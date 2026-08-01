"use client";

import { useActionState, useState } from "react";
import type { ProjectCategory } from "@prisma/client";
import { Plus, X } from "lucide-react";
import { createGroupAction } from "@/actions/chat-groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS } from "@/lib/constants";

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Ouvrir un groupe dans une catégorie. Repliée par défaut : l'annuaire reste
 * la première chose qu'on voit (rejoindre avant de créer), et la catégorie
 * filtrée est déjà choisie dans le formulaire.
 */
export function CreateGroupForm({ defaultCategory }: { defaultCategory?: ProjectCategory }) {
  const [state, formAction, pending] = useActionState(createGroupAction, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        {defaultCategory ? `Créer un groupe ${CATEGORY_LABELS[defaultCategory]}` : "Créer un groupe"}
      </Button>
    );
  }

  return (
    <form action={formAction} className="glass rounded-2xl rounded-tr-sm p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Ouvrir un groupe</h2>
          <p className="text-sm text-muted-foreground">
            Un salon public, rangé dans sa catégorie. Tu l&apos;animes, tout le monde peut le
            rejoindre.
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X aria-hidden />
          <span className="sr-only">Fermer</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="group-name">Nom du groupe</Label>
          <Input
            id="group-name"
            name="name"
            required
            minLength={3}
            maxLength={40}
            autoComplete="off"
            placeholder="Les devs du dimanche"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="group-category">Catégorie</Label>
          <select
            id="group-category"
            name="category"
            required
            defaultValue={defaultCategory ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="group-purpose">À quoi sert ce groupe ?</Label>
          <Input
            id="group-purpose"
            name="purpose"
            required
            minLength={10}
            maxLength={140}
            autoComplete="off"
            placeholder="On s'entraide sur les lancements de jeux indés : retours, playtests, contacts."
          />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le groupe"}
        </Button>
        <p className="text-xs text-muted-foreground">Tu en deviens le premier membre.</p>
      </div>
    </form>
  );
}
