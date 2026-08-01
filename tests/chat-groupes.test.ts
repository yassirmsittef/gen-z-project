import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { eraseAccount } from "../src/lib/account";
import { createReport } from "../src/lib/moderation";
import {
  createGroup,
  dissolveGroup,
  getGroupBySlug,
  getMyGroups,
  joinGroup,
  leaveGroup,
  markGroupRead,
  postGroupMessage,
} from "../src/lib/chat-groups";
import { MAX_GROUPS_OWNED } from "../src/lib/constants";
import { DomainError } from "../src/lib/project-service";

/**
 * Règles des groupes de chat — tests d'intégration contre la base de dev
 * (port 5433, `npm run db:start` d'abord). Mêmes conventions que la suite
 * « règles du jeu » : fixtures suffixées `@fixture.test`, purgées à la fin.
 */

const RUN = `g${Date.now().toString(36)}`;
let seq = 0;

function mkUser() {
  seq += 1;
  return prisma.user.create({
    data: { email: `g${seq}-${RUN}@fixture.test`, name: `Membre ${seq}` },
  });
}

function group(ownerId: string, name = "Salon fixture") {
  return createGroup(ownerId, {
    name,
    purpose: "Un salon de test pour la suite automatisée.",
    category: "GAMING",
  });
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.$disconnect();
});

describe("création d'un groupe dans une catégorie", () => {
  it("range le groupe dans sa catégorie et y installe son créateur", async () => {
    const fondateur = await mkUser();
    const slug = await group(fondateur.id, "Les devs du dimanche");

    const vue = await getGroupBySlug(slug, fondateur.id);
    expect(vue?.category).toBe("GAMING");
    expect(vue?.isOwner).toBe(true);
    expect(vue?.isMember).toBe(true);
    expect(vue?.memberCount).toBe(1);
    // Le slug reste lisible et unique (suffixe aléatoire).
    expect(slug.startsWith("les-devs-du-dimanche-")).toBe(true);
  });

  it("plafonne le nombre de groupes animés par un même membre", async () => {
    const fondateur = await mkUser();
    for (let i = 0; i < MAX_GROUPS_OWNED; i += 1) {
      await group(fondateur.id, `Salon ${i}`);
    }
    await expect(group(fondateur.id, "Un de trop")).rejects.toThrow(DomainError);
  });
});

describe("rejoindre, écrire, quitter", () => {
  it("réserve le fil aux membres et notifie les autres une seule fois", async () => {
    const fondateur = await mkUser();
    const visiteur = await mkUser();
    const slug = await group(fondateur.id);
    const groupId = (await getGroupBySlug(slug, fondateur.id))!.id;

    // Un non-membre ne peut pas écrire.
    await expect(
      postGroupMessage(visiteur.id, { groupId, body: "Coucou" })
    ).rejects.toThrow(DomainError);

    await joinGroup(visiteur.id, slug);
    // Rejoindre deux fois ne casse rien (double clic, deux onglets).
    await joinGroup(visiteur.id, slug);
    expect((await getGroupBySlug(slug, visiteur.id))?.memberCount).toBe(2);

    await postGroupMessage(visiteur.id, { groupId, body: "Salut tout le monde" });
    await postGroupMessage(visiteur.id, { groupId, body: "Quelqu'un pour un playtest ?" });

    // Deux messages, mais une seule notification non lue pour le fondateur.
    const notifications = await prisma.notification.findMany({
      where: { userId: fondateur.id, type: "GROUP_MESSAGE" },
    });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].href).toBe(`/chat/groupes/${slug}`);
    // L'auteur ne se notifie pas lui-même.
    expect(
      await prisma.notification.count({ where: { userId: visiteur.id, type: "GROUP_MESSAGE" } })
    ).toBe(0);
  });

  it("marque le fil non lu pour les autres, jamais pour l'auteur", async () => {
    const fondateur = await mkUser();
    const membre = await mkUser();
    const slug = await group(fondateur.id);
    const groupId = (await getGroupBySlug(slug, fondateur.id))!.id;
    await joinGroup(membre.id, slug);

    await postGroupMessage(membre.id, { groupId, body: "Premier message" });

    const pourLAuteur = (await getMyGroups(membre.id)).find((g) => g.slug === slug);
    const pourLAutre = (await getMyGroups(fondateur.id)).find((g) => g.slug === slug);
    expect(pourLAuteur?.unread).toBe(false);
    expect(pourLAutre?.unread).toBe(true);

    // Ouvrir le fil fait retomber la pastille.
    await markGroupRead(fondateur.id, groupId);
    expect((await getMyGroups(fondateur.id)).find((g) => g.slug === slug)?.unread).toBe(false);
  });

  it("passe l'animation au plus ancien membre quand l'animateur s'en va", async () => {
    const fondateur = await mkUser();
    const ancien = await mkUser();
    const recent = await mkUser();
    const slug = await group(fondateur.id);
    await joinGroup(ancien.id, slug);
    await joinGroup(recent.id, slug);

    const dissous = await leaveGroup(fondateur.id, slug);
    expect(dissous).toBe(false);

    const vue = await getGroupBySlug(slug, ancien.id);
    expect(vue?.owner.id).toBe(ancien.id);
    expect(vue?.memberCount).toBe(2);
    // L'ancien animateur n'est plus membre : le fil lui est refermé.
    expect((await getGroupBySlug(slug, fondateur.id))?.isMember).toBe(false);
  });

  it("dissout le groupe quand son dernier membre le quitte", async () => {
    const fondateur = await mkUser();
    const slug = await group(fondateur.id);

    expect(await leaveGroup(fondateur.id, slug)).toBe(true);
    expect(await getGroupBySlug(slug, fondateur.id)).toBeNull();
  });
});

describe("dissolution et modération", () => {
  it("réserve la dissolution à l'animateur (ou à un admin)", async () => {
    const fondateur = await mkUser();
    const membre = await mkUser();
    const slug = await group(fondateur.id);
    await joinGroup(membre.id, slug);

    await expect(dissolveGroup(membre.id, slug)).rejects.toThrow(DomainError);

    const admin = await mkUser();
    await prisma.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    await dissolveGroup(admin.id, slug);
    expect(await getGroupBySlug(slug, fondateur.id)).toBeNull();
  });

  it("permet de signaler un groupe, sauf le sien", async () => {
    const fondateur = await mkUser();
    const membre = await mkUser();
    const slug = await group(fondateur.id);
    const groupId = (await getGroupBySlug(slug, fondateur.id))!.id;

    await expect(
      createReport(fondateur.id, {
        targetType: "CHAT_GROUP",
        targetId: groupId,
        reason: "Spam ou démarchage",
      })
    ).rejects.toThrow(DomainError);

    await createReport(membre.id, {
      targetType: "CHAT_GROUP",
      targetId: groupId,
      reason: "Spam ou démarchage",
    });
    expect(
      await prisma.report.count({ where: { targetType: "CHAT_GROUP", targetId: groupId } })
    ).toBe(1);
  });
});

describe("effacement de compte (RGPD)", () => {
  it("transmet les groupes animés et retire le membre des salons", async () => {
    const partant = await mkUser();
    const restant = await mkUser();
    const repris = await group(partant.id, "Groupe repris");
    const orphelin = await group(partant.id, "Groupe orphelin");
    await joinGroup(restant.id, repris);

    await eraseAccount(partant.id);

    // Le salon vivant change d'animateur, le salon vide disparaît.
    expect((await getGroupBySlug(repris, restant.id))?.owner.id).toBe(restant.id);
    expect(await getGroupBySlug(orphelin, restant.id)).toBeNull();
    expect(await prisma.chatGroupMember.count({ where: { userId: partant.id } })).toBe(0);
  });
});
