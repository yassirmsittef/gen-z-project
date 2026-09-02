import type { NotificationType, Prisma } from "@/generated/prisma/client";
import type { NotificationKey } from "@/lib/notification-catalog";
import { isUnmutable } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Notifications in-app : un insert par événement qui concerne l'utilisateur
 * (contribution reçue, preuve à voter, étape débloquée, message, demande de
 * partenariat...). Consommées par la cloche de la navbar et /notifications.
 *
 * Les créations acceptent un client de transaction pour rester atomiques avec
 * l'événement métier qui les déclenche.
 */

type Client = Prisma.TransactionClient | typeof prisma;

export type NotificationInput = {
  userId: string;
  type: NotificationType;
  /** Gabarit du catalogue — la base ne stocke JAMAIS de texte rendu. */
  key: NotificationKey;
  /** Valeurs BRUTES du gabarit (jamais de texte déjà mis en forme). */
  params?: Record<string, string | number | null>;
  /** Extrait de contenu membre cité — neutralisable au retrait (colonne dédiée). */
  excerpt?: string;
  href: string;
  /**
   * Le contenu qui a déclenché la notification. À renseigner dès que le
   * `body` en recopie un extrait : c'est ce qui permet de neutraliser la
   * copie quand ce contenu est retiré. Sans clé, on ne peut retrouver la
   * ligne qu'en filtrant sur le texte — ce qui frappe aussi les
   * notifications d'un contenu identique resté en ligne.
   */
  sourceId?: string;
};

/** Écarte les notifications dont le destinataire a coupé le type (préférences). */
async function withoutMuted(
  inputs: NotificationInput[],
  client: Client
): Promise<NotificationInput[]> {
  if (inputs.length === 0) return [];
  const users = await client.user.findMany({
    where: { id: { in: [...new Set(inputs.map((i) => i.userId))] } },
    select: { id: true, mutedNotifications: true },
  });
  // On ignore ici les types non masquables : des lignes `mutedNotifications`
  // écrites avant l'introduction de la règle existent peut-être déjà en base,
  // et aucune migration de données n'est nécessaire si on filtre à la lecture.
  const muted = new Map(
    users.map((u) => [u.id, new Set(u.mutedNotifications.filter((t) => !isUnmutable(t)))])
  );
  return inputs.filter((input) => !muted.get(input.userId)?.has(input.type));
}

export async function notify(input: NotificationInput, client: Client = prisma) {
  const allowed = await withoutMuted([input], client);
  if (allowed.length === 0) return;
  await client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      key: input.key,
      params: input.params ?? undefined,
      excerpt: input.excerpt,
      href: input.href,
      sourceId: input.sourceId,
    },
  });
}

export async function notifyMany(inputs: NotificationInput[], client: Client = prisma) {
  const allowed = await withoutMuted(inputs, client);
  if (allowed.length === 0) return;
  await client.notification.createMany({
    data: allowed.map((input) => ({
      userId: input.userId,
      type: input.type,
      key: input.key,
      params: input.params ?? undefined,
      excerpt: input.excerpt,
      href: input.href,
      sourceId: input.sourceId,
    })),
  });
}

/**
 * Variante dédupliquée : ne crée rien si une notification NON LUE du même type
 * pointe déjà vers la même destination (évite le spam « nouveau message » à
 * chaque message d'une même conversation).
 */
export async function notifyOnceUnread(input: NotificationInput, client: Client = prisma) {
  const existing = await client.notification.findFirst({
    where: { userId: input.userId, type: input.type, href: input.href, readAt: null },
    select: { id: true },
  });
  if (existing) return;
  await notify(input, client);
}

/**
 * Version en lot de `notifyOnceUnread` — un salon de 200 membres ne doit pas
 * coûter 200 requêtes de déduplication : une seule lecture des non-lues du
 * lot, puis un seul insert.
 */
export async function notifyManyOnceUnread(inputs: NotificationInput[], client: Client = prisma) {
  const allowed = await withoutMuted(inputs, client);
  if (allowed.length === 0) return;

  const existing = await client.notification.findMany({
    where: {
      userId: { in: [...new Set(allowed.map((i) => i.userId))] },
      href: { in: [...new Set(allowed.map((i) => i.href))] },
      readAt: null,
    },
    select: { userId: true, type: true, href: true },
  });
  const key = (n: { userId: string; type: NotificationType; href: string }) =>
    `${n.userId}|${n.type}|${n.href}`;
  const alreadyPending = new Set(existing.map(key));

  const fresh = allowed.filter((input) => !alreadyPending.has(key(input)));
  if (fresh.length === 0) return;
  await client.notification.createMany({
    data: fresh.map((input) => ({
      userId: input.userId,
      type: input.type,
      key: input.key,
      params: input.params ?? undefined,
      excerpt: input.excerpt,
      href: input.href,
      sourceId: input.sourceId,
    })),
  });
}

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}
