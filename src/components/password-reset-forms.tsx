"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { requestResetAction, resetPasswordAction } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";

export function ForgotPasswordForm() {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(requestResetAction, undefined);

  if (state?.success) {
    return (
      <div className="space-y-3">
        <p className="data-label flex items-center gap-2">
          <MailCheck className="h-4 w-4 text-primary" aria-hidden />
          {t("forgotPasswordForm.sentTitle")}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("forgotPasswordForm.sentBody")}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">{t("forgotPasswordForm.backToLogin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("forgotPasswordForm.emailLabel")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("forgotPasswordForm.emailPlaceholder")}
          required
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("forgotPasswordForm.submitPending") : t("forgotPasswordForm.submit")}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (state?.success) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-success">{t("resetPasswordForm.success")}</p>
        <Button asChild>
          <Link href="/login">{t("resetPasswordForm.signIn")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">{t("resetPasswordForm.newLabel")}</Label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t("resetPasswordForm.confirmLabel")}</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}{" "}
          <Link href="/mot-de-passe-oublie" className="text-primary hover:underline">
            {t("resetPasswordForm.retryLink")}
          </Link>
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("resetPasswordForm.submitPending") : t("resetPasswordForm.submit")}
      </Button>
    </form>
  );
}
