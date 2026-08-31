"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import { deleteAccountAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";

/**
 * Droit à l'effacement : repli par défaut (details), confirmation par mot de
 * passe — pas de double bouton, la saisie EST le geste délibéré.
 */
export function DeleteAccount() {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(deleteAccountAction, undefined);

  return (
    <details className="rounded-xl border border-destructive/25 bg-destructive/[0.05]">
      <summary className="flex cursor-pointer list-none items-center gap-2 p-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-destructive [&::-webkit-details-marker]:hidden">
        <TriangleAlert className="h-4 w-4" aria-hidden />
        {t("deleteAccount.summary")}
      </summary>
      <form action={formAction} className="space-y-3 border-t border-destructive/15 p-3.5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("deleteAccount.bodyBefore")}{" "}
          <strong>{t("deleteAccount.bodyStrong")}</strong>{" "}
          {t("deleteAccount.bodyAfter")}
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="delete-password">{t("deleteAccount.passwordLabel")}</Label>
          <PasswordInput
            id="delete-password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" variant="destructive" size="sm" disabled={pending}>
          {pending ? t("deleteAccount.submitPending") : t("deleteAccount.submit")}
        </Button>
      </form>
    </details>
  );
}
