"use client";

import { useActionState, useEffect, useRef } from "react";
import { postCallCommentAction } from "@/actions/boycott";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Répondre sous un appel. Le libellé invite explicitement à la contradiction
 * et à la nuance : un fil où l'on ne peut qu'approuver devient un tribunal,
 * et c'est exactement ce qui exposerait la plateforme.
 */
export function CallCommentForm({ callId }: { callId: string }) {
  const t = useT("calls");
  const [state, formAction, pending] = useActionState(postCallCommentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="callId" value={callId} />
      <Textarea
        name="body"
        required
        rows={3}
        maxLength={1000}
        placeholder={t("callCommentForm.placeholder")}
        aria-label={t("callCommentForm.replyAria")}
      />
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? t("callCommentForm.pending") : t("callCommentForm.submit")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("callCommentForm.disclaimer")}</p>
      </div>
    </form>
  );
}
