import type { Dict } from "@/lib/i18n/t";

/**
 * Coquille des pages légales. Les trois documents (CGU, confidentialité,
 * mentions) restent en français — décision fondateur : seule la version
 * française fait foi. Hors locale fr, le layout l'annonce sobrement.
 */
export const legalPages = {
  "layout.frame": "Le cadre",
  frenchPrevails: "Cette page n'existe qu'en français — la version française fait foi.",
} as const satisfies Dict;
