"use client";

import { useActionState, useState } from "react";
import { Plus, Rocket, Swords, Trash2 } from "lucide-react";
import { createProjectAction } from "@/actions/projects";
import { useT } from "@/components/i18n-provider";
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
  REALIZATION_DAYS,
} from "@/lib/constants";
import { CURRENCIES } from "@/lib/money";
import { createProjectSchema, projectFormToInput } from "@/lib/validation";
import { cn } from "@/lib/utils";

type MilestoneDraft = { title: string; description: string; amount: number };

const EMPTY_MILESTONE: MilestoneDraft = { title: "", description: "", amount: 0 };

/**
 * `answersCall` : le projet est lancé depuis un appel du fil. On garde le
 * cahier des charges sous les yeux pendant la rédaction et on transporte le
 * slug jusqu'à l'action, qui déclare le projet remplaçant à la création.
 */
export function CreateProjectForm({
  answersCall,
}: {
  answersCall?: { slug: string; target: string; wanted: string; category: string };
}) {
  const t = useT("project");
  const [state, formAction, pending] = useActionState(createProjectAction, undefined);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { ...EMPTY_MILESTONE },
    { ...EMPTY_MILESTONE },
  ]);
  const [goal, setGoal] = useState(0);
  const [currency, setCurrency] = useState("eur");
  const [clientError, setClientError] = useState<string | null>(null);

  const amountTotal = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const amountsMatchGoal = goal > 0 && amountTotal === goal;

  function updateMilestone(index: number, patch: Partial<MilestoneDraft>) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Validation Zod côté client — le serveur revalide avec le même schéma.
    const formData = new FormData(e.currentTarget);
    const parsed = createProjectSchema.safeParse(projectFormToInput(formData, milestones));
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

      {answersCall && (
        <section className="rounded-2xl rounded-se-sm border border-secondary/25 bg-secondary/[0.07] p-5">
          <input type="hidden" name="callSlug" value={answersCall.slug} />
          <p className="data-label flex items-center gap-1.5">
            <Swords aria-hidden className="h-3 w-3" />
            {t("createProjectForm.answersCallLabel")}
          </p>
          <p className="mt-1.5 font-display text-xl font-semibold">
            {t("createProjectForm.replaceTarget", { target: answersCall.target })}
          </p>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {t("createProjectForm.quotedWanted", { wanted: answersCall.wanted })}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("createProjectForm.answersCallHelp")}
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t("createProjectForm.projectSection")}</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">{t("createProjectForm.titleLabel")}</Label>
          <Input id="title" name="title" placeholder={t("createProjectForm.titlePlaceholder")} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pitch">{t("createProjectForm.pitchLabel")}</Label>
          <Input
            id="pitch"
            name="pitch"
            placeholder={t("createProjectForm.pitchPlaceholder")}
            maxLength={140}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">{t("createProjectForm.descriptionLabel")}</Label>
          <Textarea
            id="description"
            name="description"
            rows={8}
            placeholder={t("createProjectForm.descriptionPlaceholder")}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">{t("createProjectForm.categoryLabel")}</Label>
            <select
              id="category"
              name="category"
              required
              className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              defaultValue={answersCall?.category ?? ""}
            >
              <option value="" disabled>
                {t("createProjectForm.categoryPlaceholder")}
              </option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">{t("createProjectForm.currencyLabel")}</Label>
            <select
              id="currency"
              name="currency"
              required
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal">{t("createProjectForm.goalLabel", { currency: currency.toUpperCase() })}</Label>
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
              {t("createProjectForm.durationLabel", { min: MIN_DURATION_DAYS, max: MAX_DURATION_DAYS })}
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
            <Label htmlFor="neededSkills">{t("createProjectForm.skillsLabel")}</Label>
            <Input
              id="neededSkills"
              name="neededSkills"
              placeholder={t("createProjectForm.skillsPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("createProjectForm.skillsHelp")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coverUrl">{t("createProjectForm.coverLabel")}</Label>
            <Input id="coverUrl" name="coverUrl" type="url" placeholder="https://.../cover.jpg" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t("createProjectForm.milestonesSection")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("createProjectForm.milestonesHelp", {
                currency: currency.toUpperCase(),
                days: REALIZATION_DAYS,
              })}{" "}
              <strong className="font-medium text-foreground">
                {t("createProjectForm.milestonesHelpStrong")}
              </strong>{" "}
              {t("createProjectForm.milestonesHelpAfterStrong")}
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
            {amountTotal} / {goal || "—"} {currency.toUpperCase()}
          </span>
        </div>

        {milestones.map((milestone, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <p className="data-label">{t("createProjectForm.milestoneNumber", { number: index + 1 })}</p>
                {milestones.length > MIN_MILESTONES && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => setMilestones((prev) => prev.filter((_, i) => i !== index))}
                    title={t("createProjectForm.removeMilestoneTitle")}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div className="space-y-1.5">
                  <Label htmlFor={`m-title-${index}`}>{t("createProjectForm.milestoneTitleLabel")}</Label>
                  <Input
                    id={`m-title-${index}`}
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, { title: e.target.value })}
                    placeholder={t("createProjectForm.milestoneTitlePlaceholder")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`m-amount-${index}`}>{t("createProjectForm.milestoneAmountLabel", { currency: currency.toUpperCase() })}</Label>
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
                <Label htmlFor={`m-desc-${index}`}>{t("createProjectForm.milestoneDeliverableLabel")}</Label>
                <Textarea
                  id={`m-desc-${index}`}
                  rows={2}
                  value={milestone.description}
                  onChange={(e) => updateMilestone(index, { description: e.target.value })}
                  placeholder={t("createProjectForm.milestoneDeliverablePlaceholder")}
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
            {t("createProjectForm.addMilestone")}
          </Button>
        )}
      </section>

      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        <Rocket aria-hidden />
        {pending ? t("createProjectForm.submitPending") : t("createProjectForm.submit")}
      </Button>
    </form>
  );
}
