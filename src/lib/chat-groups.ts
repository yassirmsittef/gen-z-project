import { Prisma, type ProjectCategory } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { assertUnderLimit, recordHit } from "@/lib/throttle";
import {
  LANGUAGE_ROOMS,
  MAX_GROUPS_JOINED,
  MAX_GROUPS_OWNED,
  MAX_GROUP_MEMBERS, MAX_GROUP_JOINS_PER_DAY,
  roomTexts,
} from "@/lib/constants";
import type { Locale } from "@/lib/i18n/locales";
import { isAdmin } from "@/lib/moderation";
import { notifyManyOnceUnread } from "@/lib/notifications";
import { DomainError } from "@/lib/project-service";
import { slugify } from "@/lib/utils";
import type { CreateGroupInput } from "@/lib/validation";

/**
 * Groupes de chat — les places publiques de la plateforme, rangées dans les
 * MÊMES catégories que les projets (Gaming, Musique, Tech…). N'importe quel
 * membre en ouvre un dans une catégorie, tout le monde peut le rejoindre.
 *
 * Règles du jeu :
 * - lire et écrire suppose d'avoir rejoint (les non-membres voient la fiche) ;
 * - un membre anime au plus MAX_GROUPS_OWNED groupes et en suit MAX_GROUPS_JOINED ;
 * - un groupe plafonne à MAX_GROUP_MEMBERS pour rester un fil lisible ;
 * - l'animateur qui s'en va passe la main au plus ancien membre — un groupe
 *   ne reste jamais sans animateur, et il n'est dissous que s'il se vide.
 */

const senderSelect = { id: true, name: true, avatarUrl: true, reputation: true, role: true } as const;

export type GroupMessageAuthor = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  reputation: number;
};

// ---------- Lectures ----------

/** Le salon de langue d'une locale (les 7 langues de l'app ont chacune le leur). */
export function languageRoomFor(locale: Locale) {
  return LANGUAGE_ROOMS.find((room) => room.lang === locale) ?? LANGUAGE_ROOMS[0];
}

/** Un groupe tel qu'affiché dans l'annuaire d'une catégorie. */
export async function listGroups(params: {
  category?: ProjectCategory;
  query?: string;
  userId: string;
  /** Épingle le salon de CETTE langue tout en tête des officiels. */
  locale?: Locale;
}) {
  const mots = params.query?.trim();
  const groups = await prisma.chatGroup.findMany({
    where: {
      ...(params.category ? { category: params.category } : {}),
      // On cherche dans le nom ET l'intention : « playtest » doit trouver
      // un salon qui s'appelle autrement mais le promet dans sa phrase.
      ...(mots
        ? {
            OR: [
              { name: { contains: mots, mode: "insensitive" } },
              { purpose: { contains: mots, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    // Les salons d'accueil (langues) restent en tête, quoi qu'il arrive après.
    orderBy: [{ official: "desc" }, { createdAt: "desc" }],
    take: 60,
    include: {
      owner: { select: { id: true, name: true } },
      // « X messages » compte les vraies prises de parole, pas les arrivées.
      _count: { select: { members: true, messages: { where: { system: false } } } },
      members: { where: { userId: params.userId }, select: { userId: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });

  // Le salon de SA langue passe tout en tête : la porte d'entrée d'un membre
  // est celle qui parle sa langue, pas celle du premier salon créé. Tri
  // stable : l'ordre officiels-d'abord du orderBy reste intact derrière.
  const pinnedSlug = params.locale ? languageRoomFor(params.locale).slug : undefined;
  if (pinnedSlug) {
    groups.sort((a, b) => Number(b.slug === pinnedSlug) - Number(a.slug === pinnedSlug));
  }

  return groups.map((group) => ({
    id: group.id,
    slug: group.slug,
    name: group.name,
    purpose: group.purpose,
    category: group.category,
    official: group.official,
    owner: group.owner,
    memberCount: group._count.members,
    messageCount: group._count.messages,
    lastAt: group.messages[0]?.createdAt ?? group.createdAt,
    joined: group.members.length > 0,
    full: group._count.members >= MAX_GROUP_MEMBERS,
  }));
}

/**
 * Le salon le plus vivant d'une catégorie — celui qu'on propose depuis la
 * page d'un projet. Le plus peuplé, à défaut le plus récent : c'est là
 * qu'on a le plus de chances de trouver quelqu'un.
 */
export async function getLivelyRoom(category: ProjectCategory, userId: string) {
  const group = await prisma.chatGroup.findFirst({
    where: { category },
    orderBy: [{ members: { _count: "desc" } }, { createdAt: "desc" }],
    include: {
      _count: { select: { members: true } },
      members: { where: { userId }, select: { userId: true } },
    },
  });
  if (!group) return null;

  return {
    slug: group.slug,
    name: group.name,
    purpose: group.purpose,
    category: group.category,
    memberCount: group._count.members,
    joined: group.members.length > 0,
    full: group._count.members >= MAX_GROUP_MEMBERS,
  };
}

/** Nombre de groupes par catégorie — alimente les pastilles de l'annuaire. */
export async function groupCountsByCategory(): Promise<Partial<Record<ProjectCategory, number>>> {
  const rows = await prisma.chatGroup.groupBy({ by: ["category"], _count: { _all: true } });
  return Object.fromEntries(rows.map((row) => [row.category, row._count._all]));
}

/** Mes groupes, du plus actif au plus calme, avec le dernier message et les non-lus. */
export async function getMyGroups(userId: string) {
  const memberships = await prisma.chatGroupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
          // Aperçu et pastille de non-lus : seules les vraies prises de
          // parole comptent — une arrivée ne « réveille » pas le salon.
          messages: {
            where: { system: false },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { body: true, createdAt: true, senderId: true, sender: { select: { name: true } } },
          },
        },
      },
    },
  });

  return memberships
    .map(({ group, lastReadAt }) => {
      const last = group.messages[0];
      return {
        id: group.id,
        slug: group.slug,
        name: group.name,
        category: group.category,
        memberCount: group._count.members,
        isOwner: group.ownerId === userId,
        lastBody: last?.body ?? null,
        lastSenderName: last?.sender.name ?? null,
        lastFromMe: last?.senderId === userId,
        lastAt: last?.createdAt ?? group.createdAt,
        // Non lu : un message des autres est arrivé depuis mon dernier passage.
        unread: Boolean(last && last.senderId !== userId && last.createdAt > lastReadAt),
      };
    })
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

/** Fiche d'un groupe + ma place dedans (membre ou simple visiteur). */
export async function getGroupBySlug(slug: string, userId: string) {
  const group = await prisma.chatGroup.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true, reputation: true } },
      _count: { select: { members: true, messages: { where: { system: false } } } },
      members: {
        orderBy: { joinedAt: "asc" },
        take: 12,
        select: { userId: true, user: { select: senderSelect } },
      },
    },
  });
  if (!group) return null;

  const [membership, powers] = await Promise.all([
    prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
      select: { joinedAt: true, manager: true, muted: true },
    }),
    groupPowers(group, userId),
  ]);

  return {
    id: group.id,
    slug: group.slug,
    name: group.name,
    purpose: group.purpose,
    category: group.category,
    official: group.official,
    createdAt: group.createdAt,
    owner: group.owner,
    isOwner: group.ownerId === userId,
    isManager: membership?.manager ?? false,
    isMuted: membership?.muted ?? false,
    // Ce que le visiteur a le droit de faire (ADMIN plateforme compris).
    canManage: powers.owner,
    canModerate: powers.manager,
    isMember: membership !== null,
    memberCount: group._count.members,
    messageCount: group._count.messages,
    full: group._count.members >= MAX_GROUP_MEMBERS,
    memberPreview: group.members.map((m) => m.user),
  };
}

/**
 * Le trombinoscope d'un salon : tout le monde voit qui est là et qui anime
 * (c'est une place publique), mais la liste des exclus ne regarde que
 * l'animation.
 */
export async function getGroupMembers(groupId: string, canModerate: boolean) {
  const [members, bans] = await Promise.all([
    prisma.chatGroupMember.findMany({
      where: { groupId },
      orderBy: [{ manager: "desc" }, { joinedAt: "asc" }],
      take: 200,
      select: { manager: true, joinedAt: true, user: { select: senderSelect } },
    }),
    canModerate
      ? prisma.chatGroupBan.findMany({
          where: { groupId },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, user: { select: senderSelect } },
        })
      : Promise.resolve([]),
  ]);
  return { members, bans };
}

/** Messages chargés d'un coup — au-delà, on remonte page par page. */
const THREAD_PAGE = 100;

/**
 * Le fil du groupe, du plus ancien au plus récent (réservé aux membres).
 * `avant` = l'id du plus ancien message affiché : on rend les 100 qui le
 * précèdent. Sans lui, on rend les 100 derniers — un fil s'ouvre sur le
 * présent, et l'historique se remonte à la demande.
 */
export async function getGroupThread(groupId: string, avant?: string) {
  let borne: Date | undefined;
  if (avant) {
    const pivot = await prisma.groupMessage.findUnique({
      where: { id: avant },
      select: { createdAt: true, groupId: true },
    });
    // Un id d'un AUTRE salon ne doit pas servir de fenêtre sur celui-ci.
    if (pivot?.groupId === groupId) borne = pivot.createdAt;
  }

  // Un de plus que la page : sa présence dit qu'il reste du passé.
  const lignes = await prisma.groupMessage.findMany({
    where: { groupId, ...(borne ? { createdAt: { lt: borne } } : {}) },
    orderBy: { createdAt: "desc" },
    take: THREAD_PAGE + 1,
    include: { sender: { select: senderSelect } },
  });

  return {
    messages: lignes.slice(0, THREAD_PAGE).reverse(),
    hasOlder: lignes.length > THREAD_PAGE,
    isHistory: borne !== undefined,
  };
}

// ---------- Écritures ----------

/**
 * Qui commande dans un salon, du plus fort au plus faible :
 *
 * - l'ANIMATEUR (owner) : nomme et démet les gérant·es, exclut n'importe qui,
 *   dissout le salon ;
 * - un·e GÉRANT·E : exclut des membres ordinaires et réadmet, mais ne touche
 *   ni à l'animateur ni aux autres gérant·es, et ne nomme personne — sans
 *   quoi deux gérant·es pourraient se destituer l'un l'autre, ou destituer
 *   celui qui les a nommés ;
 * - un ADMIN de la plateforme a les droits de l'animateur (modération).
 *
 * Une exclusion retire la personne ET l'empêche de revenir ; ses messages
 * restent (retirer un propos est un geste distinct, qui passe par les
 * signalements). Elle n'est jamais annoncée dans le fil : on n'humilie
 * personne en public.
 */
type GroupAuthority = { ownerId: string; id: string };

async function groupPowers(group: GroupAuthority, userId: string) {
  const [membership, admin] = await Promise.all([
    prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
      select: { manager: true },
    }),
    isAdmin(userId),
  ]);
  const owner = group.ownerId === userId || admin;
  return { owner, manager: owner || (membership?.manager ?? false) };
}

/**
 * Efface les notifications qui pointent vers un salon devenu inaccessible.
 * Sans ça, une cloche mène à une page dissoute (404) ou à une porte close
 * pour qui vient d'en être exclu. `userId` absent = pour tout le monde.
 */
async function forgetGroupNotifications(slug: string, userId?: string) {
  await prisma.notification.deleteMany({
    where: {
      type: "GROUP_MESSAGE",
      href: `/chat/groupes/${slug}`,
      ...(userId ? { userId } : {}),
    },
  });
}

async function requireMembership(groupId: string, userId: string) {
  const membership = await prisma.chatGroupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { userId: true },
  });
  if (!membership) throw new DomainError("Rejoins le groupe pour participer.");
}

/**
 * Ouvrir un groupe dans une catégorie : son créateur en devient l'animateur.
 * Les salons OFFICIELS (langues) échappent aux plafonds et portent un slug
 * stable — ils sont l'accueil de la plateforme, pas le groupe d'un membre.
 */
export async function createGroup(
  userId: string,
  input: CreateGroupInput,
  options: { official?: boolean; slug?: string } = {}
): Promise<string> {
  if (options.official && !(await isAdmin(userId))) {
    throw new DomainError("Seule l'équipe ouvre les salons officiels.");
  }

  if (!options.official) {
    const [owned, joined] = await Promise.all([
      // Les salons officiels animés par l'équipe ne comptent pas : sinon
      // l'admin serait plafonné par l'accueil qu'il entretient.
      prisma.chatGroup.count({ where: { ownerId: userId, official: false } }),
      prisma.chatGroupMember.count({ where: { userId } }),
    ]);
    if (owned >= MAX_GROUPS_OWNED) {
      throw new DomainError(
        `Tu animes déjà ${MAX_GROUPS_OWNED} groupes — fais-en vivre un avant d'en ouvrir un autre.`
      );
    }
    if (joined >= MAX_GROUPS_JOINED) {
      throw new DomainError(`${MAX_GROUPS_JOINED} groupes suivis maximum — quittes-en un d'abord.`);
    }
  }

  const base = slugify(input.name) || "groupe";
  const slug = options.slug ?? `${base}-${Math.random().toString(36).slice(2, 6)}`;

  await prisma.chatGroup.create({
    data: {
      slug,
      name: input.name,
      purpose: input.purpose,
      category: input.category,
      official: options.official ?? false,
      ownerId: userId,
      members: { create: { userId } },
    },
  });
  return slug;
}

/**
 * Ouvre les salons de langue manquants (idempotent, par slug). Appelé par
 * l'équipe depuis l'annuaire : une plateforme sans porte d'entrée dans sa
 * langue est une plateforme muette pour qui ne parle pas français.
 */
export async function openLanguageRooms(adminId: string): Promise<number> {
  if (!(await isAdmin(adminId))) {
    throw new DomainError("Seule l'équipe ouvre les salons officiels.");
  }

  const existing = await prisma.chatGroup.findMany({
    where: { slug: { in: LANGUAGE_ROOMS.map((room) => room.slug) } },
    select: { slug: true },
  });
  const already = new Set(existing.map((group) => group.slug));

  let opened = 0;
  for (const room of LANGUAGE_ROOMS) {
    if (already.has(room.slug)) continue;
    await createGroup(
      adminId,
      { name: room.name, purpose: room.purpose, category: "AUTRE" },
      { official: true, slug: room.slug }
    );
    opened += 1;
  }
  return opened;
}

/** Salons de langue encore à ouvrir — pilote la bannière de l'annuaire. */
export async function missingLanguageRooms(): Promise<number> {
  const open = await prisma.chatGroup.count({
    where: { slug: { in: LANGUAGE_ROOMS.map((room) => room.slug) } },
  });
  return LANGUAGE_ROOMS.length - open;
}

/** Rejoindre un groupe. Idempotent : y être déjà n'est pas une erreur. */
export async function joinGroup(userId: string, slug: string): Promise<string> {
  const group = await prisma.chatGroup.findUnique({
    where: { slug },
    select: { id: true, slug: true, _count: { select: { members: true } } },
  });
  if (!group) throw new DomainError("Groupe introuvable.");

  const [already, joined, exclu] = await Promise.all([
    prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
      select: { userId: true },
    }),
    prisma.chatGroupMember.count({ where: { userId } }),
    prisma.chatGroupBan.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
      select: { userId: true },
    }),
  ]);
  // Déjà là : pas de seconde ligne d'accueil (double clic, deux onglets).
  if (already) return group.id;
  if (exclu) {
    throw new DomainError("L'animation de ce salon t'en a retiré — tu ne peux pas y revenir.");
  }

  if (group._count.members >= MAX_GROUP_MEMBERS) {
    throw new DomainError(
      `Ce groupe est complet (${MAX_GROUP_MEMBERS} membres) — ouvre-en un autre dans la même catégorie.`
    );
  }
  if (joined >= MAX_GROUPS_JOINED) {
    throw new DomainError(`${MAX_GROUPS_JOINED} groupes suivis maximum — quittes-en un d'abord.`);
  }

  // Trois adhésions par salon et par 24 h : rejoindre-quitter en boucle
  // était gratuit et sans trace.
  const cleAdhesion = `join:user:${userId}:group:${group.id}`;
  await assertUnderLimit(cleAdhesion, { max: MAX_GROUP_JOINS_PER_DAY, fenetreMinutes: 24 * 60 });
  await recordHit(cleAdhesion);

  try {
    // Recompté sous verrou par salon : une rafale simultanée faisait passer
    // le plafond de 199 à 214, chaque requête comptant avant que les autres
    // n'aient écrit.
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${group.id}))`;
      const membres = await tx.chatGroupMember.count({ where: { groupId: group.id } });
      if (membres >= MAX_GROUP_MEMBERS) {
        throw new DomainError(
          `Ce groupe est complet (${MAX_GROUP_MEMBERS} membres) — ouvre-en un autre dans la même catégorie.`
        );
      }
      await tx.chatGroupMember.create({ data: { groupId: group.id, userId } });
    });
  } catch (error) {
    // Double clic / deux onglets : la contrainte de clé primaire a tranché.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return group.id;
    }
    throw error;
  }

  // Un fil qui accueille dans SA langue : personne n'entre dans le silence.
  // Ligne d'événement (system) — elle ne notifie personne et ne fait pas
  // sonner « non lu » chez les autres membres.
  // Une arrivée est un ÉVÉNEMENT, pas un compteur : pas de seconde ligne
  // pour quelqu'un qui revient dans la journée.
  const dejaAccueilli = await prisma.groupMessage.findFirst({
    where: {
      groupId: group.id,
      senderId: userId,
      system: true,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (dejaAccueilli) return group.id;

  const arrivant = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  await prisma.groupMessage.create({
    data: {
      groupId: group.id,
      senderId: userId,
      system: true,
      // La MATIÈRE, pas la phrase : le mot d'accueil se rend dans la langue
      // de qui le lit. `body` garde le rendu dans la langue du salon — filet
      // pour les lignes écrites avant cette refonte.
      systemKey: "joined",
      systemParams: { name: arrivant?.name ?? null },
      body: roomTexts(group.slug).welcome.replace("{nom}", arrivant?.name ?? "Un membre"),
    },
  });

  return group.id;
}

/**
 * Quitter un groupe. L'animateur qui s'en va passe la main au membre le plus
 * ancien ; s'il était seul, le groupe est dissous (personne pour l'animer).
 * Retourne `true` quand le groupe a disparu.
 */
export async function leaveGroup(userId: string, slug: string): Promise<boolean> {
  const group = await prisma.chatGroup.findUnique({
    where: { slug },
    select: { id: true, ownerId: true, official: true },
  });
  if (!group) throw new DomainError("Groupe introuvable.");

  const dissous = await prisma.$transaction(async (tx) => {
    const membership = await tx.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
      select: { userId: true },
    });
    if (!membership) throw new DomainError("Tu ne fais pas partie de ce groupe.");

    // Un salon d'accueil appartient à la plateforme, pas à la personne qui
    // l'a ouvert : son animation ne tombe JAMAIS entre les mains du membre
    // le plus ancien, et il ne disparaît pas quand il se vide. L'équipe le
    // quitte comme n'importe quel salon, elle en garde l'animation.
    if (group.official) {
      await tx.chatGroupMember.delete({
        where: { groupId_userId: { groupId: group.id, userId } },
      });
      return false;
    }

    if (group.ownerId === userId) {
      // La main passe d'abord au gérant le plus ancien — il modère déjà —
      // puis, faute de gérant, au membre le plus ancien.
      const heir = await tx.chatGroupMember.findFirst({
        where: { groupId: group.id, userId: { not: userId } },
        orderBy: [{ manager: "desc" }, { joinedAt: "asc" }],
        select: { userId: true },
      });
      if (!heir) {
        await tx.chatGroup.delete({ where: { id: group.id } });
        return true;
      }
      await tx.chatGroup.update({ where: { id: group.id }, data: { ownerId: heir.userId } });
    }

    await tx.chatGroupMember.delete({
      where: { groupId_userId: { groupId: group.id, userId } },
    });
    return false;
  });

  // Partir, c'est aussi couper la cloche de ce salon — et s'il s'est
  // dissous en se vidant, plus personne ne doit y être renvoyé.
  await forgetGroupNotifications(slug, dissous ? undefined : userId);
  return dissous;
}

/** Nommer ou démettre un·e gérant·e — l'animateur seul (ou un ADMIN). */
export async function setGroupManager(
  actorId: string,
  slug: string,
  targetId: string,
  manager: boolean
) {
  const group = await prisma.chatGroup.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });
  if (!group) throw new DomainError("Groupe introuvable.");

  const powers = await groupPowers(group, actorId);
  if (!powers.owner) {
    throw new DomainError("Seule l'animation du salon nomme les gérant·es.");
  }
  if (targetId === group.ownerId) {
    throw new DomainError("L'animateur du salon a déjà tous les droits.");
  }

  const changed = await prisma.chatGroupMember.updateMany({
    where: { groupId: group.id, userId: targetId },
    data: { manager },
  });
  if (changed.count === 0) throw new DomainError("Cette personne n'est pas dans le salon.");
}

/**
 * Exclure quelqu'un : il sort du salon et ne peut plus y revenir tant que
 * l'animation ne le réadmet pas.
 */
export async function excludeFromGroup(actorId: string, slug: string, targetId: string) {
  const group = await prisma.chatGroup.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });
  if (!group) throw new DomainError("Groupe introuvable.");
  if (targetId === actorId) {
    throw new DomainError("Pour partir toi-même, quitte le salon.");
  }

  const [powers, cible] = await Promise.all([
    groupPowers(group, actorId),
    prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: targetId } },
      select: { manager: true },
    }),
  ]);
  if (!powers.manager) throw new DomainError("Réservé à l'animation du salon.");
  if (!cible) throw new DomainError("Cette personne n'est pas dans le salon.");
  if (targetId === group.ownerId) {
    throw new DomainError("L'animateur du salon ne peut pas en être exclu.");
  }
  // Un·e gérant·e ne destitue pas ses pairs : il faut l'animateur pour ça.
  if (cible.manager && !powers.owner) {
    throw new DomainError("Seul l'animateur peut exclure un·e gérant·e.");
  }

  await prisma.$transaction([
    prisma.chatGroupMember.delete({
      where: { groupId_userId: { groupId: group.id, userId: targetId } },
    }),
    prisma.chatGroupBan.upsert({
      where: { groupId_userId: { groupId: group.id, userId: targetId } },
      create: { groupId: group.id, userId: targetId, byId: actorId },
      update: { byId: actorId, createdAt: new Date() },
    }),
  ]);
  // Sa cloche ne doit plus le renvoyer vers une porte close.
  await forgetGroupNotifications(slug, targetId);
}

/** Lever une exclusion : la personne peut rejoindre à nouveau. */
export async function readmitToGroup(actorId: string, slug: string, targetId: string) {
  const group = await prisma.chatGroup.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });
  if (!group) throw new DomainError("Groupe introuvable.");

  const powers = await groupPowers(group, actorId);
  if (!powers.manager) throw new DomainError("Réservé à l'animation du salon.");

  const lifted = await prisma.chatGroupBan.deleteMany({
    where: { groupId: group.id, userId: targetId },
  });
  if (lifted.count === 0) throw new DomainError("Cette personne n'est pas exclue du salon.");
}

/** Dissoudre un groupe — son animateur, ou un ADMIN (modération). */
export async function dissolveGroup(userId: string, slug: string) {
  const [group, user] = await Promise.all([
    prisma.chatGroup.findUnique({
      where: { slug },
      select: { id: true, ownerId: true, official: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);
  if (!group) throw new DomainError("Groupe introuvable.");
  if (group.ownerId !== userId && user?.role !== "ADMIN") {
    throw new DomainError("Seul l'animateur du groupe peut le dissoudre.");
  }
  // Fermer un salon d'accueil, c'est fermer une porte d'entrée de la
  // plateforme — ça ne se fait pas par héritage d'animation.
  if (group.official && user?.role !== "ADMIN") {
    throw new DomainError("Un salon d'accueil ne se dissout que depuis l'équipe.");
  }
  // Les membres et les messages cascadent avec le groupe ; les
  // notifications, elles, ne connaissent pas leur cible — sans ce ménage
  // elles resteraient à pointer vers une page dissoute.
  await prisma.chatGroup.delete({ where: { id: group.id } });
  await forgetGroupNotifications(slug);
}

/** Poster dans un groupe : réservé aux membres, notifie les autres (une fois). */
export async function postGroupMessage(userId: string, input: { groupId: string; body: string }) {
  const group = await prisma.chatGroup.findUnique({
    where: { id: input.groupId },
    select: { id: true, slug: true, name: true },
  });
  if (!group) throw new DomainError("Groupe introuvable.");
  await requireMembership(group.id, userId);

  const message = await prisma.groupMessage.create({
    data: { groupId: group.id, senderId: userId, body: input.body },
    include: { sender: { select: { name: true } } },
  });

  // Écrire vaut lecture : mon propre message ne me revient pas en non-lu.
  await prisma.chatGroupMember.update({
    where: { groupId_userId: { groupId: group.id, userId } },
    data: { lastReadAt: message.createdAt },
  });

  // Les membres qui ont mis CE salon en silence n'entendent rien — leur
  // pastille de non-lus continue pourtant de vivre dans la barre latérale.
  const others = await prisma.chatGroupMember.findMany({
    where: { groupId: group.id, userId: { not: userId }, muted: false },
    select: { userId: true },
  });
  await notifyManyOnceUnread(
    others.map(({ userId: memberId }) => ({
      userId: memberId,
      type: "GROUP_MESSAGE" as const,
      key: "groupMessage" as const,
      params: { actorName: message.sender.name ?? null, groupName: group.name },
      href: `/chat/groupes/${group.slug}`,
    }))
  );

  return message;
}

/**
 * Retirer UN message : son auteur, l'animation du salon (animateur ou
 * gérant·e) ou un ADMIN. C'est le geste proportionné que l'exclusion n'est
 * pas — on efface une phrase sans chasser la personne. Les lignes
 * d'événement (arrivées) n'appartiennent à personne et ne s'effacent pas.
 */
export async function deleteGroupMessage(actorId: string, messageId: string) {
  const message = await prisma.groupMessage.findUnique({
    where: { id: messageId },
    select: {
      senderId: true,
      system: true,
      body: true,
      group: { select: { id: true, ownerId: true } },
    },
  });
  if (!message) throw new DomainError("Message introuvable.");

  const auteur = message.senderId === actorId;
  const { manager: anime } = await groupPowers(message.group, actorId);

  // Une ligne d'arrivée n'appartient pas à son auteur : lui ne la retire pas
  // (sinon la ligne est un jouet), l'animation et les ADMIN si — trouvé par
  // l'audit : 110 aller-retours suffisaient à repousser toute la discussion
  // hors de l'écran, et ces lignes étaient indélébiles pour tout le monde.
  if (message.system && !anime) {
    throw new DomainError("Une ligne d'arrivée ne se supprime pas — l'animation du salon peut la retirer.");
  }
  if (!message.system && !auteur && !anime) {
    throw new DomainError("Seuls son auteur et l'animation du salon peuvent le retirer.");
  }

  // Trouvé par l'audit : l'auteur d'un message signalé le supprimait, et le
  // signalement se fermait tout seul À SON NOM — la file de modération n'en
  // gardait rien. Désormais, seule l'animation qui retire le message d'un
  // AUTRE clôt le dossier ; quand c'est l'auteur qui efface, le contenu est
  // copié dans le dossier, qui reste OUVERT pour qu'un humain tranche.
  const dossiers = { targetType: "GROUP_MESSAGE" as const, targetId: messageId, status: "OPEN" as const };
  if (anime && !auteur) {
    await prisma.groupMessage.delete({ where: { id: messageId } });
    await prisma.report.updateMany({
      where: dossiers,
      data: { status: "RESOLVED", handledAt: new Date(), handledBy: actorId },
    });
  } else {
    await prisma.$transaction([
      prisma.report.updateMany({ where: dossiers, data: { evidence: message.body } }),
      prisma.groupMessage.delete({ where: { id: messageId } }),
    ]);
  }
}

/**
 * Mettre un salon en silence, ou lui rendre la parole. Réservé à ses
 * membres : c'est un réglage personnel, pas un geste d'animation.
 */
export async function setGroupMuted(userId: string, slug: string, muted: boolean) {
  const group = await prisma.chatGroup.findUnique({ where: { slug }, select: { id: true } });
  if (!group) throw new DomainError("Groupe introuvable.");

  const changed = await prisma.chatGroupMember.updateMany({
    where: { groupId: group.id, userId },
    data: { muted },
  });
  if (changed.count === 0) throw new DomainError("Tu ne fais pas partie de ce groupe.");
}

/** Marque le fil comme lu (appelé à l'ouverture du groupe). */
export async function markGroupRead(userId: string, groupId: string) {
  await prisma.chatGroupMember.updateMany({
    where: { groupId, userId },
    data: { lastReadAt: new Date() },
  });
}
