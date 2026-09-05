import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { platformSupportTotal, recordPlatformSupport } from "../src/lib/platform-support";

/**
 * Soutien à la plateforme : enregistré une seule fois par session Stripe,
 * compté dans le total, et il DÉBLOQUE le droit de lancer un projet (le
 * soutien compte dans contributedUsdCents comme une contribution).
 */
const R = `soutien-${Date.now().toString(36)}`;
afterAll(async () => {
  await prisma.platformSupport.deleteMany({ where: { stripeSessionId: { startsWith: R } } });
  await prisma.notification.deleteMany({ where: { key: { in: ["support.thanks", "support.received"] }, createdAt: { gte: new Date(Date.now() - 600000) } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: R } } });
  await prisma.$disconnect();
});

describe("soutien à la plateforme", () => {
  it("enregistre une fois, additionne, et débloque le ticket projet", async () => {
    const u = await prisma.user.create({ data: { email: `${R}@fixture.test`, name: "S" } });
    expect(u.contributedUsdCents).toBe(0);
    const avant = await platformSupportTotal();

    const ok = await recordPlatformSupport({ stripeSessionId: `${R}-1`, stripePaymentIntentId: "pi_s", userId: u.id, amountMinor: 2000, currency: "chf", usdCents: 2300 });
    expect(ok).toBe(true);
    // Webhook rejoué : pas de doublon, pas de second déblocage.
    expect(await recordPlatformSupport({ stripeSessionId: `${R}-1`, stripePaymentIntentId: "pi_s", userId: u.id, amountMinor: 2000, currency: "chf", usdCents: 2300 })).toBe(false);

    expect(await platformSupportTotal()).toBe(avant + 2000);
    const apres = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(apres.contributedUsdCents).toBe(2300); // ≥ 2000 : le seuil « lancer mon projet » est franchi

    // Un don mérite un reçu : notification (relayée par email) au donateur.
    const recu = await prisma.notification.findFirst({ where: { userId: u.id, key: "support.thanks" } });
    expect(recu?.type).toBe("CONTRIBUTION_CONFIRMED");
    expect((recu?.params as { amountMinor: number }).amountMinor).toBe(2000);

    // Un soutien anonyme (sans compte) compte dans le total, sans casser.
    expect(await recordPlatformSupport({ stripeSessionId: `${R}-2`, stripePaymentIntentId: null, userId: null, amountMinor: 500, currency: "chf", usdCents: 0 })).toBe(true);
    expect(await platformSupportTotal()).toBe(avant + 2500);
  });
});
