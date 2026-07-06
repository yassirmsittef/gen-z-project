"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Transition de page : le contenu de la route entrante se révèle (fondu + léger
 * glissement vers le haut). Ne joue JAMAIS au chargement initial (`isFirst`)
 * pour ne pas retarder le LCP — uniquement sur les navigations côté client.
 * Rejoué à chaque route via `key={pathname}`. Coupé par prefers-reduced-motion
 * (globals.css). Vit dans le layout persistant (le ref survit aux navigations).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return (
    <div key={pathname} className={isFirst.current ? undefined : "page-enter"}>
      {children}
    </div>
  );
}
