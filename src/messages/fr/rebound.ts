import type { Dict } from "@/lib/i18n/t";

/** /rebond : la page qui transforme un échec en passage. */
export const rebound = {
  "meta.title": "Rebondir",
  "hero.failedTitle": "« {title} » n'a pas abouti. Et alors ?",
  "hero.title": "Un projet raté n'est pas une fin.",
  "hero.body":
    "Ici, l'échec n'est pas une sortie — c'est un passage. Les contributeurs ont été remboursés, ta réputation encaisse le coup mais se reconstruit à chaque contribution, chaque vote, chaque étape validée. Le meilleur moyen de rebondir : replonger dans la communauté.",
  "hero.support": "Soutenir un projet",
  "hero.relaunch": "Relancer un projet",
  "suggestions.heading": "Des opportunités qui t'attendent",
} as const satisfies Dict;
