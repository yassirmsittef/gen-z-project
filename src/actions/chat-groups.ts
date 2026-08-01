"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createGroup,
  dissolveGroup,
  joinGroup,
  leaveGroup,
  postGroupMessage,
} from "@/lib/chat-groups";
import { DomainError } from "@/lib/project-service";
import { createGroupSchema, groupMessageSchema } from "@/lib/validation";

export type CreateGroupState = { error?: string } | undefined;

export async function createGroupAction(
  _prev: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    purpose: formData.get("purpose"),
    category: formData.get("category"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  let slug: string;
  try {
    slug = await createGroup(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/chat", "layout");
  redirect(`/chat/groupes/${slug}`);
}

export type GroupMembershipState = { error?: string } | undefined;

export async function joinGroupAction(
  _prev: GroupMembershipState,
  formData: FormData
): Promise<GroupMembershipState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const slug = String(formData.get("slug") ?? "");
  try {
    await joinGroup(session.user.id, slug);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/chat", "layout");
  redirect(`/chat/groupes/${slug}`);
}

export async function leaveGroupAction(
  _prev: GroupMembershipState,
  formData: FormData
): Promise<GroupMembershipState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await leaveGroup(session.user.id, String(formData.get("slug") ?? ""));
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/chat", "layout");
  redirect("/chat/groupes");
}

export async function dissolveGroupAction(
  _prev: GroupMembershipState,
  formData: FormData
): Promise<GroupMembershipState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await dissolveGroup(session.user.id, String(formData.get("slug") ?? ""));
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/chat", "layout");
  redirect("/chat/groupes");
}

export type GroupMessageState = { error?: string; sentAt?: number } | undefined;

export async function sendGroupMessageAction(
  _prev: GroupMessageState,
  formData: FormData
): Promise<GroupMessageState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = groupMessageSchema.safeParse({
    groupId: formData.get("groupId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await postGroupMessage(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/chat", "layout");
  // sentAt change à chaque envoi : le formulaire client s'en sert pour se vider.
  return { sentAt: Date.now() };
}
