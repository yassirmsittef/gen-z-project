"use client";

import { useActionState, useEffect, useRef } from "react";
import { postCallCommentAction } from "@/actions/boycott";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Répondre sous un appel. Le libellé invite explicitement à la contradiction
 * et à la nuance : un fil où l'on ne peut qu'approuver devient un tribunal,
 * et c'est exactement ce qui exposerait la plateforme.
 */
export function CallCommentForm({ callId }: { callId: string }) {
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
        placeholder="Apporte une précision, une source, une nuance — ou dis pourquoi tu n'es pas d'accord…"
        aria-label="Ta réponse"
      />
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Envoi…" : "Répondre"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Publié sous ton nom. La contradiction est bienvenue, l&apos;attaque personnelle non.
        </p>
      </div>
    </form>
  );
}
