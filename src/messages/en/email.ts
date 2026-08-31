import type { Messages } from "../types";

export const email = {
  hello: "Hi {name} — ",
  cta: "View on GeniGain",
  ctaText: "View on GeniGain:",
  why: "You're receiving this email because an important event concerns your projects or contributions.",
  managePrefs: "Manage my preferences",
  managePrefsText: "Manage your preferences: {link}",
  signature: "GeniGain — the community funding your generation",

  "reset.subject": "Reset your GeniGain password",
  "reset.heading": "Reset your password",
  "reset.intro": "Someone (you, normally) asked to reset your GeniGain password.",
  "reset.validity": "The link is valid for 1 hour and works only once.",
  "reset.cta": "Choose a new password",
  "reset.ignore": "If this wasn't you, ignore this email — your password stays unchanged.",
} satisfies Messages["email"];
