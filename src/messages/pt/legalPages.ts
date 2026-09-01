import type { Messages } from "../types";

/**
 * Casca das páginas legais. Os três documentos (condições, privacidade,
 * menções) ficam em francês — decisão do fundador: só a versão francesa
 * faz fé. Fora da locale fr, o layout anuncia-o com sobriedade.
 */
export const legalPages = {
  "layout.frame": "O enquadramento",
  frenchPrevails: "Esta página só existe em francês — é a versão francesa que faz fé.",
} satisfies Messages["legalPages"];
