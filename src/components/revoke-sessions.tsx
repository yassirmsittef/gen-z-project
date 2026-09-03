"use client";

import { LogOut } from "lucide-react";
import { revokeSessionsAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";

/**
 * Bouton « déconnecter tous mes appareils ». Un geste de panique : si tu
 * crains que ton téléphone soit compromis, il coupe toutes les sessions —
 * partout — en quelques minutes, la tienne comprise. Tu te reconnectes ensuite.
 */
export function RevokeSessions() {
  const t = useT("account");
  return (
    <form action={revokeSessionsAction} className="space-y-2">
      <h3 className="text-sm font-semibold">{t("revoke.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("revoke.body")}</p>
      <Button type="submit" variant="outline" size="sm">
        <LogOut aria-hidden />
        {t("revoke.button")}
      </Button>
    </form>
  );
}
