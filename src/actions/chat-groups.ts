"use server";
import { domainErrorMessage, tErr } from "@/lib/action-errors";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createGroup,
  deleteGroupMessage,
  dissolveGroup,
  excludeFromGroup,
  joinGroup,
  leaveGroup,
  openLanguageRooms,
  postGroupMessage,
  readmitToGroup,
  addGroupMember,
  setGroupManager,
  setGroupMuted,
} from "@/lib/chat-groups";
import { DomainError } from "@/lib/project-service";
import { requestSchemas } from "@/lib/validation-locale";

export type CreateGroupState = { error?: string } | undefined;

export async function createGroupAction(
  _prev: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { createGroupSchema } = await requestSchemas();
  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    purpose: formData.get("purpose"),
    category: formData.get("category"),
    private: formData.get("private") === "on",
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  let slug: string;
  try {
    slug = await createGroup(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/chat", "layout");
  redirect(`/chat/groupes/${slug}`);
}

export type OpenLanguageRoomsState = { error?: string; opened?: number } | undefined;

/** Ouvre les salons de langue manquants (équipe). Idempotent : rejouable. */
export async function openLanguageRoomsAction(
  _prev: OpenLanguageRoomsState,
  _formData: FormData
): Promise<OpenLanguageRoomsState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let opened: number;
  try {
    opened = await openLanguageRooms(session.user.id);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/chat", "layout");
  return { opened };
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
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
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
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
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
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/chat", "layout");
  redirect("/chat/groupes");
}

export type GroupMuteState = { error?: string } | undefined;

/** Mettre un salon en silence, ou lui rendre la parole (réglage personnel). */
export async function toggleGroupMuteAction(
  _prev: GroupMuteState,
  formData: FormData
): Promise<GroupMuteState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await setGroupMuted(
      session.user.id,
      String(formData.get("slug") ?? ""),
      formData.get("muted") === "true"
    );
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/chat", "layout");
  return {};
}

export type GroupModerationState = { error?: string; done?: number } | undefined;

/**
 * Gestes d'animation d'un salon : nommer/démettre un·e gérant·e, exclure,
 * réadmettre. Un seul point d'entrée, la garde des droits vit dans le
 * service. `done` change à chaque succès pour rafraîchir l'écran.
 */
export async function groupModerationAction(
  _prev: GroupModerationState,
  formData: FormData
): Promise<GroupModerationState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const slug = String(formData.get("slug") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const geste = String(formData.get("geste") ?? "");

  try {
    if (geste === "ajouter") await addGroupMember(session.user.id, slug, targetId);
    else if (geste === "nommer") await setGroupManager(session.user.id, slug, targetId, true);
    else if (geste === "demettre") await setGroupManager(session.user.id, slug, targetId, false);
    else if (geste === "exclure") await excludeFromGroup(session.user.id, slug, targetId);
    else if (geste === "readmettre") await readmitToGroup(session.user.id, slug, targetId);
    else return { error: await tErr("unknownGesture") };
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/chat", "layout");
  return { done: Date.now() };
}

export type DeleteGroupMessageState = { error?: string } | undefined;

/** Retirer un message : son auteur, l'animation du salon, ou un ADMIN. */
export async function deleteGroupMessageAction(
  _prev: DeleteGroupMessageState,
  formData: FormData
): Promise<DeleteGroupMessageState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await deleteGroupMessage(session.user.id, String(formData.get("messageId") ?? ""));
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/chat", "layout");
  revalidatePath("/admin/signalements");
  return {};
}

/**
 * Variante « formulaire simple » pour la file de modération : l'admin y
 * retire un message signalé d'un clic, sans état à afficher (la file se
 * rafraîchit, le signalement passe en traité).
 */
export async function deleteGroupMessageFormAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await deleteGroupMessage(session.user.id, String(formData.get("messageId") ?? ""));
  } catch (error) {
    if (error instanceof DomainError) return; // file rafraîchie, rien à afficher
    throw error;
  }

  revalidatePath("/admin/signalements");
  revalidatePath("/chat", "layout");
}

export type GroupMessageState = { error?: string; sentAt?: number } | undefined;

export async function sendGroupMessageAction(
  _prev: GroupMessageState,
  formData: FormData
): Promise<GroupMessageState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { groupMessageSchema } = await requestSchemas();
  const parsed = groupMessageSchema.safeParse({
    groupId: formData.get("groupId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await postGroupMessage(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/chat", "layout");
  // sentAt change à chaque envoi : le formulaire client s'en sert pour se vider.
  return { sentAt: Date.now() };
}
