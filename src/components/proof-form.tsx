"use client";

import { useActionState } from "react";
import { Paperclip } from "lucide-react";
import { submitProofAction } from "@/actions/milestones";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProofForm({ milestoneId, lastAttempt }: { milestoneId: string; lastAttempt: boolean }) {
  const t = useT("project");
  const [state, formAction, pending] = useActionState(submitProofAction, undefined);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <input type="hidden" name="milestoneId" value={milestoneId} />

      <p className="flex items-center gap-2 text-sm font-semibold">
        <Paperclip className="h-4 w-4" aria-hidden />
        {t("proofForm.heading")}
        {lastAttempt && (
          <span className="text-destructive">{t("proofForm.lastAttempt")}</span>
        )}
      </p>

      <div className="space-y-1.5">
        <Label htmlFor={`content-${milestoneId}`}>{t("proofForm.contentLabel")}</Label>
        <Textarea
          id={`content-${milestoneId}`}
          name="content"
          placeholder={t("proofForm.contentPlaceholder")}
          rows={4}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`links-${milestoneId}`}>{t("proofForm.linksLabel")}</Label>
          <Textarea
            id={`links-${milestoneId}`}
            name="links"
            rows={2}
            placeholder={t("proofForm.linksPlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`imageUrls-${milestoneId}`}>{t("proofForm.imagesLabel")}</Label>
          <Textarea
            id={`imageUrls-${milestoneId}`}
            name="imageUrls"
            rows={2}
            placeholder={t("proofForm.imagesPlaceholder")}
          />
        </div>
      </div>

      {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? t("proofForm.submitPending") : t("proofForm.submit")}
      </Button>
    </form>
  );
}
