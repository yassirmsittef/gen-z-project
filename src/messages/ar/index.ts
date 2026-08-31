import type { Messages } from "../types";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { v } from "./v";

export const ar = {
  common: {
    someone: "شخص ما",
    justNow: "الآن",
  },
  labels,
  meta,
  nav,
  v,
} satisfies Messages;
