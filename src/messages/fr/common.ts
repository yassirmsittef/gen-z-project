import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `common` — les mots qui traversent toute l'interface.
 * Le français est la SOURCE DE VÉRITÉ : la structure de ce fichier (et de ses
 * frères du dossier fr/) définit le contrat `Messages` que les 6 autres
 * langues doivent remplir clé pour clé, à la compilation.
 */
export const common = {
  "support.link": "Soutenir GeniGain",
  "support.title": "Soutenir GeniGain",
  "support.lead": "GeniGain est une plateforme à 0 % de commission : elle ne prend rien sur les projets. Pour vivre et grandir, elle compte sur celles et ceux qui croient à l'idée.",
  "support.what": "Ce que ton soutien finance : le développement et la sécurité de la plateforme, puis des lieux dans les villes pour accompagner celles et ceux qui se lancent — un endroit pour travailler, se former, rencontrer ses contributeurs.",
  "support.surplus": "Engagement : tout ce qui dépasse les besoins de la plateforme est reversé pour financer les projets des autres membres.",
  "support.direct": "Contrairement aux projets, ce soutien n'a ni étapes ni séquestre : c'est un don à la plateforme, encaissé directement sur son compte.",
  "support.total": "Déjà reçu : {amount}",
  "support.amountLabel": "Montant (CHF)",
  "support.button": "Soutenir",
  "support.pending": "Redirection vers le paiement…",
  "support.thanks": "Merci ! Ton soutien est bien arrivé.",
  "support.cancelled": "Paiement annulé — rien n'a été débité.",
  "support.unlock": "Et ça ouvre une porte : soutenir GeniGain compte comme une contribution et débloque ton droit de lancer ton propre projet.",
  "support.login": "Connecte-toi pour soutenir GeniGain.",
  someone: "Quelqu'un",
  justNow: "à l'instant",
} as const satisfies Dict;
