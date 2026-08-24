import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationType } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { createCall, removeCall } from "../src/lib/boycott";
import { eraseAccount } from "../src/lib/account";
import {
  assertVideoStorageAvailable,
  getVideo,
  postVideo,
  removeVideo,
  videoStorageStatus,
} from "../src/lib/call-videos";
import {
  MAX_TOTAL_VIDEO_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_STORAGE_WARN_RATIO,
} from "../src/lib/constants";
import { DomainError } from "../src/lib/project-service";

/**
 * Le plafond GLOBAL du stockage vidéo — la seule limite qui protège la
 * facture quand mille membres sages déposent chacun dans les règles.
 *
 * La mesure de taille (`statOwnBlob`) interroge le stockage réel en
 * production ; ici elle est pilotée par la table TAILLES — aucun réseau.
 */

const TAILLES = vi.hoisted(() => new Map<string, number>());
/** Les fichiers dont la suppression a été RÉELLEMENT demandée au stockage. */
const SUPPRIMES = vi.hoisted(() => [] as string[]);

vi.mock("@/lib/blob", async (importOriginal) => {
  const réel = await importOriginal<typeof import("../src/lib/blob")>();
  return {
    ...réel,
    statOwnBlob: async (url: string | null | undefined) =>
      url && TAILLES.has(url) ? TAILLES.get(url)! : null,
    // Enregistre au lieu de ne rien faire : sans cette trace, aucun test ne
    // pouvait prouver que le FICHIER part avec la ligne — or c'est la seule
    // chose qui rend la baisse de la jauge honnête.
    deleteOwnBlob: async (url: string | null | undefined) => {
      if (url) SUPPRIMES.push(url);
    },
  };
});

const RUN = `s${Date.now().toString(36)}`;
/**
 * L'instant d'où part ce run. L'alerte de stockage vise TOUS les admins de la
 * base — c'est le comportement voulu en production, mais en développement la
 * base contient un admin de démo qui n'est pas une fixture : ses alertes
 * survivraient au nettoyage par suffixe d'email et s'afficheraient comme de
 * vraies alertes dans l'interface. On les efface par leur date.
 */
const DEBUT = new Date();
let seq = 0;
const BLOB = "https://exemple.public.blob.vercel-storage.com";
const Mo = 1024 * 1024;

// `muted` typé sur l'énumération et non sur `string[]` : c'est ce typage qui
// fait échouer le test si le nom d'un type de notification est mal écrit —
// sans lui, une coquille passerait pour une préférence coupée, et le test du
// caractère non masquable donnerait une assurance vide.
function mkUser(role: "MEMBER" | "ADMIN" = "MEMBER", muted: NotificationType[] = []) {
  seq += 1;
  return prisma.user.create({
    data: {
      email: `s${seq}-${RUN}@fixture.test`,
      name: `Membre ${seq}`,
      role,
      mutedNotifications: muted,
    },
  });
}

async function mkCall(authorId: string) {
  const slug = await createCall(authorId, {
    target: `Marque ${RUN}-${(seq += 1)}`,
    category: "FOOD",
    reason:
      "Je détaille ici ce que j'ai constaté, avec assez de longueur pour passer le minimum imposé par le formulaire.",
    wanted: "Une alternative locale, au même prix, avec une composition lisible.",
    sources: [],
  });
  const call = await prisma.boycottCall.findUnique({ where: { slug } });
  return call!;
}

/** Dépose un témoignage dont la taille mesurée est imposée par le test. */
async function mkVideo(
  userId: string,
  callId: string,
  bytes?: { video?: number; poster?: number }
) {
  seq += 1;
  const url = `${BLOB}/temoignages/${RUN}-${seq}.mp4`;
  const posterUrl = `${BLOB}/temoignages/posters/${RUN}-${seq}.webp`;
  if (bytes?.video !== undefined) TAILLES.set(url, bytes.video);
  if (bytes?.poster !== undefined) TAILLES.set(posterUrl, bytes.poster);
  return postVideo(userId, {
    callId,
    url,
    posterUrl,
    caption: "Ce que j'ai filmé en magasin cette semaine.",
    durationMs: 20_000,
  });
}

beforeEach(async () => {
  // La jauge est GLOBALE : on la remet à zéro pour que chaque test raisonne
  // depuis un état connu, même si un run précédent a laissé des restes.
  await prisma.callVideo.updateMany({
    where: { storedBytes: { not: null } },
    data: { storedBytes: null },
  });
  TAILLES.clear();
  SUPPRIMES.length = 0;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  // Les alertes tombées sur des admins qui ne sont PAS des fixtures.
  await prisma.notification.deleteMany({
    where: { type: "STORAGE_ALERT", createdAt: { gte: DEBUT } },
  });
  await prisma.$disconnect();
});

describe("l'empreinte d'un dépôt", () => {
  it("est mesurée auprès du stockage (vidéo + vignette) et enregistrée", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);

    const id = await mkVideo(membre.id, call.id, { video: 10 * Mo, poster: 1 * Mo });

    const ligne = await prisma.callVideo.findUnique({ where: { id } });
    expect(ligne!.storedBytes).toBe(11 * Mo);
    expect((await videoStorageStatus()).usedBytes).toBe(11 * Mo);
  });

  it("refuse un fichier que le stockage ne reconnaît pas — la mesure vaut preuve d'appartenance", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);

    // Aucune taille connue : la mesure échoue, exactement comme sur un fichier
    // hébergé dans le magasin de quelqu'un d'autre. Le refuser est la seule
    // façon d'empêcher qu'une vidéo hors de nos limites s'affiche sur le fil.
    await expect(mkVideo(membre.id, call.id)).rejects.toBeInstanceOf(DomainError);
    expect(await prisma.callVideo.count({ where: { authorId: membre.id } })).toBe(0);
  });

  it("refuse un fichier déjà publié — on ne détruit pas la vidéo d'un autre", async () => {
    const victime = await mkUser();
    const pillard = await mkUser();
    const call = await mkCall(victime.id);
    const url = `${BLOB}/temoignages/${RUN}-convoitee.mp4`;
    TAILLES.set(url, 8 * Mo);
    await postVideo(victime.id, {
      callId: call.id,
      url,
      caption: "Le témoignage que quelqu'un voudra faire disparaître.",
      durationMs: 20_000,
    });

    // Republier l'URL d'autrui donnerait le droit de la retirer — donc de
    // supprimer le fichier de la victime.
    await expect(
      postVideo(pillard.id, {
        callId: call.id,
        url,
        caption: "Je republie le fichier de quelqu'un d'autre pour l'effacer.",
        durationMs: 20_000,
      })
    ).rejects.toBeInstanceOf(DomainError);

    // Et pas davantage en la glissant comme VIGNETTE : le contrôle croise les
    // deux colonnes.
    const autre = `${BLOB}/temoignages/${RUN}-autre.mp4`;
    TAILLES.set(autre, 3 * Mo);
    await expect(
      postVideo(pillard.id, {
        callId: call.id,
        url: autre,
        posterUrl: url,
        caption: "Cette fois je la passe en vignette, même intention.",
        durationMs: 20_000,
      })
    ).rejects.toBeInstanceOf(DomainError);

    // La vidéo de la victime est intacte, et rien n'a été supprimé.
    expect((await videoStorageStatus()).usedBytes).toBe(8 * Mo);
    expect(SUPPRIMES).toHaveLength(0);
  });

  it("sort de la jauge au retrait, avec le fichier", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);
    const garde = await mkVideo(membre.id, call.id, { video: 10 * Mo });
    const retiré = await mkVideo(membre.id, call.id, { video: 7 * Mo });
    expect((await videoStorageStatus()).usedBytes).toBe(17 * Mo);

    const urlRetirée = (await prisma.callVideo.findUnique({ where: { id: retiré } }))!.url!;
    await removeVideo(membre.id, retiré, { isAdmin: false });

    // La ligne retirée garde sa trace mais son fichier n'existe plus : seule
    // la vidéo vivante coûte encore.
    expect((await videoStorageStatus()).usedBytes).toBe(10 * Mo);
    // Le FICHIER a réellement été supprimé du stockage — sans quoi la baisse
    // de la jauge serait un mensonge comptable : les octets resteraient
    // facturés, simplement invisibles.
    expect(SUPPRIMES).toContain(urlRetirée);
    // Et seulement celui-là : la vidéo gardée n'est pas touchée.
    const urlGardée = (await prisma.callVideo.findUnique({ where: { id: garde } }))!.url!;
    expect(SUPPRIMES).not.toContain(urlGardée);
  });
});

describe("le garde du plafond global", () => {
  it("refuse un jeton dès qu'une vidéo maximale ne tiendrait plus", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);
    const id = await mkVideo(membre.id, call.id, { video: 1 * Mo });

    // Pile la place pour une vidéo au poids maximal : passe encore.
    await prisma.callVideo.update({
      where: { id },
      data: { storedBytes: MAX_TOTAL_VIDEO_BYTES - MAX_VIDEO_BYTES },
    });
    await expect(assertVideoStorageAvailable()).resolves.toBeUndefined();

    // Un octet de moins de marge : le pire cas déborderait, on refuse.
    await prisma.callVideo.update({
      where: { id },
      data: { storedBytes: MAX_TOTAL_VIDEO_BYTES - MAX_VIDEO_BYTES + 1 },
    });
    await expect(assertVideoStorageAvailable()).rejects.toBeInstanceOf(DomainError);
  });
});

describe("l'alerte aux admins", () => {
  const alertesDe = (userId: string) =>
    prisma.notification.findMany({
      where: { userId, type: "STORAGE_ALERT" },
      orderBy: { createdAt: "asc" },
    });

  it("part au franchissement de 80 % — et seulement au franchissement", async () => {
    const admin = await mkUser("ADMIN");
    const membre = await mkUser();
    const call = await mkCall(membre.id);
    const seuil = MAX_TOTAL_VIDEO_BYTES * VIDEO_STORAGE_WARN_RATIO;

    // Juste sous le seuil : silence.
    await mkVideo(membre.id, call.id, { video: seuil - 1 * Mo });
    expect(await alertesDe(admin.id)).toHaveLength(0);

    // Le dépôt qui franchit : une alerte, pour l'admin et pas pour le membre.
    await mkVideo(membre.id, call.id, { video: 2 * Mo });
    const alertes = await alertesDe(admin.id);
    expect(alertes).toHaveLength(1);
    expect(alertes[0].title).toContain("80 %");
    expect(alertes[0].href).toBe("/admin#stockage-alerte");
    expect(await alertesDe(membre.id)).toHaveLength(0);

    // Au-dessus du seuil sans franchissement : pas une de plus.
    await mkVideo(membre.id, call.id, { video: 1 * Mo });
    expect(await alertesDe(admin.id)).toHaveLength(1);
  });

  it("signale la saturation quand les dépôts commencent à se refuser", async () => {
    const admin = await mkUser("ADMIN");
    const membre = await mkUser();
    const call = await mkCall(membre.id);

    // Un seul dépôt traverse 80 % ET la saturation : une seule alerte, la
    // plus grave.
    await mkVideo(membre.id, call.id, {
      video: MAX_TOTAL_VIDEO_BYTES - MAX_VIDEO_BYTES + 1 * Mo,
    });

    const alertes = await alertesDe(admin.id);
    expect(alertes).toHaveLength(1);
    expect(alertes[0].title).toContain("saturé");
  });

  it("ignore les préférences : couper ce type n'a aucun effet", async () => {
    const admin = await mkUser("ADMIN", ["STORAGE_ALERT"]);
    const membre = await mkUser();
    const call = await mkCall(membre.id);

    await mkVideo(membre.id, call.id, {
      video: MAX_TOTAL_VIDEO_BYTES * VIDEO_STORAGE_WARN_RATIO + 1 * Mo,
    });

    expect(await alertesDe(admin.id)).toHaveLength(1);
  });
});

/**
 * Deux chemins font disparaître des témoignages SANS passer par `removeVideo`.
 * Les deux oubliaient les fichiers : ils restaient servis sur une URL publique
 * et facturés pour toujours, invisibles de la jauge comme de la modération.
 */
describe("les fichiers suivent le contenu qui disparaît", () => {
  it("le retrait d'un APPEL emporte les fichiers de ses témoignages", async () => {
    const auteur = await mkUser();
    const filmeur = await mkUser();
    const call = await mkCall(auteur.id);
    const id = await mkVideo(filmeur.id, call.id, { video: 12 * Mo, poster: 1 * Mo });
    const avant = await prisma.callVideo.findUnique({ where: { id } });
    expect((await videoStorageStatus()).usedBytes).toBe(13 * Mo);

    await removeCall(auteur.id, call.id, { isAdmin: false });

    expect(SUPPRIMES).toContain(avant!.url!);
    expect(SUPPRIMES).toContain(avant!.posterUrl!);
    expect((await videoStorageStatus()).usedBytes).toBe(0);
    const après = await prisma.callVideo.findUnique({ where: { id } });
    expect(après!.url).toBeNull(); // plus rien ne pointe vers le fichier
    expect(après).not.toBeNull(); // mais la trace reste auditable
  });

  it("l'effacement d'un compte emporte les témoignages filmés de la personne", async () => {
    const partant = await mkUser();
    const restant = await mkUser();
    const call = await mkCall(restant.id);
    const sien = await mkVideo(partant.id, call.id, { video: 9 * Mo });
    const autre = await mkVideo(restant.id, call.id, { video: 4 * Mo });
    const urlSienne = (await prisma.callVideo.findUnique({ where: { id: sien } }))!.url!;
    const urlAutre = (await prisma.callVideo.findUnique({ where: { id: autre } }))!.url!;

    await eraseAccount(partant.id);

    // On y voyait son visage et on y entendait sa voix : anonymiser la ligne
    // User pendant que la vidéo tourne encore n'efface rien.
    expect(SUPPRIMES).toContain(urlSienne);
    expect(await getVideo(sien)).toBeNull();
    // Le témoignage de quelqu'un d'autre n'est pas emporté au passage.
    expect(SUPPRIMES).not.toContain(urlAutre);
    expect(await getVideo(autre)).not.toBeNull();
    expect((await videoStorageStatus()).usedBytes).toBe(4 * Mo);
  });
});
