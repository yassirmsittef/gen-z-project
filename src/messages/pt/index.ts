import type { Messages } from "../types";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";

export const pt = {
  common: {
    someone: "Alguém",
    justNow: "agora mesmo",
  },
  labels,
  meta,
  nav,
} satisfies Messages;
