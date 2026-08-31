"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import { respondPartnershipAction } from "@/actions/partnerships";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Réponse du porteur à la marque. Le texte est pré-rédigé par le copilote
 * (rekeyé quand l'analyse approfondie remplace la suggestion) — à relire et
 * personnaliser avant d'envoyer.
 */
export function PartnershipResponseForm({
  requestId,
  suggestedReply,
}: {
  requestId: string;
  suggestedReply: string;
}) {
  const t = useT("calls");
  const [state, formAction, pending] = useActionState(respondPartnershipAction, undefined);

  if (state?.success) {
    return (
      <p className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
        {t("partnershipResponseForm.success")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="space-y-1.5">
        <Label htmlFor="reply">{t("partnershipResponseForm.replyLabel")}</Label>
        {/* key : quand l'analyse approfondie arrive, la suggestion se met à jour */}
        <Textarea
          key={suggestedReply}
          id="reply"
          name="reply"
          rows={9}
          maxLength={3000}
          defaultValue={suggestedReply}
        />
        <p className="text-xs text-muted-foreground">{t("partnershipResponseForm.replyHint")}</p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="decision" value="ACCEPTED" disabled={pending}>
          <Check aria-hidden />
          {pending ? t("partnershipResponseForm.pending") : t("partnershipResponseForm.accept")}
        </Button>
        <Button type="submit" name="decision" value="DECLINED" variant="outline" disabled={pending}>
          <X aria-hidden />
          {t("partnershipResponseForm.decline")}
        </Button>
      </div>
    </form>
  );
}
