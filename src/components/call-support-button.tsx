"use client";

import { startTransition, useActionState, useOptimistic } from "react";
import { Megaphone } from "lucide-react";
import { toggleSupportAction } from "@/actions/boycott";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

/**
 * « Je veux ça remplacé aussi ». Le compteur est la seule mesure d'un appel :
 * il classe le fil et décide de ce que l'accueil met en avant. Optimiste —
 * attendre l'aller-retour pour voir sa propre voix comptée casse
 * l'impression d'être entendu.
 *
 * Variante `secondary` (violet) : c'est un geste de communauté. Le dégradé
 * accent reste réservé à l'argent et à la progression.
 */
export function CallSupportButton({
  callId,
  count,
  supporting,
  authenticated,
  className,
}: {
  callId: string;
  count: number;
  supporting: boolean;
  authenticated: boolean;
  className?: string;
}) {
  const t = useT("calls");
  const [state, formAction] = useActionState(toggleSupportAction, undefined);
  const [voice, setVoice] = useOptimistic(
    { count, supporting },
    (_prev, next: { count: number; supporting: boolean }) => next
  );

  return (
    <form
      action={formAction}
      onSubmit={() =>
        startTransition(() =>
          setVoice({
            count: voice.count + (voice.supporting ? -1 : 1),
            supporting: !voice.supporting,
          })
        )
      }
      className={className}
    >
      <input type="hidden" name="callId" value={callId} />
      {/* Le libellé est masqué sous `sm` : sans nom accessible explicite, le
          bouton s'annonce « 3 » sur mobile. Le compteur seul ne dit pas ce
          qu'on s'apprête à faire. */}
      <Button
        type="submit"
        variant={voice.supporting ? "secondary" : "outline"}
        aria-pressed={voice.supporting}
        aria-label={
          voice.supporting
            ? t("callSupportButton.removeVoiceAria", { count: voice.count })
            : t("callSupportButton.supportAria", { count: voice.count })
        }
        title={
          authenticated
            ? voice.supporting
              ? t("callSupportButton.removeVoice")
              : t("callSupportButton.support")
            : t("callSupportButton.signInToSupport")
        }
        className="gap-2"
      >
        <Megaphone aria-hidden />
        <span aria-hidden className="font-mono tabular-nums">{voice.count}</span>
        <span aria-hidden className="hidden sm:inline">
          {voice.supporting ? t("callSupportButton.supported") : t("callSupportButton.supportShort")}
        </span>
      </Button>
      {state?.error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
