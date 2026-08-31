import type { Messages } from "../types";

export const email = {
  hello: "Olá {name} — ",
  cta: "Ver na GeniGain",
  ctaText: "Ver na GeniGain:",
  why: "Recebes este email porque um evento importante diz respeito aos teus projetos ou contribuições.",
  managePrefs: "Gerir as minhas preferências",
  managePrefsText: "Gere as tuas preferências: {link}",
  signature: "GeniGain — a comunidade que financia a tua geração",

  "reset.subject": "Repõe a tua palavra-passe GeniGain",
  "reset.heading": "Repõe a tua palavra-passe",
  "reset.intro": "Alguém (tu, normalmente) pediu para repor a tua palavra-passe GeniGain.",
  "reset.validity": "O link é válido durante 1 hora e só serve uma vez.",
  "reset.cta": "Escolher uma nova palavra-passe",
  "reset.ignore": "Se não foste tu, ignora este email — a tua palavra-passe fica igual.",
} satisfies Messages["email"];
