"use server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { domainErrorMessage } from "@/lib/action-errors";
import { sendVerificationEmail } from "@/lib/email-verification";
import { DomainError } from "@/lib/project-service";

export type ResendState = { error?: string; success?: boolean } | undefined;

/** Renvoyer l'email de confirmation (3 par heure, cf. lib). */
export async function resendVerificationAction(): Promise<ResendState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  try {
    await sendVerificationEmail(session.user.id);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }
  return { success: true };
}
