"use client";

import { useActionState } from "react";
import { Languages } from "lucide-react";
import { openLanguageRoomsAction } from "@/actions/chat-groups";
import { Button } from "@/components/ui/button";

/**
 * Ouverture des salons de langue — visible par l'équipe seulement, et
 * seulement tant qu'il en manque. Rejouable sans risque : les salons déjà
 * ouverts sont reconnus à leur slug. Pas de message de succès : les salons
 * apparaissent dans l'annuaire juste en dessous, et la bannière disparaît
 * d'elle-même — le résultat se voit.
 */
export function LanguageRoomsBanner({ missing }: { missing: number }) {
  const [state, formAction, pending] = useActionState(openLanguageRoomsAction, undefined);

  return (
    <form action={formAction} className="glass rounded-2xl rounded-tr-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Languages className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
          <div>
            <p className="font-semibold">Salons de langue</p>
            <p className="text-sm text-muted-foreground">
              {missing} salon{missing > 1 ? "s" : ""} d&apos;accueil à ouvrir — une porte
              d&apos;entrée pour les membres qui ne parlent pas français.
            </p>
          </div>
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Ouverture…" : "Ouvrir les salons"}
        </Button>
      </div>
      {state?.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
