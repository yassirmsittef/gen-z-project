import { Prisma, type VoteDecision } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GATE_USD_CENTS, MAX_PROOF_ATTEMPTS, REALIZATION_DAYS, REP } from "@/lib/constants";
import type { City } from "@/lib/cities";
import { formatMoney, toMinor } from "@/lib/money";
import { notify, notifyMany } from "@/lib/notifications";
import { splitMilestonePayout } from "@/lib/payout-split";
import { slugify } from "@/lib/utils";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validation";
import { makeT, type Vars } from "@/lib/i18n/t";
import { type FailReasonKey } from "@/lib/notification-catalog";
import { err as ERR_FR } from "@/messages/fr/err";
import { notif as NOTIF_FR } from "@/messages/fr/notif";

/**
 * Erreur métier : son message est affichable tel quel à l'utilisateur.
 *
 * BI-MODE i18n : construite avec une chaîne (sites historiques, message fr),
 * ou avec `{ key, params }` du namespace `err` — `message` reste alors le
 * rendu FRANÇAIS (logs, `.toThrow(…)` des tests), et le bord traduit via
 * `domainErrorMessage` (src/lib/action-errors.ts) dans la langue du
 * requérant. La migration des sites se fait par lots, sans rupture.
 */
export type DomainErrKey = keyof typeof ERR_FR & string;
const tErrFr = makeT(ERR_FR, "fr");

export class DomainError extends Error {
  readonly key?: DomainErrKey;
  readonly params?: Vars;

  constructor(arg: string | { key: DomainErrKey; params?: Vars }) {
    super(typeof arg === "string" ? arg : tErrFr(arg.key, arg.params));
    if (typeof arg !== "string") {
      this.key = arg.key;
      this.params = arg.params;
    }
  }
}

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
    select: { contributedUsdCents: true, role: true },
  });
  const cents = user?.contributedUsdCents ?? 0;
  // Décision fondateur 2026-07-12 : le rôle ADMIN poste sans le gate — il
  // faut bien des premiers projets pour que les autres puissent contribuer
  // (démarrage à froid). La règle communautaire reste entière pour les membres.
  const exempt = user?.role === "ADMIN";
  return {
    cents,
    requiredCents: GATE_USD_CENTS,
    percent: exempt ? 100 : Math.min(Math.floor((cents / GATE_USD_CENTS) * 100), 100),
    reached: exempt || cents >= GATE_USD_CENTS,
    exempt,
  };
}

/** Règle clé de la plateforme : contribuer (50 $ cumulés) avant de poster. */
export async function canCreateProject(userId: string) {
  return (await gateProgress(userId)).reached;
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
  /** Anonymat d'affichage : identité masquée partout, y compris au porteur. */
  anonymous?: boolean;
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
    // Deux paiements simultanés lisaient le même `raised` et l'un écrasait
    // l'autre : le second contributeur payait sans que le projet le compte.
    await lockProjectMoney(tx, projectId);
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
        anonymous: input.anonymous ?? false,
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
          key: "refund.lateClose",
          params: { projectTitle: project.title },
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

    // Contribution anonyme : le porteur lui-même ne voit pas qui a donné.
    await notify(
      {
        userId: project.ownerId,
        type: "CONTRIBUTION",
        key: "contribution.received",
        // `actorName: null` = anonyme AU STOCKAGE : le nom ne doit exister
        // nulle part en base, pas seulement disparaître du rendu.
        params: {
          actorName: input.anonymous ? null : (user.name ?? null),
          projectTitle: project.title,
          amountMinor: amount,
          currency: project.currency,
        },
        href: `/projects/${project.slug}`,
      },
      tx
    );

    // Reçu côté contributeur : moment d'argent réel → relayé par email
    // (EMAILED_TYPES), avec le rappel des règles du séquestre.
    await notify(
      {
        userId,
        type: "CONTRIBUTION_CONFIRMED",
        key: "contribution.confirmed",
        params: { amountMinor: amount, currency: project.currency, projectTitle: project.title },
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
            key: "projectFunded.owner" as const,
            params: { projectTitle: project.title },
            href: `/projects/${project.slug}`,
          },
          ...[...audience].map((userId) => ({
            userId,
            type: "PROJECT_FUNDED" as const,
            key: "projectFunded.supporter" as const,
            params: { projectTitle: project.title },
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
        key: "proofToVote" as const,
        params: {
          projectTitle: milestone.project.title,
          order: milestone.order,
          milestoneTitle: milestone.title,
        },
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
    // Verrou, PUIS relecture : le projet joint à la preuve a pu être arrêté
    // entre-temps par son porteur — voter sur un projet FAILED figerait un
    // versement sur un séquestre déjà promis au remboursement.
    await lockProjectMoney(tx, proof.milestone.projectId);
    const project = await tx.project.findUniqueOrThrow({
      where: { id: proof.milestone.projectId },
    });
    if (project.status !== "FUNDED" && project.status !== "ACTIVE") {
      throw new DomainError("Ce projet n'est plus en cours : le vote est clos.");
    }

    if (proof.status !== "PENDING") throw new DomainError("Cette preuve a déjà été tranchée.");
    if (project.ownerId === userId) {
      throw new DomainError("Impossible de voter sur ses propres preuves.");
    }
    if (proof.votes.some((v) => v.userId === userId)) {
      throw new DomainError("Tu as déjà voté sur cette preuve.");
    }

    // Une contribution REMBOURSÉE (paiement arrivé après la clôture, litige,
    // remboursement) ne pèse plus : sinon on vote avec de l'argent qu'on a
    // récupéré pour débloquer celui des autres.
    const stake = await tx.contribution.aggregate({
      where: { projectId: project.id, userId, refunded: false },
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

  const { executeDuePayouts, executeDueRefunds } = await import("@/lib/payouts");
  if (released) {
    await executeDuePayouts();
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

  // Le versement est figé ICI, réparti en parts adossées aux charges des
  // contributions (voir payout-split) ; les transfers Stripe partent après
  // le commit (executeDuePayouts) et le cron rejoue les manqués.
  const contributions = await tx.contribution.findMany({
    where: { projectId: project.id },
    select: { id: true, amount: true, refunded: true, stripePaymentIntentId: true },
  });
  const alreadyPaid = await tx.milestonePayout.groupBy({
    by: ["contributionId"],
    where: { contribution: { projectId: project.id } },
    _sum: { amountMinor: true },
  });
  const paidByContribution = new Map(
    alreadyPaid.map((p) => [p.contributionId, p._sum.amountMinor ?? 0])
  );
  const shares = splitMilestonePayout({
    release,
    raised: project.raised,
    releasedBefore: project.released,
    contributions: contributions.map((c) => ({
      id: c.id,
      amount: c.amount,
      refunded: c.refunded,
      hasCharge: Boolean(c.stripePaymentIntentId),
      // Les contributions sans charge n'émettent jamais de part : leur quota
      // des étapes passées est réputé consommé (théorique), sinon elles le
      // « réclament » à chaque étape et l'écrêtage ampute les vraies parts.
      alreadyPaidMinor: Math.max(
        paidByContribution.get(c.id) ?? 0,
        project.raised > 0 ? Math.floor((c.amount * project.released) / project.raised) : 0
      ),
    })),
  });
  if (shares.length > 0) {
    await tx.milestonePayout.createMany({
      data: shares.map((s) => ({
        milestoneId: milestone.id,
        contributionId: s.contributionId,
        amountMinor: s.amountMinor,
      })),
    });
  }

  // Pas de commission (décision 2026-07-12) : la part du porteur part par
  // VIREMENT Stripe uniquement — il n'y a plus de wallet interne à créditer.
  // Le virement est net des frais bancaires (cf executeDuePayouts).
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
      key: next ? "milestoneReleased.next" : "milestoneReleased.final",
      params: {
        order: milestone.order,
        amountMinor: release,
        currency: project.currency,
        projectTitle: project.title,
        nextTitle: next?.title ?? null,
      },
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
    await failProjectTx(tx, proof.milestone.projectId, { key: "proofsRefused" });
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
        key: "proofRejected",
        // `count` pilote le pluriel du gabarit (1 tentative / 2 tentatives).
        params: {
          projectTitle: project.title,
          order: proof.milestone.order,
          count: MAX_PROOF_ATTEMPTS - milestone.rejectionCount,
        },
        href: `/projects/${project.slug}`,
      },
      tx
    );
  }
}

/**
 * UN SEUL mouvement d'argent à la fois par projet.
 *
 * Trouvé par l'audit, reproduit 6 fois sur 12 : un vote qui débloque une
 * étape et l'arrêt du projet par le porteur, lancés dans la même seconde,
 * lisaient chacun le projet AVANT le commit de l'autre (READ COMMITTED).
 * L'un figeait 600 $ de versement, l'autre remboursait 1 000 $ — 1 600 $
 * sortis d'un séquestre de 1 000 $, la différence prise sur la plateforme.
 * Le verrou consultatif tient jusqu'au commit et force les deux chemins à se
 * suivre ; ce qui est lu APRÈS lui est l'état réel.
 */
async function lockProjectMoney(tx: Tx, projectId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${projectId}))`;
}

// ---------- Échec & remboursement ----------

/**
 * Motif d'échec en JEU FERMÉ (jamais de phrase libre) : la notification le
 * traduit à la lecture ; la colonne `failureReason` garde le rendu français
 * historique — elle est du contenu de page, pas un gabarit.
 */
type FailReason = { key: FailReasonKey; days?: number };
const tNotifFr = makeT(NOTIF_FR, "fr");
const failReasonFr = (reason: FailReason) =>
  tNotifFr(`failReason.${reason.key}`, { days: reason.days ?? null });

async function failProjectTx(tx: Tx, projectId: string, reason: FailReason) {
  await lockProjectMoney(tx, projectId);
  const project = await tx.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { contributions: { where: { refunded: false } } },
  });
  if (project.status === "FAILED" || project.status === "COMPLETED") return;

  // Remboursement au prorata du séquestre restant (raised − released) :
  // le montant dû est FIGÉ ici (refundDueMinor), l'appel Stripe part APRÈS
  // le commit (executeDueRefunds) et le cron rejoue les manqués. Chaque
  // remboursement est borné par ce qui reste sur la charge après les parts
  // de versement déjà figées (la répartition proportionnelle garantit le
  // prorata à l'arrondi près — le min absorbe cet arrondi).
  const remaining = project.raised - project.released;
  const alreadyPaid = await tx.milestonePayout.groupBy({
    by: ["contributionId"],
    where: { contribution: { projectId: project.id } },
    _sum: { amountMinor: true },
  });
  const paidByContribution = new Map(
    alreadyPaid.map((p) => [p.contributionId, p._sum.amountMinor ?? 0])
  );
  const refundNotifications = [];
  for (const c of project.contributions) {
    const prorata = project.raised > 0 ? Math.floor((c.amount * remaining) / project.raised) : 0;
    const refund = Math.min(prorata, c.amount - (paidByContribution.get(c.id) ?? 0));
    if (refund > 0) {
      refundNotifications.push({
        userId: c.userId,
        type: "REFUND" as const,
        key: "refund.projectFailed" as const,
        params: { amountMinor: refund, currency: project.currency, projectTitle: project.title },
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
    data: { status: "FAILED", failureReason: failReasonFr(reason) },
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
        key: "projectFailed.owner" as const,
        params: {
          projectTitle: project.title,
          reasonKey: reason.key,
          days: reason.days ?? null,
        },
        href: `/rebond?from=${project.slug}`,
      },
      ...refundNotifications,
    ],
    tx
  );
}

export async function failProject(projectId: string, reason: FailReason) {
  await prisma.$transaction(async (tx) => failProjectTx(tx, projectId, reason));
  const { executeDueRefunds } = await import("@/lib/payouts");
  await executeDueRefunds();
}

/**
 * Arrêt VOLONTAIRE par le porteur d'un projet en cours (ACTIVE ou FUNDED).
 * Ce n'est PAS une suppression : les contributions et remboursements doivent
 * survivre (exécution Stripe + comptabilité). Le projet passe donc en FAILED
 * et le séquestre restant (raised − released) repart au prorata vers les
 * contributeurs — même mécanique éprouvée que l'échec de campagne. Une
 * campagne ACTIVE sans étape libérée = tout le séquestre remboursé ; un projet
 * FUNDED = remboursement de la part non encore débloquée par les votes.
 */
export async function cancelProjectByOwner(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, status: true },
  });
  if (!project) throw new DomainError("Projet introuvable.");
  if (project.ownerId !== userId) {
    throw new DomainError("Seul le porteur peut arrêter ce projet.");
  }
  if (project.status !== "ACTIVE" && project.status !== "FUNDED") {
    throw new DomainError("Ce projet n'est plus en cours : il ne peut plus être arrêté.");
  }

  await prisma.$transaction(async (tx) =>
    failProjectTx(tx, projectId, { key: "stoppedByOwner" })
  );
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
      failProjectTx(tx, p.id, { key: "goalNotReached" })
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
          { key: "milestonesNotRealized", days: REALIZATION_DAYS }
        );
      }
      return releasedMilestone;
    });

    if (released) {
      const { executeDuePayouts } = await import("@/lib/payouts");
      await executeDuePayouts();
    }
  }
  if (overdue.length > 0) {
    const { executeDueRefunds } = await import("@/lib/payouts");
    await executeDueRefunds();
  }
}
