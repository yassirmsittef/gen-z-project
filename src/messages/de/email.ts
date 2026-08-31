import type { Messages } from "../types";

export const email = {
  hello: "Hallo {name} — ",
  cta: "Auf GeniGain ansehen",
  ctaText: "Auf GeniGain ansehen:",
  why: "Du erhältst diese E-Mail, weil ein wichtiges Ereignis deine Projekte oder Beiträge betrifft.",
  managePrefs: "Meine Einstellungen verwalten",
  managePrefsText: "Verwalte deine Einstellungen: {link}",
  signature: "GeniGain — die Community, die deine Generation finanziert",

  "reset.subject": "Setze dein GeniGain-Passwort zurück",
  "reset.heading": "Setze dein Passwort zurück",
  "reset.intro": "Jemand (normalerweise du) hat darum gebeten, dein GeniGain-Passwort zurückzusetzen.",
  "reset.validity": "Der Link ist 1 Stunde gültig und funktioniert nur einmal.",
  "reset.cta": "Neues Passwort wählen",
  "reset.ignore": "Wenn du das nicht warst, ignoriere diese E-Mail — dein Passwort bleibt unverändert.",
} satisfies Messages["email"];
