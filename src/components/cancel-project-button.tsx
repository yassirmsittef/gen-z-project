"use client";

import { useActionState, useState } from "react";
import { OctagonX } from "lucide-react";
import { cancelProjectAction } from "@/actions/projects";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

/**
 * Arrêt d'un projet en cours par son porteur — confirmation en deux temps qui
 * énonce clairement les deux conséquences : le projet s'arrête (passe « non
 * abouti ») ET les contributeurs sont remboursés du séquestre restant. Le
 * montant et le nombre de contributeurs sont affichés pour lever tout doute.
 */
export function CancelProjectButton({
  projectId,
  slug,
  refundLabel,
  contributorCount,
}: {
  projectId: string;
  slug: string;
  refundLabel: string;
  contributorCount: number;
}) {
  const t = useT("project");
  const [state, formAction, pending] = useActionState(cancelProjectAction, undefined);
  const [armed, setArmed] = useState(false);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="slug" value={slug} />

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      {armed ? (
        <div className="space-y-3">
          <p className="rounded-xl border border-destructive/30 bg-destructive/[0.07] p-3 text-sm text-foreground/90">
            {t("cancelProjectButton.confirmBody", {
              amount: refundLabel,
              contributors:
                contributorCount > 0
                  ? t("cancelProjectButton.contributorCount", { count: contributorCount })
                  : t("cancelProjectButton.contributorsGeneric"),
            })}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="destructive" size="sm" disabled={pending}>
              <OctagonX aria-hidden />
              {pending ? t("cancelProjectButton.confirmPending") : t("cancelProjectButton.confirmSubmit")}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(false)}>
              {t("cancelProjectButton.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setArmed(true)}
        >
          <OctagonX aria-hidden />
          {t("cancelProjectButton.arm")}
        </Button>
      )}
    </form>
  );
}
