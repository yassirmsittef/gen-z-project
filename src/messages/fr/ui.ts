import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `ui` — composants transverses (lot 6) : recherche globale ⌘K,
 * partage, signalement, cloche de notifications, globe communauté,
 * navigation légale, badge de réputation.
 */
export const ui = {
  // Recherche globale (⌘K)
  "commandPalette.triggerTitle": "Rechercher (⌘K)",
  "commandPalette.triggerLabel": "Rechercher projets, salons et membres",
  "commandPalette.dialogLabel": "Recherche globale",
  "commandPalette.inputPlaceholder": "Chercher un projet, une marque, un salon, un membre…",
  "commandPalette.inputLabel": "Chercher un projet, un salon ou un membre",
  "commandPalette.sectionProjects": "Projets",
  "commandPalette.sectionCalls": "Appels",
  "commandPalette.sectionRooms": "Salons",
  "commandPalette.sectionMembers": "Membres",
  "commandPalette.replaceTarget": "Remplacer {target}",
  "commandPalette.callVotes": "{count} voix",
  "commandPalette.callAnswerers": {
    one: "{count} remplaçant",
    other: "{count} remplaçants",
  },
  "commandPalette.callNoAnswerers": "personne encore",
  "commandPalette.roomMeta": {
    one: "{count} membre · {purpose}",
    other: "{count} membres · {purpose}",
  },
  "commandPalette.noResults": "Rien trouvé pour « {query} ».",
  "commandPalette.minChars": "Tape au moins 2 caractères — projets par titre ou pitch, membres par nom.",
  "commandPalette.shortcutsHint": "↑↓ naviguer · ↵ ouvrir · esc fermer",

  // Partage de la page courante
  "shareButton.share": "Partager",
  "shareButton.copied": "Lien copié !",
  "shareButton.copyPrompt": "Copie le lien du projet :",

  // Signalement à l'équipe
  "reportButton.defaultLabel": "Signaler",
  "reportButton.triggerTitle": "Signaler à l'équipe",
  "reportButton.dialogLabel": "Signaler ce contenu",
  "reportButton.sentTitle": "Signalement envoyé",
  "reportButton.sentBody":
    "Merci de veiller sur la communauté — l'équipe va regarder. La personne visée n'est pas informée de ton signalement.",
  "reportButton.close": "Fermer",
  "reportButton.heading": "Signaler à l'équipe",
  "reportButton.reasonLegend": "Motif",
  "reportButton.detailLabel": "Précision (optionnel)",
  "reportButton.detailPlaceholder": "Ce qui t'a alerté·e — liens, contexte…",
  "reportButton.sending": "Envoi…",
  "reportButton.submit": "Envoyer le signalement",
  "reportButton.cancel": "Annuler",

  // Cloche de notifications
  "navbarBell.title": "Notifications",
  "navbarBell.overflow": "9+",
  "navbarBell.srUnread": "Notifications ({count} non lues)",

  // Globe de la communauté
  "communityGlobe.loading": "Initialisation du globe…",

  // Navigation du cadre légal
  "legalNav.ariaLabel": "Pages légales",
  "legalNav.terms": "Conditions d'utilisation",
  "legalNav.privacy": "Confidentialité",
  "legalNav.legalNotice": "Mentions légales",

  // Badge de réputation
  "reputationBadge.title": "Réputation : {reputation}",

  // Traduction sur l'appareil (Translator du navigateur — aucun service tiers)
  "translate.action": "Traduire",
  "translate.title": "Traduire ce texte dans ta langue",
  "translate.working": "Traduction…",
  "translate.downloading": "Téléchargement du modèle… {percent} %",
  "translate.showOriginal": "Voir l'original",
  "translate.badge": "Traduit sur ton appareil",
  "translate.sameLanguage": "Ce texte est déjà dans ta langue.",
  "translate.unavailablePair": "Cette langue ne peut pas être traduite.",
  "translate.failed": "La traduction n'a pas abouti — réessaie.",
  "translate.badgeService": "Traduit par un service externe",
  "translate.tooFast": "Trop de traductions d'affilée — reviens dans un moment.",
  "translate.saturated": "La traduction automatique n'est plus disponible pour le moment — réessaie plus tard.",
  "translate.consentBody": "Ton appareil ne sait pas traduire tout seul. Ce texte sera envoyé à un service de traduction externe (Microsoft), qui ne le conserve pas.",
  "translate.consentAccept": "D'accord, traduire",
  "translate.consentDecline": "Non merci",
} as const satisfies Dict;
