"use client";

import { useActionState, useEffect } from "react";
import { Landmark } from "lucide-react";
import { connectOnboardingAction } from "@/actions/connect";
import { Button } from "@/components/ui/button";
import type { ConnectStatus } from "@/lib/payouts";

/**
 * Versements Stripe Connect (dashboard). Trois états :
 *  - aucun compte → « Configurer mes versements »
 *  - onboarding incomplet → « Reprendre la configuration »
 *  - versements actifs → confirmation, plus d'action.
 */
export function ConnectForm({
  stripeEnabled,
  status,
}: {
  stripeEnabled: boolean;
  status: ConnectStatus | null;
}) {
  const [state, formAction, pending] = useActionState(connectOnboardingAction, undefined);

  // Lien d'onboarding = URL externe Stripe : navigation côté client.
  useEffect(() => {
    if (state?.onboardingUrl) window.location.assign(state.onboardingUrl);
  }, [state?.onboardingUrl]);

  if (!stripeEnabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Les versements réels arrivent avec Stripe — non configuré sur cet environnement, les
        étapes débloquées créditent ton solde en tokens.
      </p>
    );
  }

  if (status?.payoutsEnabled) {
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium text-success">
          <Landmark className="h-4 w-4" aria-hidden />
          Versements actifs
        </p>
        <p className="text-xs text-muted-foreground">
          Quand la communauté valide une étape d&apos;un de tes projets, son montant est viré
          vers ton compte Stripe (mode test pour l&apos;instant — aucun vrai argent ne circule).
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {status
          ? "Ta configuration Stripe est incomplète — finis-la pour recevoir les fonds de tes étapes validées."
          : "Configure ton compte Stripe pour recevoir les fonds de tes étapes validées (mode test, 2 minutes)."}
      </p>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        <Landmark aria-hidden />
        {pending
          ? "Redirection vers Stripe…"
          : status
            ? "Reprendre la configuration"
            : "Configurer mes versements"}
      </Button>
    </form>
  );
}
