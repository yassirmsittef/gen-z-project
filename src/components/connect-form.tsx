"use client";

import { useActionState, useEffect } from "react";
import { Landmark } from "lucide-react";
import { connectOnboardingAction } from "@/actions/connect";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";
import { formatMoney } from "@/lib/money";
import { stripeLive } from "@/lib/stripe-mode";
import type { ConnectStatus } from "@/lib/payouts";

export type PayoutSummary = { currency: string; dueMinor: number; sentMinor: number };

/** Totaux des versements du porteur (une ligne par devise de projet). */
function PayoutTotals({ payouts, active }: { payouts: PayoutSummary[]; active: boolean }) {
  const t = useT("account");
  const due = payouts.filter((p) => p.dueMinor > 0);
  const sent = payouts.filter((p) => p.sentMinor > 0);
  if (due.length === 0 && sent.length === 0) return null;

  return (
    <dl className="space-y-1 border-t border-border/60 pt-3 text-sm">
      {due.length > 0 && (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{t("payoutTotals.due")}</dt>
          <dd className="font-medium tabular-nums">
            {due.map((p) => formatMoney(p.dueMinor, p.currency)).join(" · ")}
          </dd>
        </div>
      )}
      {sent.length > 0 && (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{t("payoutTotals.sent")}</dt>
          <dd className="font-medium tabular-nums">
            {sent.map((p) => formatMoney(p.sentMinor, p.currency)).join(" · ")}
          </dd>
        </div>
      )}
      {due.length > 0 && (
        <p className="pt-1 text-xs text-muted-foreground">
          {active ? t("payoutTotals.autoActive") : t("payoutTotals.autoPending")}
        </p>
      )}
    </dl>
  );
}

/**
 * Versements Stripe Connect (dashboard). Trois états :
 *  - aucun compte → « Configurer mes versements »
 *  - onboarding incomplet → « Reprendre la configuration »
 *  - versements actifs → confirmation, plus d'action.
 */
export function ConnectForm({
  stripeEnabled,
  status,
  payouts,
}: {
  stripeEnabled: boolean;
  status: ConnectStatus | null;
  payouts: PayoutSummary[];
}) {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(connectOnboardingAction, undefined);

  // Lien d'onboarding = URL externe Stripe : navigation côté client.
  useEffect(() => {
    if (state?.onboardingUrl) window.location.assign(state.onboardingUrl);
  }, [state?.onboardingUrl]);

  if (!stripeEnabled) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("connectForm.stripeDisabled")}
      </p>
    );
  }

  if (status?.payoutsEnabled) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-success">
          <Landmark className="h-4 w-4" aria-hidden />
          {t("connectForm.activeTitle")}
        </p>
        <p className="text-xs text-muted-foreground">
          {stripeLive ? t("connectForm.activeBodyLive") : t("connectForm.activeBodyTest")}
        </p>
        <PayoutTotals payouts={payouts} active />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {status
          ? t("connectForm.resumeBody")
          : stripeLive
            ? t("connectForm.setupBodyLive")
            : t("connectForm.setupBodyTest")}
      </p>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        <Landmark aria-hidden />
        {pending
          ? t("connectForm.submitPending")
          : status
            ? t("connectForm.resume")
            : t("connectForm.setup")}
      </Button>

      <PayoutTotals payouts={payouts} active={false} />
    </form>
  );
}
