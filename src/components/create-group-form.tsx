"use client";

import { useActionState, useState } from "react";
import type { ProjectCategory } from "@/generated/prisma/client";
import { Plus, X } from "lucide-react";
import { createGroupAction } from "@/actions/chat-groups";
import { useT } from "@/components/i18n-provider";
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
  const t = useT("chat");
  const [state, formAction, pending] = useActionState(createGroupAction, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        {defaultCategory
          ? t("createGroupForm.openWithCategory", { category: CATEGORY_LABELS[defaultCategory] })
          : t("createGroupForm.open")}
      </Button>
    );
  }

  return (
    <form action={formAction} className="glass rounded-2xl rounded-se-sm p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">{t("createGroupForm.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("createGroupForm.intro")}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X aria-hidden />
          <span className="sr-only">{t("createGroupForm.close")}</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="group-name">{t("createGroupForm.nameLabel")}</Label>
          <Input
            id="group-name"
            name="name"
            required
            minLength={3}
            maxLength={40}
            autoComplete="off"
            placeholder={t("createGroupForm.namePlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="group-category">{t("createGroupForm.categoryLabel")}</Label>
          <select
            id="group-category"
            name="category"
            required
            defaultValue={defaultCategory ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              {t("createGroupForm.categoryPlaceholder")}
            </option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="group-purpose">{t("createGroupForm.purposeLabel")}</Label>
          <Input
            id="group-purpose"
            name="purpose"
            required
            minLength={10}
            maxLength={140}
            autoComplete="off"
            placeholder={t("createGroupForm.purposePlaceholder")}
          />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
        <input type="checkbox" name="private" className="mt-0.5 h-4 w-4 accent-primary" />
        <span className="text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">{t("createGroupForm.privateStrong")}</strong>{" "}
          {t("createGroupForm.privateRest")}
        </span>
      </label>

      {state?.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? t("createGroupForm.pending") : t("createGroupForm.submit")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("createGroupForm.firstMember")}</p>
      </div>
    </form>
  );
}
