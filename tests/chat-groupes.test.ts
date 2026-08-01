import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { eraseAccount } from "../src/lib/account";
import { createReport } from "../src/lib/moderation";
import {
  createGroup,
  deleteGroupMessage,
  dissolveGroup,
  excludeFromGroup,
  getGroupBySlug,
  getGroupThread,
  getMyGroups,
  joinGroup,
  leaveGroup,
  listGroups,
  markGroupRead,
  missingLanguageRooms,
  openLanguageRooms,
  postGroupMessage,
  readmitToGroup,
  setGroupManager,
} from "../src/lib/chat-groups";
import { LANGUAGE_ROOMS, MAX_GROUPS_OWNED } from "../src/lib/constants";
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

describe("salons de langue (officiels)", () => {
  async function mkAdmin() {
    const admin = await mkUser();
    await prisma.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    return admin;
  }

  it("réserve les salons officiels à l'équipe", async () => {
    const membre = await mkUser();
    await expect(openLanguageRooms(membre.id)).rejects.toThrow(DomainError);
    await expect(
      createGroup(
        membre.id,
        { name: "Faux officiel", purpose: "Tentative de salon officiel.", category: "AUTRE" },
        { official: true }
      )
    ).rejects.toThrow(DomainError);
  });

  it("ouvre chaque langue une seule fois et l'épingle en tête d'annuaire", async () => {
    const admin = await mkAdmin();

    await openLanguageRooms(admin.id);
    // Rejouable : le second passage ne duplique rien (reconnaissance par slug).
    expect(await openLanguageRooms(admin.id)).toBe(0);
    expect(await missingLanguageRooms()).toBe(0);

    const slugs = await prisma.chatGroup.findMany({
      where: { slug: { in: LANGUAGE_ROOMS.map((r) => r.slug) } },
      select: { slug: true, official: true, category: true },
    });
    expect(slugs).toHaveLength(LANGUAGE_ROOMS.length);
    expect(slugs.every((g) => g.official && g.category === "AUTRE")).toBe(true);

    // Un groupe de membre ouvert après eux passe quand même derrière.
    await createGroup(admin.id, {
      name: "Groupe ordinaire",
      purpose: "Un groupe de membre dans la même catégorie.",
      category: "AUTRE",
    });
    const annuaire = await listGroups({ category: "AUTRE", userId: admin.id });
    expect(annuaire[0].official).toBe(true);
    expect(annuaire.at(-1)?.official).toBe(false);
  });

  it("garde les salons d'accueil à la plateforme, même vidés de leur animateur", async () => {
    const admin = await mkAdmin();
    // Salon officiel de fixture : les vrais salons de langue sont partagés
    // par toute la base, une suite ne doit pas leur retirer leurs membres.
    const slug = await createGroup(
      admin.id,
      { name: "Accueil fixture", purpose: "Salon d'accueil de test.", category: "AUTRE" },
      { official: true, slug: `accueil-${RUN}` }
    );

    // Quelqu'un passe, puis l'animation quitte le salon.
    const membre = await mkUser();
    await joinGroup(membre.id, slug);
    const dissous = await leaveGroup(admin.id, slug);

    expect(dissous).toBe(false);
    const apres = await prisma.chatGroup.findUniqueOrThrow({ where: { slug } });
    // L'animation NE tombe PAS au membre le plus ancien.
    expect(apres.ownerId).toBe(admin.id);
    // Et un membre ordinaire ne peut pas fermer la porte d'entrée.
    await expect(dissolveGroup(membre.id, slug)).rejects.toThrow(DomainError);

    // Le salon survit même vidé de tous ses membres.
    await leaveGroup(membre.id, slug);
    expect(await prisma.chatGroup.count({ where: { slug } })).toBe(1);
  });

  it("laisse l'équipe animer ses salons SANS entamer son plafond de groupes", async () => {
    const admin = await mkAdmin();
    for (let i = 0; i < MAX_GROUPS_OWNED; i += 1) {
      await group(admin.id, `Salon perso ${i}`);
    }
    // Le plafond s'applique à l'équipe comme à tout le monde…
    await expect(group(admin.id, "Un de trop")).rejects.toThrow(DomainError);
    // …mais les salons d'accueil n'y entrent pas.
    await expect(
      createGroup(
        admin.id,
        { name: "Salon d'accueil", purpose: "Salon officiel hors plafond.", category: "AUTRE" },
        { official: true, slug: `officiel-${RUN}` }
      )
    ).resolves.toBe(`officiel-${RUN}`);
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

  it("accueille l'arrivant dans la langue du salon, sans réveiller le fil", async () => {
    const admin = await mkUser();
    await prisma.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    await openLanguageRooms(admin.id);

    // Un membre déjà installé : c'est chez lui que l'arrivée ne doit pas
    // faire clignoter le salon.
    const installe = await mkUser();
    await joinGroup(installe.id, "salon-english");

    const arrivant = await mkUser();
    await joinGroup(arrivant.id, "salon-english");
    const anglais = await getGroupBySlug("salon-english", arrivant.id);
    const fil = await getGroupThread(anglais!.id);

    const accueil = fil.messages.at(-1)!;
    expect(accueil.system).toBe(true);
    expect(accueil.body).toBe(`${arrivant.name} joined the room. Welcome!`);
    // Ligne d'événement : ni notification pour les membres, ni compteur.
    expect(
      await prisma.notification.count({
        where: { type: "GROUP_MESSAGE", href: "/chat/groupes/salon-english" },
      })
    ).toBe(0);
    expect(anglais?.messageCount).toBe(0);
    // …et le salon ne clignote pas « non lu » chez le membre déjà installé.
    expect((await getMyGroups(installe.id)).find((g) => g.slug === "salon-english")?.unread).toBe(
      false
    );

    // Rejoindre deux fois n'accueille pas deux fois (2 lignes : 2 arrivées).
    await joinGroup(arrivant.id, "salon-english");
    expect(await prisma.groupMessage.count({ where: { groupId: anglais!.id } })).toBe(2);

    // Un groupe ordinaire accueille en français, la langue de la plateforme.
    const ordinaire = await group(admin.id, "Groupe ordinaire");
    await joinGroup(arrivant.id, ordinaire);
    const fose = await getGroupBySlug(ordinaire, arrivant.id);
    const filOrdinaire = await getGroupThread(fose!.id);
    expect(filOrdinaire.messages.at(-1)?.body).toBe(
      `${arrivant.name} a rejoint le groupe. Bienvenue !`
    );
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

describe("animation d'un salon : gérant·es et exclusions", () => {
  it("réserve la nomination à l'animateur, et la gérance ne se retourne pas contre lui", async () => {
    const animateur = await mkUser();
    const gerant = await mkUser();
    const membre = await mkUser();
    const slug = await group(animateur.id);
    await joinGroup(gerant.id, slug);
    await joinGroup(membre.id, slug);

    // Un membre ordinaire ne nomme personne, pas même lui-même.
    await expect(setGroupManager(membre.id, slug, membre.id, true)).rejects.toThrow(DomainError);

    await setGroupManager(animateur.id, slug, gerant.id, true);
    expect((await getGroupBySlug(slug, gerant.id))?.isManager).toBe(true);

    // Un·e gérant·e ne nomme pas, ne destitue pas l'animateur…
    await expect(setGroupManager(gerant.id, slug, membre.id, true)).rejects.toThrow(DomainError);
    await expect(excludeFromGroup(gerant.id, slug, animateur.id)).rejects.toThrow(DomainError);
    // …ni ne se débarrasse d'un pair.
    const autreGerant = await mkUser();
    await joinGroup(autreGerant.id, slug);
    await setGroupManager(animateur.id, slug, autreGerant.id, true);
    await expect(excludeFromGroup(gerant.id, slug, autreGerant.id)).rejects.toThrow(DomainError);
  });

  it("exclut, ferme la porte au retour, puis réadmet", async () => {
    const animateur = await mkUser();
    const gerant = await mkUser();
    const genant = await mkUser();
    const slug = await group(animateur.id);
    const groupId = (await getGroupBySlug(slug, animateur.id))!.id;
    await joinGroup(gerant.id, slug);
    await setGroupManager(animateur.id, slug, gerant.id, true);
    await joinGroup(genant.id, slug);
    await postGroupMessage(genant.id, { groupId, body: "Un message qui restera." });

    await excludeFromGroup(gerant.id, slug, genant.id);
    expect((await getGroupBySlug(slug, genant.id))?.isMember).toBe(false);
    // La porte est fermée : rejoindre à nouveau est refusé.
    await expect(joinGroup(genant.id, slug)).rejects.toThrow(DomainError);
    // Mais ses propos restent — retirer une personne n'efface pas ses mots.
    expect(
      await prisma.groupMessage.count({ where: { groupId, senderId: genant.id, system: false } })
    ).toBe(1);

    await readmitToGroup(animateur.id, slug, genant.id);
    await joinGroup(genant.id, slug);
    expect((await getGroupBySlug(slug, genant.id))?.isMember).toBe(true);
  });

  it("passe l'animation au gérant le plus ancien quand l'animateur s'en va", async () => {
    const animateur = await mkUser();
    const ancien = await mkUser();
    const gerant = await mkUser();
    const slug = await group(animateur.id);
    await joinGroup(ancien.id, slug); // arrivé AVANT le gérant
    await joinGroup(gerant.id, slug);
    await setGroupManager(animateur.id, slug, gerant.id, true);

    await leaveGroup(animateur.id, slug);
    // La gérance prime sur l'ancienneté : il modérait déjà.
    expect((await getGroupBySlug(slug, gerant.id))?.owner.id).toBe(gerant.id);
  });
});

describe("remonter l'historique d'un fil", () => {
  it("rend les derniers messages, puis les précédents à la demande", async () => {
    const animateur = await mkUser();
    const slug = await group(animateur.id);
    const groupId = (await getGroupBySlug(slug, animateur.id))!.id;

    // 105 messages : une page pleine et un reste.
    const base = Date.now() - 105 * 60_000;
    await prisma.groupMessage.createMany({
      data: Array.from({ length: 105 }, (_, i) => ({
        groupId,
        senderId: animateur.id,
        body: `Message ${i + 1}`,
        createdAt: new Date(base + i * 60_000),
      })),
    });

    const derniers = await getGroupThread(groupId);
    expect(derniers.messages).toHaveLength(100);
    // On ouvre sur le PRÉSENT : le dernier message est le plus récent.
    expect(derniers.messages.at(-1)?.body).toBe("Message 105");
    expect(derniers.messages[0].body).toBe("Message 6");
    expect(derniers.hasOlder).toBe(true);
    expect(derniers.isHistory).toBe(false);

    const avant = await getGroupThread(groupId, derniers.messages[0].id);
    expect(avant.messages.at(-1)?.body).toBe("Message 5");
    expect(avant.isHistory).toBe(true);
    // On est remonté au début : plus rien derrière.
    expect(avant.hasOlder).toBe(false);
  });

  it("ignore une borne qui vient d'un autre salon", async () => {
    const animateur = await mkUser();
    const ici = await group(animateur.id, "Salon d'ici");
    const ailleurs = await group(animateur.id, "Salon d'ailleurs");
    const iciId = (await getGroupBySlug(ici, animateur.id))!.id;
    const ailleursId = (await getGroupBySlug(ailleurs, animateur.id))!.id;

    await postGroupMessage(animateur.id, { groupId: iciId, body: "Chez moi." });
    const etranger = await postGroupMessage(animateur.id, {
      groupId: ailleursId,
      body: "Chez le voisin.",
    });

    // Une borne étrangère ne doit pas servir de fenêtre sur ce salon.
    const fil = await getGroupThread(iciId, etranger.id);
    expect(fil.isHistory).toBe(false);
    expect(fil.messages.at(-1)?.body).toBe("Chez moi.");
  });
});

describe("retirer un message", () => {
  it("laisse l'auteur et l'animation retirer, personne d'autre", async () => {
    const animateur = await mkUser();
    const gerant = await mkUser();
    const bavard = await mkUser();
    const temoin = await mkUser();
    const slug = await group(animateur.id);
    const groupId = (await getGroupBySlug(slug, animateur.id))!.id;
    for (const u of [gerant, bavard, temoin]) await joinGroup(u.id, slug);
    await setGroupManager(animateur.id, slug, gerant.id, true);

    const sien = await postGroupMessage(bavard.id, { groupId, body: "Un message à moi." });
    const autre = await postGroupMessage(bavard.id, { groupId, body: "Un autre message." });
    const encore = await postGroupMessage(bavard.id, { groupId, body: "Et un troisième." });

    // Un simple témoin ne fait pas la police.
    await expect(deleteGroupMessage(temoin.id, sien.id)).rejects.toThrow(DomainError);
    // L'auteur, oui.
    await deleteGroupMessage(bavard.id, sien.id);
    // L'animation aussi — gérant·e comme animateur.
    await deleteGroupMessage(gerant.id, autre.id);
    await deleteGroupMessage(animateur.id, encore.id);
    expect(await prisma.groupMessage.count({ where: { groupId, system: false } })).toBe(0);
  });

  it("ne touche pas aux lignes d'arrivée et clôt le signalement du message retiré", async () => {
    const animateur = await mkUser();
    const bavard = await mkUser();
    const temoin = await mkUser();
    const slug = await group(animateur.id);
    const groupId = (await getGroupBySlug(slug, animateur.id))!.id;
    await joinGroup(bavard.id, slug);
    await joinGroup(temoin.id, slug);

    const arrivee = await prisma.groupMessage.findFirstOrThrow({
      where: { groupId, system: true },
    });
    await expect(deleteGroupMessage(animateur.id, arrivee.id)).rejects.toThrow(DomainError);

    const genant = await postGroupMessage(bavard.id, { groupId, body: "Un propos déplacé." });
    // On ne signale pas son propre message : on le retire.
    await expect(
      createReport(bavard.id, {
        targetType: "GROUP_MESSAGE",
        targetId: genant.id,
        reason: "Spam ou démarchage",
      })
    ).rejects.toThrow(DomainError);

    await createReport(temoin.id, {
      targetType: "GROUP_MESSAGE",
      targetId: genant.id,
      reason: "Contenu inapproprié ou haineux",
    });
    await deleteGroupMessage(animateur.id, genant.id);

    // Le signalement n'a plus d'objet : il sort de la file.
    const signalement = await prisma.report.findFirstOrThrow({
      where: { targetType: "GROUP_MESSAGE", targetId: genant.id },
    });
    expect(signalement.status).toBe("RESOLVED");
    expect(signalement.handledBy).toBe(animateur.id);
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
