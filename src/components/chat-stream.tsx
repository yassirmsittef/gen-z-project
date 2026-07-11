"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Temps réel du chat : écoute /api/chat/stream (SSE) et rafraîchit le contenu
 * serveur dès qu'un message arrive. EventSource gère seul les reconnexions
 * (le flux serverless se termine volontairement toutes les ~50 s) ; si le flux
 * reste indisponible, un poll lent de secours prend le relais.
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

    const source = new EventSource("/api/chat/stream");
    let fallback: number | undefined;

    source.addEventListener("message", refresh);
    source.addEventListener("open", () => {
      if (fallback !== undefined) {
        window.clearInterval(fallback);
        fallback = undefined;
      }
    });
    source.addEventListener("error", () => {
      // EventSource va retenter tout seul ; en attendant, filet de sécurité.
      if (fallback === undefined) {
        fallback = window.setInterval(() => {
          if (!document.hidden) refresh();
        }, 15_000);
      }
    });

    return () => {
      source.close();
      if (fallback !== undefined) window.clearInterval(fallback);
    };
  }, [router]);

  return null;
}
