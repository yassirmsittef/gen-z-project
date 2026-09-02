"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { domainErrorMessage } from "@/lib/action-errors";
import { confirmMfaEnrolment, disableMfa, startMfaEnrolment } from "@/lib/mfa";
import { DomainError } from "@/lib/project-service";

export type MfaState = { error?: string; success?: "enabled" | "disabled" } | undefined;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function enableMfaAction(_prev: MfaState): Promise<MfaState> {
  const userId = await requireUserId();
  try {
    await startMfaEnrolment(userId);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }
  revalidatePath("/dashboard");
  return undefined;
}

export async function confirmMfaAction(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const userId = await requireUserId();
  try {
    await confirmMfaEnrolment(userId, String(formData.get("code") ?? ""));
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }
  revalidatePath("/dashboard");
  return { success: "enabled" };
}

export async function disableMfaAction(_prev: MfaState, formData: FormData): Promise<MfaState> {
  const userId = await requireUserId();
  try {
    await disableMfa(userId, String(formData.get("password") ?? ""));
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }
  revalidatePath("/dashboard");
  return { success: "disabled" };
}
