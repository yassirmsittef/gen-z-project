import { common } from "./common";
import { err } from "./err";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { notif } from "./notif";
import { v } from "./v";

/** La copie de référence. Chaque namespace ajouté ici oblige les 6 autres langues. */
export const fr = {
  err,
  common,
  labels,
  meta,
  nav,
  notif,
  v,
} as const;
