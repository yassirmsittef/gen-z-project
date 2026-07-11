import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { eraseAccount } from "../src/lib/account";
import { createReport, handleReport } from "../src/lib/moderation";
import { createProjectSchema } from "../src/lib/validation";
import { createResetToken, requestPasswordReset, resetPassword } from "../src/lib/password-reset";
import { MIN_CONTRIBUTION, REALIZATION_DAYS } from "../src/lib/constants";
import {
  castVote,
  deleteProject,
  DomainError,
  failExpiredProjects,
  failOverdueRealizations,
  makeContribution,
  submitMilestoneProof,
  updateProject,
} from "../src/lib/project-service";

/**
 * Règles du jeu — tests d'intégration contre la base de dev (port 5433,
 * `npm run db:start` d'abord). Chaque test crée ses propres fixtures,
 * toutes suffixées `@fixture.test`, purgées en fin de suite (les projets,
 * contributions, votes, notifications… partent en cascade avec les users).
 */

const RUN = `t${Date.now().toString(36)}`;
let seq = 0;

function mkUser(credits = 0) {
  seq += 1;
  return prisma.user.create({
    data: { email: `u${seq}-${RUN}@fixture.test`, name: `Fixture ${seq}`, credits },
  });
}

function mkProject(
  ownerId: string,
  data: Partial<Parameters<typeof prisma.project.create>[0]["data"]> = {}
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
      goal: 100,
      deadline: new Date(Date.now() + 30 * 86_400_000),
      milestones: {
        create: [
          { order: 1, title: "Étape 1", description: "x", amount: 60 },
          { order: 2, title: "Étape 2", description: "x", amount: 40 },
        ],
      },
      ...data,
    },
    include: { milestones: { orderBy: { order: "asc" } } },
  });
}

const projectState = (id: string) =>
  prisma.project.findUniqueOrThrow({
    where: { id },
    select: { status: true, raised: true, released: true, realizationDeadline: true, failureReason: true },
  });

const credits = async (userId: string) =>
  (await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } })).credits;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.$disconnect();
});

describe("contribution", () => {
  it("refuse la contribution à son propre projet, sous le minimum, ou sans solde", async () => {
    const porteur = await mkUser(100);
    const projet = await mkProject(porteur.id);
    const fauche = await mkUser(2);

    await expect(makeContribution(porteur.id, projet.id, 10)).rejects.toThrow(DomainError);
    await expect(makeContribution(fauche.id, projet.id, MIN_CONTRIBUTION - 1)).rejects.toThrow(
      DomainError
    );
    await expect(makeContribution(fauche.id, projet.id, 10)).rejects.toThrow(DomainError);
  });

  it("débite le contributeur, trace au ledger, et le financement ouvre l'échéance de réalisation", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const contrib = await mkUser(150);

    await makeContribution(contrib.id, projet.id, 40);
    expect(await credits(contrib.id)).toBe(110);
    expect((await projectState(projet.id)).status).toBe("ACTIVE");

    await makeContribution(contrib.id, projet.id, 60);
    const après = await projectState(projet.id);
    expect(après.status).toBe("FUNDED");
    expect(après.raised).toBe(100);
    const jours = Math.round(
      ((après.realizationDeadline?.getTime() ?? 0) - Date.now()) / 86_400_000
    );
    expect(jours).toBe(REALIZATION_DAYS);

    // Première étape activée + ledger du contributeur.
    const étape1 = await prisma.milestone.findFirstOrThrow({
      where: { projectId: projet.id, order: 1 },
    });
    expect(étape1.status).toBe("AWAITING_PROOF");
    const mouvements = await prisma.creditTransaction.findMany({
      where: { userId: contrib.id, type: "CONTRIBUTION" },
    });
    expect(mouvements.map((m) => m.amount).sort((a, b) => a - b)).toEqual([-60, -40]);
  });
});

describe("vote pondéré", () => {
  async function fundedAvecPreuve() {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser(100);
    const b = await mkUser(100);
    await makeContribution(a.id, projet.id, 60);
    await makeContribution(b.id, projet.id, 40);
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve de test suffisamment longue.",
    });
    const preuve = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });
    return { porteur, projet, a, b, preuve };
  }

  it("libère l'étape à la majorité stricte et crédite le porteur (net de commission)", async () => {
    const { porteur, projet, a, preuve } = await fundedAvecPreuve();

    await castVote(a.id, preuve.id, "APPROVE"); // 60 > 50 = majorité
    const après = await projectState(projet.id);
    expect(après.released).toBe(60); // le séquestre comptabilise le BRUT
    expect(après.status).toBe("FUNDED");
    // Première étape : commission max(ceil(60×5%), 5) = 5 → net 55.
    expect(await credits(porteur.id)).toBe(55);
    const ledger = await prisma.creditTransaction.findMany({
      where: { userId: porteur.id },
      select: { type: true, amount: true },
    });
    expect(ledger).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "MILESTONE_RELEASE", amount: 60 }),
        expect.objectContaining({ type: "FEE", amount: -5 }),
      ])
    );
    const étape2 = await prisma.milestone.findFirstOrThrow({
      where: { projectId: projet.id, order: 2 },
    });
    expect(étape2.status).toBe("AWAITING_PROOF");
  });

  it("interdit le porteur, les non-contributeurs et le double vote", async () => {
    const { porteur, b, preuve } = await fundedAvecPreuve();
    const étranger = await mkUser(50);

    await expect(castVote(porteur.id, preuve.id, "APPROVE")).rejects.toThrow(DomainError);
    await expect(castVote(étranger.id, preuve.id, "APPROVE")).rejects.toThrow(DomainError);
    await castVote(b.id, preuve.id, "REJECT"); // 40 ≤ 50 : pas encore tranché
    await expect(castVote(b.id, preuve.id, "REJECT")).rejects.toThrow(DomainError);
  });

  it("à l'unanimité exprimée sans majorité stricte, la balance tranche (égalité → refus)", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser(100);
    const b = await mkUser(100);
    await makeContribution(a.id, projet.id, 50);
    await makeContribution(b.id, projet.id, 50);
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

describe("échec de campagne (deadline sans financement)", () => {
  it("rembourse intégralement au prorata et marque les contributions", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id, {
      deadline: new Date(Date.now() - 86_400_000),
    });
    const a = await mkUser(100);
    // Contribution AVANT la deadline (fixture) : insertion directe.
    await prisma.contribution.create({
      data: { userId: a.id, projectId: projet.id, amount: 30 },
    });
    await prisma.project.update({ where: { id: projet.id }, data: { raised: 30 } });

    await failExpiredProjects();

    const après = await projectState(projet.id);
    expect(après.status).toBe("FAILED");
    expect(await credits(a.id)).toBe(130); // 100 restants + 30 remboursés
    const contribution = await prisma.contribution.findFirstOrThrow({
      where: { projectId: projet.id },
    });
    expect(contribution.refunded).toBe(true);
  });
});

describe("échéance de réalisation", () => {
  // L'échéance tombe (antidatage) — toujours APRÈS les dépôts de preuve,
  // comme dans la vraie chronologie.
  const retarder = (projetId: string) =>
    prisma.project.update({
      where: { id: projetId },
      data: { realizationDeadline: new Date(Date.now() - 86_400_000) },
    });

  async function funded() {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser(100);
    const b = await mkUser(100);
    await makeContribution(a.id, projet.id, 60);
    await makeContribution(b.id, projet.id, 40);
    return { porteur, projet, a, b };
  }

  async function fundedEnRetard() {
    const f = await funded();
    await retarder(f.projet.id);
    return f;
  }

  it("refuse une nouvelle preuve après l'échéance", async () => {
    const { porteur, projet } = await fundedEnRetard();

    await expect(
      submitMilestoneProof(porteur.id, {
        milestoneId: projet.milestones[0].id,
        content: "Preuve déposée trop tard, suffisamment longue.",
      })
    ).rejects.toThrow(DomainError);
  });

  it("sans vote en cours : échec et remboursement du séquestre restant", async () => {
    const { projet, a, b } = await fundedEnRetard();

    await failOverdueRealizations();

    const après = await projectState(projet.id);
    expect(après.status).toBe("FAILED");
    expect(après.failureReason).toContain(`${REALIZATION_DAYS} jours`);
    expect(await credits(a.id)).toBe(100); // 40 restants + 60 remboursés
    expect(await credits(b.id)).toBe(100);
  });

  it("vote en cours à la balance POUR : l'étape est libérée in extremis, seul le reste est remboursé", async () => {
    const { porteur, projet, a, b } = await funded();
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve déposée avant l'échéance.",
    });
    const preuve = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });
    // b (40) vote POUR : 40 ≤ 50, le vote reste ouvert.
    await castVote(b.id, preuve.id, "APPROVE");

    await retarder(projet.id);
    await failOverdueRealizations();

    const après = await projectState(projet.id);
    expect(après.status).toBe("FAILED");
    expect(après.released).toBe(60); // étape 1 libérée à la balance (brut)
    expect(await credits(porteur.id)).toBe(55); // net de la commission (5)
    // Reste 40 remboursés au prorata : a = 24, b = 16.
    expect(await credits(a.id)).toBe(40 + 24);
    expect(await credits(b.id)).toBe(60 + 16);
  });

  it("dernière étape validée in extremis : le projet est RÉALISÉ, rien à rembourser", async () => {
    const { porteur, projet, a } = await funded();
    // Étape 1 déjà libérée : on avance le jeu à la main jusqu'à l'étape finale.
    const preuve1 = await (async () => {
      await submitMilestoneProof(porteur.id, {
        milestoneId: projet.milestones[0].id,
        content: "Preuve étape 1 suffisamment longue.",
      });
      return prisma.proof.findFirstOrThrow({
        where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
      });
    })();
    await castVote(a.id, preuve1.id, "APPROVE"); // 60 > 50 → étape 1 libérée
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[1].id,
      content: "Preuve étape finale suffisamment longue.",
    });
    const preuve2 = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[1].id, status: "PENDING" },
    });
    const b2 = await prisma.contribution.findFirstOrThrow({
      where: { projectId: projet.id, amount: 40 },
    });
    await castVote(b2.userId, preuve2.id, "APPROVE"); // 40 ≤ 50 : vote ouvert

    await retarder(projet.id);
    await failOverdueRealizations();

    const après = await projectState(projet.id);
    expect(après.status).toBe("COMPLETED");
    expect(après.released).toBe(100);
    // Commission sur la première étape uniquement : 60−5 puis 40 pleins.
    expect(await credits(porteur.id)).toBe(95);
  });
});

describe("durée de campagne", () => {
  it("borne le choix du porteur à 7–90 jours, avec le pourquoi dans l'erreur", async () => {
    const base = {
      title: "Titre valide de projet",
      pitch: "Pitch valide de projet.",
      description: "Description valide suffisamment longue pour la validation Zod.",
      category: "TECH",
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
  });
});

describe("commission plateforme", () => {
  it("prend 5 % au-dessus du plancher, une seule fois par projet", async () => {
    const porteur = await mkUser();
    const projet = await prisma.project.create({
      data: {
        ownerId: porteur.id,
        title: "Fixture commission",
        slug: `fixture-${RUN}-fee-${Date.now()}`,
        pitch: "Pitch de test.",
        description: "Description de test.",
        category: "TECH",
        goal: 300,
        deadline: new Date(Date.now() + 30 * 86_400_000),
        milestones: {
          create: [
            { title: "Grosse étape 1", description: "x", amount: 200, order: 1 },
            { title: "Étape 2", description: "x", amount: 100, order: 2 },
          ],
        },
      },
      include: { milestones: { orderBy: { order: "asc" } } },
    });
    const a = await mkUser(300);
    await makeContribution(a.id, projet.id, 300);

    // Étape 1 (200) : commission = ceil(200×5 %) = 10 > plancher → net 190.
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[0].id,
      content: "Preuve étape un suffisamment longue.",
    });
    const p1 = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
    });
    await castVote(a.id, p1.id, "APPROVE");
    expect(await credits(porteur.id)).toBe(190);

    // Étape 2 (dernière, 100) : plus aucune commission → net 100.
    await submitMilestoneProof(porteur.id, {
      milestoneId: projet.milestones[1].id,
      content: "Preuve étape deux suffisamment longue.",
    });
    const p2 = await prisma.proof.findFirstOrThrow({
      where: { milestoneId: projet.milestones[1].id, status: "PENDING" },
    });
    await castVote(a.id, p2.id, "APPROVE");
    expect(await credits(porteur.id)).toBe(290);

    const fees = await prisma.creditTransaction.findMany({
      where: { userId: porteur.id, type: "FEE" },
    });
    expect(fees).toHaveLength(1);
    expect(fees[0].amount).toBe(-10);
  });
});

describe("effacement de compte (RGPD)", () => {
  it("refuse tant qu'une campagne soutenue est en cours", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const a = await mkUser(50);
    await makeContribution(a.id, projet.id, 10);

    await expect(eraseAccount(porteur.id)).rejects.toThrow(DomainError);
  });

  it("anonymise, coupe la connexion et solde le ledger", async () => {
    const u = await mkUser(35);
    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash: "hash", bio: "bio", city: "Paris", skills: ["photo"] },
    });

    await eraseAccount(u.id);

    const après = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(après.name).toBe("Membre retiré");
    expect(après.email).toContain("compte-supprime");
    expect(après.passwordHash).toBeNull();
    expect(après.bio).toBeNull();
    expect(après.city).toBeNull();
    expect(après.skills).toEqual([]);
    expect(après.credits).toBe(0);
    const solde = await prisma.creditTransaction.aggregate({
      where: { userId: u.id },
      _sum: { amount: true },
    });
    expect(solde._sum.amount ?? 0).toBe(-35); // contre-écriture du solde fixture

    // L'email d'origine est libéré (réinscription possible).
    expect(après.email).not.toContain("@fixture.test");

    // L'anonymisation sort la fixture du filet de nettoyage : purge directe.
    await prisma.user.delete({ where: { id: u.id } });
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

    // Anti-énumération : demander sur un email inexistant ne lève rien.
    await expect(requestPasswordReset("nexiste-pas@fixture.test")).resolves.toBeUndefined();
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

    // La cible peut être re-signalée maintenant que le dossier est clos.
    await createReport(reporter.id, {
      targetType: "PROJECT",
      targetId: projet.id,
      reason: "Autre",
    });
  });
});

describe("édition et retrait de projet", () => {
  it("verrouille l'édition aux porteurs et aux campagnes actives, le retrait aux projets sans soutien", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id);
    const autre = await mkUser(50);
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

    await makeContribution(autre.id, projet.id, 10);
    await expect(deleteProject(porteur.id, projet.id)).rejects.toThrow(DomainError);

    const vierge = await mkProject(porteur.id);
    await deleteProject(porteur.id, vierge.id);
    expect(await prisma.project.findUnique({ where: { id: vierge.id } })).toBeNull();
  });
});
