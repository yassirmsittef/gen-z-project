"use client";

import { useActionState, useEffect, useRef } from "react";
import { Megaphone } from "lucide-react";
import { postUpdateAction } from "@/actions/project-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Poster une actu (porteur uniquement) — tous les contributeurs sont notifiés. */
export function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(postUpdateAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="space-y-1.5">
        <Label htmlFor="update-title">Titre de l&apos;actu</Label>
        <Input
          id="update-title"
          name="title"
          required
          maxLength={80}
          placeholder="ex : Le matériel est arrivé !"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="update-body">Quoi de neuf ?</Label>
        <Textarea
          id="update-body"
          name="body"
          required
          rows={4}
          maxLength={3000}
          placeholder="Avancées, coulisses, remerciements... tes contributeurs seront notifiés."
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-success">Actu publiée — contributeurs notifiés.</p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        <Megaphone aria-hidden />
        {pending ? "Publication…" : "Publier l'actu"}
      </Button>
    </form>
  );
}
