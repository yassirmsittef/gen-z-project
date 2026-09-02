"use client";

import { useActionState } from "react";
import { MailWarning } from "lucide-react";
import { resendVerificationAction } from "@/actions/email-verification";
import { useT } from "@/components/i18n-provider";

/** Bandeau du tableau de bord tant que l'adresse n'est pas confirmée. */
export function VerifyEmailBanner() {
  const t = useT("account");
  const [state, action, pending] = useActionState(resendVerificationAction, undefined);
  return (
    <form
      action={action}
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm"
    >
      <MailWarning className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
      <span className="flex-1">{state?.success ? t("verifyBanner.sent") : t("verifyBanner.text")}</span>
      {!state?.success && (
        <button
          type="submit"
          disabled={pending}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {t("verifyBanner.resend")}
        </button>
      )}
      {state?.error && <span className="text-destructive">{state.error}</span>}
    </form>
  );
}
