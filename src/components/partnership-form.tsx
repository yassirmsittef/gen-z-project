"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitPartnershipAction } from "@/actions/partnerships";
import { useT } from "@/components/i18n-provider";
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
  const t = useT("calls");
  const [state, formAction, pending] = useActionState(submitPartnershipAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />
      {/* Pot-de-miel anti-bot : invisible pour les humains. */}
      <div aria-hidden className="absolute start-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Taille de l&apos;entreprise
          <input type="text" name="companySize" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="brandName">{t("partnershipForm.brandNameLabel")}</Label>
          <Input
            id="brandName"
            name="brandName"
            required
            maxLength={80}
            placeholder={t("partnershipForm.brandNamePlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactName">{t("partnershipForm.contactNameLabel")}</Label>
          <Input
            id="contactName"
            name="contactName"
            maxLength={80}
            placeholder={t("partnershipForm.contactNamePlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brandEmail">{t("partnershipForm.emailLabel")}</Label>
          <Input
            id="brandEmail"
            name="brandEmail"
            type="email"
            required
            placeholder={t("partnershipForm.emailPlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brandWebsite">{t("partnershipForm.websiteLabel")}</Label>
          <Input
            id="brandWebsite"
            name="brandWebsite"
            type="url"
            placeholder={t("partnershipForm.websitePlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compensation">{t("partnershipForm.compensationLabel")}</Label>
          <select
            id="compensation"
            name="compensation"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-xl border border-input bg-card/60 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              {t("partnershipForm.compensationPlaceholder")}
            </option>
            {Object.entries(PARTNERSHIP_COMPENSATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget">{t("partnershipForm.budgetLabel")}</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            min={0}
            step={1}
            placeholder={t("partnershipForm.budgetPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("partnershipForm.budgetHint")}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">{t("partnershipForm.messageLabel")}</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={3000}
          placeholder={t("partnershipForm.messagePlaceholder")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliverables">{t("partnershipForm.deliverablesLabel")}</Label>
        <Textarea
          id="deliverables"
          name="deliverables"
          rows={4}
          maxLength={1500}
          placeholder={t("partnershipForm.deliverablesPlaceholder")}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        <Send className="rtl:-scale-x-100" aria-hidden />
        {pending ? t("partnershipForm.pending") : t("partnershipForm.submit")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("partnershipForm.afterSend")}</p>
    </form>
  );
}
