import type { Messages } from "../types";

/**
 * Carcasa de las páginas legales. Los tres documentos (condiciones,
 * privacidad, aviso legal) permanecen en francés — decisión del fundador:
 * solo la versión francesa da fe. Fuera de la locale fr, el layout lo anuncia
 * con sobriedad.
 */
export const legalPages = {
  "layout.frame": "El marco",
  frenchPrevails:
    "Esta página solo existe en francés — la versión francesa es la que da fe.",
} satisfies Messages["legalPages"];
