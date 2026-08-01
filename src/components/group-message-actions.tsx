"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteGroupMessageAction } from "@/actions/chat-groups";
import { ReportButton } from "@/components/report-button";

/**
 * Gestes sur un message : le retirer (son auteur, l'animation du salon) ou
 * le signaler (les autres). Discrets sous la bulle et TOUJOURS visibles —
 * un geste qui n'apparaît qu'au survol n'existe pas sur un téléphone.
 */
export function GroupMessageActions({
  messageId,
  canDelete,
  canReport,
}: {
  messageId: string;
  canDelete: boolean;
  canReport: boolean;
}) {
  const [state, formAction, pending] = useActionState(deleteGroupMessageAction, undefined);
  const [armed, setArmed] = useState(false);

  if (!canDelete && !canReport) return null;

  return (
    <span className="mt-1 flex items-center gap-2">
      {canReport && (
        <ReportButton
          targetType="GROUP_MESSAGE"
          targetId={messageId}
          iconOnly
          className="h-6 w-6 opacity-60 transition-opacity duration-200 hover:opacity-100"
        />
      )}

      {canDelete &&
        (armed ? (
          <form action={formAction} className="flex items-center gap-2">
            <input type="hidden" name="messageId" value={messageId} />
            <button
              type="submit"
              disabled={pending}
              className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-destructive hover:underline"
            >
              {pending ? "Retrait…" : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={() => setArmed(false)}
              className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:underline"
            >
              Annuler
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setArmed(true)}
            title="Retirer ce message"
            className="cursor-pointer text-muted-foreground opacity-60 transition-opacity duration-200 hover:text-destructive hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Retirer ce message</span>
          </button>
        ))}

      {state?.error && (
        <span role="alert" className="text-[11px] font-medium text-destructive">
          {state.error}
        </span>
      )}
    </span>
  );
}
