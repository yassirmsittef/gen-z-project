import type { Messages } from "../types";

/** Auth pages: login, sign-up, forgotten password, reset. */
export const authPages = {
  "meta.loginTitle": "Log in",
  "meta.registerTitle": "Sign up",
  "meta.forgotTitle": "Forgotten password",
  "meta.resetTitle": "New password",
  "login.title": "Welcome back",
  "login.description": "Log in to contribute and follow your projects.",
  "register.title": "Join the community",
  "register.description":
    "Back the projects of your generation by card, in their currency — and launch your own from $20 of contributions.",
  "register.howItWorks": "How does it work?",
  "forgot.title": "Forgotten password",
  "forgot.description":
    "Give us your account email: we'll send you a link, valid for 1 hour, to choose a new one.",
  "verify.title": "Address confirmed",
  "verify.success": "Thanks — your address is confirmed. All of GeniGain is open to you.",
  "verify.invalid": "This link is invalid or has expired. Request a new email from your dashboard.",
  "verify.cta": "Go to the dashboard",
  "reset.title": "Choose your new password",
  "reset.description": "The link works only once — the moment it's saved, it's dead.",
} satisfies Messages["authPages"];
