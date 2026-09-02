import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { eraseAccount } from "../src/lib/account";
import { createResetToken, resetPassword } from "../src/lib/password-reset";
import { ERASED_EMAIL_DOMAIN } from "../src/lib/constants";
import { DomainError } from "../src/lib/project-service";

/**
 * Suppression de compte : ce que le droit à l'effacement doit VRAIMENT
 * emporter. Trois défauts trouvés en audit, tous présents en production :
 * les liens publics survivaient (ré-identification immédiate), les jetons de
 * réinitialisation survivaient (résurrection du compte), et la photo restait
 * servie.
 */

const RUN = `e${Date.now().toString(36)}`;
let seq = 0;

function mkUser(data: Record<string, unknown> = {}) {
  seq += 1;
  return prisma.user.create({
    data: {
      email: `e${seq}-${RUN}@fixture.test`,
      name: `Membre ${seq}`,
      passwordHash: "hash-bidon",
      ...data,
    },
  });
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: ERASED_EMAIL_DOMAIN } } });
  await prisma.$disconnect();
});

describe("droit à l'effacement", () => {
  it("emporte les liens publics, qui ré-identifient aussi sûrement qu'un nom", async () => {
    const membre = await mkUser({
      links: ["https://exemple.test/moi", "https://reseau.test/@moi"],
      bio: "Ma bio",
    });

    await eraseAccount(membre.id);

    const après = await prisma.user.findUnique({
      where: { id: membre.id },
      select: { links: true, bio: true, name: true },
    });
    expect(après!.links).toEqual([]);
    expect(après!.bio).toBeNull();
    expect(après!.name).toBe("Membre retiré");
  });

  it("emporte les jetons de réinitialisation en attente", async () => {
    const membre = await mkUser();
    await createResetToken(membre.id);
    expect(await prisma.passwordResetToken.count({ where: { userId: membre.id } })).toBe(1);

    await eraseAccount(membre.id);

    expect(await prisma.passwordResetToken.count({ where: { userId: membre.id } })).toBe(0);
  });

  it("refuse de ressusciter un compte effacé avec un jeton émis avant", async () => {
    const membre = await mkUser();
    // Le jeton est capturé AVANT la suppression — le cas d'un lien déjà
    // parti par email, que la purge ne peut pas rattraper côté boîte.
    const token = await createResetToken(membre.id);
    expect(token).toBeTruthy();

    await eraseAccount(membre.id);

    await expect(resetPassword(token, "un-nouveau-mot-de-passe")).rejects.toBeInstanceOf(
      DomainError
    );

    const après = await prisma.user.findUnique({
      where: { id: membre.id },
      select: { passwordHash: true },
    });
    // Sans le garde-fou, la ligne anonymisée reprenait un mot de passe et le
    // compte redevenait connectable (l'email neutralisé se déduit de l'id).
    expect(après!.passwordHash).toBeNull();
  });
});

describe("ce que l'effacement laissait derrière lui (audit du 02/09)", () => {
  it("retire le nom réel des lignes « X a rejoint », des notifications des autres et des signalements", async () => {
    const personne = await mkUser({ name: "Prénom Réel" });
    const temoin = await mkUser({ name: "Témoin" });
    const salon = await prisma.chatGroup.create({
      data: {
        name: `Salon efface ${Date.now().toString(36)}`,
        slug: `salon-efface-${Date.now().toString(36)}`,
        purpose: "x",
        category: "TECH",
        ownerId: temoin.id,
        members: { create: [{ userId: temoin.id }, { userId: personne.id }] },
      },
    });
    const ligne = await prisma.groupMessage.create({
      data: {
        groupId: salon.id,
        senderId: personne.id,
        system: true,
        systemKey: "joined",
        systemParams: { name: "Prénom Réel" },
        body: "Prénom Réel a rejoint le groupe. Bienvenue !",
      },
    });
    const notif = await prisma.notification.create({
      data: {
        userId: temoin.id,
        type: "MESSAGE",
        key: "message.new",
        params: { actorName: "Prénom Réel" },
        excerpt: "coucou",
        href: `/chat/${personne.id}`,
      },
    });
    const signalement = await prisma.report.create({
      data: { reporterId: personne.id, targetType: "USER", targetId: temoin.id, reason: "spam", detail: "texte libre identifiant" },
    });

    await eraseAccount(personne.id);

    const apresLigne = await prisma.groupMessage.findUniqueOrThrow({ where: { id: ligne.id } });
    expect((apresLigne.systemParams as { name: string | null }).name).toBeNull();
    expect(apresLigne.body).not.toContain("Prénom Réel");
    const apresNotif = await prisma.notification.findUniqueOrThrow({ where: { id: notif.id } });
    expect((apresNotif.params as { actorName: string }).actorName).toBe("Membre retiré");
    expect(apresNotif.excerpt).toBeNull();
    const apresSignalement = await prisma.report.findUniqueOrThrow({ where: { id: signalement.id } });
    expect(apresSignalement.detail).toBeNull();

    await prisma.chatGroup.delete({ where: { id: salon.id } });
  });
});
