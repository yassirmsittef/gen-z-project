"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCommentAction } from "@/actions/project-feed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Commenter un projet (membres connectés). */
export function CommentForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(addCommentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <Textarea
        name="body"
        required
        rows={3}
        maxLength={1000}
        placeholder="Encourage, pose une question, propose un coup de main…"
        aria-label="Ton commentaire"
      />
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Envoi…" : "Commenter"}
      </Button>
    </form>
  );
}
