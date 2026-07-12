import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import {
  LOGIN_MAX_FAILURES,
  clearLoginFailures,
  isLoginLocked,
  purgeStaleLoginAttempts,
  recordLoginFailure,
} from "../src/lib/login-rate-limit";

/**
 * Anti brute-force du login — helpers testés contre la base de dev (5433).
 * Le branchement dans `authorize` est vérifié E2E (POST réels sur le serveur
 * dev) : Auth.js ne s'instancie pas proprement dans vitest.
 */

const EMAIL = `brute-${Date.now().toString(36)}@fixture.test`;

afterAll(async () => {
  await prisma.loginAttempt.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.$disconnect();
});

describe("anti brute-force du login", () => {
  it("verrouille au seuil, insensible à la casse, et le succès remet à zéro", async () => {
    for (let i = 0; i < LOGIN_MAX_FAILURES - 1; i++) await recordLoginFailure(EMAIL);
    expect(await isLoginLocked(EMAIL)).toBe(false);

    // La dernière tentative arrive en MAJUSCULES : même compteur.
    await recordLoginFailure(EMAIL.toUpperCase());
    expect(await isLoginLocked(EMAIL)).toBe(true);

    await clearLoginFailures(EMAIL);
    expect(await isLoginLocked(EMAIL)).toBe(false);
  });

  it("la purge ne retire que les tentatives sorties de la fenêtre", async () => {
    await recordLoginFailure(EMAIL);
    await prisma.loginAttempt.create({
      data: { email: EMAIL, createdAt: new Date(Date.now() - 60 * 60_000) },
    });

    await purgeStaleLoginAttempts();

    expect(await prisma.loginAttempt.count({ where: { email: EMAIL } })).toBe(1);
    await clearLoginFailures(EMAIL);
  });
});
