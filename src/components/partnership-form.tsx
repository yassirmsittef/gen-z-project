"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitPartnershipAction } from "@/actions/partnerships";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PARTNERSHIP_COMPENSATION_LABELS } from "@/lib/constants";

/**
 * Formulaire public de demande de partenariat (côté marque, sans compte).
 * En cas de succès, l'action redirige vers le lien de suivi privé.
 */
export function PartnershipForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(submitPartnershipAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />
      {/* Pot-de-miel anti-bot : invisible pour les humains. */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Taille de l&apos;entreprise
          <input type="text" name="companySize" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="brandName">Marque / entreprise *</Label>
          <Input id="brandName" name="brandName" required maxLength={80} placeholder="ex : Studio Nova" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactName">Votre nom</Label>
          <Input id="contactName" name="contactName" maxLength={80} placeholder="ex : Camille Perrin" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brandEmail">Email professionnel *</Label>
          <Input
            id="brandEmail"
            name="brandEmail"
            type="email"
            required
            placeholder="prenom@votre-marque.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brandWebsite">Site web</Label>
          <Input id="brandWebsite" name="brandWebsite" type="url" placeholder="https://votre-marque.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compensation">Contrepartie proposée *</Label>
          <select
            id="compensation"
            name="compensation"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-xl border border-input bg-card/60 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {Object.entries(PARTNERSHIP_COMPENSATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget proposé ($)</Label>
          <Input id="budget" name="budget" type="number" min={0} step={1} placeholder="ex : 300" />
          <p className="text-xs text-muted-foreground">Si rémunération en argent — soyez transparent.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Votre proposition *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={3000}
          placeholder="Qui vous êtes, pourquoi ce projet, ce que vous proposez concrètement (calendrier, modalités...)."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliverables">Ce que vous attendez du créateur</Label>
        <Textarea
          id="deliverables"
          name="deliverables"
          rows={4}
          maxLength={1500}
          placeholder="ex : 2 posts Instagram + 1 mention dans un épisode, avec brief fourni."
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        <Send aria-hidden />
        {pending ? "Envoi…" : "Envoyer la demande"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Après envoi, vous recevrez un lien privé pour suivre la réponse du créateur ou de la
        créatrice.
      </p>
    </form>
  );
}
