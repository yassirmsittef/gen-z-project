import type { Dict } from "@/lib/i18n/t";

/** Métadonnées de l'app (balises <title>, descriptions de partage). */
export const meta = {
  titleDefault: "GeniGain — La communauté qui finance ta génération",
  description:
    "Lance ton projet, fais-le financer par la communauté, débloque les fonds étape par étape. Contribue avant de poster — et si ça rate, rebondis.",
  notFoundTitle: "Page introuvable",
} as const satisfies Dict;
