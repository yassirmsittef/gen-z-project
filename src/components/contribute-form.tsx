"use client";

import { useActionState, useEffect, useState } from "react";
import { BadgePercent, ShieldCheck } from "lucide-react";
import { contributeAction } from "@/actions/contributions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_CONTRIBUTION_MAJOR } from "@/lib/constants";
import { formatMoney, toMinor } from "@/lib/money";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [5, 10, 25, 50];

/**
 * Contribution en argent réel : montant choisi en devise du projet, puis
 * paiement sur Stripe Checkout (qui EST l'écran de confirmation). L'URL
 * externe est naviguée côté client — un redirect serveur ne sort pas de
 * l'app.
 */
export function ContributeForm({
  projectId,
  currency,
}: {
  projectId: string;
  currency: string;
}) {
  const [state, formAction, pending] = useActionState(contributeAction, undefined);
  const [amount, setAmount] = useState(10);

  useEffect(() => {
    if (state?.checkoutUrl) window.location.assign(state.checkoutUrl);
  }, [state?.checkoutUrl]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="amount" value={amount} />

      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 font-mono text-sm transition duration-200",
              amount === value
                ? "border-primary/40 bg-primary/15 text-primary shadow-glow"
                : "border-white/[0.12] bg-card/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {formatMoney(toMinor(value, currency), currency)}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contribute-amount">Montant libre ({currency.toUpperCase()})</Label>
        <Input
          id="contribute-amount"
          type="number"
          min={MIN_CONTRIBUTION_MAJOR}
          value={amount || ""}
          onChange={(event) => setAmount(Number(event.target.value) || 0)}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending || Boolean(state?.checkoutUrl)}>
        {pending || state?.checkoutUrl
          ? "Redirection vers le paiement…"
          : `Contribuer ${formatMoney(toMinor(amount || 0, currency), currency)}`}
      </Button>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BadgePercent className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
        <span>
          <strong className="font-semibold text-foreground">0&nbsp;% de commission GeniGain</strong>{" "}
          — seuls les frais bancaires s&apos;appliquent.
        </span>
      </p>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
        Paiement sécurisé Stripe. Fonds sous séquestre, débloqués étape par étape par le vote
        des contributeurs — remboursés si la campagne n&apos;aboutit pas.
      </p>
    </form>
  );
}
