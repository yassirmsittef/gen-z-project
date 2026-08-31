import { common } from "./common";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";

/** La copie de référence. Chaque namespace ajouté ici oblige les 6 autres langues. */
export const fr = {
  common,
  labels,
  meta,
  nav,
} as const;
