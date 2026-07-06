"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Zap } from "lucide-react";
import { contributeAction } from "@/actions/contributions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contributeSchema } from "@/lib/validation";
import { MIN_CONTRIBUTION } from "@/lib/constants";
import { formatCredits } from "@/lib/format";

const QUICK_AMOUNTS = [5, 10, 25, 50];

export function ContributeForm({
  projectId,
  projectTitle,
  balance,
}: {
  projectId: string;
  projectTitle: string;
  balance: number;
}) {
  const [state, formAction, pending] = useActionState(contributeAction, undefined);
  const [amount, setAmount] = useState(10);
  const [clientError, setClientError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // La contribution n'est enregistrée qu'après confirmation explicite :
  // ce bouton valide côté client puis ouvre le dialogue.
  function requestConfirmation() {
    const parsed = contributeSchema.safeParse({ projectId, amount });
    if (!parsed.success) {
      setClientError(parsed.error.errors[0].message);
      return;
    }
    if (amount > balance) {
      setClientError(`Solde insuffisant (${formatCredits(balance)} disponibles).`);
      return;
    }
    setClientError(null);
    setConfirming(true);
  }

  // Fermer le dialogue après succès, ou via Échap.
  useEffect(() => {
    if (state?.success) setConfirming(false);
  }, [state?.success]);

  // Gestion du focus du dialogue (WAI-ARIA) : déplace le focus dedans à
  // l'ouverture, le piège (Tab cycle), Échap ferme, et rend le focus au
  // déclencheur à la fermeture.
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!confirming) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = dialogRef.current
      ? Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])'
          )
        )
      : [];
    focusables[focusables.length - 1]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirming(false);
        return;
      }
      if (event.key !== "Tab" || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [confirming]);

  const error = clientError ?? state?.error;
  const insufficient = error?.includes("insuffisant");
  // Le dialogue vit dans un portal (hors du DOM du <form>) : son bouton
  // Confirmer est rattaché au formulaire via l'attribut HTML `form`.
  const formId = `contribute-${projectId}`;

  return (
    <form id={formId} action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="amount" value={amount} />

      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={
              amount === value
                ? "rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1.5 font-mono text-sm text-primary shadow-glow transition-all duration-200"
                : "rounded-full border border-white/[0.12] bg-card/60 px-3.5 py-1.5 font-mono text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
            }
          >
            {value}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount-input">Montant (tokens)</Label>
        <Input
          id="amount-input"
          type="number"
          min={MIN_CONTRIBUTION}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          onKeyDown={(e) => {
            // Entrée ne doit jamais court-circuiter la confirmation.
            if (e.key === "Enter") {
              e.preventDefault();
              requestConfirmation();
            }
          }}
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}{" "}
          {insufficient && (
            <Link href="/dashboard#recharge" className="text-primary underline underline-offset-4">
              Recharger mon compte →
            </Link>
          )}
        </p>
      )}
      {state?.success && !clientError && (
        <p className="text-sm font-medium text-success">Merci ! Ta contribution est enregistrée.</p>
      )}

      <Button type="button" className="w-full" disabled={pending} onClick={requestConfirmation}>
        <Zap aria-hidden />
        Contribuer
      </Button>
      <p className="text-center font-mono text-xs text-muted-foreground">
        Ton solde : {formatCredits(balance)}
      </p>

      {/* Dialogue de confirmation — la contribution ne part qu'après accord */}
      {confirming &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center overscroll-contain bg-background/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={() => setConfirming(false)}
          >
            <div
              ref={dialogRef}
              className="glass w-full max-w-md rounded-2xl rounded-tr-sm p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl rounded-br-sm border border-primary/30 bg-primary/15">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                </span>
                <h3 id="confirm-title" className="font-display text-lg font-semibold">
                  Confirmer ta contribution
                </h3>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Tu t&apos;apprêtes à soutenir{" "}
                <span className="font-semibold text-foreground">« {projectTitle} »</span> à
                hauteur de{" "}
                <span className="font-mono font-semibold text-primary">
                  {formatCredits(amount)}
                </span>{" "}
                <span className="font-mono">(≈ {amount} $)</span>.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Les fonds partent sous séquestre : débloqués étape par étape sur preuve, ou
                remboursés si la campagne échoue.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                >
                  Annuler
                </Button>
                <Button type="submit" form={formId} size="sm" disabled={pending}>
                  {pending ? "Envoi..." : `Confirmer — ${formatCredits(amount)}`}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </form>
  );
}
