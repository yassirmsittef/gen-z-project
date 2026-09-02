import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { LOGIN_BURST_ALERT_THRESHOLD } from "../src/lib/constants";
import { alertAdmins, checkLoginBurst } from "../src/lib/security-alerts";

/**
 * Les alertes de sécurité — contre la base de dev. Le seuil est sabotable :
 * un cran en dessous, rien ne part ; au seuil, l'admin est prévenu UNE fois.
 */
const RUN = Date.now().toString(36);
const EMAIL_ADMIN = `admin-alerte-${RUN}@fixture.test`;

afterAll(async () => {
  await prisma.loginAttempt.deleteMany({ where: { email: { startsWith: `rafale-${RUN}` } } });
  // Les alertes partent à TOUS les admins de la base de dev, pas seulement à
  // la fixture : on les retire toutes, sinon elles restent en attente d'email
  // et faussent le test qui compte les envois.
  await prisma.notification.deleteMany({ where: { type: "SECURITY_ALERT" } });
  await prisma.user.deleteMany({ where: { email: EMAIL_ADMIN } });
  await prisma.$disconnect();
});

describe("alertes de sécurité vers les admins", () => {
  it("une rafale d'échecs de connexion prévient l'admin, une seule fois tant qu'elle n'est pas lue", async () => {
    const admin = await prisma.user.create({ data: { email: EMAIL_ADMIN, name: "Admin", role: "ADMIN" } });
    await prisma.loginAttempt.deleteMany({});
    for (let i = 0; i < LOGIN_BURST_ALERT_THRESHOLD - 1; i++) {
      await prisma.loginAttempt.create({ data: { email: `rafale-${RUN}-${i}@x.invalid` } });
    }
    expect(await checkLoginBurst()).toBe(false);
    expect(await prisma.notification.count({ where: { userId: admin.id, type: "SECURITY_ALERT" } })).toBe(0);

    await prisma.loginAttempt.create({ data: { email: `rafale-${RUN}-fin@x.invalid` } });
    expect(await checkLoginBurst()).toBe(true);
    expect(await checkLoginBurst()).toBe(true);
    const alertes = await prisma.notification.findMany({ where: { userId: admin.id, type: "SECURITY_ALERT" } });
    expect(alertes).toHaveLength(1);
    expect(alertes[0].key).toBe("securityAlert.loginBurst");
    expect((alertes[0].params as { count: number }).count).toBe(LOGIN_BURST_ALERT_THRESHOLD);
  });

  it("un litige et une saturation de traduction arrivent aussi, avec leurs paramètres", async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL_ADMIN } });
    await alertAdmins("securityAlert.dispute", { reason: "fraudulent", count: 1 });
    await alertAdmins("securityAlert.translationSaturated", {});
    const cles = (await prisma.notification.findMany({ where: { userId: admin.id, type: "SECURITY_ALERT" }, select: { key: true } })).map((n) => n.key).sort();
    expect(cles).toEqual(["securityAlert.dispute", "securityAlert.loginBurst", "securityAlert.translationSaturated"]);
  });
});
