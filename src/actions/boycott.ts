"use server";
import { domainErrorMessage, tErr } from "@/lib/action-errors";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  answerCall,
  createCall,
  deleteCallComment,
  postCallComment,
  removeCall,
  toggleSupport,
  withdrawAnswer,
} from "@/lib/boycott";
import { isAdmin } from "@/lib/moderation";
import { DomainError } from "@/lib/project-service";
import { parseLines } from "@/lib/validation";
import { requestSchemas } from "@/lib/validation-locale";

export type CallFormState = { error?: string } | undefined;

export async function createCallAction(
  _prev: CallFormState,
  formData: FormData
): Promise<CallFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { boycottCallSchema } = await requestSchemas();
  const parsed = boycottCallSchema.safeParse({
    target: formData.get("target"),
    category: formData.get("category"),
    reason: formData.get("reason"),
    wanted: formData.get("wanted"),
    sources: parseLines(formData.get("sources")),
    anonymous: formData.get("anonymous") === "on",
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  let slug: string;
  try {
    slug = await createCall(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/appels");
  revalidatePath("/");
  redirect(`/appels/${slug}`);
}

export type SupportState = { error?: string; supporting?: boolean } | undefined;

export async function toggleSupportAction(
  _prev: SupportState,
  formData: FormData
): Promise<SupportState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const callId = String(formData.get("callId") ?? "");
  let supporting: boolean;
  try {
    supporting = await toggleSupport(session.user.id, callId);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/appels", "layout");
  revalidatePath("/");
  return { supporting };
}

export type CallCommentState = { error?: string; success?: boolean } | undefined;

export async function postCallCommentAction(
  _prev: CallCommentState,
  formData: FormData
): Promise<CallCommentState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { callCommentSchema } = await requestSchemas();
  const parsed = callCommentSchema.safeParse({
    callId: formData.get("callId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await postCallComment(session.user.id, parsed.data.callId, parsed.data.body);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/appels", "layout");
  return { success: true };
}

export async function deleteCallCommentAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await deleteCallComment(
      session.user.id,
      String(formData.get("commentId") ?? ""),
      await isAdmin(session.user.id)
    );
  } catch (error) {
    if (error instanceof DomainError) return;
    throw error;
  }

  revalidatePath("/appels", "layout");
}

export type AnswerState = { error?: string; success?: boolean } | undefined;

/** « Mon projet répond à cet appel » — la colère devient une commande. */
export async function answerCallAction(
  _prev: AnswerState,
  formData: FormData
): Promise<AnswerState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const callId = String(formData.get("callId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return { error: await tErr("pickYourProject") };

  try {
    await answerCall(session.user.id, callId, projectId);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/appels", "layout");
  revalidatePath("/projects", "layout");
  revalidatePath("/");
  return { success: true };
}

export async function withdrawAnswerAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await withdrawAnswer(
      session.user.id,
      String(formData.get("callId") ?? ""),
      String(formData.get("projectId") ?? ""),
      await isAdmin(session.user.id)
    );
  } catch (error) {
    if (error instanceof DomainError) return;
    throw error;
  }

  revalidatePath("/appels", "layout");
  revalidatePath("/projects", "layout");
}

/**
 * Retrait d'un appel. La même action sert l'auteur et la modération : c'est
 * le service qui décide ce que chacun a le droit de faire.
 */
export async function removeCallAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const callId = String(formData.get("callId") ?? "");
  // Le motif type de modération est écrit ICI, en français : la base garde le
  // rendu que l'équipe relit, quelle que soit la langue du modérateur.
  const reason =
    formData.get("standardReason") === "1"
      ? "Retiré par la modération après examen"
      : String(formData.get("reason") ?? "");

  try {
    await removeCall(session.user.id, callId, {
      isAdmin: await isAdmin(session.user.id),
      reason,
    });
  } catch (error) {
    if (error instanceof DomainError) return;
    throw error;
  }

  revalidatePath("/appels", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}
