import { prisma } from "@/lib/prisma";

const partnerSelect = { id: true, name: true, avatarUrl: true, reputation: true, skills: true } as const;

export type ChatPartner = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  reputation: number;
  skills: string[];
};

/** Conversations de l'utilisateur : un partenaire + son dernier message. */
export async function getConversations(userId: string) {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      sender: { select: partnerSelect },
      recipient: { select: partnerSelect },
    },
  });

  const conversations = new Map<
    string,
    { partner: ChatPartner; lastBody: string; lastAt: Date; lastFromMe: boolean }
  >();
  for (const message of messages) {
    const partner = message.senderId === userId ? message.recipient : message.sender;
    if (!conversations.has(partner.id)) {
      conversations.set(partner.id, {
        partner,
        lastBody: message.body,
        lastAt: message.createdAt,
        lastFromMe: message.senderId === userId,
      });
    }
  }
  return [...conversations.values()];
}

/** Fil complet entre deux utilisateurs, du plus ancien au plus récent. */
export async function getThread(userId: string, partnerId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: partnerId },
        { senderId: partnerId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}
