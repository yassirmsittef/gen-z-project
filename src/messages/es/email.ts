import type { Messages } from "../types";

export const email = {
  hello: "Hola {name} — ",
  cta: "Ver en GeniGain",
  ctaText: "Ver en GeniGain:",
  why: "Recibes este email porque un evento importante concierne a tus proyectos o contribuciones.",
  managePrefs: "Gestionar mis preferencias",
  managePrefsText: "Gestiona tus preferencias: {link}",
  signature: "GeniGain — la comunidad que financia a tu generación",

  "verify.subject": "Confirma tu dirección de email de GeniGain",
  "verify.heading": "Confirma tu dirección de email",
  "verify.intro": "¡Bienvenido! Queda un paso: confirmar que esta dirección es realmente tuya.",
  "verify.validity": "El enlace es válido 24 horas y solo sirve una vez.",
  "verify.cta": "Confirmar mi dirección",
  "verify.ignore": "Si no has creado una cuenta en GeniGain, ignora este email.",
  "reset.subject": "Restablece tu contraseña de GeniGain",
  "reset.heading": "Restablece tu contraseña",
  "reset.intro": "Alguien (tú, normalmente) pidió restablecer tu contraseña de GeniGain.",
  "reset.validity": "El enlace es válido durante 1 hora y solo sirve una vez.",
  "reset.cta": "Elegir una nueva contraseña",
  "reset.ignore": "Si no fuiste tú, ignora este email — tu contraseña sigue igual.",
} satisfies Messages["email"];
