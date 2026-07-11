"use client";

import { useActionState } from "react";
import { updateSkillsAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SkillsForm({ initialSkills }: { initialSkills: string[] }) {
  const [state, formAction, pending] = useActionState(updateSkillsAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="skills">Tes compétences</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={initialSkills.join(", ")}
          placeholder="ex : montage, react, photo — séparées par des virgules"
        />
        <p className="text-xs text-muted-foreground">
          Elles servent à te recommander des projets qui cherchent un coup de main comme le tien.
        </p>
      </div>

      {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-success">Compétences enregistrées.</p>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
