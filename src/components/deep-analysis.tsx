"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { deepAnalyzeAction } from "@/actions/partnerships";

/**
 * Déclenche automatiquement l'analyse approfondie (Claude) au montage :
 * l'analyse rapide s'affiche instantanément, celle-ci l'enrichit quelques
 * secondes plus tard (router.refresh). En cas d'échec, message discret —
 * l'analyse rapide reste en place.
 */
export function DeepAnalysis({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(deepAnalyzeAction, undefined);
  const [, startTransition] = useTransition();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const formData = new FormData();
    formData.set("requestId", requestId);
    startTransition(() => formAction(formData));
  }, [requestId, formAction]);

  useEffect(() => {
    if (state?.done) router.refresh();
  }, [state?.done, router]);

  if (state?.done) return null;
  if (state?.error) {
    return <p className="text-xs text-muted-foreground">{state.error}</p>;
  }
  return (
    <p className="flex animate-pulse-slow items-center gap-2 text-xs text-muted-foreground">
      <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
      Analyse approfondie par l&apos;IA en cours...
    </p>
  );
}
