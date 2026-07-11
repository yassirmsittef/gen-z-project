import { Prisma, type VoteDecision } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  MAX_PROOF_ATTEMPTS,
  MIN_CONTRIBUTION,
  MIN_CONTRIBUTIONS_TO_CREATE,
  REP,
  WELCOME_CREDITS,
} from "@/lib/constants";
import type { City } from "@/lib/cities";
import { formatCredits } from "@/lib/format";
import { notify, notifyMany } from "@/lib/notifications";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validation";

/** Erreur métier : son message est affichable tel quel à l'utilisateur. */
export class DomainError extends Error {}

type Tx = Prisma.TransactionClient;

// ---------- Crédits ----------

export async function grantWelcomeCredits(userId: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: WELCOME_CREDITS } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        amount: WELCOME_CREDITS,
        type: "WELCOME",
        label: "Crédits de bienvenue",
      },
    }),
  ]);
}

/**
 * Crédit de tokens (recharge). `refId` permet l'idempotence des webhooks
 * Stripe : une session Checkout ne peut créditer qu'une seule fois.
 */
export async function topUpCredits(
  userId: string,
  amount: number,
  label: string,
  refId?: string
) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { credits: { increment: amount } } }),
    prisma.creditTransaction.create({
      data: { userId, amount, type: "BONUS", label, refId },
    }),
  ]);
}

// ---------- Profil ----------

export async function updateUserSkills(userId: string, skills: string[]) {
  const unique = [...new Set(skills.map((s) => s.trim()).filter(Boolean))];
  await prisma.user.update({ where: { id: userId }, data: { skills: unique } });
}

/**
 * Localisation déclarative (globe Communauté) : on enregistre la VILLE choisie
 * dans la liste officielle et ses coordonnées — `null` retire le membre du globe.
 */
export async function updateUserLocation(userId: string, city: City | null) {
  await prisma.user.update({
    where: { id: userId },
    data: city
      ? { city: city.name, country: city.country, latitude: city.lat, longitude: city.lng }
      : { city: null, country: null, latitude: null, longitude: null },
  });
}

/** Score de proximité entre les compétences d'un utilisateur et celles d'un projet. */
export function skillMatchScore(userSkills: string[], neededSkills: string[]): number {
  const mine = new Set(userSkills.map((s) => s.toLowerCase()));
  return neededSkills.filter((s) => mine.has(s.toLowerCase())).length;
}

// ---------- Création de projet ----------

export async function countUserContributions(userId: string) {
  return prisma.contribution.count({ where: { userId } });
}

/** Règle clé de la plateforme : contribuer avant de pouvoir poster. */
export async function canCreateProject(userId: string) {
  return (await countUserContributions(userId)) >= MIN_CONTRIBUTIONS_TO_CREATE;
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function createProject(userId: string, input: CreateProjectInput): Promise<string> {
  if (!(await canCreateProject(userId))) {
    throw new DomainError(
      `Contribue d'abord à au moins ${MIN_CONTRIBUTIONS_TO_CREATE} projet avant de lancer le tien.`
    );
  }

  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;
  const deadline = new Date(Date.now() + input.durationDays * 86_400_000);

  await prisma.project.create({
    data: {
      slug,
      title: input.title,
      pitch: input.pitch,
      description: input.description,
      category: input.category,
      goal: input.goal,
      coverUrl: input.coverUrl || null,
      neededSkills: input.neededSkills,
      deadline,
      ownerId: userId,
      milestones: {
        create: input.milestones.map((m, i) => ({
          order: i + 1,
          title: m.title,
          description: m.description,
          amount: m.amount,
        })),
      },
    },
  });

  return slug;
}

/**
 * Édition du CONTENU par le porteur, campagne ACTIVE uniquement : une fois la
 * campagne terminée (financée, échouée, réalisée), la page devient un
 * engagement figé. Objectif, étapes et deadline ne passent jamais par ici, et
 * le slug ne change pas (liens partagés, cartes OG).
 */
export async function updateProject(
  userId: string,
  projectId: string,
  input: UpdateProjectInput
): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, status: true, slug: true },
  });
  if (!project) throw new DomainError("Projet introuvable.");
  if (project.ownerId !== userId) {
    throw new DomainError("Seul le porteur peut modifier ce projet.");
  }
  if (project.status !== "ACTIVE") {
    throw new DomainError("La campagne est terminée : le contenu du projet est figé.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title: input.title,
      pitch: input.pitch,
      description: input.description,
      category: input.category,
      coverUrl: input.coverUrl || null,
      neededSkills: input.neededSkills,
    },
  });

  return project.slug;
}

/**
 * Retrait définitif par le porteur, uniquement tant que PERSONNE n'a
 * contribué : dès le premier token engagé, le projet doit vivre son cycle
 * (remboursements compris). Les enfants (étapes, commentaires, follows,
 * actus, demandes de partenariat) partent en cascade.
 */
export async function deleteProject(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, _count: { select: { contributions: true } } },
  });
  if (!project) throw new DomainError("Projet introuvable.");
  if (project.ownerId !== userId) {
    throw new DomainError("Seul le porteur peut retirer ce projet.");
  }
  if (project._count.contributions > 0) {
    throw new DomainError("Des membres ont déjà contribué : le projet ne peut plus être retiré.");
  }

  await prisma.project.delete({ where: { id: projectId } });
}

// ---------- Contribution ----------

export async function makeContribution(userId: string, projectId: string, amount: number) {
  if (!Number.isInteger(amount) || amount < MIN_CONTRIBUTION) {
    throw new DomainError(`Contribution minimum : ${MIN_CONTRIBUTION} tokens.`);
  }

  await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId } });
    if (!project) throw new DomainError("Projet introuvable.");
    if (project.ownerId === userId) {
      throw new DomainError("Tu ne peux pas contribuer à ton propre projet.");
    }
    if (project.status !== "ACTIVE" || project.deadline < new Date()) {
      throw new DomainError("Ce projet n'est plus en campagne.");
    }

    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.credits < amount) {
      throw new DomainError(`Crédits insuffisants (solde : ${user.credits} tokens).`);
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: amount },
        totalContributed: { increment: amount },
        reputation: { increment: REP.CONTRIBUTION },
      },
    });
    await tx.contribution.create({ data: { userId, projectId, amount } });
    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: "CONTRIBUTION",
        refId: projectId,
        label: `Contribution — ${project.title}`,
      },
    });
    await tx.reputationEvent.create({
      data: { userId, delta: REP.CONTRIBUTION, reason: `Contribution à « ${project.title} »` },
    });

    const newRaised = project.raised + amount;
    const funded = newRaised >= project.goal;
    await tx.project.update({
      where: { id: projectId },
      data: { raised: newRaised, ...(funded ? { status: "FUNDED" } : {}) },
    });

    await notify(
      {
        userId: project.ownerId,
        type: "CONTRIBUTION",
        title: `${user.name ?? "Quelqu'un"} a soutenu « ${project.title} » (${formatCredits(amount)})`,
        href: `/projects/${project.slug}`,
      },
      tx
    );

    // Objectif atteint : la collecte s'arrête, l'étape 1 attend sa preuve.
    if (funded) {
      const first = await tx.milestone.findFirst({ where: { projectId, order: 1 } });
      if (first) {
        await tx.milestone.update({ where: { id: first.id }, data: { status: "AWAITING_PROOF" } });
      }

      // Contributeurs ∪ followers, dédupliqués (le porteur a son message dédié).
      const [contributors, followers] = await Promise.all([
        tx.contribution.findMany({
          where: { projectId },
          distinct: ["userId"],
          select: { userId: true },
        }),
        tx.follow.findMany({ where: { projectId }, select: { userId: true } }),
      ]);
      const audience = new Set([
        ...contributors.map((c) => c.userId),
        ...followers.map((f) => f.userId),
      ]);
      audience.delete(project.ownerId);
      await notifyMany(
        [
          {
            userId: project.ownerId,
            type: "PROJECT_FUNDED" as const,
            title: `Objectif atteint pour « ${project.title} » !`,
            body: "La collecte est terminée — soumets la preuve de l'étape 1 pour débloquer les premiers fonds.",
            href: `/projects/${project.slug}`,
          },
          ...[...audience].map((userId) => ({
            userId,
            type: "PROJECT_FUNDED" as const,
            title: `« ${project.title} » est financé !`,
            body: "Les fonds seront débloqués étape par étape, sous le contrôle des contributeurs.",
            href: `/projects/${project.slug}`,
          })),
        ],
        tx
      );
    }
  });
}

// ---------- Preuves d'avancement ----------

export async function submitMilestoneProof(
  userId: string,
  input: { milestoneId: string; content: string; links?: string[]; imageUrls?: string[] }
) {
  await prisma.$transaction(async (tx) => {
    const milestone = await tx.milestone.findUnique({
      where: { id: input.milestoneId },
      include: { project: true },
    });
    if (!milestone) throw new DomainError("Étape introuvable.");
    if (milestone.project.ownerId !== userId) {
      throw new DomainError("Seul·e le·la porteur·se du projet peut soumettre une preuve.");
    }
    if (milestone.project.status !== "FUNDED" || milestone.status !== "AWAITING_PROOF") {
      throw new DomainError("Cette étape n'attend pas de preuve pour le moment.");
    }
    if (milestone.rejectionCount >= MAX_PROOF_ATTEMPTS) {
      throw new DomainError("Nombre maximum de tentatives atteint pour cette étape.");
    }

    await tx.proof.create({
      data: {
        milestoneId: milestone.id,
        content: input.content,
        links: input.links ?? [],
        imageUrls: input.imageUrls ?? [],
      },
    });
    await tx.milestone.update({ where: { id: milestone.id }, data: { status: "UNDER_REVIEW" } });

    // Les contributeurs sont le jury : chacun est prévenu qu'un vote l'attend.
    const contributors = await tx.contribution.findMany({
      where: { projectId: milestone.projectId },
      distinct: ["userId"],
      select: { userId: true },
    });
    await notifyMany(
      contributors.map((c) => ({
        userId: c.userId,
        type: "PROOF_TO_VOTE" as const,
        title: `Preuve à examiner — « ${milestone.project.title} »`,
        body: `Étape ${milestone.order} : ${milestone.title}. Ton vote débloque (ou non) les fonds.`,
        href: `/projects/${milestone.project.slug}`,
      })),
      tx
    );
  });
}

/**
 * Vote pondéré : le poids = total contribué par le votant au projet (figé au
 * moment du vote). Une preuve est validée dès que le poids POUR dépasse 50%
 * des crédits collectés, refusée dès que le poids CONTRE les dépasse. Si tous
 * les contributeurs ont voté sans majorité stricte, la balance des poids
 * tranche (égalité → refus, protection des contributeurs).
 */
export async function castVote(userId: string, proofId: string, decision: VoteDecision) {
  // Si le vote a débloqué une étape, on tente le versement réel APRÈS le
  // commit (jamais d'appel réseau dans la transaction) — voir lib/payouts.
  const released = await prisma.$transaction(async (tx) => {
    const proof = await tx.proof.findUnique({
      where: { id: proofId },
      include: { milestone: { include: { project: true } }, votes: true },
    });
    if (!proof) throw new DomainError("Preuve introuvable.");
    const project = proof.milestone.project;

    if (proof.status !== "PENDING") throw new DomainError("Cette preuve a déjà été tranchée.");
    if (project.ownerId === userId) {
      throw new DomainError("Impossible de voter sur ses propres preuves.");
    }
    if (proof.votes.some((v) => v.userId === userId)) {
      throw new DomainError("Tu as déjà voté sur cette preuve.");
    }

    const stake = await tx.contribution.aggregate({
      where: { projectId: project.id, userId },
      _sum: { amount: true },
    });
    const weight = stake._sum.amount ?? 0;
    if (weight <= 0) {
      throw new DomainError("Seuls les contributeurs du projet peuvent voter.");
    }

    await tx.vote.create({ data: { proofId, userId, weight, decision } });
    await tx.user.update({
      where: { id: userId },
      data: { reputation: { increment: REP.VOTE } },
    });
    await tx.reputationEvent.create({
      data: { userId, delta: REP.VOTE, reason: `Vote sur une preuve — ${project.title}` },
    });

    // Décompte pondéré.
    const votes = [...proof.votes, { userId, weight, decision }];
    const approveWeight = votes
      .filter((v) => v.decision === "APPROVE")
      .reduce((sum, v) => sum + v.weight, 0);
    const rejectWeight = votes
      .filter((v) => v.decision === "REJECT")
      .reduce((sum, v) => sum + v.weight, 0);
    const threshold = project.raised / 2;

    if (approveWeight > threshold) {
      return approveProofTx(tx, proofId);
    }
    if (rejectWeight > threshold) {
      await rejectProofTx(tx, proofId);
      return null;
    }

    // Tous les contributeurs ont voté sans majorité stricte : la balance tranche.
    const contributors = await tx.contribution.findMany({
      where: { projectId: project.id },
      distinct: ["userId"],
      select: { userId: true },
    });
    if (votes.length >= contributors.length) {
      if (approveWeight > rejectWeight) return approveProofTx(tx, proofId);
      await rejectProofTx(tx, proofId);
    }
    return null;
  });

  if (released) {
    const { attemptMilestonePayout } = await import("@/lib/payouts");
    await attemptMilestonePayout(released.milestoneId, released.amount);
  }
}

/** Valide la preuve, débloque les fonds — renvoie l'étape et le montant réellement débloqué. */
async function approveProofTx(
  tx: Tx,
  proofId: string
): Promise<{ milestoneId: string; amount: number }> {
  const proof = await tx.proof.findUniqueOrThrow({
    where: { id: proofId },
    include: { milestone: { include: { project: true } } },
  });
  const milestone = proof.milestone;
  const project = milestone.project;

  await tx.proof.update({ where: { id: proofId }, data: { status: "APPROVED" } });
  await tx.milestone.update({ where: { id: milestone.id }, data: { status: "RELEASED" } });

  const next = await tx.milestone.findFirst({
    where: { projectId: project.id, order: milestone.order + 1 },
  });
  // La dernière étape reçoit tout le séquestre restant (dont un éventuel
  // dépassement d'objectif) ; les autres débloquent leur montant défini.
  const release = next
    ? Math.min(milestone.amount, project.raised - project.released)
    : project.raised - project.released;

  await tx.user.update({
    where: { id: project.ownerId },
    data: { credits: { increment: release }, reputation: { increment: REP.MILESTONE_RELEASED } },
  });
  await tx.creditTransaction.create({
    data: {
      userId: project.ownerId,
      amount: release,
      type: "MILESTONE_RELEASE",
      refId: milestone.id,
      label: `Étape ${milestone.order} débloquée — ${project.title}`,
    },
  });
  await tx.reputationEvent.create({
    data: {
      userId: project.ownerId,
      delta: REP.MILESTONE_RELEASED,
      reason: `Étape « ${milestone.title} » validée par la communauté`,
    },
  });
  await tx.project.update({
    where: { id: project.id },
    data: { released: { increment: release }, ...(next ? {} : { status: "COMPLETED" }) },
  });

  if (next) {
    await tx.milestone.update({ where: { id: next.id }, data: { status: "AWAITING_PROOF" } });
  } else {
    await tx.user.update({
      where: { id: project.ownerId },
      data: { reputation: { increment: REP.PROJECT_COMPLETED } },
    });
    await tx.reputationEvent.create({
      data: {
        userId: project.ownerId,
        delta: REP.PROJECT_COMPLETED,
        reason: `Projet « ${project.title} » réalisé`,
      },
    });
  }

  await notify(
    {
      userId: project.ownerId,
      type: "MILESTONE_RELEASED",
      title: `Étape ${milestone.order} validée — ${formatCredits(release)} débloqués`,
      body: next
        ? `La communauté a validé ta preuve pour « ${project.title} ». Prochaine étape : « ${next.title} ».`
        : `« ${project.title} » est entièrement réalisé. Bravo !`,
      href: `/projects/${project.slug}`,
    },
    tx
  );

  return { milestoneId: milestone.id, amount: release };
}

async function rejectProofTx(tx: Tx, proofId: string) {
  const proof = await tx.proof.findUniqueOrThrow({
    where: { id: proofId },
    include: { milestone: true },
  });

  await tx.proof.update({ where: { id: proofId }, data: { status: "REJECTED" } });

  const milestone = await tx.milestone.update({
    where: { id: proof.milestoneId },
    data: { rejectionCount: { increment: 1 } },
  });

  if (milestone.rejectionCount >= MAX_PROOF_ATTEMPTS) {
    await failProjectTx(
      tx,
      proof.milestone.projectId,
      "Les preuves d'avancement ont été refusées par la communauté."
    );
  } else {
    await tx.milestone.update({
      where: { id: proof.milestoneId },
      data: { status: "AWAITING_PROOF" },
    });

    const project = await tx.project.findUniqueOrThrow({
      where: { id: proof.milestone.projectId },
      select: { ownerId: true, title: true, slug: true },
    });
    await notify(
      {
        userId: project.ownerId,
        type: "PROOF_REJECTED",
        title: `Preuve refusée — « ${project.title} »`,
        body: `Étape ${proof.milestone.order} : la communauté n'a pas validé. Il te reste ${
          MAX_PROOF_ATTEMPTS - milestone.rejectionCount
        } tentative — renforce ta preuve (photos, liens publics).`,
        href: `/projects/${project.slug}`,
      },
      tx
    );
  }
}

// ---------- Échec & remboursement ----------

async function failProjectTx(tx: Tx, projectId: string, reason: string) {
  const project = await tx.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { contributions: { where: { refunded: false } } },
  });
  if (project.status === "FAILED" || project.status === "COMPLETED") return;

  // Remboursement au prorata du séquestre restant (raised − released).
  const remaining = project.raised - project.released;
  const refundNotifications = [];
  for (const c of project.contributions) {
    const refund = project.raised > 0 ? Math.floor((c.amount * remaining) / project.raised) : 0;
    if (refund > 0) {
      await tx.user.update({ where: { id: c.userId }, data: { credits: { increment: refund } } });
      await tx.creditTransaction.create({
        data: {
          userId: c.userId,
          amount: refund,
          type: "REFUND",
          refId: project.id,
          label: `Remboursement — ${project.title}`,
        },
      });
      refundNotifications.push({
        userId: c.userId,
        type: "REFUND" as const,
        title: `Remboursement de ${formatCredits(refund)} — « ${project.title} »`,
        body: "La campagne n'a pas abouti : ta part du séquestre restant t'a été recréditée.",
        href: "/dashboard",
      });
    }
    await tx.contribution.update({ where: { id: c.id }, data: { refunded: true } });
  }

  await tx.project.update({
    where: { id: project.id },
    data: { status: "FAILED", failureReason: reason },
  });
  await tx.user.update({
    where: { id: project.ownerId },
    data: { reputation: { increment: REP.PROJECT_FAILED } },
  });
  await tx.reputationEvent.create({
    data: {
      userId: project.ownerId,
      delta: REP.PROJECT_FAILED,
      reason: `Projet « ${project.title} » non abouti`,
    },
  });

  await notifyMany(
    [
      {
        userId: project.ownerId,
        type: "PROJECT_FAILED" as const,
        title: `« ${project.title} » n'a pas abouti`,
        body: `${reason} L'échec n'est pas une sortie : des opportunités t'attendent sur le parcours rebond.`,
        href: `/rebond?from=${project.slug}`,
      },
      ...refundNotifications,
    ],
    tx
  );
}

export async function failProject(projectId: string, reason: string) {
  await prisma.$transaction(async (tx) => failProjectTx(tx, projectId, reason));
}

/**
 * Fait expirer les campagnes dont la deadline est passée sans financement.
 * Appelé paresseusement en tête des pages qui listent/affichent des projets
 * (pas de cron en Phase 1).
 */
export async function failExpiredProjects() {
  const expired = await prisma.project.findMany({
    where: { status: "ACTIVE", deadline: { lt: new Date() } },
    select: { id: true },
  });
  for (const p of expired) {
    await prisma.$transaction(async (tx) =>
      failProjectTx(tx, p.id, "Objectif non atteint avant la fin de la campagne.")
    );
  }
}
