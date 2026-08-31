import type { Messages } from "../types";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { v } from "./v";

export const en = {
  common: {
    someone: "Someone",
    justNow: "just now",
  },
  labels,
  meta,
  nav,
  v,
} satisfies Messages;
