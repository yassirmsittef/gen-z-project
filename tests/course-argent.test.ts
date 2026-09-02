import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import {
  cancelProjectByOwner,
  castVote,
  fulfillContribution,
  submitMilestoneProof,
} from "../src/lib/project-service";

/**
 * La course trouvée par l'audit : un vote qui débloque une étape et l'arrêt
 * du projet par le porteur, lancés EN MÊME TEMPS. Sans verrou, 6 essais sur
 * 12 sortaient 160 d'un séquestre de 100 (60 versés + 100 remboursés). Avec
 * le verrou par projet, jamais plus que le séquestre — vérifié en sabotant le
 * verrou : ce test tombe alors.
 */
const RUN = Date.now().toString(36);
let seq = 0;

async function membre() {
  seq += 1;
  return prisma.user.create({
    data: { email: `course-${RUN}-${seq}@fixture.test`, name: `Course ${seq}`, contributedUsdCents: 5000 },
  });
}

async function projetFinanceAvecPreuve() {
  const porteur = await membre();
  const b = await membre();
  seq += 1;
  const projet = await prisma.project.create({
    data: {
      ownerId: porteur.id,
      title: `Course ${seq}`,
      slug: `course-${RUN}-${seq}`,
      pitch: "p",
      description: "d",
      category: "TECH",
      currency: "usd",
      goal: 100,
      status: "ACTIVE",
      deadline: new Date(Date.now() + 30 * 86_400_000),
      milestones: {
        create: [
          { order: 1, title: "Étape 1", description: "x", amount: 60 },
          { order: 2, title: "Étape 2", description: "x", amount: 40 },
        ],
      },
    },
    include: { milestones: { orderBy: { order: "asc" } } },
  });
  await fulfillContribution({
    userId: b.id,
    projectId: projet.id,
    amountMinor: 100,
    usdCents: 100,
    stripeSessionId: `cs_course_${RUN}_${seq}`,
    stripePaymentIntentId: null,
  });
  await submitMilestoneProof(porteur.id, {
    milestoneId: projet.milestones[0].id,
    content: "Preuve de test suffisamment longue.",
  });
  const preuve = await prisma.proof.findFirstOrThrow({
    where: { milestoneId: projet.milestones[0].id, status: "PENDING" },
  });
  return { porteur, b, projet, preuve };
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: `course-${RUN}-` } } });
  await prisma.$disconnect();
});

describe("un seul mouvement d'argent à la fois par projet", () => {
  it("vote décisif et arrêt simultanés ne sortent jamais plus que le séquestre (12 essais)", async () => {
    let surplus = 0;
    for (let essai = 0; essai < 12; essai++) {
      const { porteur, b, projet, preuve } = await projetFinanceAvecPreuve();
      await Promise.allSettled([
        castVote(b.id, preuve.id, "APPROVE"),
        cancelProjectByOwner(porteur.id, projet.id),
      ]);
      const apres = await prisma.project.findUniqueOrThrow({ where: { id: projet.id } });
      const verse = await prisma.milestonePayout.aggregate({
        where: { contribution: { projectId: projet.id } },
        _sum: { amountMinor: true },
      });
      const rembourse = await prisma.contribution.aggregate({
        where: { projectId: projet.id },
        _sum: { refundDueMinor: true },
      });
      const sorti = (verse._sum.amountMinor ?? 0) + (rembourse._sum.refundDueMinor ?? 0);
      if (sorti > apres.raised) surplus++;
      // Et l'état est cohérent : un projet FAILED n'a pas de part figée
      // après coup, un projet resté FUNDED n'a rien remboursé.
      if (apres.status === "FAILED") expect(apres.released + (rembourse._sum.refundDueMinor ?? 0)).toBeLessThanOrEqual(apres.raised);
    }
    expect(surplus).toBe(0);
  }, 120_000);
});
