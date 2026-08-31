"use server";
import { domainErrorMessage } from "@/lib/action-errors";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { postVideo, removeVideo } from "@/lib/call-videos";
import { isAdmin } from "@/lib/moderation";
import { DomainError } from "@/lib/project-service";
import { requestSchemas } from "@/lib/validation-locale";

export type VideoFormState = { error?: string; success?: boolean } | undefined;

/**
 * Enregistre le témoignage APRÈS que le navigateur a déposé le fichier sur
 * Blob. L'action ne reçoit donc qu'une URL et des métadonnées — jamais la
 * vidéo elle-même, qui ne passerait pas la limite de corps.
 */
export async function postVideoAction(
  _prev: VideoFormState,
  formData: FormData
): Promise<VideoFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { callVideoSchema } = await requestSchemas();
  const parsed = callVideoSchema.safeParse({
    callId: formData.get("callId"),
    url: formData.get("url"),
    posterUrl: formData.get("posterUrl") || undefined,
    caption: formData.get("caption"),
    durationMs: formData.get("durationMs"),
    width: formData.get("width") || undefined,
    height: formData.get("height") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await postVideo(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  revalidatePath("/direct");
  revalidatePath("/appels", "layout");
  return { success: true };
}

export async function removeVideoAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await removeVideo(session.user.id, String(formData.get("videoId") ?? ""), {
      isAdmin: await isAdmin(session.user.id),
      reason: String(formData.get("reason") ?? ""),
    });
  } catch (error) {
    if (error instanceof DomainError) return;
    throw error;
  }

  revalidatePath("/direct");
  revalidatePath("/appels", "layout");
  revalidatePath("/admin", "layout");
}
