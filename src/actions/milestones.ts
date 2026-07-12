"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { VoteDecision } from "@prisma/client";
import { auth } from "@/auth";
import { sendPendingNotificationEmails } from "@/lib/notification-emails";
import { castVote, DomainError, submitMilestoneProof } from "@/lib/project-service";
import { parseList, submitProofSchema } from "@/lib/validation";

export type ProofFormState = { error?: string; success?: boolean } | undefined;

export async function submitProofAction(
  _prev: ProofFormState,
  formData: FormData
): Promise<ProofFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = submitProofSchema.safeParse({
    milestoneId: formData.get("milestoneId"),
    content: formData.get("content"),
    links: parseList(formData.get("links")),
    imageUrls: parseList(formData.get("imageUrls")),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await submitMilestoneProof(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  // « Une preuve attend ton vote » part aussi par email (hors transaction).
  await sendPendingNotificationEmails();

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Vote pondéré sur une preuve — utilisé via bind(proofId, decision) dans un
 * <form> serveur. L'UI ne montre les boutons qu'aux votants éligibles ; une
 * DomainError résiduelle (double-clic, course) est ignorée sans casser la page.
 */
export async function voteProofAction(proofId: string, decision: VoteDecision) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await castVote(session.user.id, proofId, decision);
  } catch (error) {
    if (!(error instanceof DomainError)) throw error;
  }

  // Étape validée, remboursements, échec… : les emails majeurs partent
  // maintenant que tout est commité.
  await sendPendingNotificationEmails();

  revalidatePath("/", "layout");
}
