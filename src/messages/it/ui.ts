import type { Messages } from "../types";

/**
 * Namespace `ui` — composants transverses (lot 6) : recherche globale ⌘K,
 * partage, signalement, cloche de notifications, globe communauté,
 * navigation légale, badge de réputation.
 */
export const ui = {
  // Recherche globale (⌘K)
  "commandPalette.triggerTitle": "Cerca (⌘K)",
  "commandPalette.triggerLabel": "Cerca progetti, stanze e membri",
  "commandPalette.dialogLabel": "Ricerca globale",
  "commandPalette.inputPlaceholder": "Cerca un progetto, un brand, una stanza, un membro…",
  "commandPalette.inputLabel": "Cerca un progetto, una stanza o un membro",
  "commandPalette.sectionProjects": "Progetti",
  "commandPalette.sectionCalls": "Appelli",
  "commandPalette.sectionRooms": "Stanze",
  "commandPalette.sectionMembers": "Membri",
  "commandPalette.replaceTarget": "Sostituire {target}",
  "commandPalette.callVotes": {
    one: "{count} voce",
    other: "{count} voci",
  },
  "commandPalette.callAnswerers": {
    one: "{count} sostituto",
    other: "{count} sostituti",
  },
  "commandPalette.callNoAnswerers": "ancora nessuno",
  "commandPalette.roomMeta": {
    one: "{count} membro · {purpose}",
    other: "{count} membri · {purpose}",
  },
  "commandPalette.noResults": "Nessun risultato per «{query}».",
  "commandPalette.minChars": "Digita almeno 2 caratteri — progetti per titolo o pitch, membri per nome.",
  "commandPalette.shortcutsHint": "↑↓ naviga · ↵ apri · esc chiudi",

  // Partage de la page courante
  "shareButton.share": "Condividi",
  "shareButton.copied": "Link copiato!",
  "shareButton.copyPrompt": "Copia il link del progetto:",

  // Signalement à l'équipe
  "reportButton.defaultLabel": "Segnala",
  "reportButton.triggerTitle": "Segnala al team",
  "reportButton.dialogLabel": "Segnala questo contenuto",
  "reportButton.sentTitle": "Segnalazione inviata",
  "reportButton.sentBody":
    "Grazie per vegliare sulla community — il team darà un'occhiata. La persona interessata non viene informata della tua segnalazione.",
  "reportButton.close": "Chiudi",
  "reportButton.heading": "Segnala al team",
  "reportButton.reasonLegend": "Motivo",
  "reportButton.detailLabel": "Dettagli (facoltativo)",
  "reportButton.detailPlaceholder": "Cosa ti ha messo in allarme — link, contesto…",
  "reportButton.sending": "Invio…",
  "reportButton.submit": "Invia la segnalazione",
  "reportButton.cancel": "Annulla",

  // Cloche de notifications
  "navbarBell.title": "Notifiche",
  "navbarBell.overflow": "9+",
  "navbarBell.srUnread": {
    one: "Notifiche ({count} non letta)",
    other: "Notifiche ({count} non lette)",
  },

  // Globe de la communauté
  "communityGlobe.loading": "Inizializzazione del globo…",

  // Navigation du cadre légal
  "legalNav.ariaLabel": "Pagine legali",
  "legalNav.terms": "Condizioni d'uso",
  "legalNav.privacy": "Privacy",
  "legalNav.legalNotice": "Note legali",

  // Badge de réputation
  "reputationBadge.title": "Reputazione: {reputation}",

  // Traduction sur l'appareil (Translator du navigateur — aucun service tiers)
  "translate.action": "Traduci",
  "translate.title": "Traduci questo testo nella tua lingua",
  "translate.working": "Traduzione…",
  "translate.downloading": "Download del modello… {percent} %",
  "translate.showOriginal": "Vedi l'originale",
  "translate.badge": "Tradotto sul tuo dispositivo",
  "translate.sameLanguage": "Questo testo è già nella tua lingua.",
  "translate.unavailablePair": "Questa lingua non si può tradurre.",
  "translate.failed": "La traduzione non è riuscita — riprova.",
  "translate.badgeService": "Tradotto da un servizio esterno",
  "translate.tooFast": "Troppe traduzioni di fila — riprova tra poco.",
  "translate.saturated": "La traduzione automatica non è disponibile al momento — riprova più tardi.",
  "translate.consentBody": "Il tuo dispositivo non sa tradurre da solo. Questo testo sarà inviato a un servizio di traduzione esterno (Microsoft), che non lo conserva.",
  "translate.consentAccept": "D'accordo, traduci",
  "translate.consentDecline": "No, grazie",
  "error.title": "Qualcosa si è rotto dalla nostra parte.",
  "error.body": "Non dipende da qualcosa che hai fatto. Riprova; se persiste, scrivici a bonjour@genigain.com.",
  "error.retry": "Riprova",
} satisfies Messages["ui"];
