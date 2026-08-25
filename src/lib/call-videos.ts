import { prisma } from "@/lib/prisma";
import { deleteOwnBlob, isVideoBlob, listOwnBlobs, statOwnBlob } from "@/lib/blob";
import {
  AVATAR_BLOB_PREFIX,
  MAX_TOTAL_VIDEO_BYTES,
  MAX_VIDEO_BYTES,
  MAX_UPLOAD_TICKETS_PER_DAY,
  MAX_VIDEOS_PER_DAY,
  ORPHAN_BLOB_GRACE_MS,
  VIDEO_BLOB_PREFIX,
  VIDEO_STORAGE_WARN_RATIO,
  VIDEOS_PER_PAGE,
} from "@/lib/constants";
import { sendPendingNotificationEmails } from "@/lib/notification-emails";
import { notify, notifyMany, notifyManyOnceUnread } from "@/lib/notifications";
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
  // `authorId` sert au droit de retrait : celui qui tient le fil répond de ce
  // qui s'y dit, et `removeVideo` l'autorise explicitement. Sans ce champ,
  // l'interface ne pouvait pas le calculer et le bouton n'apparaissait jamais.
  select: {
    slug: true,
    target: true,
    category: true,
    authorId: true,
    _count: { select: { supports: true } },
  },
} as const;

/**
 * Où en est LE MAGASIN face au plafond global — pas seulement les vidéos.
 *
 * Les photos de profil habitent le même magasin. Ne compter que les
 * témoignages laissait le plafond déborder par l'autre bout : 800 Mo de vidéos
 * plus cent trente photos suffisaient à crever le gigaoctet du plan, et le
 * garde n'y voyait rien puisqu'il ne regardait qu'une moitié de l'occupation.
 *
 * Ne comptent que les fichiers VIVANTS (url non nulle) : un témoignage retiré
 * garde sa ligne mais son fichier est supprimé — il ne coûte plus rien.
 * `full` anticipe le pire cas du prochain dépôt (une vidéo au poids maximal) :
 * le plafond est un mur qu'on ne veut jamais toucher, pas une ligne qu'on
 * constate après l'avoir franchie.
 */
export async function storageStatus() {
  const [vidéos, avatars] = await Promise.all([
    prisma.callVideo.aggregate({
      _sum: { storedBytes: true },
      where: { url: { not: null } },
    }),
    prisma.user.aggregate({
      _sum: { avatarBytes: true },
      where: { avatarUrl: { not: null } },
    }),
  ]);
  const videoBytes = vidéos._sum.storedBytes ?? 0;
  const avatarBytes = avatars._sum.avatarBytes ?? 0;
  const usedBytes = videoBytes + avatarBytes;
  return {
    usedBytes,
    videoBytes,
    avatarBytes,
    capBytes: MAX_TOTAL_VIDEO_BYTES,
    full: usedBytes + MAX_VIDEO_BYTES > MAX_TOTAL_VIDEO_BYTES,
  };
}

/**
 * Enregistre la délivrance d'un jeton d'upload et refuse au-delà de la
 * cadence autorisée.
 *
 * Sans ce compteur, la seule limite par membre portait sur les témoignages
 * PUBLIÉS : obtenir des jetons sans jamais publier laissait le quota intact
 * et permettait de remplir le magasin autant de fois que voulu — chaque jeton
 * valant jusqu'à 30 Mo, payés dès le dépôt. Le balayage des orphelins récupère
 * ces octets, mais seulement au passage suivant : d'ici là, ils se facturent.
 *
 * La ligne est écrite AVANT que le jeton parte : en cas de doute, on compte
 * un dépôt qui n'a pas eu lieu plutôt que d'en oublier un qui a eu lieu.
 */
export async function claimUploadTicket(userId: string): Promise<void> {
  const depuis = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Un VERROU par membre, tenu jusqu'à la fin de la transaction : les
  // demandes du même compte passent une par une, celles des autres ne sont
  // jamais gênées.
  //
  // Ni compter-puis-écrire ni écrire-puis-compter ne suffisent : en lecture
  // validée (le défaut de PostgreSQL), deux transactions simultanées ne voient
  // pas les écritures que l'autre n'a pas encore validées, et toutes se
  // croient sous le plafond. Mesuré : 22 jetons délivrés pour un plafond de 20
  // en lançant les demandes d'un coup. En serverless, ces requêtes tombent sur
  // des instances différentes — la base est la seule mémoire partagée, donc
  // c'est elle qui doit arbitrer.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

    const délivrés = await tx.uploadTicket.count({
      where: { userId, createdAt: { gte: depuis } },
    });
    if (délivrés >= MAX_UPLOAD_TICKETS_PER_DAY) {
      // L'exception annule la transaction : une tentative refusée ne laisse
      // aucune trace et ne pénalise donc pas la fenêtre du lendemain.
      throw new DomainError(
        "Trop d'envois lancés aujourd'hui. Reviens demain, ou termine ceux qui sont en cours."
      );
    }
    await tx.uploadTicket.create({ data: { userId } });
  });
}

/** Purge des jetons sortis de la fenêtre (cron quotidien). */
export async function purgeStaleUploadTickets(): Promise<void> {
  await prisma.uploadTicket.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
}

/**
 * Le garde du plafond global, appelé AVANT de délivrer un jeton d'upload —
 * c'est à la délivrance qu'on s'engage à payer le stockage, pas à
 * l'enregistrement de la ligne (refuser après coup laisserait un fichier
 * orphelin déjà facturé, hors de toute jauge).
 */
export async function assertVideoStorageAvailable(): Promise<void> {
  const { full } = await storageStatus();
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
export async function alertAdminsOnStorageCrossing(beforeBytes: number, afterBytes: number) {
  const cap = MAX_TOTAL_VIDEO_BYTES;
  const paliers = [
    {
      seuil: cap * VIDEO_STORAGE_WARN_RATIO,
      title: `Stockage hébergé à ${Math.round(VIDEO_STORAGE_WARN_RATIO * 100)} % (${Mo(afterBytes)} Mo sur ${Mo(cap)} Mo)`,
      body: "Le magasin (témoignages du direct ET photos de profil) approche de son plafond. Le cockpit en donne la répartition. Faire le tri, ou relever le plafond côté hébergement avant qu'il ne refuse les dépôts.",
      // Deux liens DISTINCTS : la déduplication porte sur (destinataire, type,
      // lien), donc un lien commun ferait taire l'alerte de saturation tant
      // que celle des 80 % resterait non lue. Ils visent la même tuile — dont
      // l'ancre existe bel et bien — en se distinguant par le paramètre.
      href: "/admin?palier=alerte#stockage",
    },
    {
      seuil: cap - MAX_VIDEO_BYTES,
      title: `Stockage hébergé saturé (${Mo(afterBytes)} Mo sur ${Mo(cap)} Mo) — les dépôts sont refusés`,
      body: "Le prochain témoignage risquerait de dépasser le plafond : la délivrance de jetons d'upload est suspendue jusqu'à ce que de la place se libère.",
      href: "/admin?palier=plein#stockage",
    },
  ];
  const franchi = paliers.filter((p) => beforeBytes < p.seuil && afterBytes >= p.seuil).pop();
  if (!franchi) return;

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  // Dédupliqué sur les non-lues : deux dépôts qui franchissent le même palier
  // en même temps ne doivent pas sonner deux fois, email compris.
  await notifyManyOnceUnread(
    admins.map((admin) => ({
      userId: admin.id,
      type: "STORAGE_ALERT" as const,
      title: franchi.title,
      body: franchi.body,
      href: franchi.href,
    }))
  );

  // L'email part D'ICI, où l'on sait qu'une alerte vient de naître. Il partait
  // auparavant de chaque publication de témoignage : toute la file d'attente
  // était drainée en série, dans la requête du membre, pour un événement qui
  // ne survient au plus que deux fois dans la vie du plafond.
  await sendPendingNotificationEmails();
}

/**
 * Détache les fichiers d'un lot de témoignages : la ligne reste (la trace est
 * auditable), l'URL part de la base et le fichier part du stockage.
 *
 * Appelé quand des témoignages cessent d'être publiables sans passer par
 * `removeVideo` — le retrait de l'APPEL qui les portait, ou l'effacement du
 * compte de leur auteur. Sans ça, les fichiers restaient servis sur une URL
 * publique devinable et facturés indéfiniment, invisibles de la jauge comme
 * de la modération.
 */
export async function detachVideoFiles(
  where: { callId: string } | { authorId: string },
  options: { actorId: string; reason: string }
): Promise<number> {
  const vidéos = await prisma.callVideo.findMany({
    where: { ...where, url: { not: null } },
    select: { id: true, url: true, posterUrl: true, authorId: true },
  });
  if (vidéos.length === 0) return 0;

  const ids = vidéos.map((v) => v.id);
  await prisma.callVideo.updateMany({
    where: { id: { in: ids } },
    data: {
      removedAt: new Date(),
      removedById: options.actorId,
      removalReason: options.reason,
      url: null,
      posterUrl: null,
    },
  });

  // Les signalements qui visaient ces témoignages n'ont plus d'objet : sans
  // ça, la file de modération gardait des entrées mortes, pointant vers un
  // contenu déjà détruit. `removeVideo` le fait déjà pour la voie ordinaire.
  await prisma.report.updateMany({
    where: { targetType: "CALL_VIDEO", targetId: { in: ids }, status: "OPEN" },
    data: { status: "RESOLVED", handledAt: new Date(), handledBy: options.actorId },
  });

  // La copie de la légende voyage dans les notifications déjà posées : on la
  // neutralise, comme au retrait ordinaire. Le contenu disparaît, la trace
  // qu'il a existé reste.
  await prisma.notification.updateMany({
    where: { type: "CALL_VIDEO", sourceId: { in: ids } },
    data: { body: "Ce témoignage a été retiré." },
  });

  // Chacun apprend que SON témoignage a disparu, et pourquoi. Un contenu qui
  // s'efface sans un mot, c'est ce qui fait croire à la censure — la règle
  // vaut pour le retrait en cascade comme pour la modération directe. Rien
  // n'est envoyé à qui a lui-même déclenché la cascade.
  await notifyMany(
    vidéos
      .filter((v) => v.authorId !== options.actorId)
      .map((v) => ({
        userId: v.authorId,
        type: "CALL_VIDEO" as const,
        title: "Ton témoignage filmé a été retiré",
        body: options.reason,
        href: "/direct",
      }))
  );

  // Les fichiers APRÈS commit : un échec réseau ne doit pas annuler le retrait.
  for (const v of vidéos) {
    await deleteOwnBlob(v.url);
    await deleteOwnBlob(v.posterUrl);
  }
  return vidéos.length;
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

  // Le DOSSIER, avant tout le reste. Les photos de profil partagent le magasin
  // avec les témoignages : sans ce contrôle, l'URL de la photo de quelqu'un
  // passait l'unicité (qui n'interroge que les témoignages) et la mesure (qui
  // réussit, le fichier étant bien à nous), puis disparaissait de son profil
  // au premier retrait.
  if (!isVideoBlob(input.url) || (input.posterUrl && !isVideoBlob(input.posterUrl))) {
    throw new DomainError("Ce fichier n'est pas un témoignage hébergé par GeniGain.");
  }

  // Un fichier ne se référence qu'UNE fois, et jamais en travers : on cherche
  // les deux URL dans les deux colonnes. Sans ce contrôle, publier l'URL du
  // témoignage d'un autre suffisait à pouvoir le détruire (retirer sa propre
  // ligne supprime le fichier) et à faire compter deux fois les mêmes octets.
  const urls = [input.url, ...(input.posterUrl ? [input.posterUrl] : [])];
  const déjàPris = await prisma.callVideo.findFirst({
    where: { OR: [{ url: { in: urls } }, { posterUrl: { in: urls } }] },
    select: { id: true },
  });
  if (déjàPris) throw new DomainError("Ce fichier est déjà publié sur le direct.");

  // L'empreinte réelle sur le stockage, mesurée auprès du blob et jamais
  // déclarée par le client. La mesure vaut aussi PREUVE D'APPARTENANCE : elle
  // passe par notre jeton, donc elle ne réussit que sur un fichier de notre
  // magasin. Un fichier qu'on ne sait pas mesurer est un fichier dont on ne
  // sait rien — ni le poids, ni s'il est à nous, ni s'il respecte les limites
  // du jeton d'upload : on refuse de le référencer plutôt que de l'afficher
  // hors de toute portée.
  const [tailleVideo, taillePoster] = await Promise.all([
    statOwnBlob(input.url),
    statOwnBlob(input.posterUrl),
  ]);
  if (tailleVideo === null) {
    throw new DomainError("Ce fichier n'est pas hébergé par GeniGain. Renvoie ta vidéo.");
  }
  const storedBytes = tailleVideo + (taillePoster ?? 0);
  const jaugeAvant = (await storageStatus()).usedBytes;

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

  // La jauge est RELUE après le commit, jamais extrapolée : un dépôt
  // concurrent enregistré entre-temps doit compter dans l'« après ». Sinon
  // deux dépôts simultanés encadrant un palier le franchissent sans qu'aucun
  // ne le voie — et comme le test de franchissement est à sens unique, plus
  // aucune alerte ne partirait jamais.
  await alertAdminsOnStorageCrossing(jaugeAvant, (await storageStatus()).usedBytes);

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
 * Qui peut retirer ce témoignage : son auteur, l'auteur de l'appel qui le
 * porte, ou la modération — les mêmes titres que pour la discussion écrite,
 * et exactement ceux que `removeVideo` fait respecter.
 *
 * Défini ICI et nulle part ailleurs : le calcul vivait en double, sur la page
 * du fil et dans l'API de pagination, et les deux avaient déjà divergé —
 * l'auteur d'un appel voyait le bouton sur le premier écran puis le perdait
 * dès la page suivante du défilement.
 */
export function peutRetirerVideo(
  video: { authorId: string; call: { authorId: string } },
  userId: string | undefined,
  admin: boolean
): boolean {
  if (!userId) return false;
  return video.authorId === userId || video.call.authorId === userId || admin;
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

/**
 * À appeler après tout dépôt qui alourdit le magasin SANS passer par le fil —
 * une photo de profil, par exemple. L'alerte de palier n'était déclenchée que
 * par la publication d'un témoignage : depuis que les photos comptent dans la
 * jauge, un franchissement dû à elles seules n'était jamais rapporté, et le
 * test de franchissement étant à sens unique, il ne l'aurait plus jamais été.
 */
export async function reportStorageAfterUpload(avantBytes: number): Promise<void> {
  await alertAdminsOnStorageCrossing(avantBytes, (await storageStatus()).usedBytes);
}

/**
 * Rattrape les tailles manquantes.
 *
 * Les colonnes `storedBytes` et `avatarBytes` sont arrivées par migration, en
 * NULL : tout ce qui avait été déposé AVANT pesait donc zéro pour la jauge, et
 * pour toujours — une ligne n'est mesurée qu'à sa création, et une photo qu'à
 * son remplacement. Le plafond protégeait un magasin dont il ignorait une
 * partie du contenu.
 *
 * Mesuré auprès du stockage, borné par passage pour ne pas allonger le cron,
 * et sans effet une fois le retard résorbé.
 */
export async function backfillStorageSizes(limite = 200): Promise<{ mesurés: number }> {
  const [vidéos, avatars] = await Promise.all([
    prisma.callVideo.findMany({
      where: { url: { not: null }, storedBytes: null },
      select: { id: true, url: true, posterUrl: true },
      take: limite,
    }),
    prisma.user.findMany({
      where: { avatarUrl: { not: null }, avatarBytes: null },
      select: { id: true, avatarUrl: true },
      take: limite,
    }),
  ]);

  let mesurés = 0;

  for (const v of vidéos) {
    const [taille, poster] = await Promise.all([statOwnBlob(v.url), statOwnBlob(v.posterUrl)]);
    // Mesure impossible : on laisse NULL plutôt que d'inscrire un zéro, qui
    // se confondrait avec « pesé, et vide ». Le prochain passage réessaiera.
    if (taille === null && poster === null) continue;
    await prisma.callVideo.update({
      where: { id: v.id },
      data: { storedBytes: (taille ?? 0) + (poster ?? 0) },
    });
    mesurés += 1;
  }

  for (const u of avatars) {
    const taille = await statOwnBlob(u.avatarUrl);
    if (taille === null) continue;
    await prisma.user.update({ where: { id: u.id }, data: { avatarBytes: taille } });
    mesurés += 1;
  }

  if (mesurés > 0) console.info(`[rattrapage] ${mesurés} fichier(s) mesuré(s)`);
  return { mesurés };
}

/**
 * Balaye les fichiers que plus aucune ligne ne réclame.
 *
 * Le dépôt se fait en deux temps : le navigateur envoie le fichier au
 * stockage, PUIS l'action serveur crée la ligne. Si le second temps n'arrive
 * jamais — légende refusée, onglet fermé, réseau coupé, ou simple abandon — le
 * fichier reste. Il est alors invisible de la jauge (qui somme des LIGNES),
 * invisible du plafond, invisible de la modération, et rien ne le supprimait :
 * il se payait indéfiniment. C'était le trou le plus large du dispositif.
 *
 * Trois garde-fous, parce que ce code EFFACE :
 * 1. seulement les dossiers que la base sait réclamer — les témoignages et les
 *    photos de profil ; tout autre dossier du magasin est hors de portée ;
 * 2. un délai de grâce : un fichier récent est probablement une publication en
 *    cours, pas un déchet ;
 * 3. l'ensemble des URL réclamées est relu À CHAQUE passage, juste avant de
 *    supprimer — jamais un cache, jamais une liste calculée plus tôt.
 *
 * `dryRun` permet de mesurer ce qui serait supprimé sans rien détruire.
 */
export async function sweepOrphanVideoBlobs(
  options: { dryRun?: boolean; now?: number } = {}
): Promise<{ examinés: number; orphelins: number; octetsLibérés: number; supprimés: string[] }> {
  const maintenant = options.now ?? Date.now();

  // Toutes les URL vivantes, dans les deux colonnes. Lu maintenant : entre
  // deux passages du cron, des lignes sont nées et d'autres sont mortes.
  const lignes = await prisma.callVideo.findMany({
    where: { OR: [{ url: { not: null } }, { posterUrl: { not: null } }] },
    select: { url: true, posterUrl: true },
  });
  const réclamées = new Set<string>();
  for (const l of lignes) {
    if (l.url) réclamées.add(l.url);
    if (l.posterUrl) réclamées.add(l.posterUrl);
  }

  let examinés = 0;
  let octetsLibérés = 0;
  const supprimés: string[] = [];

  // Les photos de profil sont l'autre producteur du magasin : une photo
  // remplacée ou effacée dont la suppression a échoué n'était réclamée par
  // personne et n'était balayée par rien.
  const avatars = await prisma.user.findMany({
    where: { avatarUrl: { not: null } },
    select: { avatarUrl: true },
  });
  for (const a of avatars) if (a.avatarUrl) réclamées.add(a.avatarUrl);

  for await (const blob of listOwnBlobs(VIDEO_BLOB_PREFIX, AVATAR_BLOB_PREFIX)) {
    examinés += 1;
    if (réclamées.has(blob.url)) continue;
    // Trop jeune : sans doute une publication en cours de route.
    if (maintenant - blob.uploadedAt.getTime() < ORPHAN_BLOB_GRACE_MS) continue;

    octetsLibérés += blob.size;
    supprimés.push(blob.url);
    if (!options.dryRun) await deleteOwnBlob(blob.url);
  }

  if (supprimés.length > 0) {
    console.info(
      `[balayage] ${supprimés.length} fichier(s) orphelin(s), ${Math.round(octetsLibérés / (1024 * 1024))} Mo${options.dryRun ? " (à blanc)" : " libérés"}`
    );
  }
  return { examinés, orphelins: supprimés.length, octetsLibérés, supprimés };
}
