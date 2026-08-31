import type { Messages } from "../types";

export const nav = {
  skipToContent: "Skip to content",
  projects: "Projects",
  calls: "Calls",
  live: "Live",
  community: "Community",
  communityTitle: "Community — the network on the globe",
  rankings: "Rankings",
  launchProject: "Launch a project",
  dashboard: "Dashboard",
  chat: "Chat",
  chatTitle: "Chat — builders helping builders",
  adminCockpit: "Admin cockpit",
  adminOpenReports: {
    one: "{count} open report",
    other: "{count} open reports",
  },
  profileTitle: "Your public profile",
  signOut: "Sign out",
  signIn: "Log in",
  signUp: "Sign up",
  legalLinks: "Legal links",
  terms: "Terms of service",
  privacy: "Privacy",
  legalNotice: "Legal notice",
  footerLive:
    "GeniGain · 0% commission, only bank fees apply · payments secured by Stripe.",
  footerTest:
    "GeniGain · Phase 1 — Stripe payments in test mode, no real charge · 0% commission, only bank fees apply.",
  notFoundLabel: "Error 404",
  notFoundHeading: "This page drifted out of orbit",
  notFoundBody:
    "The link may be stale — or the project was withdrawn by the person behind it. Nothing is lost: the community keeps building right next door.",
  notFoundDiscover: "Discover projects",
  notFoundHome: "Home",
} satisfies Messages["nav"];
