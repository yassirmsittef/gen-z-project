"use client";

import { useActionState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { sendMessageAction } from "@/actions/messages";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MessageForm({ recipientId }: { recipientId: string }) {
  const t = useT("chat");
  const [state, formAction, pending] = useActionState(sendMessageAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Après un envoi réussi, on vide le champ (sentAt change à chaque envoi).
  useEffect(() => {
    if (state?.sentAt) formRef.current?.reset();
  }, [state?.sentAt]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input type="hidden" name="recipientId" value={recipientId} />
        <Input
          name="body"
          aria-label={t("messageForm.bodyLabel")}
          placeholder={t("messageForm.bodyPlaceholder")}
          maxLength={1000}
          autoComplete="off"
          required
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={pending} title={t("messageForm.send")}>
          <SendHorizontal aria-hidden />
          <span className="sr-only">{t("messageForm.send")}</span>
        </Button>
      </div>
      {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}
    </form>
  );
}
