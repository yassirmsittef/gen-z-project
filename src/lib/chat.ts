import { prisma } from "@/lib/prisma";

const partnerSelect = { id: true, name: true, avatarUrl: true, reputation: true, skills: true } as const;

export type ChatPartner = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  reputation: number;
  skills: string[];
};

/**
 * Conversations de l'utilisateur : un partenaire + son dernier message.
 *
 * Limite connue : la liste se déduit des 200 derniers messages échangés,
 * donc une conversation dont le dernier message est plus vieux que ça
 * disparaît de la colonne (elle reste accessible par le profil). Il
 * faudra un `DISTINCT ON (partenaire)` en SQL le jour où quelqu'un aura
 * assez de conversations pour s'en rendre compte.
 */
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

/** Messages chargés d'un coup — au-delà, on remonte page par page. */
const THREAD_PAGE = 100;

/**
 * Fil entre deux personnes, du plus ancien au plus récent — mais fenêtré
 * sur les DERNIERS messages. La version qui prenait les 100 premiers
 * (`orderBy: asc, take: 100`) figeait la conversation dans son passé :
 * passé le centième message, les nouveaux n'apparaissaient plus jamais.
 *
 * `avant` = l'id du plus ancien message affiché, pour remonter d'une page.
 */
export async function getThread(userId: string, partnerId: string, avant?: string) {
  const entreEux = {
    OR: [
      { senderId: userId, recipientId: partnerId },
      { senderId: partnerId, recipientId: userId },
    ],
  };

  let borne: Date | undefined;
  if (avant) {
    const pivot = await prisma.message.findUnique({
      where: { id: avant },
      select: { createdAt: true, senderId: true, recipientId: true },
    });
    // Un message d'une AUTRE conversation ne sert pas de fenêtre sur celle-ci.
    const dansLeFil =
      pivot &&
      ((pivot.senderId === userId && pivot.recipientId === partnerId) ||
        (pivot.senderId === partnerId && pivot.recipientId === userId));
    if (dansLeFil) borne = pivot.createdAt;
  }

  // Un de plus que la page : sa présence dit qu'il reste du passé.
  const lignes = await prisma.message.findMany({
    where: { ...entreEux, ...(borne ? { createdAt: { lt: borne } } : {}) },
    orderBy: { createdAt: "desc" },
    take: THREAD_PAGE + 1,
  });

  return {
    messages: lignes.slice(0, THREAD_PAGE).reverse(),
    hasOlder: lignes.length > THREAD_PAGE,
    isHistory: borne !== undefined,
  };
}
