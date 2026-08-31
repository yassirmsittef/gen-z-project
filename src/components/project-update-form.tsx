"use client";

import { useActionState, useEffect, useRef } from "react";
import { Megaphone } from "lucide-react";
import { postUpdateAction } from "@/actions/project-feed";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Poster une actu (porteur uniquement) — tous les contributeurs sont notifiés. */
export function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const t = useT("project");
  const [state, formAction, pending] = useActionState(postUpdateAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="space-y-1.5">
        <Label htmlFor="update-title">{t("projectUpdateForm.titleLabel")}</Label>
        <Input
          id="update-title"
          name="title"
          required
          maxLength={80}
          placeholder={t("projectUpdateForm.titlePlaceholder")}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="update-body">{t("projectUpdateForm.bodyLabel")}</Label>
        <Textarea
          id="update-body"
          name="body"
          required
          rows={4}
          maxLength={3000}
          placeholder={t("projectUpdateForm.bodyPlaceholder")}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-success">{t("projectUpdateForm.success")}</p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        <Megaphone aria-hidden />
        {pending ? t("projectUpdateForm.submitPending") : t("projectUpdateForm.submit")}
      </Button>
    </form>
  );
}
