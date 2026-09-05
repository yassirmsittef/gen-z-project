"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateLocationAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";
import { CityPicker } from "@/components/city-picker";

/**
 * Ville du profil : suggestions parmi toutes les villes du monde (> 5 000
 * hab., recherche serveur). Vide = on disparaît du globe — la localisation
 * reste un choix, jamais une capture.
 */
export function LocationForm({ initialCity }: { initialCity: string | null }) {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(updateLocationAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="city">{t("locationForm.cityLabel")}</Label>
        <CityPicker id="city" defaultValue={initialCity ?? ""} placeholder={t("locationForm.cityPlaceholder")} />
        <p className="text-xs text-muted-foreground">
          {t("locationForm.hintBefore")}{" "}
          <Link href="/communaute" className="font-medium text-primary hover:underline">
            {t("locationForm.hintLink")}
          </Link>{" "}
          {t("locationForm.hintAfter")}
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-success">
          {state.removed ? t("locationForm.removedSuccess") : t("locationForm.savedSuccess")}
        </p>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? t("locationForm.submitPending") : t("locationForm.submit")}
      </Button>
    </form>
  );
}
