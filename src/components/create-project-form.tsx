"use client";

import { useActionState, useState } from "react";
import { Plus, Rocket, Trash2 } from "lucide-react";
import { createProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  CATEGORY_LABELS,
  MAX_DURATION_DAYS,
  MAX_GOAL,
  MAX_MILESTONES,
  MIN_DURATION_DAYS,
  MIN_GOAL,
  MIN_MILESTONES,
  PLATFORM_FEE_MIN,
  PLATFORM_FEE_RATE,
  REALIZATION_DAYS,
} from "@/lib/constants";
import { createProjectSchema, parseList } from "@/lib/validation";
import { cn } from "@/lib/utils";

type MilestoneDraft = { title: string; description: string; amount: number };

const EMPTY_MILESTONE: MilestoneDraft = { title: "", description: "", amount: 0 };

export function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(createProjectAction, undefined);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { ...EMPTY_MILESTONE },
    { ...EMPTY_MILESTONE },
  ]);
  const [goal, setGoal] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);

  const amountTotal = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const amountsMatchGoal = goal > 0 && amountTotal === goal;

  function updateMilestone(index: number, patch: Partial<MilestoneDraft>) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Validation Zod côté client — le serveur revalide avec le même schéma.
    const formData = new FormData(e.currentTarget);
    const parsed = createProjectSchema.safeParse({
      title: formData.get("title"),
      pitch: formData.get("pitch"),
      description: formData.get("description"),
      category: formData.get("category"),
      goal: formData.get("goal"),
      coverUrl: formData.get("coverUrl"),
      durationDays: formData.get("durationDays"),
      neededSkills: parseList(formData.get("neededSkills")),
      milestones,
    });
    if (!parsed.success) {
      e.preventDefault();
      setClientError(parsed.error.errors[0].message);
      return;
    }
    setClientError(null);
  }

  const error = clientError ?? state?.error;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="milestones" value={JSON.stringify(milestones)} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Ton projet</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Titre</Label>
          <Input id="title" name="title" placeholder="Ex : EP 5 titres — LUNE NOIRE" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pitch">Pitch (140 caractères max)</Label>
          <Input
            id="pitch"
            name="pitch"
            placeholder="Une phrase qui donne envie de te financer."
            maxLength={140}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={8}
            placeholder="Raconte : c'est quoi, pour qui, pourquoi toi, et à quoi servira l'argent (50 caractères min)."
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="category">Catégorie</Label>
            <select
              id="category"
              name="category"
              required
              className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              defaultValue=""
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

          <div className="space-y-1.5">
            <Label htmlFor="goal">Objectif (tokens)</Label>
            <Input
              id="goal"
              name="goal"
              type="number"
              min={MIN_GOAL}
              max={MAX_GOAL}
              placeholder="500"
              onChange={(e) => setGoal(Number(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="durationDays">
              Durée de campagne ({MIN_DURATION_DAYS}–{MAX_DURATION_DAYS} jours)
            </Label>
            <Input
              id="durationDays"
              name="durationDays"
              type="number"
              min={MIN_DURATION_DAYS}
              max={MAX_DURATION_DAYS}
              defaultValue={30}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="neededSkills">Compétences recherchées (optionnel)</Label>
            <Input
              id="neededSkills"
              name="neededSkills"
              placeholder="ex : montage, mix, photo — séparées par des virgules"
            />
            <p className="text-xs text-muted-foreground">
              On oriente vers ton projet les membres qui ont ces compétences.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coverUrl">Visuel de couverture (URL, optionnel)</Label>
            <Input id="coverUrl" name="coverUrl" type="url" placeholder="https://.../cover.jpg" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Étapes de déblocage</h2>
            <p className="text-sm text-muted-foreground">
              Chaque étape débloque un montant en tokens, sur preuve validée par le vote pondéré
              de tes contributeurs. La somme doit égaler ton objectif. Une fois financé, tu as{" "}
              {REALIZATION_DAYS} jours pour tout réaliser et faire valider — au-delà, le reste
              du séquestre est remboursé. La plateforme prélève{" "}
              {Math.round(PLATFORM_FEE_RATE * 100)}&nbsp;% de la première étape débloquée
              (minimum {PLATFORM_FEE_MIN} tokens) — c&apos;est ce qui finance les tokens de
              bienvenue.
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1 font-mono text-sm",
              amountsMatchGoal
                ? "border-success/30 bg-success/15 text-success shadow-glow-teal"
                : "border-amber-400/30 bg-amber-400/10 text-amber-300"
            )}
          >
            {amountTotal} / {goal || "—"} tokens
          </span>
        </div>

        {milestones.map((milestone, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <p className="data-label">Étape {index + 1}</p>
                {milestones.length > MIN_MILESTONES && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => setMilestones((prev) => prev.filter((_, i) => i !== index))}
                    title="Supprimer cette étape"
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div className="space-y-1.5">
                  <Label htmlFor={`m-title-${index}`}>Titre</Label>
                  <Input
                    id={`m-title-${index}`}
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, { title: e.target.value })}
                    placeholder="Ex : Maquette terminée"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`m-amount-${index}`}>Montant (tokens)</Label>
                  <Input
                    id={`m-amount-${index}`}
                    type="number"
                    min={10}
                    value={milestone.amount || ""}
                    onChange={(e) => updateMilestone(index, { amount: Number(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`m-desc-${index}`}>Ce que tu livreras</Label>
                <Textarea
                  id={`m-desc-${index}`}
                  rows={2}
                  value={milestone.description}
                  onChange={(e) => updateMilestone(index, { description: e.target.value })}
                  placeholder="Ce que les contributeurs pourront vérifier à cette étape."
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {milestones.length < MAX_MILESTONES && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setMilestones((prev) => [...prev, { ...EMPTY_MILESTONE }])}
          >
            <Plus />
            Ajouter une étape
          </Button>
        )}
      </section>

      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        <Rocket aria-hidden />
        {pending ? "Création…" : "Lancer mon projet"}
      </Button>
    </form>
  );
}
