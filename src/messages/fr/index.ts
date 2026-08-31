import { common } from "./common";
import { labels } from "./labels";

/** La copie de référence. Chaque namespace ajouté ici oblige les 6 autres langues. */
export const fr = {
  common,
  labels,
} as const;
