import type { NotificationType, Prisma } from "@prisma/client";
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
  title: string;
  body?: string;
  href: string;
};

export async function notify(input: NotificationInput, client: Client = prisma) {
  await client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });
}

export async function notifyMany(inputs: NotificationInput[], client: Client = prisma) {
  if (inputs.length === 0) return;
  await client.notification.createMany({
    data: inputs.map((input) => ({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
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

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}
