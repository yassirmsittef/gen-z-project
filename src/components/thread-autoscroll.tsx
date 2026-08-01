"use client";

import { useEffect, useRef } from "react";

/**
 * Un fil de discussion s'ouvre là où la conversation en est : en bas.
 * Rendu tel quel, le conteneur défilant démarre en haut — on tombait sur
 * les plus vieux messages et il fallait scroller pour trouver le présent.
 *
 * Ensuite, on ne suit les nouveaux messages QUE si le lecteur est déjà en
 * bas : quelqu'un qui remonte l'historique ne doit jamais se faire arracher
 * sa lecture par l'arrivée d'un message.
 *
 * Se place en DERNIER enfant du conteneur défilant (`overflow-y-auto`).
 */
export function ThreadAutoScroll({ count }: { count: number }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  // Suit la position de lecture pour savoir si on a le droit de recoller.
  useEffect(() => {
    const scroller = anchorRef.current?.parentElement;
    if (!scroller) return;

    const onScroll = () => {
      const reste = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      stickRef.current = reste < 80; // ~une ligne de marge
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  // À l'ouverture (count initial) puis à chaque message de plus.
  useEffect(() => {
    const scroller = anchorRef.current?.parentElement;
    if (!scroller || !stickRef.current) return;
    scroller.scrollTop = scroller.scrollHeight;
  }, [count]);

  return <div ref={anchorRef} aria-hidden />;
}
