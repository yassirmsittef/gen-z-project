"use client";

import { useActionState } from "react";
import { ShieldAlert } from "lucide-react";
import { createCallAction } from "@/actions/boycott";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CALL_CHARTER,
  CATEGORY_LABELS,
  MAX_CALL_REASON,
  MAX_CALL_SOURCES,
  MAX_CALL_WANTED,
  MIN_CALL_REASON,
  MIN_CALL_WANTED,
} from "@/lib/constants";

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Publier un appel. La charte est AU-DESSUS du formulaire et non repliée :
 * un membre qui écrit son appel doit avoir lu ce qui l'engage avant la
 * première touche, pas après l'avoir envoyé.
 */
export function CreateCallForm() {
  const t = useT("calls");
  const [state, formAction, pending] = useActionState(createCallAction, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <section className="glass rounded-2xl rounded-se-sm p-5">
        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
          <ShieldAlert aria-hidden className="h-5 w-5 text-secondary" />
          {t("createCallForm.charterHeading")}
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">{t("createCallForm.charterBody")}</p>
        <ul className="space-y-2">
          {CALL_CHARTER.map((rule) => (
            <li key={rule} className="flex gap-2.5 text-sm text-muted-foreground">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/70"
              />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="call-target">{t("createCallForm.targetLabel")}</Label>
          <Input
            id="call-target"
            name="target"
            required
            minLength={2}
            maxLength={60}
            autoComplete="off"
            placeholder={t("createCallForm.targetPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("createCallForm.targetHint")}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="call-category">{t("createCallForm.categoryLabel")}</Label>
          <select id="call-category" name="category" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              {t("createCallForm.categoryPlaceholder")}
            </option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">{t("createCallForm.categoryHint")}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="call-reason">{t("createCallForm.reasonLabel")}</Label>
        <Textarea
          id="call-reason"
          name="reason"
          required
          rows={6}
          minLength={MIN_CALL_REASON}
          maxLength={MAX_CALL_REASON}
          placeholder={t("createCallForm.reasonPlaceholder")}
        />
        <p className="text-xs text-muted-foreground">
          {t("createCallForm.reasonHint", { min: MIN_CALL_REASON })}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="call-wanted">{t("createCallForm.wantedLabel")}</Label>
        <Textarea
          id="call-wanted"
          name="wanted"
          required
          rows={4}
          minLength={MIN_CALL_WANTED}
          maxLength={MAX_CALL_WANTED}
          placeholder={t("createCallForm.wantedPlaceholder")}
        />
        <p className="text-xs text-muted-foreground">{t("createCallForm.wantedHint")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="call-sources">{t("createCallForm.sourcesLabel")}</Label>
        <Textarea
          id="call-sources"
          name="sources"
          rows={3}
          spellCheck={false}
          autoComplete="off"
          placeholder={"https://…\nhttps://…"}
        />
        <p className="text-xs text-muted-foreground">
          {t("createCallForm.sourcesHint", { max: MAX_CALL_SOURCES })}
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? t("createCallForm.pending") : t("createCallForm.submit")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("createCallForm.withdrawNote")}</p>
      </div>
    </form>
  );
}
