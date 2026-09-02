import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { createVerificationToken, sendVerificationEmail, verifyEmailToken } from "../src/lib/email-verification";

const RUN = Date.now().toString(36);
const mk = (n: string) => prisma.user.create({ data: { email: `verif-${RUN}-${n}@fixture.test`, name: `V ${n}`, preferredLanguage: "es" } });

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: `verif-${RUN}-` } } });
  await prisma.$disconnect();
});

describe("vérification de l'adresse email", () => {
  it("l'email part dans la langue du compte, le lien confirme UNE fois, puis meurt", async () => {
    const u = await mk("a");
    const envois: { to: string; subject: string; text: string; html: string }[] = [];
    await sendVerificationEmail(u.id, async (i) => { envois.push(i); return { sent: true }; });
    expect(envois).toHaveLength(1);
    expect(envois[0].to).toBe(u.email);
    expect(envois[0].subject).toContain("Confirma"); // espagnol
    const token = envois[0].text.match(/\/verifier-email\/([A-Za-z0-9_-]+)/)![1];
    expect(envois[0].html).toContain(token);

    expect(await verifyEmailToken(token)).toBe(true);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: u.id } })).emailVerified).not.toBeNull();
    // Rejoué : mort. Faux : mort.
    expect(await verifyEmailToken(token)).toBe(false);
    expect(await verifyEmailToken("pas-un-jeton")).toBe(false);
    // Déjà confirmée : plus d'envoi.
    await sendVerificationEmail(u.id, async (i) => { envois.push(i); return { sent: true }; });
    expect(envois).toHaveLength(1);
  });

  it("un nouveau jeton tue le précédent, un jeton expiré ne confirme pas, et 3 envois par heure", async () => {
    const u = await mk("b");
    const t1 = await createVerificationToken(u.id);
    const t2 = await createVerificationToken(u.id);
    expect(await verifyEmailToken(t1)).toBe(false);
    await prisma.emailVerificationToken.updateMany({ where: { userId: u.id, usedAt: null }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await verifyEmailToken(t2)).toBe(false);
    await createVerificationToken(u.id); // 3e de l'heure
    await expect(createVerificationToken(u.id)).rejects.toThrow();
  });
});
