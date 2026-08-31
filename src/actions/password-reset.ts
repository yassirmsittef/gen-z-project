"use server";

import { emailEnabled } from "@/lib/email";
import { requestPasswordReset, resetPassword } from "@/lib/password-reset";
import { DomainError } from "@/lib/project-service";
import { requestSchemas } from "@/lib/validation-locale";

export type RequestResetState = { error?: string; success?: boolean } | undefined;

export async function requestResetAction(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const { requestResetSchema } = await requestSchemas();
  const parsed = requestResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // En dev sans clé, on laisse passer : le lien part dans les logs du serveur
  // (cf sendEmail). En prod, on est honnête avec l'utilisateur.
  if (!emailEnabled && process.env.NODE_ENV === "production") {
    return {
      error:
        "L'envoi d'email n'est pas encore configuré sur cette plateforme — contacte l'équipe.",
    };
  }

  try {
    await requestPasswordReset(parsed.data.email);
  } catch (error) {
    // Même le plafond de demandes répond comme un succès : la réponse ne doit
    // jamais révéler si un compte existe.
    if (!(error instanceof DomainError)) throw error;
  }

  return { success: true };
}

export type ResetPasswordState = { error?: string; success?: boolean } | undefined;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const { resetPasswordSchema } = await requestSchemas();
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await resetPassword(parsed.data.token, parsed.data.newPassword);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  return { success: true };
}
