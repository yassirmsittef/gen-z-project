import type { Messages } from "../types";

export const email = {
  hello: "Ciao {name} — ",
  cta: "Vedi su GeniGain",
  ctaText: "Vedi su GeniGain:",
  why: "Ricevi questa email perché un evento importante riguarda i tuoi progetti o i tuoi contributi.",
  managePrefs: "Gestisci le mie preferenze",
  managePrefsText: "Gestisci le tue preferenze: {link}",
  signature: "GeniGain — la community che finanzia la tua generazione",

  "reset.subject": "Reimposta la tua password GeniGain",
  "reset.heading": "Reimposta la tua password",
  "reset.intro": "Qualcuno (tu, normalmente) ha chiesto di reimpostare la tua password GeniGain.",
  "reset.validity": "Il link è valido per 1 ora e funziona una sola volta.",
  "reset.cta": "Scegli una nuova password",
  "reset.ignore": "Se non eri tu, ignora questa email — la tua password resta invariata.",
} satisfies Messages["email"];
