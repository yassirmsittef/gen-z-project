"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useActionState } from "react";
import { Flag } from "lucide-react";
import { reportAction } from "@/actions/moderation";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASON_KEYS } from "@/lib/constants";

/**
 * Signaler un contenu à l'équipe : bouton discret → dialogue portal (motif
 * imposé, précision libre). Le signalement n'est jamais montré à la personne
 * visée.
 */
export function ReportButton({
  targetType,
  targetId,
  label,
  iconOnly = false,
  className,
}: {
  targetType: "PROJECT" | "COMMENT" | "USER" | "CHAT_GROUP" | "GROUP_MESSAGE" | "BOYCOTT_CALL" | "CALL_COMMENT" | "CALL_VIDEO";
  targetId: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const t = useT("ui");
  const tLabels = useT("labels");
  const buttonLabel = label ?? t("reportButton.defaultLabel");
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
        title={t("reportButton.triggerTitle")}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Flag aria-hidden className={iconOnly ? undefined : "h-3.5 w-3.5"} />
        {iconOnly ? <span className="sr-only">{buttonLabel}</span> : buttonLabel}
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
              aria-label={t("reportButton.dialogLabel")}
              className="glass mx-auto mt-[15vh] w-full max-w-md rounded-2xl rounded-tr-sm border border-white/[0.12] p-5 shadow-glow"
              style={{ overscrollBehavior: "contain" }}
              onClick={(event) => event.stopPropagation()}
            >
              {state?.success ? (
                <div className="space-y-4">
                  <p className="data-label flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 text-primary" aria-hidden />
                    {t("reportButton.sentTitle")}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("reportButton.sentBody")}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                    {t("reportButton.close")}
                  </Button>
                </div>
              ) : (
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="targetType" value={targetType} />
                  <input type="hidden" name="targetId" value={targetId} />

                  <p className="data-label flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 text-destructive" aria-hidden />
                    {t("reportButton.heading")}
                  </p>

                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">{t("reportButton.reasonLegend")}</legend>
                    {REPORT_REASON_KEYS.map((reason) => (
                      <label key={reason} className="flex items-center gap-2.5 text-sm">
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          required
                          className="h-4 w-4 accent-[#38BDF8]"
                        />
                        {tLabels(`reportReason.${reason}`)}
                      </label>
                    ))}
                  </fieldset>

                  <div className="space-y-1.5">
                    <Label htmlFor={`report-detail-${targetId}`}>{t("reportButton.detailLabel")}</Label>
                    <Textarea
                      id={`report-detail-${targetId}`}
                      name="detail"
                      rows={3}
                      maxLength={500}
                      placeholder={t("reportButton.detailPlaceholder")}
                    />
                  </div>

                  {state?.error && (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {state.error}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
                      {pending ? t("reportButton.sending") : t("reportButton.submit")}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                      {t("reportButton.cancel")}
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
