import type { Messages } from "../types";

/**
 * Namespace `ui` — übergreifende Komponenten (Los 6): globale Suche ⌘K,
 * Teilen, Melden, Benachrichtigungsglocke, Community-Globus,
 * rechtliche Navigation, Reputations-Badge.
 */
export const ui = {
  // Globale Suche (⌘K)
  "commandPalette.triggerTitle": "Suchen (⌘K)",
  "commandPalette.triggerLabel": "Projekte, Räume und Mitglieder suchen",
  "commandPalette.dialogLabel": "Globale Suche",
  "commandPalette.inputPlaceholder": "Projekt, Marke, Raum oder Mitglied suchen…",
  "commandPalette.inputLabel": "Projekt, Raum oder Mitglied suchen",
  "commandPalette.sectionProjects": "Projekte",
  "commandPalette.sectionCalls": "Aufrufe",
  "commandPalette.sectionRooms": "Räume",
  "commandPalette.sectionMembers": "Mitglieder",
  "commandPalette.replaceTarget": "{target} ersetzen",
  "commandPalette.callVotes": {
    one: "{count} Stimme",
    other: "{count} Stimmen",
  },
  "commandPalette.callAnswerers": {
    one: "{count} Ersatzprojekt",
    other: "{count} Ersatzprojekte",
  },
  "commandPalette.callNoAnswerers": "noch niemand",
  "commandPalette.roomMeta": {
    one: "{count} Mitglied · {purpose}",
    other: "{count} Mitglieder · {purpose}",
  },
  "commandPalette.noResults": "Nichts gefunden für „{query}“.",
  "commandPalette.minChars": "Tipp mindestens 2 Zeichen — Projekte nach Titel oder Pitch, Mitglieder nach Namen.",
  "commandPalette.shortcutsHint": "↑↓ navigieren · ↵ öffnen · esc schließen",

  // Aktuelle Seite teilen
  "shareButton.share": "Teilen",
  "shareButton.copied": "Link kopiert!",
  "shareButton.copyPrompt": "Kopiere den Projekt-Link:",

  // Meldung ans Team
  "reportButton.defaultLabel": "Melden",
  "reportButton.triggerTitle": "Dem Team melden",
  "reportButton.dialogLabel": "Diesen Inhalt melden",
  "reportButton.sentTitle": "Meldung gesendet",
  "reportButton.sentBody":
    "Danke, dass du auf die Community achtest — das Team schaut es sich an. Die betroffene Person erfährt nichts von deiner Meldung.",
  "reportButton.close": "Schließen",
  "reportButton.heading": "Dem Team melden",
  "reportButton.reasonLegend": "Grund",
  "reportButton.detailLabel": "Details (optional)",
  "reportButton.detailPlaceholder": "Was dich stutzig gemacht hat — Links, Kontext…",
  "reportButton.sending": "Wird gesendet…",
  "reportButton.submit": "Meldung senden",
  "reportButton.cancel": "Abbrechen",

  // Benachrichtigungsglocke
  "navbarBell.title": "Benachrichtigungen",
  "navbarBell.overflow": "9+",
  "navbarBell.srUnread": "Benachrichtigungen ({count} ungelesen)",

  // Community-Globus
  "communityGlobe.loading": "Globus wird initialisiert…",

  // Navigation des rechtlichen Rahmens
  "legalNav.ariaLabel": "Rechtliche Seiten",
  "legalNav.terms": "Nutzungsbedingungen",
  "legalNav.privacy": "Datenschutz",
  "legalNav.legalNotice": "Impressum",

  // Reputations-Badge
  "reputationBadge.title": "Reputation: {reputation}",

  // Traduction sur l'appareil (Translator du navigateur — aucun service tiers)
  "translate.action": "Übersetzen",
  "translate.title": "Diesen Text auf deinem Gerät in deine Sprache übersetzen",
  "translate.working": "Übersetzung…",
  "translate.downloading": "Modell wird geladen… {percent} %",
  "translate.showOriginal": "Original anzeigen",
  "translate.badge": "Auf deinem Gerät übersetzt",
  "translate.sameLanguage": "Dieser Text ist schon in deiner Sprache.",
  "translate.unavailablePair": "Dein Browser kann diese Sprache nicht übersetzen.",
  "translate.failed": "Die Übersetzung hat nicht geklappt — versuch es erneut.",
} satisfies Messages["ui"];
