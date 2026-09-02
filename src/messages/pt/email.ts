import type { Messages } from "../types";

export const email = {
  hello: "Olá {name} — ",
  cta: "Ver na GeniGain",
  ctaText: "Ver na GeniGain:",
  why: "Recebes este email porque um evento importante diz respeito aos teus projetos ou contribuições.",
  managePrefs: "Gerir as minhas preferências",
  managePrefsText: "Gere as tuas preferências: {link}",
  signature: "GeniGain — a comunidade que financia a tua geração",

  "verify.subject": "Confirma o teu endereço de email GeniGain",
  "verify.heading": "Confirma o teu endereço de email",
  "verify.intro": "Bem-vindo! Falta um passo: confirmar que este endereço é mesmo teu.",
  "verify.validity": "A ligação é válida 24 horas e só funciona uma vez.",
  "verify.cta": "Confirmar o meu endereço",
  "verify.ignore": "Se não criaste uma conta GeniGain, ignora este email.",
  "reset.subject": "Repõe a tua palavra-passe GeniGain",
  "reset.heading": "Repõe a tua palavra-passe",
  "reset.intro": "Alguém (tu, normalmente) pediu para repor a tua palavra-passe GeniGain.",
  "reset.validity": "O link é válido durante 1 hora e só serve uma vez.",
  "reset.cta": "Escolher uma nova palavra-passe",
  "reset.ignore": "Se não foste tu, ignora este email — a tua palavra-passe fica igual.",
} satisfies Messages["email"];
