"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";

/**
 * Retrait définitif d'un projet sans contribution — confirmation en deux
 * temps dans le flux (pas de dialogue), le second bouton dit clairement
 * l'irréversibilité.
 */
export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(deleteProjectAction, undefined);
  const [armed, setArmed] = useState(false);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      {armed ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="destructive" size="sm" disabled={pending}>
            <Trash2 aria-hidden />
            {pending ? "Retrait…" : "Oui, retirer définitivement"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(false)}>
            Annuler
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setArmed(true)}
        >
          <Trash2 aria-hidden />
          Retirer le projet
        </Button>
      )}
    </form>
  );
}
