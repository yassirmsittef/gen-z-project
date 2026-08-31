import type { Messages } from "../types";

export const email = {
  hello: "Hola {name} — ",
  cta: "Ver en GeniGain",
  ctaText: "Ver en GeniGain:",
  why: "Recibes este email porque un evento importante concierne a tus proyectos o contribuciones.",
  managePrefs: "Gestionar mis preferencias",
  managePrefsText: "Gestiona tus preferencias: {link}",
  signature: "GeniGain — la comunidad que financia a tu generación",

  "reset.subject": "Restablece tu contraseña de GeniGain",
  "reset.heading": "Restablece tu contraseña",
  "reset.intro": "Alguien (tú, normalmente) pidió restablecer tu contraseña de GeniGain.",
  "reset.validity": "El enlace es válido durante 1 hora y solo sirve una vez.",
  "reset.cta": "Elegir una nueva contraseña",
  "reset.ignore": "Si no fuiste tú, ignora este email — tu contraseña sigue igual.",
} satisfies Messages["email"];
