"use server";
import { tErr } from "@/lib/action-errors";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyOnceUnread } from "@/lib/notifications";
import { requestSchemas } from "@/lib/validation-locale";

export type MessageFormState = { error?: string; sentAt?: number } | undefined;

export async function sendMessageAction(
  _prev: MessageFormState,
  formData: FormData
): Promise<MessageFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { messageSchema } = await requestSchemas();
  const parsed = messageSchema.safeParse({
    recipientId: formData.get("recipientId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  if (parsed.data.recipientId === session.user.id) {
    return { error: await tErr("selfMessage") };
  }
  const recipient = await prisma.user.findUnique({
    where: { id: parsed.data.recipientId },
    select: { id: true },
  });
  if (!recipient) return { error: await tErr("recipientNotFound") };

  await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: parsed.data.recipientId,
      body: parsed.data.body,
    },
  });

  // Une seule notification non lue par conversation (pas une par message).
  await notifyOnceUnread({
    userId: parsed.data.recipientId,
    type: "MESSAGE",
    title: `Nouveau message de ${session.user.name ?? "un membre"}`,
    href: `/chat/${session.user.id}`,
  });

  revalidatePath("/chat", "layout");
  // sentAt change à chaque envoi : le formulaire client s'en sert pour se vider.
  return { sentAt: Date.now() };
}
