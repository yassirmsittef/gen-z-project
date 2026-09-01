import type { Messages } from "../types";

/** Authentifizierungsseiten: Anmelden, Registrieren, Passwort vergessen, Zurücksetzen. */
export const authPages = {
  "meta.loginTitle": "Anmelden",
  "meta.registerTitle": "Registrieren",
  "meta.forgotTitle": "Passwort vergessen",
  "meta.resetTitle": "Neues Passwort",
  "login.title": "Willkommen zurück",
  "login.description": "Melde dich an, um beizutragen und deine Projekte zu verfolgen.",
  "register.title": "Komm in die Community",
  "register.description":
    "Unterstütze die Projekte deiner Generation per Karte, in ihrer Währung — und starte dein eigenes ab 20 $ an gesammelten Beiträgen.",
  "register.howItWorks": "Wie funktioniert das?",
  "forgot.title": "Passwort vergessen",
  "forgot.description":
    "Gib die E-Mail deines Kontos an: Wir schicken dir einen Link, 1 Stunde gültig, um ein neues zu wählen.",
  "reset.title": "Wähl dein neues Passwort",
  "reset.description": "Der Link funktioniert nur einmal — sobald gespeichert, ist er tot.",
} satisfies Messages["authPages"];
