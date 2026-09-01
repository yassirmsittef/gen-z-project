"use client";

import { useActionState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { sendGroupMessageAction } from "@/actions/chat-groups";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GroupMessageForm({ groupId, groupName }: { groupId: string; groupName: string }) {
  const t = useT("chat");
  const [state, formAction, pending] = useActionState(sendGroupMessageAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Après un envoi réussi, on vide le champ (sentAt change à chaque envoi).
  useEffect(() => {
    if (state?.sentAt) formRef.current?.reset();
  }, [state?.sentAt]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input type="hidden" name="groupId" value={groupId} />
        <Input
          name="body"
          aria-label={t("groupMessageForm.bodyLabel", { group: groupName })}
          placeholder={t("groupMessageForm.bodyPlaceholder", { group: groupName })}
          maxLength={1000}
          autoComplete="off"
          required
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={pending} title={t("groupMessageForm.send")}>
          <SendHorizontal className="rtl:-scale-x-100" aria-hidden />
          <span className="sr-only">{t("groupMessageForm.send")}</span>
        </Button>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
