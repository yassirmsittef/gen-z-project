import { Prisma, type ProjectCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MAX_GROUPS_JOINED, MAX_GROUPS_OWNED, MAX_GROUP_MEMBERS } from "@/lib/constants";
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

const senderSelect = { id: true, name: true, avatarUrl: true, reputation: true } as const;

export type GroupMessageAuthor = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  reputation: number;
};

// ---------- Lectures ----------

/** Un groupe tel qu'affiché dans l'annuaire d'une catégorie. */
export async function listGroups(params: { category?: ProjectCategory; userId: string }) {
  const groups = await prisma.chatGroup.findMany({
    where: params.category ? { category: params.category } : undefined,
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { members: true, messages: true } },
      members: { where: { userId: params.userId }, select: { userId: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    slug: group.slug,
    name: group.name,
    purpose: group.purpose,
    category: group.category,
    owner: group.owner,
    memberCount: group._count.members,
    messageCount: group._count.messages,
    lastAt: group.messages[0]?.createdAt ?? group.createdAt,
    joined: group.members.length > 0,
    full: group._count.members >= MAX_GROUP_MEMBERS,
  }));
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
          messages: {
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
      _count: { select: { members: true, messages: true } },
      members: {
        orderBy: { joinedAt: "asc" },
        take: 12,
        select: { userId: true, user: { select: senderSelect } },
      },
    },
  });
  if (!group) return null;

  const membership = await prisma.chatGroupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } },
    select: { joinedAt: true },
  });

  return {
    id: group.id,
    slug: group.slug,
    name: group.name,
    purpose: group.purpose,
    category: group.category,
    createdAt: group.createdAt,
    owner: group.owner,
    isOwner: group.ownerId === userId,
    isMember: membership !== null,
    memberCount: group._count.members,
    messageCount: group._count.messages,
    full: group._count.members >= MAX_GROUP_MEMBERS,
    memberPreview: group.members.map((m) => m.user),
  };
}

/** Le fil du groupe, du plus ancien au plus récent (réservé aux membres). */
export async function getGroupThread(groupId: string) {
  const messages = await prisma.groupMessage.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { sender: { select: senderSelect } },
  });
  return messages.reverse();
}

// ---------- Écritures ----------

async function requireMembership(groupId: string, userId: string) {
  const membership = await prisma.chatGroupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { userId: true },
  });
  if (!membership) throw new DomainError("Rejoins le groupe pour participer.");
}

/** Ouvrir un groupe dans une catégorie : son créateur en devient l'animateur. */
export async function createGroup(userId: string, input: CreateGroupInput): Promise<string> {
  const [owned, joined] = await Promise.all([
    prisma.chatGroup.count({ where: { ownerId: userId } }),
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

  const base = slugify(input.name) || "groupe";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  await prisma.chatGroup.create({
    data: {
      slug,
      name: input.name,
      purpose: input.purpose,
      category: input.category,
      ownerId: userId,
      members: { create: { userId } },
    },
  });
  return slug;
}

/** Rejoindre un groupe. Idempotent : y être déjà n'est pas une erreur. */
export async function joinGroup(userId: string, slug: string): Promise<string> {
  const group = await prisma.chatGroup.findUnique({
    where: { slug },
    select: { id: true, _count: { select: { members: true } } },
  });
  if (!group) throw new DomainError("Groupe introuvable.");

  const [already, joined] = await Promise.all([
    prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
      select: { userId: true },
    }),
    prisma.chatGroupMember.count({ where: { userId } }),
  ]);
  if (already) return group.id;

  if (group._count.members >= MAX_GROUP_MEMBERS) {
    throw new DomainError(
      `Ce groupe est complet (${MAX_GROUP_MEMBERS} membres) — ouvre-en un autre dans la même catégorie.`
    );
  }
  if (joined >= MAX_GROUPS_JOINED) {
    throw new DomainError(`${MAX_GROUPS_JOINED} groupes suivis maximum — quittes-en un d'abord.`);
  }

  try {
    await prisma.chatGroupMember.create({ data: { groupId: group.id, userId } });
  } catch (error) {
    // Double clic / deux onglets : la contrainte de clé primaire a tranché.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }
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
    select: { id: true, ownerId: true },
  });
  if (!group) throw new DomainError("Groupe introuvable.");

  return prisma.$transaction(async (tx) => {
    const membership = await tx.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
      select: { userId: true },
    });
    if (!membership) throw new DomainError("Tu ne fais pas partie de ce groupe.");

    if (group.ownerId === userId) {
      const heir = await tx.chatGroupMember.findFirst({
        where: { groupId: group.id, userId: { not: userId } },
        orderBy: { joinedAt: "asc" },
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
}

/** Dissoudre un groupe — son animateur, ou un ADMIN (modération). */
export async function dissolveGroup(userId: string, slug: string) {
  const [group, user] = await Promise.all([
    prisma.chatGroup.findUnique({ where: { slug }, select: { id: true, ownerId: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);
  if (!group) throw new DomainError("Groupe introuvable.");
  if (group.ownerId !== userId && user?.role !== "ADMIN") {
    throw new DomainError("Seul l'animateur du groupe peut le dissoudre.");
  }
  // Les membres et les messages cascadent avec le groupe.
  await prisma.chatGroup.delete({ where: { id: group.id } });
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

  const others = await prisma.chatGroupMember.findMany({
    where: { groupId: group.id, userId: { not: userId } },
    select: { userId: true },
  });
  await notifyManyOnceUnread(
    others.map(({ userId: memberId }) => ({
      userId: memberId,
      type: "GROUP_MESSAGE" as const,
      title: `${message.sender.name ?? "Un membre"} a écrit dans ${group.name}`,
      href: `/chat/groupes/${group.slug}`,
    }))
  );

  return message;
}

/** Marque le fil comme lu (appelé à l'ouverture du groupe). */
export async function markGroupRead(userId: string, groupId: string) {
  await prisma.chatGroupMember.updateMany({
    where: { groupId, userId },
    data: { lastReadAt: new Date() },
  });
}
