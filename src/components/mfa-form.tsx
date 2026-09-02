"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { confirmMfaAction, disableMfaAction, enableMfaAction } from "@/actions/mfa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/i18n-provider";

/**
 * Carte « Double authentification » du tableau de bord (ADMIN seulement).
 * Trois états : pas commencé → « Activer » ; secret posé → la clé à saisir
 * dans l'application et le code de confirmation ; activée → la date, et la
 * désactivation contre mot de passe.
 *
 * Pas de QR code : le dessiner demanderait une bibliothèque de plus, et
 * toutes les applications acceptent la clé tapée à la main (ou le lien
 * otpauth collé). C'est un geste qu'on fait une fois.
 */
export function MfaForm({
  enabledAt,
  pendingSecret,
  pendingUri,
}: {
  enabledAt: string | null;
  pendingSecret: string | null;
  pendingUri: string | null;
}) {
  const t = useT("account");
  const [enableState, enableAction, enablePending] = useActionState(enableMfaAction, undefined);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmMfaAction, undefined);
  const [disableState, disableAction, disablePending] = useActionState(disableMfaAction, undefined);

  const groupee = pendingSecret?.match(/.{1,4}/g)?.join(" ") ?? "";

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
        {t("mfa.title")}
      </h3>

      {enabledAt ? (
        <form action={disableAction} className="space-y-3">
          <p className="text-xs text-success">{t("mfa.enabledSince", { date: enabledAt })}</p>
          <p className="text-xs text-muted-foreground">{t("mfa.disableHint")}</p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[12rem] flex-1 space-y-1.5">
              <Label htmlFor="mfaPassword">{t("passwordForm.currentLabel")}</Label>
              <PasswordInput id="mfaPassword" name="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={disablePending}>
              {t("mfa.disable")}
            </Button>
          </div>
          {disableState?.error && (
            <p role="alert" className="text-sm font-medium text-destructive">{disableState.error}</p>
          )}
          {disableState?.success === "disabled" && (
            <p className="text-sm font-medium text-success">{t("mfa.disabled")}</p>
          )}
        </form>
      ) : pendingSecret ? (
        <form action={confirmAction} className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("mfa.body")}</p>
          <div className="space-y-1.5">
            <Label>{t("mfa.secretLabel")}</Label>
            <p dir="ltr" className="select-all rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-sm tracking-[0.18em]">
              {groupee}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mfaUri">{t("mfa.uriLabel")}</Label>
            <Input id="mfaUri" dir="ltr" readOnly value={pendingUri ?? ""} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[10rem] space-y-1.5">
              <Label htmlFor="mfaCode">{t("mfa.confirmLabel")}</Label>
              <Input
                id="mfaCode"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]*"
                maxLength={7}
                required
                className="font-mono tracking-[0.3em]"
              />
            </div>
            <Button type="submit" size="sm" disabled={confirmPending}>
              {t("mfa.confirm")}
            </Button>
          </div>
          {confirmState?.error && (
            <p role="alert" className="text-sm font-medium text-destructive">{confirmState.error}</p>
          )}
          {confirmState?.success === "enabled" && (
            <p className="text-sm font-medium text-success">{t("mfa.success")}</p>
          )}
        </form>
      ) : (
        <form action={enableAction} className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("mfa.body")}</p>
          <Button type="submit" variant="outline" size="sm" disabled={enablePending}>
            {t("mfa.enable")}
          </Button>
          {enableState?.error && (
            <p role="alert" className="text-sm font-medium text-destructive">{enableState.error}</p>
          )}
        </form>
      )}
    </div>
  );
}
