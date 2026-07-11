import { Prisma, type VoteDecision } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GATE_USD_CENTS, MAX_PROOF_ATTEMPTS, REALIZATION_DAYS, REP } from "@/lib/constants";
import type { City } from "@/lib/cities";
import { formatMoney, toMinor } from "@/lib/money";
import { notify, notifyMany } from "@/lib/notifications";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validation";

/** Erreur métier : son message est affichable tel quel à l'utilisateur. */
export class DomainError extends Error {}

type Tx = Prisma.TransactionClient;

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

/**
 * Le gate « contribue d'abord » en argent réel : cumul des contributions
 * (équivalent USD figé au paiement) rapporté aux 50 $ requis — alimente la
 * jauge de progression.
 */
export async function gateProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { contributedUsdCents: true },
  });
  const cents = user?.contributedUsdCents ?? 0;
  return {
    cents,
    requiredCents: GATE_USD_CENTS,
    percent: Math.min(Math.floor((cents / GATE_USD_CENTS) * 100), 100),
    reached: cents >= GATE_USD_CENTS,
  };
}

/** Règle clé de la plateforme : contribuer (50 $ cumulés) avant de poster. */
export async function canCreateProject(userId: string) {
  return (await gateProgress(userId)).reached;
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
      `Contribue d'abord — il faut ${formatMoney(GATE_USD_CENTS, "usd")} de contributions cumulées avant de lancer ton projet.`
    );
  }

  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;
  const deadline = new Date(Date.now() + input.durationDays * 86_400_000);

  // Les montants arrivent en unités MAJEURES de la devise choisie (ce que
  // le porteur tape) et sont stockés en unités MINEURES.
  await prisma.project.create({
    data: {
      slug,
      title: input.title,
      pitch: input.pitch,
      description: input.description,
      category: input.category,
      currency: input.currency,
      goal: toMinor(input.goal, input.currency),
      coverUrl: input.coverUrl || null,
      neededSkills: input.neededSkills,
      deadline,
      ownerId: userId,
      milestones: {
        create: input.milestones.map((m, i) => ({
          order: i + 1,
          title: m.title,
          description: m.description,
          amount: toMinor(m.amount, input.currency),
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

// ---------- Contribution (fulfillment d'un paiement Stripe) ----------

/**
 * Gardes AVANT paiement — appelées à la création de la session Checkout.
 * Renvoie le projet si la contribution est possible.
 */
export async function assertCanContribute(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new DomainError("Projet introuvable.");
  if (project.ownerId === userId) {
    throw new DomainError("Tu ne peux pas contribuer à ton propre projet.");
  }
  if (project.status !== "ACTIVE" || project.deadline < new Date()) {
    throw new DomainError("Ce projet n'est plus en campagne.");
  }
  return project;
}

/**
 * Enregistre une contribution PAYÉE (webhook `checkout.session.completed`).
 * Idempotent par session Stripe. Un paiement réel n'est jamais rejeté : si
 * le projet n'est plus finançable entre le checkout et le webhook, la
 * contribution est enregistrée puis immédiatement fléchée remboursement
 * (exécuté hors transaction, rejoué par le cron si besoin).
 */
export async function fulfillContribution(input: {
  userId: string;
  projectId: string;
  amountMinor: number;
  usdCents: number;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
}): Promise<{ refundNeeded: boolean }> {
  const { userId, projectId, amountMinor: amount } = input;

  const existing = await prisma.contribution.findUnique({
    where: { stripeSessionId: input.stripeSessionId },
    select: { id: true },
  });
  if (existing) return { refundNeeded: false }; // webhook rejoué

  let refundNeeded = false;
  await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId } });
    if (!project) {
      // Projet disparu entre checkout et webhook (retrait) : cas résiduel,
      // remboursement manuel — on trace sans casser le webhook.
      console.error(
        `[contribution] paiement ${input.stripeSessionId} pour un projet disparu (${projectId})`
      );
      return;
    }

    const closed = project.status !== "ACTIVE" || project.deadline < new Date();
    await tx.contribution.create({
      data: {
        userId,
        projectId,
        amount,
        usdCents: input.usdCents,
        stripeSessionId: input.stripeSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId,
        ...(closed ? { refunded: true, refundDueMinor: amount } : {}),
      },
    });

    if (closed) {
      refundNeeded = true;
      await notify(
        {
          userId,
          type: "REFUND",
          title: `Ta contribution à « ${project.title} » arrive après la clôture`,
          body: `La campagne s'est terminée entre-temps : ${formatMoney(amount, project.currency)} repartent vers ta carte.`,
          href: `/projects/${project.slug}`,
        },
        tx
      );
      return;
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        contributedUsdCents: { increment: input.usdCents },
        reputation: { increment: REP.CONTRIBUTION },
      },
    });
    await tx.reputationEvent.create({
      data: { userId, delta: REP.CONTRIBUTION, reason: `Contribution à « ${project.title} »` },
    });

    const newRaised = project.raised + amount;
    const funded = newRaised >= project.goal;
    await tx.project.update({
      where: { id: projectId },
      data: {
        raised: newRaised,
        // Le financement ouvre l'échéance de réalisation : REALIZATION_DAYS
        // pour livrer toutes les étapes, sinon échec + remboursement.
        ...(funded
          ? {
              status: "FUNDED" as const,
              realizationDeadline: new Date(Date.now() + REALIZATION_DAYS * 86_400_000),
            }
          : {}),
      },
    });

    await notify(
      {
        userId: project.ownerId,
        type: "CONTRIBUTION",
        title: `${user.name ?? "Quelqu'un"} a soutenu « ${project.title} » (${formatMoney(amount, project.currency)})`,
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

  return { refundNeeded };
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
    // Une preuve déposée APRÈS l'échéance ne peut plus être votée à temps :
    // on la refuse à la source (le vote déjà ouvert, lui, sera tranché à la
    // balance par le cron — cf failOverdueRealizations).
    if (
      milestone.project.realizationDeadline &&
      milestone.project.realizationDeadline < new Date()
    ) {
      throw new DomainError(
        "L'échéance de réalisation est dépassée : les étapes restantes ne peuvent plus être prouvées."
      );
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

  const { attemptMilestonePayout, executeDueRefunds } = await import("@/lib/payouts");
  if (released) {
    await attemptMilestonePayout(released.milestoneId, released.amount);
  }
  // Un 2e refus pendant ce vote a pu faire échouer le projet : les
  // remboursements fléchés partent maintenant, hors transaction.
  await executeDueRefunds();
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

  // Pas de commission pour le moment (décision 2026-07-12) : l'intégralité
  // part au porteur, par VIREMENT Stripe uniquement — il n'y a plus de
  // wallet interne à créditer.
  await tx.user.update({
    where: { id: project.ownerId },
    data: { reputation: { increment: REP.MILESTONE_RELEASED } },
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
      title: `Étape ${milestone.order} validée — ${formatMoney(release, project.currency)} débloqués`,
      body: next
        ? `La communauté a validé ta preuve pour « ${project.title} ». Prochaine étape : « ${next.title} ». Le virement part sur ton compte Stripe.`
        : `« ${project.title} » est entièrement réalisé. Bravo ! Le virement final part sur ton compte Stripe.`,
      href: `/projects/${project.slug}`,
    },
    tx
  );

  // Le versement réel (Stripe) est tenté après le commit de la transaction.
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

  // Remboursement au prorata du séquestre restant (raised − released) :
  // le montant dû est FIGÉ ici (refundDueMinor), l'appel Stripe part APRÈS
  // le commit (executeDueRefunds) et le cron rejoue les manqués.
  const remaining = project.raised - project.released;
  const refundNotifications = [];
  for (const c of project.contributions) {
    const refund = project.raised > 0 ? Math.floor((c.amount * remaining) / project.raised) : 0;
    if (refund > 0) {
      refundNotifications.push({
        userId: c.userId,
        type: "REFUND" as const,
        title: `Remboursement de ${formatMoney(refund, project.currency)} — « ${project.title} »`,
        body: "La campagne n'a pas abouti : ta part du séquestre restant repart vers ta carte (quelques jours selon ta banque).",
        href: `/projects/${project.slug}`,
      });
    }
    await tx.contribution.update({
      where: { id: c.id },
      data: { refunded: true, refundDueMinor: refund },
    });
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
  const { executeDueRefunds } = await import("@/lib/payouts");
  await executeDueRefunds();
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
  if (expired.length > 0) {
    const { executeDueRefunds } = await import("@/lib/payouts");
    await executeDueRefunds();
  }
}

/**
 * Fait échouer les projets financés dont l'échéance de réalisation est
 * dépassée. Un vote encore ouvert à l'échéance est d'abord TRANCHÉ à la
 * balance des bulletins posés (même règle que le décompte final : égalité →
 * refus) — le porteur repart ainsi avec tout ce que la communauté a validé,
 * y compris in extremis. Puis, sauf si cette validation a réalisé le projet
 * (dernière étape), le séquestre restant repart aux contributeurs (même
 * mécanique d'échec que la fin de campagne — prorata, réputation,
 * notifications).
 */
export async function failOverdueRealizations() {
  const overdue = await prisma.project.findMany({
    where: { status: "FUNDED", realizationDeadline: { lt: new Date() } },
    select: { id: true },
  });
  for (const p of overdue) {
    const released = await prisma.$transaction(async (tx) => {
      const pending = await tx.proof.findFirst({
        where: { milestone: { projectId: p.id }, status: "PENDING" },
        include: { votes: true },
      });

      let releasedMilestone: { milestoneId: string; amount: number } | null = null;
      if (pending) {
        const approveWeight = pending.votes
          .filter((v) => v.decision === "APPROVE")
          .reduce((sum, v) => sum + v.weight, 0);
        const rejectWeight = pending.votes
          .filter((v) => v.decision === "REJECT")
          .reduce((sum, v) => sum + v.weight, 0);
        if (approveWeight > rejectWeight) {
          releasedMilestone = await approveProofTx(tx, pending.id);
        } else {
          await rejectProofTx(tx, pending.id);
        }
      }

      // La validation in extremis a pu réaliser le projet (dernière étape →
      // COMPLETED) ou le refus l'a déjà fait échouer (2e rejet) : dans ces
      // cas, rien à ajouter. Sinon, échec + remboursement du reste.
      const current = await tx.project.findUniqueOrThrow({
        where: { id: p.id },
        select: { status: true },
      });
      if (current.status === "FUNDED") {
        await failProjectTx(
          tx,
          p.id,
          `Étapes non réalisées dans les ${REALIZATION_DAYS} jours suivant le financement.`
        );
      }
      return releasedMilestone;
    });

    if (released) {
      const { attemptMilestonePayout } = await import("@/lib/payouts");
      await attemptMilestonePayout(released.milestoneId, released.amount);
    }
  }
  if (overdue.length > 0) {
    const { executeDueRefunds } = await import("@/lib/payouts");
    await executeDueRefunds();
  }
}
