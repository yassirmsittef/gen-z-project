"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { updateProjectAction } from "@/actions/projects";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS } from "@/lib/constants";
import { projectEditFormToInput, updateProjectSchema } from "@/lib/validation";

type EditableProject = {
  id: string;
  title: string;
  pitch: string;
  description: string;
  category: string;
  coverUrl: string | null;
  neededSkills: string[];
};

/**
 * Édition du contenu d'un projet en campagne — mêmes règles Zod que la
 * création. Le cadre financier (objectif, étapes, deadline) n'apparaît pas :
 * il est figé, affiché par la page dans un panneau verrouillé.
 */
export function EditProjectForm({ project }: { project: EditableProject }) {
  const t = useT("project");
  const [state, formAction, pending] = useActionState(updateProjectAction, undefined);
  const [clientError, setClientError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Validation Zod côté client — le serveur revalide avec le même schéma.
    const formData = new FormData(e.currentTarget);
    const parsed = updateProjectSchema.safeParse(projectEditFormToInput(formData));
    if (!parsed.success) {
      e.preventDefault();
      setClientError(parsed.error.errors[0].message);
      return;
    }
    setClientError(null);
  }

  const error = clientError ?? state?.error;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="projectId" value={project.id} />

      <div className="space-y-1.5">
        <Label htmlFor="title">{t("editProjectForm.titleLabel")}</Label>
        <Input id="title" name="title" defaultValue={project.title} required />
        <p className="text-xs text-muted-foreground">
          {t("editProjectForm.titleHelp")}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pitch">{t("editProjectForm.pitchLabel")}</Label>
        <Input id="pitch" name="pitch" defaultValue={project.pitch} maxLength={140} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t("editProjectForm.descriptionLabel")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={10}
          defaultValue={project.description}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">{t("editProjectForm.categoryLabel")}</Label>
          <select
            id="category"
            name="category"
            required
            className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            defaultValue={project.category}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coverUrl">{t("editProjectForm.coverLabel")}</Label>
          <Input
            id="coverUrl"
            name="coverUrl"
            type="url"
            defaultValue={project.coverUrl ?? ""}
            placeholder="https://.../cover.jpg"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="neededSkills">{t("editProjectForm.skillsLabel")}</Label>
        <Input
          id="neededSkills"
          name="neededSkills"
          defaultValue={project.neededSkills.join(", ")}
          placeholder={t("editProjectForm.skillsPlaceholder")}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        <Save aria-hidden />
        {pending ? t("editProjectForm.submitPending") : t("editProjectForm.submit")}
      </Button>
    </form>
  );
}
