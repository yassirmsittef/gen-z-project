"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Matérialité au pointeur (couche 4) :
 *  - « spotlight » : le liseré des surfaces `[data-spotlight]` s'illumine là où
 *    passe le curseur (variables `--spot-x` / `--spot-y`, une seule écoute
 *    globale par délégation) ;
 *  - « magnetic » : les éléments `[data-magnetic]` sont légèrement attirés vers
 *    le curseur puis reviennent (spring via transition CSS, suivi posé ici).
 *
 * Vit dans le layout persistant → ré-attache à chaque route (`usePathname`).
 * Reduced motion : pas d'aimantation (le spotlight, simple surbrillance de
 * survol, ne provoque aucun déplacement, on le garde).
 */
export function PointerFx() {
  const pathname = usePathname();

  useEffect(() => {
    const onSpot = (event: PointerEvent) => {
      const el = (event.target as HTMLElement | null)?.closest?.(
        "[data-spotlight]"
      ) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", onSpot);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    if (!reduced) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          el.style.transform = `translate(${dx * 0.2}px, ${dy * 0.3}px)`;
        };
        const onLeave = () => {
          el.style.transform = "";
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.style.transform = "";
        });
      });
    }

    return () => {
      document.removeEventListener("pointermove", onSpot);
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
