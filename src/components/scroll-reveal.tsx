"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll spatial : révèle les éléments marqués `data-reveal` à leur entrée
 * dans le viewport (translation + fondu + léger scale), avec un décalage en
 * cascade pour ceux qui entrent ensemble.
 *
 * Progressive enhancement : la classe `js-reveal` — qui masque l'état initial
 * (voir globals.css) — n'est posée que si JS tourne ET hors reduced motion.
 * Sans JS ou en reduced motion, tout reste visible.
 *
 * Différé d'une frame (`requestAnimationFrame`) : avec le streaming (Suspense /
 * loading.tsx), muter les classes pendant que React hydrate encore les cartes
 * provoque un mismatch d'hydratation — on attend la fin de l'hydratation.
 *
 * Vit dans le layout persistant : on ré-observe à chaque route (`usePathname`).
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let observer: IntersectionObserver | undefined;

    const raf = requestAnimationFrame(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) =>
                a.boundingClientRect.top - b.boundingClientRect.top ||
                a.boundingClientRect.left - b.boundingClientRect.left
            )
            .forEach((entry, i) => {
              const el = entry.target as HTMLElement;
              el.style.transitionDelay = `${Math.min(i, 6) * 0.06}s`;
              el.classList.add("in-view");
              observer?.unobserve(el);
            });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      // Le contenu déjà dans le viewport est marqué visible ; le reste est
      // observé et se révèle au scroll. (Pas de flash au-dessus du fold.)
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("in-view");
        } else {
          observer!.observe(el);
        }
      });
      document.documentElement.classList.add("js-reveal");
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
