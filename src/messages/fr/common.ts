import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `common` — les mots qui traversent toute l'interface.
 * Le français est la SOURCE DE VÉRITÉ : la structure de ce fichier (et de ses
 * frères du dossier fr/) définit le contrat `Messages` que les 6 autres
 * langues doivent remplir clé pour clé, à la compilation.
 */
export const common = {
  someone: "Quelqu'un",
  justNow: "à l'instant",
} as const satisfies Dict;
