import type { Message } from "@/lib/i18n/t";
import type { fr } from "./fr";

/**
 * Le contrat de parité des langues, dérivé du français : mêmes namespaces,
 * mêmes clés, valeurs libres (`string` ou objet pluriel). Une clé manquante
 * ou en trop dans une langue = erreur de compilation — le garde-fou le plus
 * précoce possible, dans l'esprit de contrat-formulaires.
 */
export type Messages = {
  [N in keyof typeof fr]: { [K in keyof (typeof fr)[N] & string]: Message };
};

export type Namespace = keyof Messages;
