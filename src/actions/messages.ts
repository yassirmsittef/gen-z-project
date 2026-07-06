"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validation";

export type MessageFormState = { error?: string; sentAt?: number } | undefined;

export async function sendMessageAction(
  _prev: MessageFormState,
  formData: FormData
): Promise<MessageFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = messageSchema.safeParse({
    recipientId: formData.get("recipientId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  if (parsed.data.recipientId === session.user.id) {
    return { error: "Tu ne peux pas t'écrire à toi-même." };
  }
  const recipient = await prisma.user.findUnique({
    where: { id: parsed.data.recipientId },
    select: { id: true },
  });
  if (!recipient) return { error: "Destinataire introuvable." };

  await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: parsed.data.recipientId,
      body: parsed.data.body,
    },
  });

  revalidatePath("/chat", "layout");
  // sentAt change à chaque envoi : le formulaire client s'en sert pour se vider.
  return { sentAt: Date.now() };
}
