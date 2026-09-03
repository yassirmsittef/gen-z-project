import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { confirmMfaEnrolment, consumeRecoveryCode, generateRecoveryCodes, startMfaEnrolment } from "../src/lib/mfa";
import { hashPassword } from "../src/lib/password";
import { totpCode } from "../src/lib/totp";

const SUFFIXE = `@secours-${Date.now().toString(36)}.fixture.test`;
afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: SUFFIXE } } });
  await prisma.$disconnect();
});

describe("codes de secours de la double authentification", () => {
  it("génère 8 codes uniques au bon format", () => {
    const { plain, hashes } = generateRecoveryCodes();
    expect(plain).toHaveLength(8);
    expect(new Set(plain).size).toBe(8);
    expect(new Set(hashes).size).toBe(8);
    for (const c of plain) expect(c).toMatch(/^[0-9a-f]{5}-[0-9a-f]{5}$/);
  });

  it("l'activation rend 8 codes, chacun ouvre UNE fois puis est brûlé", async () => {
    const admin = await prisma.user.create({
      data: { email: `admin${SUFFIXE}`, name: "Admin", role: "ADMIN", passwordHash: await hashPassword("Admin!2026xx") },
    });
    const { secret } = await startMfaEnrolment(admin.id);
    const codes = await confirmMfaEnrolment(admin.id, totpCode(secret));
    expect(codes).toHaveLength(8);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: admin.id } })).totpRecoveryCodes).toHaveLength(8);

    // Un code inconnu : refusé.
    expect(await consumeRecoveryCode(admin.id, "0000-0000")).toBe(false);
    // Un vrai code : accepté UNE fois, insensible aux espaces/casse/tirets.
    const c = codes[0];
    expect(await consumeRecoveryCode(admin.id, c.replace("-", " ").toUpperCase())).toBe(true);
    // Rejoué : brûlé.
    expect(await consumeRecoveryCode(admin.id, c)).toBe(false);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: admin.id } })).totpRecoveryCodes).toHaveLength(7);
  });
});
