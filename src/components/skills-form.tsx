"use client";

import { useActionState } from "react";
import { updateSkillsAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";

export function SkillsForm({ initialSkills }: { initialSkills: string[] }) {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(updateSkillsAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="skills">{t("skillsForm.label")}</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={initialSkills.join(", ")}
          placeholder={t("skillsForm.placeholder")}
        />
        <p className="text-xs text-muted-foreground">
          {t("skillsForm.hint")}
        </p>
      </div>

      {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-success">{t("skillsForm.success")}</p>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? t("skillsForm.submitPending") : t("skillsForm.submit")}
      </Button>
    </form>
  );
}
