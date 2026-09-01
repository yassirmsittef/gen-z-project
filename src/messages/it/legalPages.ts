import type { Messages } from "../types";

/**
 * Guscio delle pagine legali. I tre documenti (condizioni d'uso, privacy,
 * note legali) restano in francese — decisione del fondatore: solo la
 * versione francese fa fede. Fuori dalla locale fr, il layout lo annuncia
 * con sobrietà.
 */
export const legalPages = {
  "layout.frame": "Il quadro",
  frenchPrevails:
    "Questa pagina esiste solo in francese — fa fede la versione francese.",
} satisfies Messages["legalPages"];
