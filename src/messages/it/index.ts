import type { Messages } from "../types";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";

export const it = {
  common: {
    someone: "Qualcuno",
    justNow: "proprio ora",
  },
  labels,
  meta,
  nav,
} satisfies Messages;
