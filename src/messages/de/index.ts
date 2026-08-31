import type { Messages } from "../types";
import { email } from "./email";
import { err } from "./err";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { notif } from "./notif";
import { v } from "./v";

export const de = {
  email,
  err,
  common: {
    someone: "Jemand",
    justNow: "gerade eben",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
