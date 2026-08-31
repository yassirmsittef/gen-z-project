"use server";
import { domainErrorMessage } from "@/lib/action-errors";
import { REPORT_REASON_KEYS, reportReasonFr } from "@/lib/constants";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { createReport, handleReport } from "@/lib/moderation";
import { DomainError } from "@/lib/project-service";

export type ReportFormState = { error?: string; success?: boolean } | undefined;

const reportSchema = z.object({
  targetType: z.enum([
    "PROJECT",
    "COMMENT",
    "USER",
    "CHAT_GROUP",
    "GROUP_MESSAGE",
    "BOYCOTT_CALL",
    "CALL_COMMENT",
    "CALL_VIDEO",
  ]),
  targetId: z.string().min(1),
  // La CLÉ du motif (affichée traduite au formulaire) ; le rendu français
  // part en base — l'équipe modère en français.
  reason: z.enum(REPORT_REASON_KEYS, { errorMap: () => ({ message: "Choisis un motif." }) }),
  detail: z.string().trim().max(500, "500 caractères max.").optional(),
});

export async function reportAction(
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
    detail: formData.get("detail") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await createReport(session.user.id, {
      ...parsed.data,
      reason: reportReasonFr(parsed.data.reason),
    });
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  return { success: true };
}

/** Traiter ou rejeter un signalement (admin) — action de formulaire simple. */
export async function handleReportAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reportId = String(formData.get("reportId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "RESOLVED" && decision !== "DISMISSED") return;

  try {
    await handleReport(session.user.id, reportId, decision);
  } catch (error) {
    if (error instanceof DomainError) return; // file rafraîchie, rien à afficher
    throw error;
  }

  revalidatePath("/admin/signalements");
}
