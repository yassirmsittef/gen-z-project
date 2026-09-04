"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { supportAction } from "@/actions/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";
import { MIN_SUPPORT_MAJOR } from "@/lib/constants";

export function SupportForm({ authenticated, enabled }: { authenticated: boolean; enabled: boolean }) {
  const t = useT("common");
  const [state, formAction, pending] = useActionState(supportAction, undefined);
  useEffect(() => {
    if (state?.checkoutUrl) window.location.assign(state.checkoutUrl);
  }, [state?.checkoutUrl]);

  if (!authenticated) {
    return (
      <Button asChild className="w-full">
        <Link href="/login">{t("support.login")}</Link>
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="support-amount">{t("support.amountLabel")}</Label>
        <Input
          id="support-amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min={MIN_SUPPORT_MAJOR}
          step="1"
          defaultValue={20}
          required
          disabled={!enabled}
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={!enabled || pending || Boolean(state?.checkoutUrl)}>
        {pending || state?.checkoutUrl ? t("support.pending") : t("support.button")}
      </Button>
    </form>
  );
}
