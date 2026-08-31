import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { renderNotification } from "../src/lib/notification-render";
import { eraseAccount } from "../src/lib/account";
import { createReport, handleReport } from "../src/lib/moderation";
import { createResetToken, requestPasswordReset, resetPassword } from "../src/lib/password-reset";
import { GATE_USD_CENTS, REALIZATION_DAYS } from "../src/lib/constants";
import { createProjectSchema } from "../src/lib/validation";
import {
  assertCanContribute,
  canCreateProject,
  castVote,
  cancelProjectByOwner,
  deleteProject,
  DomainError,
  failExpiredProjects,
  failOverdueRealizations,
  fulfillContribution,
  gateProgress,
  submitMilestoneProof,
  updateProject,
} from "../src/lib/project-service";

/**
 * Règles du jeu — ARGENT RÉEL. Tests d'intégration contre la base de dev
 * (port 5433, `npm run db:start` d'abord). Projets fixtures en USD avec des
 * montants en unités MINEURES (les règles sont insensibles à l'échelle) :
 * les chiffres historiques de la suite restent lisibles. Fixtures suffixées
 * `@fixture.test`, purgées en fin de suite.
 */

const RUN = `t${Date.now().toString(36)}`;
let seq = 0;

function mkUser(usdCents = 0) {
  seq += 1;
  return prisma.user.create({
    data: {
      email: `u${seq}-${RUN}@fixture.test`,
      name: `Fixture ${seq}`,
      contributedUsdCents: usdCents,
    },
  });
}

function mkProject(
  ownerId: string,
  overrides: { status?: "ACTIVE" | "FUNDED" | "FAILED"; deadline?: Date; goal?: number } = {}
) {
  seq += 1;
  return prisma.project.create({
    data: {
      ownerId,
      title: `Projet fixture ${seq}`,
      slug: `fixture-${RUN}-${seq}`,
      pitch: "Pitch de test.",
      description: "Description de test.",
      category: "TECH",
      currency: "usd",
      goal: overrides.goal ?? 100,
      status: overrides.status ?? "ACTIVE",
      deadline: overrides.deadline ?? new Date(Date.now() + 30 * 86_400_000),
      milestones: {
        create: [
          { order: 1, title: "Étape 1", description: "x", amount: 60 },
          { order: 2, title: "Étape 2", description: "x", amount: 40 },
        ],
      },
    },
    include: { milestones: { orderBy: { order: "asc" } } },
  });
}

/**
 * Contribution PAYÉE (chemin réel du webhook) — USD : usdCents = montant.
 * payment_intent absent par défaut : les exécuteurs Stripe (remboursements,
 * versements) ignorent ces fixtures, aucun appel réseau dans la suite. Un PI
 * fictif peut être posé pour tester la RÉPARTITION des versements — les
 * porteurs fixtures n'ont pas de compte Connect, l'exécuteur s'arrête avant
 * tout appel réseau et les parts restent dues.
 */
async function contribute(
  userId: string,
  projectId: string,
  amountMinor: number,
  paymentIntentId: string | null = null,
  anonymous = false
) {
  seq += 1;
  return fulfillContribution({
    userId,
    projectId,
    amountMinor,
    usdCents: amountMinor,
    anonymous,
    stripeSessionId: `cs_test_${RUN}_${seq}`,
    stripePaymentIntentId: paymentIntentId,
  });
}

const projectState = (id: string) =>
  prisma.project.findUniqueOrThrow({
    where: { id },
    select: {
      status: true,
      raised: true,
      released: true,
      realizationDeadline: true,
      failureReason: true,
    },
  });

const refundsOf = (projectId: string) =>
  prisma.contribution.findMany({
    where: { projectId },
    orderBy: { amount: "desc" },
    select: { amount: true, refunded: true, refundDueMinor: true },
  });

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.$disconnect();
});

describe("contribution (argent réel)", () => {
  it("garde le checkout : propre projet et campagne close refusés", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const autre = await mkUser();

    await expect(assertCanContribute(porteur.id, projet.id)).rejects.toThrow(DomainError);
    await expect(assertCanContribute(autre.id, projet.id)).resolves.toBeTruthy();

    const clos = await mkProject(porteur.id, { deadline: new Date(Date.now() - 1000) });
    await expect(assertCanContribute(autre.id, clos.id)).rejects.toThrow(DomainError);
  });

  it("enregistre le paiement, cumule l'équivalent USD, et le financement ouvre l'échéance", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const contrib = await mkUser();

    await contribute(contrib.id, projet.id, 40);
    const à40 = await projectState(projet.id);
    expect(à40.status).toBe("ACTIVE");
    expect(à40.raised).toBe(40);

    await contribute(contrib.id, projet.id, 60);
    const après = await projectState(projet.id);
    expect(après.status).toBe("FUNDED");
    expect(après.raised).toBe(100);
    const jours = Math.round(
      ((après.realizationDeadline?.getTime() ?? 0) - Date.now()) / 86_400_000
    );
    expect(jours).toBe(REALIZATION_DAYS);

    const étape1 = await prisma.milestone.findFirstOrThrow({
      where: { projectId: projet.id, order: 1 },
    });
    expect(étape1.status).toBe("AWAITING_PROOF");

    const user = await prisma.user.findUniqueOrThrow({ where: { id: contrib.id } });
    expect(user.contributedUsdCents).toBe(100);
  });

  it("est idempotent par session Stripe (webhook rejoué)", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const contrib = await mkUser();

    const input = {
      userId: contrib.id,
      projectId: projet.id,
      amountMinor: 30,
      usdCents: 30,
      stripeSessionId: `cs_test_${RUN}_idem`,
      stripePaymentIntentId: null,
    };
    await fulfillContribution(input);
    await fulfillContribution(input);

    expect(await prisma.contribution.count({ where: { projectId: projet.id } })).toBe(1);
    expect((await projectState(projet.id)).raised).toBe(30);
  });

  it("envoie un reçu au contributeur — mais pas pour un paiement après clôture", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const contrib = await mkUser();

    await contribute(contrib.id, projet.id, 40);

    const reçu = await prisma.notification.findFirstOrThrow({
      where: { userId: contrib.id, type: "CONTRIBUTION_CONFIRMED" },
    });
    // La base ne stocke plus de texte : on épingle le RENDU français.
    expect(renderNotification("fr", reçu).title).toContain("est confirmée");
    expect(reçu.href).toBe(`/projects/${projet.slug}`);
    expect(
      await prisma.notification.count({ where: { userId: porteur.id, type: "CONTRIBUTION" } })
    ).toBe(1);

    // Après la clôture, le paiement est fléché remboursement : REFUND, pas de reçu.
    const clos = await mkProject(porteur.id, { status: "FAILED" });
    const tardif = await mkUser();
    await contribute(tardif.id, clos.id, 25);
    expect(
      await prisma.notification.count({
        where: { userId: tardif.id, type: "CONTRIBUTION_CONFIRMED" },
      })
    ).toBe(0);
    expect(
      await prisma.notification.count({ where: { userId: tardif.id, type: "REFUND" } })
    ).toBe(1);
  });

  it("une contribution anonyme masque l'identité jusque chez le porteur", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const discret = await mkUser();

    await contribute(discret.id, projet.id, 30, null, true);

    const c = await prisma.contribution.findFirstOrThrow({
      where: { projectId: projet.id, userId: discret.id },
    });
    expect(c.anonymous).toBe(true);

    const notif = await prisma.notification.findFirstOrThrow({
      where: { userId: porteur.id, type: "CONTRIBUTION" },
    });
    expect(renderNotification("fr", notif).title).toContain("Quelqu'un a soutenu");
    // Plus fort qu'avant : l'anonymat vaut AU STOCKAGE — le nom n'existe
    // nulle part en base, pas seulement hors du rendu.
    expect((notif.params as { actorName?: string | null })?.actorName ?? null).toBeNull();
    expect(JSON.stringify(notif.params)).not.toContain("Fixture");

    // Le poids de vote et le gate restent intacts (anonymat d'affichage).
    const user = await prisma.user.findUniqueOrThrow({ where: { id: discret.id } });
    expect(user.contributedUsdCents).toBe(30);
  });

  it("un paiement arrivé après la clôture est enregistré puis fléché remboursement", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id, { status: "FAILED" });
    const contrib = await mkUser();

    const { refundNeeded } = await contribute(contrib.id, projet.id, 25);
    expect(refundNeeded).toBe(true);

    const [c] = await refundsOf(projet.id);
    expect(c.refunded).toBe(true);
    expect(c.refundDueMinor).toBe(25);
    expect((await projectState(projet.id)).raised).toBe(0); // pas compté
  });
});

describe("gate « 50 $ contribués avant de poster »", () => {
  it("s'ouvre exactement au seuil, avec une progression honnête", async () => {
    const presque = await mkUser(GATE_USD_CENTS - 1);
    const pile = await mkUser(GATE_USD_CENTS);

    expect(await canCreateProject(presque.id)).toBe(false);
    expect(await canCreateProject(pile.id)).toBe(true);

    const progress = await gateProgress(presque.id);
    expect(progress.percent).toBe(99);
    expect(progress.reached).toBe(false);
  });

  it("le rôle ADMIN poste sans le gate (démarrage à froid, décision fondateur)", async () => {
    const fondateur = await mkUser(0);
    await prisma.user.update({ where: { id: fondateur.id }, data: { role: "ADMIN" } });

    expect(await canCreateProject(fondateur.id)).toBe(true);
    const gate = await gateProgress(fondateur.id);
    expect(gate.exempt).toBe(true);
    expect(gate.percent).toBe(100);

    // La règle communautaire ne bouge pas pour les membres.
    const membre = await mkUser(0);
    expect(await canCreateProject(membre.id)).toBe(false);
    expect((await gateProgress(membre.id)).exempt).toBe(false);
  });
});

describe("vote pondéré", () => {
  async function fundedAvecPreuve() {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser();
    const b = await mkUser();
    await contribute(a.id, projet.id, 60);
    await contribute(b.id, projet.id, 40);
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve de test suffisamment longue.",
    });
    const preuve = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });
    return { porteur, projet, a, b, preuve };
  }

  it("libère l'étape à la majorité stricte (le versement part chez Stripe, pas en interne)", async () => {
    const { projet, a, preuve } = await fundedAvecPreuve();

    await castVote(a.id, preuve.id, "APPROVE"); // 60 > 50 = majorité
    const après = await projectState(projet.id);
    expect(après.released).toBe(60);
    expect(après.status).toBe("FUNDED");
    const étape2 = await prisma.milestone.findFirstOrThrow({
      where: { projectId: projet.id, order: 2 },
    });
    expect(étape2.status).toBe("AWAITING_PROOF");
  });

  it("interdit le porteur, les non-contributeurs et le double vote", async () => {
    const { porteur, b, preuve } = await fundedAvecPreuve();
    const étranger = await mkUser();

    await expect(castVote(porteur.id, preuve.id, "APPROVE")).rejects.toThrow(DomainError);
    await expect(castVote(étranger.id, preuve.id, "APPROVE")).rejects.toThrow(DomainError);
    await castVote(b.id, preuve.id, "REJECT"); // 40 ≤ 50 : pas encore tranché
    await expect(castVote(b.id, preuve.id, "REJECT")).rejects.toThrow(DomainError);
  });

  it("à l'unanimité exprimée sans majorité stricte, la balance tranche (égalité → refus)", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser();
    const b = await mkUser();
    await contribute(a.id, projet.id, 50);
    await contribute(b.id, projet.id, 50);
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve de test suffisamment longue.",
    });
    const preuve = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });

    await castVote(a.id, preuve.id, "APPROVE"); // 50 = 50 : pas de majorité stricte
    await castVote(b.id, preuve.id, "REJECT"); // tous ont voté, égalité → refus

    const après = await prisma.proof.findUniqueOrThrow({ where: { id: preuve.id } });
    expect(après.status).toBe("REJECTED");
    const étape1 = await prisma.milestone.findFirstOrThrow({
      where: { projectId: projet.id, order: 1 },
    });
    expect(étape1.status).toBe("AWAITING_PROOF"); // 2e tentative possible
    expect(étape1.rejectionCount).toBe(1);
  });
});

describe("versements aux porteurs (parts adossées aux charges)", () => {
  async function financeEtLibereÉtape1(pi: string) {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id); // objectif 100, étapes 60/40
    const a = await mkUser();
    const b = await mkUser();
    await contribute(a.id, projet.id, 60, pi); // charge réelle
    await contribute(b.id, projet.id, 40); // fixture de démo, sans charge
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve de test suffisamment longue.",
    });
    const preuve = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });
    await castVote(a.id, preuve.id, "APPROVE"); // 60 > 50 : étape 1 libérée
    return { porteur, projet, a, b };
  }

  it("fige les parts au prorata sur les seules charges réelles, étape après étape", async () => {
    const { porteur, projet, a } = await financeEtLibereÉtape1(`pi_${RUN}_parts`);

    const contribA = await prisma.contribution.findFirstOrThrow({
      where: { projectId: projet.id, userId: a.id },
    });
    let parts = await prisma.milestonePayout.findMany({
      where: { milestone: { projectId: projet.id } },
    });
    // Une seule part : la contribution de démo (40) n'a pas d'argent réel à
    // adosser et n'absorbe pas le prorata de la charge réelle.
    expect(parts).toHaveLength(1);
    expect(parts[0].contributionId).toBe(contribA.id);
    expect(parts[0].amountMinor).toBe(36); // 60 × (60 / 100)
    // Porteur sans compte Connect : la part reste due, le cron la rejouera.
    expect(parts[0].stripeTransferId).toBeNull();

    // Dernière étape : le cumul vide la charge au centime près.
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[1].id,
      content: "Preuve de test suffisamment longue.",
    });
    const preuve2 = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[1].id, status: "PENDING" },
    });
    await castVote(a.id, preuve2.id, "APPROVE");

    parts = await prisma.milestonePayout.findMany({ where: { contributionId: contribA.id } });
    expect(parts.map((p) => p.amountMinor).sort((x, y) => x - y)).toEqual([24, 36]); // Σ = 60
    expect((await projectState(projet.id)).status).toBe("COMPLETED");
  });

  it("les quotas de démo n'amputent jamais les vraies parts d'une étape à l'autre", async () => {
    // Mix réel/démo sur DEUX étapes : sans le quota théorique passé des
    // contributions de démo, l'étape 2 écrêtait la plus grosse vraie part.
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id); // objectif 100, étapes 60/40
    const a = await mkUser();
    const b = await mkUser();
    await contribute(a.id, projet.id, 30, `pi_${RUN}_mix_a`);
    await contribute(b.id, projet.id, 30, `pi_${RUN}_mix_b`);
    const c = await mkUser();
    await contribute(c.id, projet.id, 40); // démo, sans charge

    for (const order of [1, 2] as const) {
      await submitMilestoneProof(porteur.id, {
        milestoneId: projet.milestones[order - 1].id,
        content: "Preuve de test suffisamment longue.",
      });
      const preuve = await prisma.proof.findFirstOrThrow({
        where: { milestoneId: projet.milestones[order - 1].id, status: "PENDING" },
      });
      await castVote(a.id, preuve.id, "APPROVE"); // 30 ≤ 50 : pas de majorité
      await castVote(b.id, preuve.id, "APPROVE"); // 60 > 50 : étape libérée
    }

    const contribA = await prisma.contribution.findFirstOrThrow({
      where: { projectId: projet.id, userId: a.id },
    });
    const parts = await prisma.milestonePayout.findMany({
      where: { contributionId: contribA.id },
      orderBy: { amountMinor: "asc" },
    });
    // Étape 1 : 30 × 60 % = 18. Étape 2 : cumul 30 − 18 = 12 — la part de
    // démo (40 %) ne vole rien. Cumul = la contribution entière × released.
    expect(parts.map((p) => p.amountMinor)).toEqual([12, 18]);
  });

  it("borne le remboursement d'échec à ce qui reste sur chaque charge après versements", async () => {
    const { projet } = await financeEtLibereÉtape1(`pi_${RUN}_borne`);

    // Échéance de réalisation dépassée sans preuve en cours → échec du reste.
    await prisma.project.update({
      where: { id: projet.id },
      data: { realizationDeadline: new Date(Date.now() - 1000) },
    });
    await failOverdueRealizations();

    expect((await projectState(projet.id)).status).toBe("FAILED");
    const refunds = await refundsOf(projet.id); // tri par montant décroissant
    // Charge réelle : min(prorata 24, 60 − 36 déjà versés) ; démo : prorata.
    expect(refunds[0]).toMatchObject({ amount: 60, refunded: true, refundDueMinor: 24 });
    expect(refunds[1]).toMatchObject({ amount: 40, refunded: true, refundDueMinor: 16 });
  });
});

describe("échec de campagne (deadline sans financement)", () => {
  it("flèche le remboursement intégral de chaque contribution", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id, {
      deadline: new Date(Date.now() - 86_400_000),
    });
    const a = await mkUser();
    await prisma.contribution.create({
      data: { userId: a.id, projectId: projet.id, amount: 30, usdCents: 30 },
    });
    await prisma.project.update({ where: { id: projet.id }, data: { raised: 30 } });

    await failExpiredProjects();

    const après = await projectState(projet.id);
    expect(après.status).toBe("FAILED");
    const [c] = await refundsOf(projet.id);
    expect(c.refunded).toBe(true);
    expect(c.refundDueMinor).toBe(30); // remboursement intégral (rien libéré)
  });
});

describe("échéance de réalisation", () => {
  const retarder = (projetId: string) =>
    prisma.project.update({
      where: { id: projetId },
      data: { realizationDeadline: new Date(Date.now() - 86_400_000) },
    });

  async function funded() {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser();
    const b = await mkUser();
    await contribute(a.id, projet.id, 60);
    await contribute(b.id, projet.id, 40);
    return { porteur, projet, a, b };
  }

  it("refuse une nouvelle preuve après l'échéance", async () => {
    const { porteur, projet } = await funded();
    await retarder(projet.id);

    await expect(
      submitMilestoneProof(porteur.id, {
        milestoneId: projet.milestones[0].id,
        content: "Preuve déposée trop tard, suffisamment longue.",
      })
    ).rejects.toThrow(DomainError);
  });

  it("sans vote en cours : échec et remboursement intégral fléché", async () => {
    const { projet } = await funded();
    await retarder(projet.id);

    await failOverdueRealizations();

    const après = await projectState(projet.id);
    expect(après.status).toBe("FAILED");
    expect(après.failureReason).toContain(`${REALIZATION_DAYS} jours`);
    const [c60, c40] = await refundsOf(projet.id);
    expect(c60.refundDueMinor).toBe(60);
    expect(c40.refundDueMinor).toBe(40);
  });

  it("vote ouvert à la balance POUR : l'étape est libérée in extremis, seul le reste est remboursé", async () => {
    const { porteur, projet, b } = await funded();
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve déposée avant l'échéance.",
    });
    const preuve = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });
    await castVote(b.id, preuve.id, "APPROVE"); // 40 ≤ 50 : vote ouvert

    await retarder(projet.id);
    await failOverdueRealizations();

    const après = await projectState(projet.id);
    expect(après.status).toBe("FAILED");
    expect(après.released).toBe(60); // étape 1 libérée à la balance
    // Reste 40 remboursés au prorata : 60/100 → 24, 40/100 → 16.
    const [c60, c40] = await refundsOf(projet.id);
    expect(c60.refundDueMinor).toBe(24);
    expect(c40.refundDueMinor).toBe(16);
  });

  it("dernière étape validée in extremis : le projet est RÉALISÉ, rien à rembourser", async () => {
    const { porteur, projet, a, b } = await funded();
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve étape 1 suffisamment longue.",
    });
    const preuve1 = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });
    await castVote(a.id, preuve1.id, "APPROVE"); // 60 > 50 → étape 1 libérée
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[1].id,
      content: "Preuve étape finale suffisamment longue.",
    });
    const preuve2 = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[1].id, status: "PENDING" },
    });
    await castVote(b.id, preuve2.id, "APPROVE"); // 40 ≤ 50 : vote ouvert

    await retarder(projet.id);
    await failOverdueRealizations();

    const après = await projectState(projet.id);
    expect(après.status).toBe("COMPLETED");
    expect(après.released).toBe(100);
    const dues = await refundsOf(projet.id);
    expect(dues.every((c) => c.refundDueMinor === 0)).toBe(true);
  });
});

describe("réinitialisation de mot de passe", () => {
  it("pose le nouveau mot de passe et le token ne sert qu'une fois", async () => {
    const u = await mkUser();
    const token = await createResetToken(u.id);

    await resetPassword(token, "nouveau-mdp-123");

    const bcrypt = (await import("bcryptjs")).default;
    const après = await prisma.user.findUniqueOrThrow({
      where: { id: u.id },
      select: { passwordHash: true },
    });
    expect(await bcrypt.compare("nouveau-mdp-123", après.passwordHash!)).toBe(true);
    await expect(resetPassword(token, "encore-un-autre-mdp")).rejects.toThrow(DomainError);
  });

  it("refuse un token expiré ou inconnu, et plafonne à 3 demandes par heure", async () => {
    const u = await mkUser();
    const token = await createResetToken(u.id);
    await prisma.passwordResetToken.updateMany({
      where: { userId: u.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await expect(resetPassword(token, "mdp-valide-123")).rejects.toThrow(DomainError);
    await expect(resetPassword("token-bidon", "mdp-valide-123")).rejects.toThrow(DomainError);

    await createResetToken(u.id);
    await createResetToken(u.id); // 3e de l'heure
    await expect(createResetToken(u.id)).rejects.toThrow(DomainError);
  });

  it("une nouvelle demande invalide le lien précédent ; email inconnu = silence", async () => {
    const u = await mkUser();
    const t1 = await createResetToken(u.id);
    const t2 = await createResetToken(u.id);

    await expect(resetPassword(t1, "mdp-valide-123")).rejects.toThrow(DomainError);
    await resetPassword(t2, "mdp-valide-123");

    await expect(requestPasswordReset("nexiste-pas@fixture.test")).resolves.toBeUndefined();
  });
});

describe("durée de campagne", () => {
  it("borne le choix du porteur à 7–90 jours, avec le pourquoi dans l'erreur", async () => {
    const base = {
      title: "Titre valide de projet",
      pitch: "Pitch valide de projet.",
      description: "Description valide suffisamment longue pour la validation Zod.",
      category: "TECH",
      currency: "eur",
      goal: 100,
      coverUrl: "",
      neededSkills: [],
      milestones: [
        { title: "Étape un", description: "Livrable un.", amount: 50 },
        { title: "Étape deux", description: "Livrable deux.", amount: 50 },
      ],
    };

    expect(createProjectSchema.safeParse({ ...base, durationDays: 90 }).success).toBe(true);
    const trop = createProjectSchema.safeParse({ ...base, durationDays: 91 });
    expect(trop.success).toBe(false);
    if (!trop.success) {
      expect(trop.error.errors[0].message).toContain("90 jours maximum");
      expect(trop.error.errors[0].message).toContain("séquestre");
    }
    expect(createProjectSchema.safeParse({ ...base, durationDays: 6 }).success).toBe(false);
    expect(createProjectSchema.safeParse({ ...base, currency: "xyz" }).success).toBe(false);
  });
});

describe("signalements et modération", () => {
  it("refuse le doublon ouvert, le motif hors liste et l'auto-signalement", async () => {
    const reporter = await mkUser();
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);

    await createReport(reporter.id, {
      targetType: "PROJECT",
      targetId: projet.id,
      reason: "Spam ou démarchage",
    });
    await expect(
      createReport(reporter.id, {
        targetType: "PROJECT",
        targetId: projet.id,
        reason: "Spam ou démarchage",
      })
    ).rejects.toThrow(DomainError);
    await expect(
      createReport(reporter.id, {
        targetType: "PROJECT",
        targetId: projet.id,
        reason: "Motif inventé",
      })
    ).rejects.toThrow(DomainError);
    await expect(
      createReport(reporter.id, {
        targetType: "USER",
        targetId: reporter.id,
        reason: "Autre",
      })
    ).rejects.toThrow(DomainError);
  });

  it("seul un admin tranche, une seule fois — et re-signaler après résolution est permis", async () => {
    const reporter = await mkUser();
    const quidam = await mkUser();
    const admin = await mkUser();
    await prisma.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);

    await createReport(reporter.id, {
      targetType: "PROJECT",
      targetId: projet.id,
      reason: "Autre",
      detail: "Détail de test.",
    });
    const report = await prisma.report.findFirstOrThrow({
      where: { reporterId: reporter.id, status: "OPEN" },
    });

    await expect(handleReport(quidam.id, report.id, "RESOLVED")).rejects.toThrow(DomainError);
    await handleReport(admin.id, report.id, "RESOLVED");
    await expect(handleReport(admin.id, report.id, "DISMISSED")).rejects.toThrow(DomainError);

    const après = await prisma.report.findUniqueOrThrow({ where: { id: report.id } });
    expect(après.status).toBe("RESOLVED");
    expect(après.handledBy).toBe(admin.id);

    await createReport(reporter.id, {
      targetType: "PROJECT",
      targetId: projet.id,
      reason: "Autre",
    });
  });
});

describe("effacement de compte (RGPD)", () => {
  it("refuse tant qu'une campagne soutenue est en cours", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser();
    await contribute(a.id, projet.id, 10);

    await expect(eraseAccount(porteur.id)).rejects.toThrow(DomainError);
  });

  it("anonymise et coupe la connexion", async () => {
    const u = await mkUser(1200);
    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash: "hash", bio: "bio", city: "Paris", skills: ["photo"] },
    });

    await eraseAccount(u.id);

    const après = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(après.name).toBe("Membre retiré");
    expect(après.email).toContain("compte-supprime");
    expect(après.email).not.toContain("@fixture.test");
    expect(après.passwordHash).toBeNull();
    expect(après.bio).toBeNull();
    expect(après.city).toBeNull();
    expect(après.skills).toEqual([]);

    await prisma.user.delete({ where: { id: u.id } }); // hors filet de purge
  });
});

describe("édition et retrait de projet", () => {
  it("verrouille l'édition aux porteurs et aux campagnes actives, le retrait aux projets sans soutien", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const autre = await mkUser();
    const contenu = {
      title: "Titre modifié valide",
      pitch: "Pitch modifié valide.",
      description: "Description modifiée suffisamment longue pour Zod, cinquante caractères.",
      category: "TECH" as const,
      coverUrl: "",
      neededSkills: [],
    };

    await expect(updateProject(autre.id, projet.id, contenu)).rejects.toThrow(DomainError);
    await updateProject(porteur.id, projet.id, contenu); // porteur + ACTIVE : OK

    await contribute(autre.id, projet.id, 10);
    await expect(deleteProject(porteur.id, projet.id)).rejects.toThrow(DomainError);

    const vierge = await mkProject(porteur.id);
    await deleteProject(porteur.id, vierge.id);
    expect(await prisma.project.findUnique({ where: { id: vierge.id } })).toBeNull();
  });

  it("l'arrêt volontaire par le porteur rembourse le séquestre restant et passe le projet en échec", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser();
    const b = await mkUser();
    await contribute(a.id, projet.id, 40);
    await contribute(b.id, projet.id, 30);

    // Non-porteur refusé ; le porteur peut arrêter une campagne ACTIVE soutenue.
    await expect(cancelProjectByOwner(a.id, projet.id)).rejects.toThrow(DomainError);
    await cancelProjectByOwner(porteur.id, projet.id);

    const after = await projectState(projet.id);
    expect(after.status).toBe("FAILED");
    expect(after.failureReason).toContain("arrêté par son porteur");

    // Rien n'était débloqué : remboursement intégral figé pour les deux.
    const refunds = await refundsOf(projet.id);
    expect(refunds.every((c) => c.refunded)).toBe(true);
    expect(refunds.map((c) => c.refundDueMinor).sort((x, y) => x - y)).toEqual([30, 40]);

    // Un projet déjà arrêté ne peut plus l'être.
    await expect(cancelProjectByOwner(porteur.id, projet.id)).rejects.toThrow(DomainError);
  });
});
