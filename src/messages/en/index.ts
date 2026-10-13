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
    "support.surplus": "Our guiding line: what exceeds the platform's needs goes to support other members' projects — we'll say so here, with figures. It is not a quantified commitment.",
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
    "frozen.badge": "Coming soon",
    "frozen.title": "This feature opens soon",
    "frozen.body": "GeniGain is opening its community first. Projects, calls, contributions and payouts will open as soon as a lawyer has validated our legal framework: we'd rather take that time to protect your money and your rights.",
    "frozen.now": "In the meantime, you can sign up, complete your profile and chat in the rooms.",
    "frozen.chat": "Go to the rooms",
    "frozen.banner": "Open beta: sign up and join the rooms now. Projects, calls and contributions open after legal validation.",
    "frozen.close": "Got it",
    "frozen.locked": "Closed until legal validation",
    "frozen.contribute": "Contribute",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
