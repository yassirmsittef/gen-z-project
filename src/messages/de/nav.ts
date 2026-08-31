import type { Messages } from "../types";

export const nav = {
  skipToContent: "Zum Inhalt springen",
  projects: "Projekte",
  calls: "Aufrufe",
  live: "Live",
  community: "Community",
  communityTitle: "Community — das Netzwerk auf dem Globus",
  rankings: "Ranglisten",
  launchProject: "Projekt starten",
  dashboard: "Dashboard",
  chat: "Chat",
  chatTitle: "Chat — Gründer helfen Gründern",
  adminCockpit: "Admin-Cockpit",
  adminOpenReports: {
    one: "{count} offene Meldung",
    other: "{count} offene Meldungen",
  },
  profileTitle: "Dein öffentliches Profil",
  signOut: "Abmelden",
  signIn: "Anmelden",
  signUp: "Registrieren",
  legalLinks: "Rechtliche Links",
  terms: "Nutzungsbedingungen",
  privacy: "Datenschutz",
  legalNotice: "Impressum",
  footerLive:
    "GeniGain · 0 % Provision, nur Bankgebühren fallen an · Zahlungen gesichert durch Stripe.",
  footerTest:
    "GeniGain · Phase 1 — Stripe-Zahlungen im Testmodus, keine echte Abbuchung · 0 % Provision, nur Bankgebühren.",
  notFoundLabel: "Fehler 404",
  notFoundHeading: "Diese Seite ist aus der Umlaufbahn geraten",
  notFoundBody:
    "Der Link ist vielleicht veraltet — oder das Projekt wurde von der Person dahinter zurückgezogen. Nichts ist verloren: die Community baut gleich nebenan weiter.",
  notFoundDiscover: "Projekte entdecken",
  notFoundHome: "Startseite",
} satisfies Messages["nav"];
