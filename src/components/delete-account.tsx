"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import { deleteAccountAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

/**
 * Droit à l'effacement : repli par défaut (details), confirmation par mot de
 * passe — pas de double bouton, la saisie EST le geste délibéré.
 */
export function DeleteAccount() {
  const [state, formAction, pending] = useActionState(deleteAccountAction, undefined);

  return (
    <details className="rounded-xl border border-destructive/25 bg-destructive/[0.05]">
      <summary className="flex cursor-pointer list-none items-center gap-2 p-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-destructive [&::-webkit-details-marker]:hidden">
        <TriangleAlert className="h-4 w-4" aria-hidden />
        Supprimer mon compte
      </summary>
      <form action={formAction} className="space-y-3 border-t border-destructive/15 p-3.5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tes données personnelles sont effacées (profil, avatar, bio, ville, préférences) et la
          connexion coupée définitivement. <strong>Tes témoignages filmés sont retirés du direct
          et leurs fichiers supprimés</strong> : on y voit ton visage, ils ne peuvent pas te
          survivre — c&apos;est sans retour. Tes contributions et l&apos;historique des projets
          déjà soutenus restent, au nom de « Membre retiré » — les comptes de la communauté ne
          mentent jamais. Impossible tant qu&apos;une de tes campagnes soutenues est en cours.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="delete-password">Confirme avec ton mot de passe</Label>
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
          {pending ? "Suppression…" : "Supprimer définitivement mon compte"}
        </Button>
      </form>
    </details>
  );
}
