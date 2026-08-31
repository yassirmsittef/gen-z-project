import type { Messages } from "../types";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";

export const de = {
  common: {
    someone: "Jemand",
    justNow: "gerade eben",
  },
  labels,
  meta,
  nav,
} satisfies Messages;
