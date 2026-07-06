"use client";

import dynamic from "next/dynamic";

// Three.js reste hors du bundle partagé : chargé uniquement sur l'accueil,
// côté client (pas de rendu serveur pour un canvas WebGL).
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

export function HeroSceneLoader() {
  return <HeroScene />;
}
