import { adminPages } from "./adminPages";
import { authPages } from "./authPages";
import { callsPages } from "./callsPages";
import { communityPages } from "./communityPages";
import { home } from "./home";
import { howItWorks } from "./howItWorks";
import { legalPages } from "./legalPages";
import { memberPages } from "./memberPages";
import { projectsPages } from "./projectsPages";
import { rebound } from "./rebound";
import { account } from "./account";
import { calls } from "./calls";
import { chat } from "./chat";
import { project } from "./project";
import { ui } from "./ui";
import type { Messages } from "../types";
import { email } from "./email";
import { err } from "./err";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { notif } from "./notif";
import { v } from "./v";

export const en = {
  email,
  err,
  account,
  adminPages,
  authPages,
  callsPages,
  communityPages,
  home,
  howItWorks,
  legalPages,
  memberPages,
  projectsPages,
  rebound,
  calls,
  chat,
  project,
  ui,
  common: {
    "support.link": "Support GeniGain",
    "support.title": "Support GeniGain",
    "support.lead": "GeniGain is a 0 % commission platform: it takes nothing from projects. To live and grow, it relies on those who believe in the idea.",
    "support.what": "What your support funds: the platform's development and security, then places in cities to accompany those who are starting out — somewhere to work, learn, and meet their contributors.",
    "support.surplus": "Commitment: everything beyond the platform's needs goes to funding other members' projects.",
    "support.direct": "Unlike projects, this support has no milestones and no escrow: it is a gift to the platform, received directly on its account.",
    "support.total": "Received so far: {amount}",
    "support.amountLabel": "Amount (CHF)",
    "support.button": "Support",
    "support.pending": "Redirecting to payment…",
    "support.thanks": "Thank you! Your support has arrived.",
    "support.cancelled": "Payment cancelled — nothing was charged.",
    "support.login": "Log in to support GeniGain.",
    "support.unlock": "And it opens a door: supporting GeniGain counts as a contribution and unlocks your right to launch your own project.",
    someone: "Someone",
    justNow: "just now",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
