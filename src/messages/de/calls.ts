import type { Messages } from "../types";

/**
 * Namespace `calls` — der Aufruf-Feed, der Live-Feed und die Partnerschaften:
 * Aufruf-Karten und -Formulare, Unterstützung, gefilmte Erfahrungsberichte,
 * KI-Copilot.
 */
export const calls = {
  // ── CallAnswerForm ────────────────────────────────────────────────────────
  "callAnswerForm.emptyHeading": "Du kannst der Ersatz sein",
  "callAnswerForm.emptyBody":
    "Starte ein Projekt, das auf diesen Aufruf antwortet: Die Stimmen hinter dem Aufruf sind deine ersten Unterstützer — und sie werden benachrichtigt, sobald du dich erklärst.",
  "callAnswerForm.launchReplacement": "Den Ersatz für {target} starten",
  "callAnswerForm.heading": "Antwortet eines deiner Projekte darauf?",
  "callAnswerForm.body":
    "Erklär es: Wer den Aufruf gestartet hat und alle, die ihn unterstützen, werden benachrichtigt.",
  "callAnswerForm.projectLabel": "Dein Projekt",
  "callAnswerForm.projectPlaceholder": "Projekt auswählen…",
  "callAnswerForm.success":
    "Erklärt — die Unterstützer des Aufrufs wurden gerade benachrichtigt.",
  "callAnswerForm.pending": "Wird gespeichert…",
  "callAnswerForm.submit": "Mein Projekt ersetzt {target}",

  // ── CallCard ──────────────────────────────────────────────────────────────
  "callCard.replacementCount": {
    one: "{count} Ersatzprojekt",
    other: "{count} Ersatzprojekte",
  },
  "callCard.nobodyYet": "Noch niemand",
  "callCard.noLongerWants": "Hat genug von",
  "callCard.instead": "Stattdessen",
  "callCard.memberFallback": "Mitglied",
  "callCard.takeCall": "Diesen Aufruf annehmen",

  // ── CallCommentForm ───────────────────────────────────────────────────────
  "callCommentForm.placeholder":
    "Ergänze ein Detail, eine Quelle, eine Nuance — oder sag, warum du nicht einverstanden bist…",
  "callCommentForm.replyAria": "Deine Antwort",
  "callCommentForm.pending": "Wird gesendet…",
  "callCommentForm.submit": "Antworten",
  "callCommentForm.disclaimer":
    "Veröffentlicht unter deinem Namen. Widerspruch ist willkommen, persönliche Angriffe nicht.",

  // ── CallSupportButton ─────────────────────────────────────────────────────
  "callSupportButton.removeVoiceAria": {
    one: "Meine Stimme zurückziehen — {count} Stimme",
    other: "Meine Stimme zurückziehen — {count} Stimmen",
  },
  "callSupportButton.supportAria": {
    one: "Ich will das auch ersetzt sehen — {count} Stimme",
    other: "Ich will das auch ersetzt sehen — {count} Stimmen",
  },
  "callSupportButton.removeVoice": "Meine Stimme zurückziehen",
  "callSupportButton.support": "Ich will das auch ersetzt sehen",
  "callSupportButton.signInToSupport": "Melde dich an, um diesen Aufruf zu unterstützen",
  "callSupportButton.supported": "Unterstützt",
  "callSupportButton.supportShort": "Das soll ersetzt werden",

  // ── CreateCallForm ────────────────────────────────────────────────────────
  "createCallForm.charterHeading": "Was du mit der Veröffentlichung unterschreibst",
  "createCallForm.charterBody":
    "Dein Aufruf erscheint unter deinem Namen. GeniGain hostet diesen Feed, schreibt ihn nicht und macht ihn sich nicht zu eigen — du bleibst verantwortlich für das, was du behauptest.",
  "createCallForm.targetLabel": "Die Marke oder das Unternehmen",
  "createCallForm.targetPlaceholder": "Einfach der Name…",
  "createCallForm.targetHint":
    "Ein Unternehmen — nie eine Person und nie eine Community.",
  "createCallForm.categoryLabel": "Die Branche, die ersetzt werden soll",
  "createCallForm.categoryPlaceholder": "Auswählen…",
  "createCallForm.categoryHint":
    "Hier suchen Projektträger nach Aufrufen, die sie annehmen können.",
  "createCallForm.reasonLabel": "Warum du genug davon hast",
  "createCallForm.reasonPlaceholder":
    "Erzähl, was du beobachtet, erlebt, gelesen hast. Trenne, was du weißt, von dem, was du vermutest…",
  "createCallForm.reasonHint":
    "Mindestens {min} Zeichen. Für die Fakten, die du nennst, stehst du gerade — genau dafür sind die Quellen da.",
  "createCallForm.wantedLabel": "Was du stattdessen willst",
  "createCallForm.wantedPlaceholder":
    "Das Produkt oder der Service, den du morgen kaufen würdest, wenn es ihn gäbe — und zu welchen Bedingungen…",
  "createCallForm.wantedHint":
    "Aus diesem Teil entsteht ein Projekt. Sei präzise: Ein Projektträger muss ihn wie ein Briefing lesen können.",
  "createCallForm.sourcesLabel": "Quellen (optional)",
  "createCallForm.sourcesHint":
    "Ein Link pro Zeile, höchstens {max}, mit https. Ein belegter Aufruf hält stand; einer ohne Quellen fällt bei der ersten Meldung.",
  "createCallForm.pending": "Wird veröffentlicht…",
  "createCallForm.submit": "Aufruf veröffentlichen",
  "createCallForm.withdrawNote": "Du kannst ihn jederzeit selbst zurückziehen.",

  // ── VideoFeed ─────────────────────────────────────────────────────────────
  "videoFeed.emptyHeading": "Noch niemand hat gefilmt.",
  "videoFeed.emptyBody":
    "Ein Erfahrungsbericht gehört immer zu einem Aufruf: Öffne einen Aufruf aus dem Feed und erzähl vor der Kamera, warum du genug von dieser Marke hast.",
  "videoFeed.seeCalls": "Zu den Aufrufen",
  "videoFeed.soundOn": "Ton einschalten",
  "videoFeed.soundOff": "Ton ausschalten",
  "videoFeed.resume": "Fortsetzen",
  "videoFeed.pause": "Pausieren",
  "videoFeed.resumePlayback": "Wiedergabe fortsetzen",
  "videoFeed.unreadable": "Dein Browser kann dieses Video nicht abspielen.",
  "videoFeed.openInNewTab": "In neuem Tab öffnen",
  "videoFeed.noLongerWants": "Hat genug von",
  "videoFeed.memberFallback": "Mitglied",
  // Die Zahl wird DANEBEN gerendert (Mono-Span); `count` wird übergeben,
  // damit Sprachen wie diese hier per Pluralobjekt beugen können.
  "videoFeed.voicesOnCall": {
    one: "Stimme zu diesem Aufruf",
    other: "Stimmen zu diesem Aufruf",
  },
  "videoFeed.withdraw": "Zurückziehen",
  "videoFeed.hostDisclaimer":
    "Von einem Mitglied veröffentlichter Erfahrungsbericht. GeniGain hostet diesen Inhalt und ist nicht sein Autor.",
  "videoFeed.loading": "Wird geladen…",

  // ── VideoUploadForm ───────────────────────────────────────────────────────
  "videoUploadForm.unreadableRetry":
    "Video nicht lesbar — versuch eine andere Datei (MP4 oder WebM).",
  "videoUploadForm.formatRejected":
    "Format nicht akzeptiert — es braucht MP4 oder WebM. Auf dem iPhone wähle das Video aus der Mediathek: Es wird automatisch konvertiert.",
  "videoUploadForm.tooHeavy":
    "Video zu groß ({size} MB). Maximal {max} MB — film kürzer oder in geringerer Qualität.",
  "videoUploadForm.tooLong":
    "{seconds} Sekunden sind zu lang. Höchstens {max} Sekunden.",
  "videoUploadForm.unreadable": "Video nicht lesbar.",
  "videoUploadForm.chooseFirst": "Wähle zuerst ein Video.",
  "videoUploadForm.publishImpossible": "Veröffentlichen gerade nicht möglich.",
  "videoUploadForm.sendImpossible": "Hochladen unmöglich.",
  "videoUploadForm.successHeading": "Dein Erfahrungsbericht ist online.",
  "videoUploadForm.successBody":
    "Er erscheint im Live-Feed, verknüpft mit dem Aufruf zu {target}.",
  "videoUploadForm.seeLive": "Zum Live-Feed",
  "videoUploadForm.heading": "Film deinen Erfahrungsbericht",
  "videoUploadForm.intro":
    "Höchstens {maxSeconds} Sekunden, max. {maxMb} MB. Dein Video erscheint unter deinem Namen, verknüpft mit diesem Aufruf — und du bleibst verantwortlich für das, was du darin behauptest, genau wie bei einem geschriebenen Aufruf.",
  "videoUploadForm.fileLabel": "Dein Video",
  "videoUploadForm.fileMetaPoster": "{seconds} s · {width}×{height} · Vorschaubild erstellt",
  "videoUploadForm.fileMetaNoPoster": "{seconds} s · {width}×{height} · kein Vorschaubild",
  "videoUploadForm.captionLabel": "Was dein Video zeigt",
  "videoUploadForm.captionPlaceholder":
    "Sag in einem Satz, was man sieht und was es beweist…",
  "videoUploadForm.uploading": "Video wird hochgeladen…",
  "videoUploadForm.publishing": "Wird veröffentlicht…",
  "videoUploadForm.submit": "Erfahrungsbericht veröffentlichen",

  // ── DeepAnalysis ──────────────────────────────────────────────────────────
  "deepAnalysis.inProgress": "Tiefenanalyse durch die KI läuft...",

  // ── PartnershipAnalysisPanel ──────────────────────────────────────────────
  "partnershipAnalysisPanel.verdictFavorable": "Angebot wirkt seriös",
  "partnershipAnalysisPanel.verdictPrudence": "Vor der Zusage klären",
  "partnershipAnalysisPanel.verdictDeconseille": "Betrugssignale — abzuraten",
  "partnershipAnalysisPanel.signalDanger": "Gefahr",
  "partnershipAnalysisPanel.signalAttention": "Achtung",
  "partnershipAnalysisPanel.signalInfo": "Info",
  "partnershipAnalysisPanel.heading": "KI-Copilot",
  "partnershipAnalysisPanel.engineDeep": "Tiefenanalyse · Claude",
  "partnershipAnalysisPanel.engineQuick": "Schnellanalyse",
  "partnershipAnalysisPanel.reliabilityLabel": "Verlässlichkeit",
  "partnershipAnalysisPanel.reliabilitySub": "Wirkt die Marke echt?",
  "partnershipAnalysisPanel.fairnessLabel": "Fairness",
  "partnershipAnalysisPanel.fairnessSub": "Gegenleistung vs. verlangte Arbeit",
  "partnershipAnalysisPanel.signalsHeading": "Erkannte Signale",
  "partnershipAnalysisPanel.questionsHeading": "Frag das, bevor du zusagst",

  // ── PartnershipForm ───────────────────────────────────────────────────────
  // Wie im Französischen: Das markenseitige Formular siezt (« vous »).
  "partnershipForm.brandNameLabel": "Marke / Unternehmen *",
  "partnershipForm.brandNamePlaceholder": "z. B. Studio Nova",
  "partnershipForm.contactNameLabel": "Ihr Name",
  "partnershipForm.contactNamePlaceholder": "z. B. Lena Krüger",
  "partnershipForm.emailLabel": "Geschäftliche E-Mail *",
  "partnershipForm.emailPlaceholder": "vorname@ihre-marke.com",
  "partnershipForm.websiteLabel": "Website",
  "partnershipForm.websitePlaceholder": "https://ihre-marke.com",
  "partnershipForm.compensationLabel": "Angebotene Gegenleistung *",
  "partnershipForm.compensationPlaceholder": "Auswählen…",
  "partnershipForm.budgetLabel": "Angebotenes Budget ($)",
  "partnershipForm.budgetPlaceholder": "z. B. 300",
  "partnershipForm.budgetHint": "Bei Bezahlung in Geld — seien Sie transparent.",
  "partnershipForm.messageLabel": "Ihr Vorschlag *",
  "partnershipForm.messagePlaceholder":
    "Wer Sie sind, warum dieses Projekt, was Sie konkret anbieten (Zeitplan, Rahmen...).",
  "partnershipForm.deliverablesLabel": "Was Sie vom Creator erwarten",
  "partnershipForm.deliverablesPlaceholder":
    "z. B. 2 Instagram-Posts + 1 Erwähnung in einer Folge, Briefing wird gestellt.",
  "partnershipForm.pending": "Wird gesendet…",
  "partnershipForm.submit": "Anfrage senden",
  "partnershipForm.afterSend":
    "Nach dem Absenden erhalten Sie einen privaten Link, um die Antwort des Creators oder der Creatorin zu verfolgen.",

  // ── PartnershipResponseForm ───────────────────────────────────────────────
  "partnershipResponseForm.success":
    "Antwort gesendet — die Marke sieht sie über ihren privaten Link.",
  "partnershipResponseForm.replyLabel": "Deine Antwort an die Marke",
  "partnershipResponseForm.replyHint":
    "Vom Copilot vorformuliert — lies gegen, personalisiere, dann triff deine Entscheidung.",
  "partnershipResponseForm.pending": "Wird gesendet…",
  "partnershipResponseForm.accept": "Partnerschaft annehmen",
  "partnershipResponseForm.decline": "Ablehnen",
} satisfies Messages["calls"];
