import type { Messages } from "../types";
import { err } from "./err";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { notif } from "./notif";
import { v } from "./v";

export const pt = {
  err,
  common: {
    someone: "Alguém",
    justNow: "agora mesmo",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
