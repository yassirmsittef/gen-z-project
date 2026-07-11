"use client";

import { useActionState, useEffect, useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { rechargeAction } from "@/actions/wallet";
import { Button } from "@/components/ui/button";
import { RECHARGE_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function RechargeForm({ stripeEnabled }: { stripeEnabled: boolean }) {
  const [state, formAction, pending] = useActionState(rechargeAction, undefined);
  const [amount, setAmount] = useState<number>(25);

  // L'action renvoie l'URL Checkout : navigation externe côté client.
  useEffect(() => {
    if (state?.checkoutUrl) window.location.assign(state.checkoutUrl);
  }, [state?.checkoutUrl]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="amount" value={amount} />

      <div className="flex flex-wrap gap-2">
        {RECHARGE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(preset)}
            className={cn(
              "rounded-full border px-4 py-1.5 font-mono text-sm transition-all duration-200",
              amount === preset
                ? "border-primary/40 bg-primary/15 text-primary shadow-glow"
                : "border-white/[0.12] bg-card/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {preset} tokens
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {stripeEnabled
          ? "1 token = 1 $ — paiement sécurisé par Stripe, tokens crédités dès confirmation."
          : "1 token = 1 $ — recharge fictive (Stripe non configuré : mode démo)."}
      </p>

      {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}
      {state?.rechargedAt && !pending && (
        <p className="text-sm font-medium text-success">
          Recharge effectuée — ton solde est à jour.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {stripeEnabled ? <CreditCard aria-hidden /> : <Wallet aria-hidden />}
        {pending
          ? "Redirection…"
          : stripeEnabled
            ? `Payer ${amount} $ avec Stripe`
            : `Recharger ${amount} tokens`}
      </Button>
    </form>
  );
}
