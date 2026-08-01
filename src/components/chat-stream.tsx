"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Temps réel du chat : écoute /api/chat/stream (SSE) et rafraîchit le contenu
 * serveur dès qu'un message arrive. EventSource gère seul les reconnexions
 * (le flux serverless se termine volontairement toutes les ~50 s) ; si le flux
 * reste indisponible, un poll lent de secours prend le relais.
 *
 * ONGLET CACHÉ = FLUX FERMÉ. Un onglet de chat oublié en arrière-plan
 * coûtait autant qu'une conversation active : 6 000 requêtes par heure pour
 * personne. On ferme donc la connexion dès que la page passe en veille, on
 * la rouvre au retour — et on rafraîchit d'abord, pour rattraper ce qui s'est
 * dit pendant l'absence.
 */
export function ChatStream() {
  const router = useRouter();
  // Coalesce les rafales : au plus un refresh par seconde.
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < 1_000) return;
      lastRefreshRef.current = now;
      router.refresh();
    };

    let source: EventSource | null = null;
    let fallback: number | undefined;

    const stopFallback = () => {
      if (fallback !== undefined) {
        window.clearInterval(fallback);
        fallback = undefined;
      }
    };

    const open = () => {
      if (source || document.hidden) return;
      const es = new EventSource("/api/chat/stream");
      source = es;
      es.addEventListener("message", refresh);
      es.addEventListener("open", stopFallback);
      es.addEventListener("error", () => {
        // EventSource va retenter tout seul ; en attendant, filet de sécurité.
        if (fallback === undefined) {
          fallback = window.setInterval(() => {
            if (!document.hidden) refresh();
          }, 15_000);
        }
      });
    };

    const close = () => {
      source?.close();
      source = null;
      stopFallback();
    };

    const onVisibility = () => {
      if (document.hidden) {
        close();
      } else {
        refresh();
        open();
      }
    };

    open();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      close();
    };
  }, [router]);

  return null;
}
