"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Ne jamais laisser traîner des mots de passe dans les champs après succès.
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">Nouveau (8 caractères min)</Label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmer</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-success">Mot de passe modifié.</p>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Modification…" : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
