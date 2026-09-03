import { createHash } from "node:crypto";
import type { Prisma, ProjectCategory } from "@/generated/prisma/client";
import { detachVideoFiles } from "@/lib/call-videos";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { prisma } from "@/lib/prisma";
import { assertUnderLimit, recordHit } from "@/lib/throttle";
import {
  MAX_CALLS_PER_DAY, MAX_ANSWERS_PER_PROJECT_PER_DAY,
  MAX_COMMENTS_RENDERED,
  MAX_CALL_COMMENTS_PER_HOUR,
  MAX_COMMENTS_PER_CALL,
} from "@/lib/constants";
import { notify, notifyManyOnceUnread } from "@/lib/notifications";
import { DomainError } from "@/lib/project-service";
import { slugify } from "@/lib/utils";
import type { BoycottCallInput } from "@/lib/validation";

/**
 * Le fil des appels au remplacement.
 *
 * Règle qui gouverne tout ce fichier : **GeniGain héberge, n'écrit pas.**
 * Aucune fonction ici ne juge le fond d'un appel — ni liste noire de marques,
 * ni score de « légitimité ». Ce que le service garantit, c'est la
 * traçabilité (un auteur nommé, une date), les plafonds (anti-spam), et le
 * retrait (par l'auteur ou la modération). Le fond se règle par le
 * signalement, a posteriori, comme sur n'importe quel réseau.
 *
 * Le fil n'existe pas pour lister des colères mais pour les convertir : un
 * appel est une demande ouverte, et un projet vient y répondre.
 */

/**
 * Regroupe les appels visant la même marque : « Nestlé », « nestle » et
 * « NESTLE » ont une seule clé.
 *
 * UNE seule passe de normalisation, jamais une branche « latin sinon autre ».
 * La version à branches choisissait `slugify` dès qu'UN caractère latin
 * apparaissait et jetait tout le reste de l'écriture : « Сбербанк 24 » et
 * « Аэрофлот 24 » tombaient tous deux sur « 24 », et une seule lettre latine
 * égarée dans un mot cyrillique suffisait à fusionner deux entreprises sans
 * rapport. La plateforme publiait alors, sous le nom d'une marque, le poids
 * d'une autre.
 *
 * Le repli est DISCRIMINANT, pas une constante partagée : un nom composé
 * uniquement de symboles ou d'emoji (« ★★★ », « 🍫🍫 ») garde une clé qui lui
 * est propre. Deux marques différentes ne doivent jamais fusionner par
 * accident de normalisation — c'est le seul endroit du fil où une erreur de
 * calcul devient une affirmation publique sur une entreprise.
 */
export function targetKeyOf(target: string): string {
  const cle = target
    .normalize("NFKD")
    // Retire les diacritiques décomposés (é → e), toutes écritures confondues.
    .replace(/\p{M}/gu, "")
    .normalize("NFKC")
    .toLowerCase()
    // Garde lettres ET chiffres de N'IMPORTE quelle écriture ; jette le reste.
    .replace(/[^\p{L}\p{N}]/gu, "")
    .slice(0, 60);
  if (cle) return cle;

  // Ni lettre ni chiffre : on dérive une clé stable du nom brut, pour que
  // deux graphies identiques se regroupent et que deux graphies différentes
  // restent séparées.
  return `sym-${createHash("sha1").update(target.trim().toLowerCase()).digest("hex").slice(0, 16)}`;
}

/**
 * Un remplaçant qui compte encore. `answerCall` refuse déjà un projet FAILED
 * ou COMPLETED à la déclaration, mais un projet peut mourir APRÈS : sans ce
 * prédicat, un appel dont l'unique tentative a échoué resterait « pourvu »
 * à vie et sortirait définitivement du tri « orphelins », qui porte toute
 * l'intention du produit. COMPLETED reste un remplaçant — l'alternative a
 * bel et bien existé.
 */
export const liveAnswer = {
  withdrawnAt: null,
  project: { status: { not: "FAILED" } },
} satisfies Prisma.BoycottAnswerWhereInput;

/**
 * Un appel visible : ni retiré par son auteur, ni par la modération.
 * Volontairement NON exporté : toute lecture d'appel passe par ce module, et
 * c'est cette contrainte qui garantit qu'aucune page ne réimplémente le
 * filtre de son côté — la fuite du badge « Remplace X » venait exactement de
 * là.
 */
const visibleCall = { removedAt: null } satisfies Prisma.BoycottCallWhereInput;

export async function createCall(authorId: string, input: BoycottCallInput): Promise<string> {
  // Plafond glissant sur 24 h : le fil doit rester une place, pas un mur
  // de tracts posés par trois personnes.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.boycottCall.count({
    where: { authorId, createdAt: { gte: since } },
  });
  if (recent >= MAX_CALLS_PER_DAY) {
    throw new DomainError(
      `${MAX_CALLS_PER_DAY} appels par jour maximum. Reviens demain — ou soutiens un appel qui existe déjà.`
    );
  }

  // Un même auteur ne compte qu'une fois par marque : sans ça, publier trois
  // appels sur « Nestlé » fabrique « 3 appels, 3 voix » alors qu'il n'y a
  // qu'une personne — et c'est la plateforme qui publierait ce chiffre sous
  // le nom d'une entreprise.
  const targetKey = targetKeyOf(input.target);
  const doublon = await prisma.boycottCall.findFirst({
    where: { authorId, targetKey, ...visibleCall },
    select: { slug: true },
  });
  if (doublon) {
    throw new DomainError(
      "Tu as déjà un appel en ligne sur cette marque. Complète-le ou retire-le plutôt que d'en ouvrir un second."
    );
  }

  // `slugify` ne rend rien sur une écriture non latine : sans repli, le slug
  // se réduisait aux 4 caractères aléatoires (« -ghih »), et l'unicité ne
  // tenait plus qu'à eux.
  const base = slugify(input.target) || "appel";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  // Recompté sous verrou par auteur au moment d'écrire : 100 appels
  // concurrents en passaient 100, chacun comptant avant l'écriture des autres.
  const call = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${authorId}))`;
    const auJour = await tx.boycottCall.count({ where: { authorId, createdAt: { gte: since } } });
    if (auJour >= MAX_CALLS_PER_DAY) {
      throw new DomainError(`${MAX_CALLS_PER_DAY} appels par jour maximum. Reviens demain.`);
    }
    return tx.boycottCall.create({
      data: {
        authorId,
        slug,
        target: input.target,
        targetKey,
        category: input.category,
        reason: input.reason,
        wanted: input.wanted,
        sources: input.sources,
        anonymous: input.anonymous ?? false,
        // L'auteur soutient son propre appel : sinon un appel naît à zéro voix
        // et paraît mort-né.
        supports: { create: { userId: authorId } },
      },
      select: { slug: true },
    });
  });

  return call.slug;
}

/** « Je veux ça remplacé aussi » — bascule, et renvoie l'état après coup. */
export async function toggleSupport(userId: string, callId: string): Promise<boolean> {
  const call = await prisma.boycottCall.findFirst({
    where: { id: callId, ...visibleCall },
    select: { id: true },
  });
  if (!call) throw new DomainError("Cet appel n'existe plus.");

  const existing = await prisma.boycottSupport.findUnique({
    where: { callId_userId: { callId, userId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.boycottSupport.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.boycottSupport.create({ data: { callId, userId } });
  return true;
}

/**
 * Un porteur déclare que son projet répond à l'appel. C'est la charnière de
 * toute la plateforme : la colère devient une commande, la commande devient
 * un projet financé. On prévient donc l'auteur ET tous les soutiens — ce sont
 * les premiers contributeurs naturels.
 */
export async function answerCall(userId: string, callId: string, projectId: string) {
  const [call, project] = await Promise.all([
    prisma.boycottCall.findFirst({
      where: { id: callId, ...visibleCall },
      select: { id: true, slug: true, target: true, authorId: true },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, ownerId: true, title: true, slug: true, status: true },
    }),
  ]);

  if (!call) throw new DomainError("Cet appel n'existe plus.");
  if (!project) throw new DomainError("Projet introuvable.");
  if (project.ownerId !== userId) {
    throw new DomainError("Seul le porteur du projet peut le déclarer remplaçant.");
  }
  if (project.status === "FAILED" || project.status === "COMPLETED") {
    throw new DomainError("Ce projet est terminé — déclare un projet en cours.");
  }

  const already = await prisma.boycottAnswer.findUnique({
    where: { callId_projectId: { callId, projectId } },
    select: { id: true, withdrawnAt: true, withdrawnBy: true },
  });
  if (already && !already.withdrawnAt) {
    throw new DomainError("Ce projet répond déjà à cet appel.");
  }

  if (already) {
    // Qui a détaché décide si ça peut revenir. Un retrait posé par l'auteur
    // de l'appel ou par la modération ne se défait PAS d'un clic du porteur :
    // sinon le seul geste durable contre un squatteur redevient « retirer
    // l'appel entier », c'est-à-dire punir la victime.
    if (already.withdrawnBy && already.withdrawnBy !== userId) {
      throw new DomainError(
        "Ton projet a été détaché de cet appel par son auteur ou par la modération. " +
          "Écris-leur plutôt que de le redéclarer."
      );
    }

    // Le couple a déjà existé : on le réactive SANS renotifier. Sinon
    // « déclarer / retirer » en boucle devient un canal de diffusion vers
    // tous les soutiens de l'appel, à volonté.
    await prisma.boycottAnswer.update({
      where: { id: already.id },
      data: { withdrawnAt: null, withdrawnBy: null },
    });
    return;
  }

  // Trouvé par l'audit : un projet pouvait se déclarer remplaçant de N'IMPORTE
  // QUEL appel, sans lien — et chaque déclaration notifie tous les soutiens de
  // l'appel. Trois par projet et par jour : de quoi répondre, pas arroser.
  const cleReponse = `answer:project:${projectId}`;
  await assertUnderLimit(cleReponse, { max: MAX_ANSWERS_PER_PROJECT_PER_DAY, fenetreMinutes: 24 * 60 });
  await recordHit(cleReponse);
  await prisma.boycottAnswer.create({ data: { callId, projectId } });

  // L'auteur et les soutiens, sans doublon ni auto-notification du porteur.
  const supporters = await prisma.boycottSupport.findMany({
    where: { callId },
    select: { userId: true },
  });
  const recipients = [...new Set([call.authorId, ...supporters.map((s) => s.userId)])].filter(
    (id) => id !== userId
  );

  // `…OnceUnread` : si une notification identique dort encore non lue, on ne
  // l'empile pas.
  await notifyManyOnceUnread(
    recipients.map((recipientId) => ({
      userId: recipientId,
      type: "BOYCOTT_ANSWERED" as const,
      key: "boycottAnswered" as const,
      params: { target: call.target, projectTitle: project.title },
      href: `/projects/${project.slug}`,
    }))
  );
}

/**
 * Le raccourci du tunnel : le porteur arrive sur la création de projet avec
 * un appel en poche (`/projects/new?appel=…`). On lie à la création, sans
 * lui demander de revenir se déclarer — ce détour perdait la moitié des
 * remplaçants en route.
 *
 * Best-effort assumé : le projet vient d'être créé et existe. Si la liaison
 * échoue (appel retiré entre-temps), on ne fait pas échouer la création — le
 * porteur pourra se déclarer depuis la page de l'appel.
 */
export async function linkNewProjectToCall(
  userId: string,
  projectId: string,
  callSlug: string
): Promise<void> {
  const call = await prisma.boycottCall.findFirst({
    where: { slug: callSlug, ...visibleCall },
    select: { id: true },
  });
  if (!call) return;

  try {
    await answerCall(userId, call.id, projectId);
  } catch (error) {
    if (error instanceof DomainError) return;
    throw error;
  }
}

/** L'appel visé par `?appel=…`, pour afficher son cahier des charges. */
export async function getCallBrief(slug: string) {
  return prisma.boycottCall.findFirst({
    where: { slug, ...visibleCall },
    select: { slug: true, target: true, wanted: true, category: true },
  });
}

/**
 * Détacher un projet d'un appel : son porteur (il s'est trompé de cible),
 * l'auteur de l'appel (on squatte sa demande), ou la modération — mêmes
 * règles que pour un commentaire. Sans ce partage, le seul geste possible
 * face à un squatteur serait de retirer l'appel entier : punir l'auteur
 * pour se débarrasser de l'intrus.
 *
 * Retrait LOGIQUE : la ligne reste, et sert de mémoire du fait que les
 * soutiens ont déjà été prévenus pour ce couple.
 */
export async function withdrawAnswer(
  userId: string,
  callId: string,
  projectId: string,
  isAdmin = false
) {
  const [project, call] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } }),
    prisma.boycottCall.findUnique({ where: { id: callId }, select: { authorId: true } }),
  ]);
  if (!project || !call) throw new DomainError("Cette réponse n'existe plus.");

  const autorisé = project.ownerId === userId || call.authorId === userId || isAdmin;
  if (!autorisé) {
    throw new DomainError("Tu ne peux pas retirer ce projet de cet appel.");
  }

  await prisma.boycottAnswer.updateMany({
    where: { callId, projectId, withdrawnAt: null },
    data: { withdrawnAt: new Date(), withdrawnBy: userId },
  });
}

/**
 * Retrait. On ne supprime jamais la ligne : les soutiens et les réponses ont
 * une histoire, et un fil où les contenus gênants disparaissent sans trace
 * est un fil qu'on ne peut plus auditer. `removedById` distingue le retrait
 * par l'auteur (null) du retrait par la modération.
 */
export async function removeCall(
  actorId: string,
  callId: string,
  options: { isAdmin: boolean; reason?: string }
) {
  const call = await prisma.boycottCall.findUnique({
    where: { id: callId },
    select: { authorId: true, removedAt: true, target: true, slug: true },
  });
  if (!call) throw new DomainError("Cet appel n'existe plus.");
  if (call.removedAt) throw new DomainError("Cet appel est déjà retiré.");

  const isAuthor = call.authorId === actorId;
  if (!isAuthor && !options.isAdmin) {
    throw new DomainError("Tu ne peux pas retirer l'appel de quelqu'un d'autre.");
  }

  await prisma.boycottCall.update({
    where: { id: callId },
    data: {
      removedAt: new Date(),
      removedById: isAuthor ? null : actorId,
      removalReason: isAuthor ? null : (options.reason?.trim() || "Retiré par la modération"),
    },
  });

  // Une vidéo ne survit pas à son ancrage : les témoignages de cet appel
  // sortent du fil avec lui, et leurs FICHIERS partent du stockage. Sans ça
  // ils restaient servis sur une URL publique — un contenu retiré qui
  // continue de circuler — et facturés pour toujours.
  await detachVideoFiles(
    { callId },
    { actorId, reason: "L'appel qui portait ce témoignage a été retiré." }
  );

  // Retrait par la modération : l'auteur est prévenu. Un contenu qui
  // disparaît sans un mot, c'est ce qui fait croire à la censure.
  if (!isAuthor) {
    await notify({
      userId: call.authorId,
      type: "BOYCOTT_REMOVED",
      key: "boycottRemoved",
      // `reason: null` = le motif par défaut, TRADUIT à la lecture — le
      // défaut ne se fige plus en français à l'écriture.
      params: { target: call.target, reason: options.reason?.trim() || null },
      href: "/appels",
    });
  }
}

export type CallSort = "soutenus" | "recents" | "orphelins";

/**
 * Le fil. `orphelins` — les appels les plus soutenus que PERSONNE ne remplace
 * encore — est le tri qui porte l'intention du produit : il montre la demande
 * qui attend son offre.
 */
/**
 * Un appel ANONYME ne laisse sortir ni le nom, ni l'avatar, ni l'`authorId`
 * (qui mènerait à /u/<id> et démasquerait l'auteur). Masqué AU NIVEAU DES
 * DONNÉES, jamais seulement à l'affichage. `id: ""` : un lien /u/ oublié
 * pointe alors vers rien, jamais vers la personne.
 */
const AUTEUR_MASQUE = { id: "", name: null, avatarUrl: null, reputation: 0 } as const;

export async function listCalls(options: {
  sort: CallSort;
  category?: ProjectCategory;
  query?: string;
  take?: number;
}) {
  const where: Prisma.BoycottCallWhereInput = {
    ...visibleCall,
    ...(options.category ? { category: options.category } : {}),
    ...(options.sort === "orphelins" ? { answers: { none: liveAnswer } } : {}),
    ...(options.query
      ? {
          OR: [
            { target: { contains: options.query, mode: "insensitive" } },
            // La clé normalisée aussi : sans elle, « nestle » ne trouvait pas
            // « Nestlé » alors que tout le regroupement du fil repose sur
            // cette normalisation. Chercher une marque doit marcher comme la
            // ranger.
            { targetKey: { contains: targetKeyOf(options.query) } },
            { reason: { contains: options.query, mode: "insensitive" } },
            { wanted: { contains: options.query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.BoycottCallOrderByWithRelationInput[] =
    options.sort === "recents"
      ? [{ createdAt: "desc" }]
      : [{ supports: { _count: "desc" } }, { createdAt: "desc" }];

  const calls = await prisma.boycottCall.findMany({
    where,
    orderBy,
    take: options.take ?? 60,
    include: {
      // Jamais `author: true` : la ligne User porte passwordHash, email et
      // stripeAccountId, qui n'ont rien à faire dans le rendu d'un fil public.
      author: { select: { id: true, name: true, avatarUrl: true, reputation: true } },
      _count: { select: { supports: true, answers: { where: liveAnswer } } },
    },
  });
  // Le fil est public : tout appel anonyme est masqué (aucun auteur privilégié).
  return calls.map((c) => (c.anonymous ? { ...c, authorId: "", author: { ...AUTEUR_MASQUE } } : c));
}

export type CallListItem = Awaited<ReturnType<typeof listCalls>>[number];

/**
 * Un appel et tout ce qui s'y rattache. Renvoie null si l'appel n'existe pas.
 *
 * On ne matérialise JAMAIS la liste des soutiens : un appel viral en compte
 * des dizaines de milliers, alors que la page n'a besoin que d'un compteur
 * et de savoir si le lecteur en fait partie. D'où `_count` + une sonde d'au
 * plus une ligne sur la clé unique `callId_userId`.
 */
export async function getCall(slug: string, viewerId?: string) {
  const call = await prisma.boycottCall.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, reputation: true } },
      _count: {
        select: { supports: true, comments: { where: { removedAt: null } } },
      },
      supports: viewerId
        ? { where: { userId: viewerId }, select: { userId: true } }
        : { take: 0, select: { userId: true } },
      answers: {
        where: liveAnswer,
        orderBy: { createdAt: "asc" },
        include: {
          project: {
            include: PROJECT_CARD_INCLUDE,
          },
        },
      },
      comments: {
        where: { removedAt: null },
        // Les DERNIÈRES, pas les premières. Une troncature par le début
        // scelle le fil : dix comptes respectant tous les plafonds
        // suffisaient à saturer les 100 places, et la réponse suivante —
        // typiquement le droit de réponse de la marque mise en cause, que
        // la page promet explicitement — était enregistrée sans jamais
        // s'afficher. La page réordonne ensuite pour lire dans le sens
        // chronologique.
        orderBy: { createdAt: "desc" },
        take: MAX_COMMENTS_RENDERED,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, reputation: true } },
        },
      },
    },
  });
  // Anonyme : masqué pour tout le monde SAUF l'auteur, qui garde son authorId
  // (donc ses droits de retrait sur sa propre page).
  if (call && call.anonymous && call.authorId !== viewerId) {
    return { ...call, authorId: "", author: { ...AUTEUR_MASQUE } };
  }
  return call;
}

/**
 * Commenter un appel. La contradiction fait partie du dispositif : un fil où
 * l'on ne peut qu'acclamer se transforme en tribunal à sens unique, et c'est
 * précisément ce qui rendrait la plateforme responsable de ce qu'elle laisse
 * passer. L'entreprise visée, elle aussi, peut répondre ici.
 */
/**
 * L'extrait recopié dans la cloche de l'auteur de l'appel.
 *
 * Le retrait ne rejoue PAS ce calcul pour retrouver la notification : il la
 * cible par `sourceId`. Retrouver une ligne par son texte frappait aussi les
 * notifications d'une réponse identique restée en ligne.
 */
function extraitDeReponse(body: string): string {
  return body.length > 120 ? `${body.slice(0, 117)}…` : body;
}

export async function postCallComment(userId: string, callId: string, body: string) {
  const call = await prisma.boycottCall.findFirst({
    where: { id: callId, ...visibleCall },
    select: { id: true, slug: true, target: true, authorId: true },
  });
  if (!call) throw new DomainError("Cet appel n'existe plus.");

  // Deux plafonds complémentaires : l'un coupe le pilonnage transversal
  // (inonder vingt fils), l'autre le monologue sous un seul appel. Sans eux,
  // la discussion devient l'arme que l'appel n'est pas.
  // Volontairement SANS filtre sur `removedAt` : un plafond qui se remet à
  // zéro quand on supprime ses propres messages n'est pas un plafond. C'est
  // la même règle que le compteur d'appels quotidien.
  const [récentes, souscetAppel] = await Promise.all([
    prisma.callComment.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    }),
    prisma.callComment.count({ where: { userId, callId: call.id } }),
  ]);
  if (récentes >= MAX_CALL_COMMENTS_PER_HOUR) {
    throw new DomainError(
      "Tu as beaucoup écrit dans la dernière heure. Laisse le fil respirer et reviens tout à l'heure."
    );
  }
  if (souscetAppel >= MAX_COMMENTS_PER_CALL) {
    throw new DomainError(
      `${MAX_COMMENTS_PER_CALL} réponses sous un même appel, c'est le maximum — l'essentiel est sans doute déjà dit.`
    );
  }

  const comment = await prisma.callComment.create({
    data: { callId: call.id, userId, body },
    select: { id: true },
  });

  if (call.authorId !== userId) {
    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    await notify({
      userId: call.authorId,
      type: "CALL_COMMENT",
      key: "callComment",
      params: { actorName: author?.name ?? null, target: call.target },
      excerpt: extraitDeReponse(body),
      href: `/appels/${call.slug}#discussion`,
      sourceId: comment.id,
    });
  }

  return comment.id;
}

/**
 * Retrait d'un commentaire : son auteur, l'auteur de l'appel, ou la
 * modération. Mêmes règles que sous un projet — celui qui tient le fil
 * répond de ce qui s'y dit.
 */
export async function deleteCallComment(userId: string, commentId: string, isAdmin: boolean) {
  const comment = await prisma.callComment.findUnique({
    where: { id: commentId },
    select: {
      userId: true,
      body: true,
      removedAt: true,
      call: { select: { slug: true, authorId: true } },
    },
  });
  if (!comment) return null;

  const autorisé =
    comment.userId === userId || comment.call.authorId === userId || isAdmin;
  if (!autorisé) throw new DomainError("Tu ne peux pas retirer ce commentaire.");
  if (comment.removedAt) return comment.call.slug;

  // Retrait logique : le rendu disparaît, la preuve reste. Un signalement
  // déposé après coup doit rester traitable, et les plafonds ne doivent pas
  // se réinitialiser.
  await prisma.callComment.update({
    where: { id: commentId },
    data: { removedAt: new Date(), removedById: userId },
  });

  // La notification envoyée à l'auteur de l'appel recopiait le texte de la
  // réponse : sans ce nettoyage, le contenu retiré survivait mot pour mot
  // dans sa cloche, hors d'atteinte de tout le monde — y compris de celui qui
  // l'avait écrit. On neutralise l'extrait plutôt que de supprimer la ligne :
  // l'auteur doit pouvoir constater qu'une réponse a existé puis a été
  // retirée, sinon le retrait ressemble à une disparition.
  //
  // Ciblage par `sourceId`, JAMAIS par le texte : deux membres écrivant le
  // même « Je confirme, j'ai vu la même chose » sous le même appel — un « +1 »,
  // un copier-coller — faisaient neutraliser les DEUX notifications quand un
  // seul retirait la sienne. L'auteur se voyait alors annoncer un retrait qui
  // n'avait pas eu lieu, et l'extrait de la réponse encore en ligne était
  // perdu sans retour.
  await prisma.notification.updateMany({
    where: { type: "CALL_COMMENT", sourceId: commentId },
    // L'extrait DISPARAÎT de la base ; le rendu affiche la pierre tombale
    // (traduite) tant que la ligne existe.
    data: { excerpt: null, retractedAt: new Date() },
  });

  // Le retrait clôt les signalements qui visaient cette réponse — même
  // geste que `deleteGroupMessage`. Sans ça, la file de modération garde une
  // entrée déjà traitée, et le prochain modérateur rouvre un dossier clos.
  await prisma.report.updateMany({
    where: { targetType: "CALL_COMMENT", targetId: commentId, status: "OPEN" },
    data: { status: "RESOLVED", handledAt: new Date(), handledBy: userId },
  });

  return comment.call.slug;
}

/**
 * Les autres appels qui visent la même marque, toutes graphies confondues
 * (« Nestlé », « nestle », « NESTLE » partagent une `targetKey`). Un rejet
 * isolé est une humeur ; trois appels convergents sur la même enseigne, c'est
 * un signal — et c'est ce signal qui doit décider un porteur.
 */
export async function siblingCalls(callId: string, targetKey: string) {
  const rows = await prisma.boycottCall.findMany({
    where: { targetKey, id: { not: callId }, ...visibleCall },
    orderBy: [{ supports: { _count: "desc" } }, { createdAt: "desc" }],
    take: 5,
    select: {
      id: true,
      slug: true,
      target: true,
      reason: true,
      anonymous: true,
      author: { select: { name: true } },
      _count: { select: { supports: true, answers: { where: liveAnswer } } },
    },
  });
  // Un voisin anonyme n'affiche pas de nom (le rendu retombe sur « anonyme »).
  return rows.map((r) => (r.anonymous ? { ...r, author: { name: null } } : r));
}

/**
 * Le poids d'une marque. `voices` compte des PERSONNES distinctes, pas des
 * lignes de soutien : quelqu'un qui soutient deux appels visant la même
 * enseigne reste une voix. C'est un chiffre que la plateforme publie sous
 * le nom d'une entreprise — il doit vouloir dire ce qu'il dit.
 */
export async function targetWeight(targetKey: string): Promise<{ calls: number; voices: number }> {
  // `distinct` de Prisma n'émet AUCUN DISTINCT SQL : il rapatrie toutes les
  // lignes puis déduplique en mémoire. Sur une marque virale, c'est
  // exactement la matérialisation que `getCall` s'interdit trois lignes plus
  // haut. On laisse donc Postgres compter.
  const [row] = await prisma.$queryRaw<{ calls: bigint; voices: bigint }[]>`
    SELECT COUNT(DISTINCT c."id")     AS calls,
           COUNT(DISTINCT s."userId") AS voices
    FROM "BoycottCall" c
    LEFT JOIN "BoycottSupport" s ON s."callId" = c."id"
    WHERE c."targetKey" = ${targetKey} AND c."removedAt" IS NULL
  `;
  return { calls: Number(row?.calls ?? 0), voices: Number(row?.voices ?? 0) };
}

/**
 * Les marques que la communauté veut le plus voir remplacées, tous appels
 * confondus. C'est la vue de la DEMANDE agrégée : celle qu'un porteur (ou un
 * journaliste) consulte pour savoir où se situe le manque le plus criant.
 *
 * Tout est compté EN BASE, en une requête. La version précédente rapatriait
 * toute la table des soutiens dans Node pour dédupliquer en mémoire : mesuré
 * à 28 secondes et 641 Mo pour afficher dix lignes sur une page publique en
 * rendu dynamique — un rafraîchissement en boucle suffisait à saturer le
 * process.
 *
 * Mesures sur la base de dev, 200 000 soutiens / 200 appels / 20 marques :
 * 355 ms et 114 Mo de RSS. Le coût reste LINÉAIRE en nombre de soutiens (il
 * faut bien les parcourir pour dédupliquer par personne) : au-delà de
 * quelques centaines de milliers, il faudra des compteurs dénormalisés sur
 * BoycottCall ou une mise en cache du classement — pas un troisième
 * réglage de cette requête.
 *
 * Trois décomptes, trois natures différentes, et c'est le fond du sujet :
 * - `calls`   : des appels distincts ;
 * - `voices`  : des PERSONNES distinctes (quelqu'un qui soutient trois appels
 *               sur la même marque pèse une voix, pas trois) ;
 * - `answers` : des PROJETS distincts (un projet déclaré sur trois appels
 *               frères est un seul remplaçant, pas trois).
 * Compter des lignes au lieu d'entités, c'est publier un chiffre faux sous le
 * nom d'une entreprise.
 */
export async function mostTargetedBrands(take = 10) {
  // Chaque décompte dans SA propre agrégation, puis jointure des résultats
  // (une ligne par marque). Joindre soutiens ET réponses dans la même passe
  // produit leur produit croisé avant le COUNT(DISTINCT) : mesuré à 8,3 s
  // pour 200 000 soutiens, contre ~0,2 s en séparant.
  const rows = await prisma.$queryRaw<
    {
      target: string;
      slug: string;
      calls: bigint;
      voices: bigint;
      answers: bigint;
    }[]
  >`
    WITH vivant AS (
      SELECT c."id", c."targetKey", c."target", c."slug"
      FROM "BoycottCall" c
      WHERE c."removedAt" IS NULL
    ),
    appels AS (
      SELECT v."targetKey", COUNT(*) AS calls
      FROM vivant v
      GROUP BY v."targetKey"
    ),
    voix AS (
      SELECT v."targetKey", COUNT(DISTINCT s."userId") AS voices
      FROM vivant v
      JOIN "BoycottSupport" s ON s."callId" = v."id"
      GROUP BY v."targetKey"
    ),
    remplacants AS (
      SELECT v."targetKey", COUNT(DISTINCT a."projectId") AS answers
      FROM vivant v
      JOIN "BoycottAnswer" a ON a."callId" = v."id" AND a."withdrawnAt" IS NULL
      JOIN "Project" p ON p."id" = a."projectId" AND p."status" <> 'FAILED'
      GROUP BY v."targetKey"
    ),
    par_appel AS (
      SELECT v."targetKey", v."target", v."slug", COUNT(s."id") AS poids
      FROM vivant v
      LEFT JOIN "BoycottSupport" s ON s."callId" = v."id"
      GROUP BY v."id", v."targetKey", v."target", v."slug"
    ),
    -- La marque est représentée par la graphie de son appel le plus soutenu.
    porte_parole AS (
      SELECT DISTINCT ON ("targetKey") "targetKey", "target", "slug"
      FROM par_appel
      ORDER BY "targetKey", poids DESC, "slug"
    )
    SELECT pp."target",
           pp."slug",
           ap.calls,
           COALESCE(vx.voices, 0)  AS voices,
           COALESCE(rp.answers, 0) AS answers
    FROM appels ap
    JOIN porte_parole pp ON pp."targetKey" = ap."targetKey"
    LEFT JOIN voix vx        ON vx."targetKey" = ap."targetKey"
    LEFT JOIN remplacants rp ON rp."targetKey" = ap."targetKey"
    ORDER BY voices DESC, ap.calls DESC, pp."slug"
    LIMIT ${take}
  `;

  return rows.map((row) => ({
    target: row.target,
    slug: row.slug,
    calls: Number(row.calls),
    voices: Number(row.voices),
    answers: Number(row.answers),
  }));
}

/** Les appels auxquels ce projet répond (badge « Remplace X » sur le projet). */
export async function callsAnsweredBy(projectId: string) {
  const answers = await prisma.boycottAnswer.findMany({
    // `...liveAnswer` entier, pas sa moitié recopiée : il manquait la clause
    // `project.status != FAILED`, si bien qu'un projet échoué gardait « Se
    // lance pour remplacer X » sur sa page pendant que l'appel affichait
    // « personne ne l'a encore remplacé ». Le lien devenait à sens unique.
    where: { projectId, ...liveAnswer, call: visibleCall },
    orderBy: { createdAt: "asc" },
    include: { call: { select: { slug: true, target: true } } },
  });
  return answers.map((answer) => answer.call);
}

/**
 * Pour une liste de projets, ce que chacun remplace — une seule requête pour
 * toute une grille de cartes, au lieu d'une par carte.
 */
export async function replacementsByProject(
  projectIds: string[]
): Promise<Map<string, { target: string; slug: string }[]>> {
  if (projectIds.length === 0) return new Map();

  const answers = await prisma.boycottAnswer.findMany({
    where: { projectId: { in: projectIds }, ...liveAnswer, call: visibleCall },
    orderBy: { createdAt: "asc" },
    select: { projectId: true, call: { select: { target: true, slug: true } } },
  });

  const map = new Map<string, { target: string; slug: string }[]>();
  for (const answer of answers) {
    const list = map.get(answer.projectId) ?? [];
    list.push(answer.call);
    map.set(answer.projectId, list);
  }
  return map;
}

/**
 * Combien de remplaçants VIVANTS par projet. Sert au tri de l'accueil :
 * Prisma ne sait pas appliquer `liveAnswer` à un `orderBy: { _count }`, donc
 * on compte à part plutôt que de laisser un appel retiré propulser un projet
 * en tête de la page d'accueil à perpétuité.
 */
export async function visibleAnswerCounts(projectIds: string[]): Promise<Map<string, number>> {
  if (projectIds.length === 0) return new Map();
  const groupes = await prisma.boycottAnswer.groupBy({
    by: ["projectId"],
    where: { projectId: { in: projectIds }, ...liveAnswer, call: visibleCall },
    _count: { _all: true },
  });
  return new Map(groupes.map((g) => [g.projectId, g._count._all]));
}

/**
 * Les appels à mettre en avant sur l'accueil : les plus soutenus qui
 * attendent encore un remplaçant. La home doit montrer un manque, pas une
 * vitrine — c'est le manque qui fait lever des porteurs.
 */
export async function featuredCalls(take = 3) {
  return listCalls({ sort: "orphelins", take });
}
