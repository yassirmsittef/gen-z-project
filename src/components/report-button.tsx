"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useActionState } from "react";
import { Flag } from "lucide-react";
import { reportAction } from "@/actions/moderation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASONS } from "@/lib/constants";

/**
 * Signaler un contenu à l'équipe : bouton discret → dialogue portal (motif
 * imposé, précision libre). Le signalement n'est jamais montré à la personne
 * visée.
 */
export function ReportButton({
  targetType,
  targetId,
  label = "Signaler",
  iconOnly = false,
  className,
}: {
  targetType: "PROJECT" | "COMMENT" | "USER" | "CHAT_GROUP";
  targetId: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(reportAction, undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus dans le dialogue à l'ouverture, Échap ferme, focus rendu au bouton.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      (previous ?? triggerRef.current)?.focus?.();
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size={iconOnly ? "icon" : "sm"}
        title="Signaler à l'équipe"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Flag aria-hidden className={iconOnly ? undefined : "h-3.5 w-3.5"} />
        {iconOnly ? <span className="sr-only">{label}</span> : label}
      </Button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-background/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Signaler ce contenu"
              className="glass mx-auto mt-[15vh] w-full max-w-md rounded-2xl rounded-tr-sm border border-white/[0.12] p-5 shadow-glow"
              style={{ overscrollBehavior: "contain" }}
              onClick={(event) => event.stopPropagation()}
            >
              {state?.success ? (
                <div className="space-y-4">
                  <p className="data-label flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Signalement envoyé
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Merci de veiller sur la communauté — l&apos;équipe va regarder. La personne
                    visée n&apos;est pas informée de ton signalement.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Fermer
                  </Button>
                </div>
              ) : (
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="targetType" value={targetType} />
                  <input type="hidden" name="targetId" value={targetId} />

                  <p className="data-label flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 text-destructive" aria-hidden />
                    Signaler à l&apos;équipe
                  </p>

                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Motif</legend>
                    {REPORT_REASONS.map((reason) => (
                      <label key={reason} className="flex items-center gap-2.5 text-sm">
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          required
                          className="h-4 w-4 accent-[#38BDF8]"
                        />
                        {reason}
                      </label>
                    ))}
                  </fieldset>

                  <div className="space-y-1.5">
                    <Label htmlFor={`report-detail-${targetId}`}>Précision (optionnel)</Label>
                    <Textarea
                      id={`report-detail-${targetId}`}
                      name="detail"
                      rows={3}
                      maxLength={500}
                      placeholder="Ce qui t'a alerté·e — liens, contexte…"
                    />
                  </div>

                  {state?.error && (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {state.error}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
                      {pending ? "Envoi…" : "Envoyer le signalement"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
