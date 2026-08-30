"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { requestResetAction, resetPasswordAction } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestResetAction, undefined);

  if (state?.success) {
    return (
      <div className="space-y-3">
        <p className="data-label flex items-center gap-2">
          <MailCheck className="h-4 w-4 text-primary" aria-hidden />
          Email envoyé
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Si un compte existe avec cette adresse, un lien de réinitialisation vient de partir —
          il est valable 1&nbsp;heure. Pense à vérifier tes spams.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Ton email de compte</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="toi@exemple.fr"
          required
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi…" : "M'envoyer un lien de réinitialisation"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (state?.success) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-success">Mot de passe changé — tu peux te connecter.</p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Nouveau mot de passe (8 caractères min)</Label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirme-le</Label>
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
            Refaire une demande
          </Link>
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enregistrement…" : "Changer mon mot de passe"}
      </Button>
    </form>
  );
}
