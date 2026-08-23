import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/prisma";
import { createCall } from "../src/lib/boycott";
import {
  assertVideoStorageAvailable,
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

vi.mock("@/lib/blob", async (importOriginal) => {
  const réel = await importOriginal<typeof import("../src/lib/blob")>();
  return {
    ...réel,
    statOwnBlob: async (url: string | null | undefined) =>
      url && TAILLES.has(url) ? TAILLES.get(url)! : null,
    deleteOwnBlob: async () => {},
  };
});

const RUN = `s${Date.now().toString(36)}`;
let seq = 0;
const BLOB = "https://exemple.public.blob.vercel-storage.com";
const Mo = 1024 * 1024;

function mkUser(role: "MEMBER" | "ADMIN" = "MEMBER", muted: string[] = []) {
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
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
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

  it("ne bloque pas le dépôt quand la mesure échoue — best-effort assumé", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);

    // Aucune taille connue : statOwnBlob rend null, comme un incident réseau.
    const id = await mkVideo(membre.id, call.id);

    const ligne = await prisma.callVideo.findUnique({ where: { id } });
    expect(ligne!.storedBytes).toBeNull();
    expect((await videoStorageStatus()).usedBytes).toBe(0);
  });

  it("sort de la jauge au retrait, avec le fichier", async () => {
    const membre = await mkUser();
    const call = await mkCall(membre.id);
    const garde = await mkVideo(membre.id, call.id, { video: 10 * Mo });
    const retiré = await mkVideo(membre.id, call.id, { video: 7 * Mo });
    expect((await videoStorageStatus()).usedBytes).toBe(17 * Mo);

    await removeVideo(membre.id, retiré, { isAdmin: false });

    // La ligne retirée garde sa trace mais son fichier n'existe plus : seule
    // la vidéo vivante coûte encore.
    expect((await videoStorageStatus()).usedBytes).toBe(10 * Mo);
    expect(garde).toBeTruthy();
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
    expect(alertes[0].href).toBe("/admin");
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
