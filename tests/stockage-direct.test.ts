import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationType } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { createCall, removeCall } from "../src/lib/boycott";
import { eraseAccount } from "../src/lib/account";
import {
  assertVideoStorageAvailable,
  getVideo,
  postVideo,
  claimUploadTicket,
  removeVideo,
  sweepOrphanVideoBlobs,
  storageStatus,
} from "../src/lib/call-videos";
import {
  MAX_TOTAL_VIDEO_BYTES,
  MAX_UPLOAD_TICKETS_PER_DAY,
  MAX_VIDEO_BYTES,
  ORPHAN_BLOB_GRACE_MS,
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
/** Le magasin simulé que parcourt le balayage : url → poids et date de dépôt. */
const MAGASIN = vi.hoisted(
  () => new Map<string, { size: number; uploadedAt: Date; pathname: string }>()
);

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
      if (url) {
        SUPPRIMES.push(url);
        MAGASIN.delete(url);
      }
    },
    // Ne rend que ce qui commence par le préfixe demandé — c'est justement le
    // garde-fou qu'on veut pouvoir mettre en défaut.
    listOwnBlobs: async function* (prefix: string) {
      for (const [url, meta] of [...MAGASIN.entries()]) {
        if (meta.pathname.startsWith(prefix)) yield { url, ...meta };
      }
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
  MAGASIN.clear();
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
    expect((await storageStatus()).usedBytes).toBe(11 * Mo);
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
    expect((await storageStatus()).usedBytes).toBe(8 * Mo);
    expect(SUPPRIMES).toHaveLength(0);
  });

  it("sort de la jauge au retrait, avec le fichier", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);
    const garde = await mkVideo(membre.id, call.id, { video: 10 * Mo });
    const retiré = await mkVideo(membre.id, call.id, { video: 7 * Mo });
    expect((await storageStatus()).usedBytes).toBe(17 * Mo);

    const urlRetirée = (await prisma.callVideo.findUnique({ where: { id: retiré } }))!.url!;
    await removeVideo(membre.id, retiré, { isAdmin: false });

    // La ligne retirée garde sa trace mais son fichier n'existe plus : seule
    // la vidéo vivante coûte encore.
    expect((await storageStatus()).usedBytes).toBe(10 * Mo);
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
    expect((await storageStatus()).usedBytes).toBe(13 * Mo);

    await removeCall(auteur.id, call.id, { isAdmin: false });

    expect(SUPPRIMES).toContain(avant!.url!);
    expect(SUPPRIMES).toContain(avant!.posterUrl!);
    expect((await storageStatus()).usedBytes).toBe(0);
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
    expect((await storageStatus()).usedBytes).toBe(4 * Mo);
  });
});

/**
 * Le balayage des fichiers orphelins. C'est du code qui EFFACE : chaque test
 * ci-dessous protège un garde-fou, et doit tomber si on le retire.
 */
describe("le balayage des fichiers que plus rien ne réclame", () => {
  /** Pose un fichier dans le magasin simulé, sans ligne en base. */
  const poser = (chemin: string, ageMs: number, size = 5 * Mo) => {
    const url = `${BLOB}/${chemin}`;
    MAGASIN.set(url, { size, uploadedAt: new Date(Date.now() - ageMs), pathname: chemin });
    return url;
  };

  it("supprime un dépôt abandonné, et rend les octets qu'il coûtait", async () => {
    const abandonné = poser(`temoignages/${RUN}-abandonne.mp4`, ORPHAN_BLOB_GRACE_MS + 60_000, 7 * Mo);

    const bilan = await sweepOrphanVideoBlobs();

    expect(bilan.orphelins).toBe(1);
    expect(bilan.octetsLibérés).toBe(7 * Mo);
    expect(SUPPRIMES).toContain(abandonné);
  });

  it("épargne le fichier d'un témoignage publié", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);
    const id = await mkVideo(membre.id, call.id, { video: 6 * Mo, poster: 1 * Mo });
    const ligne = await prisma.callVideo.findUnique({ where: { id } });
    // Le fichier existe dans le magasin depuis longtemps : seul son statut de
    // fichier RÉCLAMÉ doit le sauver.
    MAGASIN.set(ligne!.url!, {
      size: 6 * Mo,
      uploadedAt: new Date(Date.now() - ORPHAN_BLOB_GRACE_MS * 10),
      pathname: new URL(ligne!.url!).pathname.slice(1),
    });
    MAGASIN.set(ligne!.posterUrl!, {
      size: 1 * Mo,
      uploadedAt: new Date(Date.now() - ORPHAN_BLOB_GRACE_MS * 10),
      pathname: new URL(ligne!.posterUrl!).pathname.slice(1),
    });

    const bilan = await sweepOrphanVideoBlobs();

    expect(bilan.orphelins).toBe(0);
    expect(SUPPRIMES).not.toContain(ligne!.url!);
    // La VIGNETTE compte autant que la vidéo : elle est réclamée par l'autre
    // colonne, et l'oublier reviendrait à défigurer un témoignage en ligne.
    expect(SUPPRIMES).not.toContain(ligne!.posterUrl!);
  });

  it("épargne un dépôt tout frais — une publication peut être en cours", async () => {
    const enCours = poser(`temoignages/${RUN}-en-cours.mp4`, 60_000);

    const bilan = await sweepOrphanVideoBlobs();

    expect(bilan.orphelins).toBe(0);
    expect(SUPPRIMES).not.toContain(enCours);
  });

  it("ne sort JAMAIS du dossier des témoignages — les photos de profil vivent au même endroit", async () => {
    const avatar = poser(`avatars/${RUN}-photo.webp`, ORPHAN_BLOB_GRACE_MS * 5);
    const preuve = poser(`preuves/${RUN}-piece.png`, ORPHAN_BLOB_GRACE_MS * 5);

    const bilan = await sweepOrphanVideoBlobs();

    expect(SUPPRIMES).not.toContain(avatar);
    expect(SUPPRIMES).not.toContain(preuve);
    expect(bilan.examinés).toBe(0); // le balayage ne les a même pas regardés
  });

  it("à blanc : compte sans rien détruire", async () => {
    const orphelin = poser(`temoignages/${RUN}-blanc.mp4`, ORPHAN_BLOB_GRACE_MS * 2, 4 * Mo);

    const bilan = await sweepOrphanVideoBlobs({ dryRun: true });

    expect(bilan.orphelins).toBe(1);
    expect(bilan.octetsLibérés).toBe(4 * Mo);
    expect(SUPPRIMES).toHaveLength(0);
    expect(MAGASIN.has(orphelin)).toBe(true);
  });
});

describe("la jauge couvre le magasin entier", () => {
  it("compte les photos de profil, pas seulement les vidéos", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);
    await mkVideo(membre.id, call.id, { video: 20 * Mo });
    expect((await storageStatus()).usedBytes).toBe(20 * Mo);

    // Une photo de profil vit dans le MÊME magasin : l'ignorer laissait le
    // plafond déborder par l'autre bout.
    await prisma.user.update({
      where: { id: membre.id },
      data: { avatarUrl: `${BLOB}/avatars/${RUN}.webp`, avatarBytes: Math.round(1.5 * Mo) },
    });

    const état = await storageStatus();
    expect(état.videoBytes).toBe(20 * Mo);
    expect(état.avatarBytes).toBe(Math.round(1.5 * Mo));
    expect(état.usedBytes).toBe(20 * Mo + Math.round(1.5 * Mo));
  });

  it("les photos comptent aussi pour SATURER le magasin", async () => {
    const membre = await mkUser();
    // Aucune vidéo : c'est le poids des photos, seul, qui doit fermer la porte.
    await prisma.user.update({
      where: { id: membre.id },
      data: {
        avatarUrl: `${BLOB}/avatars/${RUN}-gros.webp`,
        avatarBytes: MAX_TOTAL_VIDEO_BYTES - MAX_VIDEO_BYTES + 1,
      },
    });

    await expect(assertVideoStorageAvailable()).rejects.toBeInstanceOf(DomainError);
  });
});

describe("la cadence des jetons d'upload", () => {
  it("coupe au-delà du plafond quotidien, même sans jamais publier", async () => {
    const membre = await mkUser();

    // Personne ne publie ici : le quota de PUBLICATION reste donc intact.
    // C'était la faille — obtenir des jetons sans fin, 30 Mo engagés chacun.
    for (let i = 0; i < MAX_UPLOAD_TICKETS_PER_DAY; i += 1) {
      await claimUploadTicket(membre.id);
    }
    await expect(claimUploadTicket(membre.id)).rejects.toBeInstanceOf(DomainError);

    expect(await prisma.callVideo.count({ where: { authorId: membre.id } })).toBe(0);
  });

  it("ne compte que les jetons du membre, et seulement ceux du jour", async () => {
    const membre = await mkUser();
    const voisin = await mkUser();
    for (let i = 0; i < MAX_UPLOAD_TICKETS_PER_DAY; i += 1) await claimUploadTicket(voisin.id);

    // Le voisin a épuisé les siens : cela ne doit rien coûter à ce membre.
    await expect(claimUploadTicket(membre.id)).resolves.toBeUndefined();

    // Et des jetons d'hier ne pèsent plus sur aujourd'hui.
    await prisma.uploadTicket.updateMany({
      where: { userId: membre.id },
      data: { createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
    });
    for (let i = 0; i < MAX_UPLOAD_TICKETS_PER_DAY; i += 1) {
      await expect(claimUploadTicket(membre.id)).resolves.toBeUndefined();
    }
  });
});
