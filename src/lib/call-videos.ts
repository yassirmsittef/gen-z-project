import { prisma } from "@/lib/prisma";
import { deleteOwnBlob, statOwnBlob } from "@/lib/blob";
import {
  MAX_TOTAL_VIDEO_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEOS_PER_DAY,
  VIDEO_STORAGE_WARN_RATIO,
  VIDEOS_PER_PAGE,
} from "@/lib/constants";
import { notify, notifyMany } from "@/lib/notifications";
import { DomainError } from "@/lib/project-service";

/**
 * Les témoignages vidéo du fil.
 *
 * Une vidéo est TOUJOURS accrochée à un appel — jamais libre. C'est le choix
 * structurant : un appel dit par écrit ce qu'on voudrait à la place, il est
 * signé, sourçable, et déjà encadré par la charte. La vidéo prolonge ce
 * propos au lieu de le remplacer, ce qui évite au fil de devenir un mur de
 * colère sans issue et garde la posture d'hébergeur lisible.
 *
 * Le retrait est LOGIQUE en base (la ligne survit, la modération reste
 * auditable) mais le FICHIER, lui, est supprimé pour de bon : garder la
 * vidéo d'un contenu retiré sur une URL publique la laisserait circuler.
 */

/** Un témoignage visible : ni retiré, ni orphelin d'un appel retiré. */
export const visibleVideo = {
  removedAt: null,
  call: { removedAt: null },
} as const;

const AUTEUR = { select: { id: true, name: true, avatarUrl: true } } as const;
const APPEL = {
  select: { slug: true, target: true, category: true, _count: { select: { supports: true } } },
} as const;

/**
 * Où en est le stockage vidéo face au plafond global. La somme ne compte que
 * les fichiers VIVANTS (url non nulle) : un témoignage retiré garde sa ligne
 * mais son fichier est supprimé — il ne coûte plus rien. `full` anticipe le
 * pire cas du prochain dépôt (une vidéo au poids maximal) : le plafond est
 * un mur qu'on ne veut jamais toucher, pas une ligne qu'on constate après
 * l'avoir franchie.
 */
export async function videoStorageStatus() {
  const agg = await prisma.callVideo.aggregate({
    _sum: { storedBytes: true },
    where: { url: { not: null } },
  });
  const usedBytes = agg._sum.storedBytes ?? 0;
  return {
    usedBytes,
    capBytes: MAX_TOTAL_VIDEO_BYTES,
    full: usedBytes + MAX_VIDEO_BYTES > MAX_TOTAL_VIDEO_BYTES,
  };
}

/**
 * Le garde du plafond global, appelé AVANT de délivrer un jeton d'upload —
 * c'est à la délivrance qu'on s'engage à payer le stockage, pas à
 * l'enregistrement de la ligne (refuser après coup laisserait un fichier
 * orphelin déjà facturé, hors de toute jauge).
 */
export async function assertVideoStorageAvailable(): Promise<void> {
  const { full } = await videoStorageStatus();
  if (full) {
    throw new DomainError("Le direct est plein pour le moment — reviens un peu plus tard.");
  }
}

const Mo = (bytes: number) => Math.round(bytes / (1024 * 1024));

/**
 * Préviens chaque admin quand un dépôt FRANCHIT un palier — et seulement au
 * franchissement : au-dessus du seuil sans le franchir, rien, sinon chaque
 * dépôt suivant sonnerait. Deux paliers : l'avertissement (80 %), puis la
 * saturation effective — le point où le garde ci-dessus commence à refuser,
 * soit une vidéo maximale sous le plafond. Type non masquable, relayé par
 * email : c'est l'alerte de budget que le plan Hobby ne fournit pas.
 */
async function alertAdminsOnStorageCrossing(beforeBytes: number, afterBytes: number) {
  const cap = MAX_TOTAL_VIDEO_BYTES;
  const paliers = [
    {
      seuil: cap * VIDEO_STORAGE_WARN_RATIO,
      title: `Stockage vidéo à ${Math.round(VIDEO_STORAGE_WARN_RATIO * 100)} % (${Mo(afterBytes)} Mo sur ${Mo(cap)} Mo)`,
      body: "Le direct approche de son plafond. Faire le tri, ou relever le plafond côté hébergement avant qu'il ne refuse les dépôts.",
    },
    {
      seuil: cap - MAX_VIDEO_BYTES,
      title: `Stockage vidéo saturé (${Mo(afterBytes)} Mo sur ${Mo(cap)} Mo) — les dépôts sont refusés`,
      body: "Le prochain témoignage risquerait de dépasser le plafond : la délivrance de jetons d'upload est suspendue jusqu'à ce que de la place se libère.",
    },
  ];
  const franchi = paliers.filter((p) => beforeBytes < p.seuil && afterBytes >= p.seuil).pop();
  if (!franchi) return;

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await notifyMany(
    admins.map((admin) => ({
      userId: admin.id,
      type: "STORAGE_ALERT" as const,
      title: franchi.title,
      body: franchi.body,
      href: "/admin",
    }))
  );
}

export async function postVideo(
  userId: string,
  input: { callId: string; url: string; posterUrl?: string; caption: string; durationMs: number; width?: number; height?: number }
) {
  const call = await prisma.boycottCall.findFirst({
    where: { id: input.callId, removedAt: null },
    select: { id: true, slug: true, target: true, authorId: true },
  });
  if (!call) throw new DomainError("Cet appel n'existe plus.");

  // Plafond glissant sur 24 h. La vidéo circule plus loin qu'un texte : on
  // borne plus serré que la discussion écrite.
  const récentes = await prisma.callVideo.count({
    where: { authorId: userId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  if (récentes >= MAX_VIDEOS_PER_DAY) {
    throw new DomainError(
      `${MAX_VIDEOS_PER_DAY} témoignages par jour maximum. Reviens demain — un fil se nourrit de voix différentes.`
    );
  }

  // L'empreinte réelle sur le stockage — vidéo et vignette, mesurées auprès
  // du blob et non déclarées. Best-effort : sans mesure, la ligne se crée
  // quand même (le fichier existe déjà, autant le référencer) et la jauge
  // sous-compte ce dépôt — le plafond global garde une marge pour ça.
  const [tailleVideo, taillePoster] = await Promise.all([
    statOwnBlob(input.url),
    statOwnBlob(input.posterUrl),
  ]);
  const storedBytes =
    tailleVideo === null && taillePoster === null
      ? null
      : (tailleVideo ?? 0) + (taillePoster ?? 0);
  const jaugeAvant = storedBytes === null ? null : (await videoStorageStatus()).usedBytes;

  const video = await prisma.callVideo.create({
    data: {
      callId: call.id,
      authorId: userId,
      url: input.url,
      posterUrl: input.posterUrl ?? null,
      caption: input.caption,
      durationMs: input.durationMs,
      width: input.width ?? null,
      height: input.height ?? null,
      storedBytes,
    },
    select: { id: true },
  });

  if (jaugeAvant !== null && storedBytes !== null) {
    await alertAdminsOnStorageCrossing(jaugeAvant, jaugeAvant + storedBytes);
  }

  if (call.authorId !== userId) {
    const auteur = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    await notify({
      userId: call.authorId,
      type: "CALL_VIDEO",
      title: `${auteur?.name ?? "Un membre"} a filmé un témoignage sur ${call.target}`,
      body: input.caption.length > 120 ? `${input.caption.slice(0, 117)}…` : input.caption,
      href: `/direct?v=${video.id}`,
      sourceId: video.id,
    });
  }

  return video.id;
}

/**
 * Retrait par l'auteur du témoignage, l'auteur de l'appel, ou la modération —
 * mêmes titres que pour la discussion écrite : celui qui tient le fil répond
 * de ce qui s'y dit.
 */
export async function removeVideo(
  actorId: string,
  videoId: string,
  options: { isAdmin: boolean; reason?: string }
) {
  const video = await prisma.callVideo.findUnique({
    where: { id: videoId },
    select: {
      authorId: true,
      url: true,
      posterUrl: true,
      removedAt: true,
      call: { select: { slug: true, authorId: true } },
    },
  });
  if (!video) return null;
  if (video.removedAt) return video.call.slug;

  const autorisé =
    video.authorId === actorId || video.call.authorId === actorId || options.isAdmin;
  if (!autorisé) throw new DomainError("Tu ne peux pas retirer ce témoignage.");

  await prisma.callVideo.update({
    where: { id: videoId },
    data: {
      removedAt: new Date(),
      removedById: actorId,
      removalReason: options.reason?.trim() || null,
      // L'URL part de la base en même temps que le fichier : plus rien ne
      // pointe vers une vidéo retirée, même en lisant la ligne.
      url: null,
      posterUrl: null,
    },
  });

  // Les signalements qui visaient ce témoignage sont clos par le retrait.
  await prisma.report.updateMany({
    where: { targetType: "CALL_VIDEO", targetId: videoId, status: "OPEN" },
    data: { status: "RESOLVED", handledAt: new Date(), handledBy: actorId },
  });

  // La notification recopiait la légende : on la neutralise, sans effacer la
  // ligne — l'auteur de l'appel doit pouvoir constater qu'un témoignage a
  // existé puis a été retiré.
  await prisma.notification.updateMany({
    where: { type: "CALL_VIDEO", sourceId: videoId },
    data: { body: "Ce témoignage a été retiré." },
  });

  // Le fichier lui-même, APRÈS commit : un échec réseau ne doit pas annuler
  // le retrait en base.
  await deleteOwnBlob(video.url);
  await deleteOwnBlob(video.posterUrl);

  return video.call.slug;
}

/**
 * Le fil, paginé au CURSEUR et non par page numérotée : on fait défiler sans
 * fin, et un curseur reste juste quand des témoignages s'ajoutent en tête
 * pendant qu'on lit (un `skip` numérique, lui, décale et fait réapparaître
 * des vidéos déjà vues).
 */
export async function listVideos(options: { cursor?: string; take?: number; callId?: string } = {}) {
  const take = options.take ?? VIDEOS_PER_PAGE;
  const videos = await prisma.callVideo.findMany({
    where: { ...visibleVideo, ...(options.callId ? { callId: options.callId } : {}) },
    orderBy: { createdAt: "desc" },
    take: take + 1, // une de plus : sert uniquement à savoir s'il y a une suite
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    include: { author: AUTEUR, call: APPEL },
  });

  const suite = videos.length > take;
  return { videos: suite ? videos.slice(0, take) : videos, cursor: suite ? videos[take - 1].id : null };
}

export type VideoDuFil = Awaited<ReturnType<typeof listVideos>>["videos"][number];

/** Un témoignage précis — pour ouvrir le fil directement dessus (`/direct?v=…`). */
export async function getVideo(videoId: string) {
  return prisma.callVideo.findFirst({
    where: { id: videoId, ...visibleVideo },
    include: { author: AUTEUR, call: APPEL },
  });
}

/** Combien de témoignages sous cet appel — affiché sur la page de l'appel. */
export async function videoCountForCall(callId: string): Promise<number> {
  return prisma.callVideo.count({ where: { callId, ...visibleVideo } });
}
