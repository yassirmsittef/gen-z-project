import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { confirmMfaEnrolment, disableMfa, mfaRequired, startMfaEnrolment } from "../src/lib/mfa";
import { hashPassword } from "../src/lib/password";
import { totpCode } from "../src/lib/totp";

/**
 * Double authentification des ADMIN — testée contre la base de dev, en
 * jouant chaque refus : un MEMBRE qui tente, un code faux, une confirmation
 * sans enrôlement, une désactivation sans le bon mot de passe.
 */
const SUFFIXE = `@mfa-${Date.now().toString(36)}.fixture.test`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: SUFFIXE } } });
  await prisma.$disconnect();
});

describe("double authentification", () => {
  it("est refusée à un membre ordinaire", async () => {
    const membre = await prisma.user.create({
      data: { email: `membre${SUFFIXE}`, name: "Membre", passwordHash: await hashPassword("Mdp!2026xxx") },
    });
    await expect(startMfaEnrolment(membre.id)).rejects.toThrow();
    expect(mfaRequired(await prisma.user.findUniqueOrThrow({ where: { id: membre.id } }))).toBe(false);
  });

  it("s'enrôle en deux temps, n'exige rien avant le premier code, et se désactive contre mot de passe", async () => {
    const admin = await prisma.user.create({
      data: { email: `admin${SUFFIXE}`, name: "Admin", role: "ADMIN", passwordHash: await hashPassword("Admin!2026xx") },
    });
    // Confirmer sans avoir commencé : refusé.
    await expect(confirmMfaEnrolment(admin.id, "000000")).rejects.toThrow();

    const { secret, uri } = await startMfaEnrolment(admin.id);
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(uri).toContain(`secret=${secret}`);
    // Secret posé, porte encore ouverte : rien n'est exigé à la connexion.
    expect(mfaRequired(await prisma.user.findUniqueOrThrow({ where: { id: admin.id } }))).toBe(false);

    // Un code faux ne ferme pas la porte.
    const faux = totpCode(secret, Date.now() + 5 * 60_000);
    await expect(confirmMfaEnrolment(admin.id, faux)).rejects.toThrow();
    expect(mfaRequired(await prisma.user.findUniqueOrThrow({ where: { id: admin.id } }))).toBe(false);

    // Le bon code l'active — et on ne s'enrôle pas deux fois.
    await confirmMfaEnrolment(admin.id, totpCode(secret));
    expect(mfaRequired(await prisma.user.findUniqueOrThrow({ where: { id: admin.id } }))).toBe(true);
    await expect(startMfaEnrolment(admin.id)).rejects.toThrow();

    // Désactiver : pas sans le mot de passe.
    await expect(disableMfa(admin.id, "pas-le-bon")).rejects.toThrow();
    expect(mfaRequired(await prisma.user.findUniqueOrThrow({ where: { id: admin.id } }))).toBe(true);
    await disableMfa(admin.id, "Admin!2026xx");
    const apres = await prisma.user.findUniqueOrThrow({ where: { id: admin.id } });
    expect(apres.totpSecret).toBeNull();
    expect(apres.totpEnabledAt).toBeNull();
  });
});
