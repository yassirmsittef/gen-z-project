"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Rafraîchit la conversation à intervalle régulier (pas de websocket en
 * Phase 1) — uniquement quand l'onglet est visible.
 */
export function ChatRefresher({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
