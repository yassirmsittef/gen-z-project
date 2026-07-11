"use client";

import { useActionState } from "react";
import { Paperclip } from "lucide-react";
import { submitProofAction } from "@/actions/milestones";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProofForm({ milestoneId, lastAttempt }: { milestoneId: string; lastAttempt: boolean }) {
  const [state, formAction, pending] = useActionState(submitProofAction, undefined);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <input type="hidden" name="milestoneId" value={milestoneId} />

      <p className="flex items-center gap-2 text-sm font-semibold">
        <Paperclip className="h-4 w-4" aria-hidden />
        Soumets ta preuve d&apos;avancement
        {lastAttempt && (
          <span className="text-destructive">Dernière tentative — sois convaincant·e !</span>
        )}
      </p>

      <div className="space-y-1.5">
        <Label htmlFor={`content-${milestoneId}`}>Ce que tu as réalisé</Label>
        <Textarea
          id={`content-${milestoneId}`}
          name="content"
          placeholder="Décris concrètement ce qui a été fait pour cette étape (20 caractères min)…"
          rows={4}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`links-${milestoneId}`}>Liens (un par ligne, optionnel)</Label>
          <Textarea
            id={`links-${milestoneId}`}
            name="links"
            rows={2}
            placeholder={"https://demo.exemple.fr\nhttps://github.com/…"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`imageUrls-${milestoneId}`}>Images (une URL par ligne, optionnel)</Label>
          <Textarea
            id={`imageUrls-${milestoneId}`}
            name="imageUrls"
            rows={2}
            placeholder={"https://.../photo-atelier.jpg"}
          />
        </div>
      </div>

      {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer la preuve au vote"}
      </Button>
    </form>
  );
}
