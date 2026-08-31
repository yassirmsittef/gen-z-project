import type { Messages } from "../types";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";

export const es = {
  common: {
    someone: "Alguien",
    justNow: "ahora mismo",
  },
  labels,
  meta,
  nav,
} satisfies Messages;
