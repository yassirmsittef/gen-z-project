import type { Messages } from "../types";

/**
 * Namespace `calls` — le fil des appels, le direct vidéo et les partenariats :
 * cartes et formulaires d'appel, soutien, témoignages filmés, copilote IA.
 */
export const calls = {
  // ── CallAnswerForm ────────────────────────────────────────────────────────
  "callAnswerForm.emptyHeading": "Il sostituto puoi essere tu",
  "callAnswerForm.emptyBody":
    "Lancia un progetto che risponde a questo appello: i sostenitori dell'appello sono i tuoi primi contributori, e saranno avvisati appena ti dichiari.",
  "callAnswerForm.launchReplacement": "Lancia il sostituto di {target}",
  "callAnswerForm.heading": "Uno dei tuoi progetti risponde a questo appello?",
  "callAnswerForm.body":
    "Dichiaralo: chi ha lanciato l'appello e tutti i suoi sostenitori saranno avvisati.",
  "callAnswerForm.projectLabel": "Il tuo progetto",
  "callAnswerForm.projectPlaceholder": "Scegli un progetto…",
  "callAnswerForm.success":
    "Dichiarato — i sostenitori dell'appello sono appena stati avvisati.",
  "callAnswerForm.pending": "Salvataggio…",
  "callAnswerForm.submit": "Il mio progetto sostituisce {target}",

  // ── CallCard ──────────────────────────────────────────────────────────────
  "callCard.replacementCount": {
    one: "{count} sostituto",
    other: "{count} sostituti",
  },
  "callCard.nobodyYet": "Ancora nessuno",
  "callCard.noLongerWants": "Non vuole più",
  "callCard.instead": "Al suo posto",
  "callCard.memberFallback": "Membro",
  "callCard.takeCall": "Raccogli questo appello",

  // ── CallCommentForm ───────────────────────────────────────────────────────
  "callCommentForm.placeholder":
    "Aggiungi una precisazione, una fonte, una sfumatura — o di' perché non sei d'accordo…",
  "callCommentForm.replyAria": "La tua risposta",
  "callCommentForm.pending": "Invio…",
  "callCommentForm.submit": "Rispondi",
  "callCommentForm.disclaimer":
    "Pubblicato a tuo nome. La contraddizione è benvenuta, l'attacco personale no.",

  // ── CallSupportButton ─────────────────────────────────────────────────────
  "callSupportButton.removeVoiceAria": {
    one: "Ritira la tua voce — {count} sostegno",
    other: "Ritira la tua voce — {count} sostegni",
  },
  "callSupportButton.supportAria": {
    one: "Anch'io lo voglio sostituito — {count} sostegno",
    other: "Anch'io lo voglio sostituito — {count} sostegni",
  },
  "callSupportButton.removeVoice": "Ritira la tua voce",
  "callSupportButton.support": "Anch'io lo voglio sostituito",
  "callSupportButton.signInToSupport": "Accedi per sostenere questo appello",
  "callSupportButton.supported": "Sostenuto",
  "callSupportButton.supportShort": "Lo voglio sostituito",

  // ── CreateCallForm ────────────────────────────────────────────────────────
  "createCallForm.charterHeading": "Cosa firmi pubblicando",
  "createCallForm.charterBody":
    "Il tuo appello è pubblicato a tuo nome. GeniGain ospita questo feed, non lo scrive e non lo fa suo — resti responsabile di ciò che affermi.",
  "createCallForm.targetLabel": "Il brand o l'azienda",
  "createCallForm.targetPlaceholder": "Il nome, semplicemente…",
  "createCallForm.targetHint":
    "Un'azienda — mai una persona né una community.",
  "createCallForm.categoryLabel": "Il settore da sostituire",
  "createCallForm.categoryPlaceholder": "Scegli…",
  "createCallForm.categoryHint":
    "È lì che chi porta avanti progetti verrà a cercare appelli da raccogliere.",
  "createCallForm.reasonLabel": "Perché non lo vuoi più",
  "createCallForm.reasonPlaceholder":
    "Racconta cosa hai constatato, vissuto, letto. Distingui ciò che sai da ciò che supponi…",
  "createCallForm.reasonHint":
    "Minimo {min} caratteri. I fatti che affermi ti impegnano — le fonti servono a questo.",
  "createCallForm.wantedLabel": "Cosa vuoi al suo posto",
  "createCallForm.wantedPlaceholder":
    "Il prodotto o il servizio che compreresti domani se esistesse — e a quali condizioni…",
  "createCallForm.wantedHint":
    "È la parte che fa nascere un progetto. Scendi nei dettagli: chi porta avanti un progetto deve poterla leggere come un capitolato.",
  "createCallForm.sourcesLabel": "Fonti (facoltativo)",
  "createCallForm.sourcesHint":
    "Un link per riga, massimo {max}, in https. Un appello con le fonti resiste; un appello senza fonti cade alla prima segnalazione.",
  "createCallForm.pending": "Pubblicazione…",
  "createCallForm.submit": "Pubblica l'appello",
  "createCallForm.withdrawNote": "Potrai ritirarlo tu in ogni momento.",

  // ── VideoFeed ─────────────────────────────────────────────────────────────
  "videoFeed.emptyHeading": "Nessuno ha ancora filmato.",
  "videoFeed.emptyBody":
    "Una testimonianza è sempre legata a un appello: apri un appello dal feed e racconta, davanti alla videocamera, perché non vuoi più quel brand.",
  "videoFeed.seeCalls": "Vedi gli appelli",
  "videoFeed.soundOn": "Attiva l'audio",
  "videoFeed.soundOff": "Disattiva l'audio",
  "videoFeed.resume": "Riprendi",
  "videoFeed.pause": "Metti in pausa",
  "videoFeed.resumePlayback": "Riprendi la riproduzione",
  "videoFeed.unreadable": "Il tuo browser non riesce a leggere questo video.",
  "videoFeed.openInNewTab": "Aprilo in una nuova scheda",
  "videoFeed.noLongerWants": "Non vuole più",
  "videoFeed.memberFallback": "Membro",
  // Le nombre est rendu À CÔTÉ (span mono) ; `count` est passé pour que
  // d'autres langues puissent accorder via un objet pluriel.
  "videoFeed.voicesOnCall": {
    one: "voce su questo appello",
    other: "voci su questo appello",
  },
  "videoFeed.withdraw": "Ritira",
  "videoFeed.hostDisclaimer":
    "Testimonianza pubblicata da un membro. GeniGain ospita questo contenuto e non ne è l'autore.",
  "videoFeed.loading": "Caricamento…",

  // ── VideoUploadForm ───────────────────────────────────────────────────────
  "videoUploadForm.unreadableRetry":
    "Video illeggibile — prova con un altro file (MP4 o WebM).",
  "videoUploadForm.formatRejected":
    "Formato non accettato — serve un MP4 o un WebM. Da iPhone, scegli il video dalla libreria foto: sarà convertito automaticamente.",
  "videoUploadForm.tooHeavy":
    "Video troppo pesante ({size} MB). Massimo {max} MB — gira un video più corto o a qualità più bassa.",
  "videoUploadForm.tooLong":
    "{seconds} secondi: è troppo lungo. Massimo {max} secondi.",
  "videoUploadForm.unreadable": "Video illeggibile.",
  "videoUploadForm.chooseFirst": "Prima scegli un video.",
  "videoUploadForm.publishImpossible": "Pubblicazione impossibile per il momento.",
  "videoUploadForm.sendImpossible": "Invio impossibile.",
  "videoUploadForm.successHeading": "La tua testimonianza è online.",
  "videoUploadForm.successBody":
    "Appare nella diretta, legata all'appello su {target}.",
  "videoUploadForm.seeLive": "Vedi la diretta",
  "videoUploadForm.heading": "Filma la tua testimonianza",
  "videoUploadForm.intro":
    "Massimo {maxSeconds} secondi, {maxMb} MB max. Il tuo video è pubblicato a tuo nome, legato a questo appello — e resti responsabile di ciò che vi affermi, esattamente come per un appello scritto.",
  "videoUploadForm.fileLabel": "Il tuo video",
  "videoUploadForm.fileMetaPoster": "{seconds} s · {width}×{height} · miniatura catturata",
  "videoUploadForm.fileMetaNoPoster": "{seconds} s · {width}×{height} · nessuna miniatura",
  "videoUploadForm.captionLabel": "Cosa mostra il tuo video",
  "videoUploadForm.captionPlaceholder":
    "Di' in una frase cosa si vede e cosa dimostra…",
  "videoUploadForm.uploading": "Invio del video…",
  "videoUploadForm.publishing": "Pubblicazione…",
  "videoUploadForm.submit": "Pubblica la mia testimonianza",

  // ── DeepAnalysis ──────────────────────────────────────────────────────────
  "deepAnalysis.inProgress": "Analisi approfondita dell'IA in corso...",

  // ── PartnershipAnalysisPanel ──────────────────────────────────────────────
  "partnershipAnalysisPanel.verdictFavorable": "Offerta a prima vista sana",
  "partnershipAnalysisPanel.verdictPrudence": "Da chiarire prima di impegnarsi",
  "partnershipAnalysisPanel.verdictDeconseille": "Segnali di truffa — sconsigliato",
  "partnershipAnalysisPanel.signalDanger": "Pericolo",
  "partnershipAnalysisPanel.signalAttention": "Attenzione",
  "partnershipAnalysisPanel.signalInfo": "Info",
  "partnershipAnalysisPanel.heading": "Copilota IA",
  "partnershipAnalysisPanel.engineDeep": "Analisi approfondita · Claude",
  "partnershipAnalysisPanel.engineQuick": "Analisi rapida",
  "partnershipAnalysisPanel.reliabilityLabel": "Affidabilità",
  "partnershipAnalysisPanel.reliabilitySub": "Il brand sembra reale?",
  "partnershipAnalysisPanel.fairnessLabel": "Equità",
  "partnershipAnalysisPanel.fairnessSub": "Compenso vs lavoro richiesto",
  "partnershipAnalysisPanel.signalsHeading": "Segnali rilevati",
  "partnershipAnalysisPanel.questionsHeading": "Da chiedere prima di impegnarti",

  // ── PartnershipForm ───────────────────────────────────────────────────────
  "partnershipForm.brandNameLabel": "Brand / azienda *",
  "partnershipForm.brandNamePlaceholder": "es.: Studio Nova",
  "partnershipForm.contactNameLabel": "Il vostro nome",
  "partnershipForm.contactNamePlaceholder": "es.: Giulia Bianchi",
  "partnershipForm.emailLabel": "Email professionale *",
  "partnershipForm.emailPlaceholder": "nome@vostro-brand.com",
  "partnershipForm.websiteLabel": "Sito web",
  "partnershipForm.websitePlaceholder": "https://vostro-brand.com",
  "partnershipForm.compensationLabel": "Compenso proposto *",
  "partnershipForm.compensationPlaceholder": "Scegli…",
  "partnershipForm.budgetLabel": "Budget proposto ($)",
  "partnershipForm.budgetPlaceholder": "es.: 300",
  "partnershipForm.budgetHint": "Se il compenso è in denaro — siate trasparenti.",
  "partnershipForm.messageLabel": "La vostra proposta *",
  "partnershipForm.messagePlaceholder":
    "Chi siete, perché questo progetto, cosa proponete concretamente (calendario, modalità...).",
  "partnershipForm.deliverablesLabel": "Cosa vi aspettate da chi crea",
  "partnershipForm.deliverablesPlaceholder":
    "es.: 2 post Instagram + 1 menzione in un episodio, con brief fornito.",
  "partnershipForm.pending": "Invio…",
  "partnershipForm.submit": "Invia la richiesta",
  "partnershipForm.afterSend":
    "Dopo l'invio, riceverete un link privato per seguire la risposta di chi crea il progetto.",

  // ── PartnershipResponseForm ───────────────────────────────────────────────
  "partnershipResponseForm.success":
    "Risposta inviata — il brand la scoprirà sul suo link di monitoraggio.",
  "partnershipResponseForm.replyLabel": "La tua risposta al brand",
  "partnershipResponseForm.replyHint":
    "Scritta in bozza dal copilota — rileggi, personalizza, poi scegli la tua decisione.",
  "partnershipResponseForm.pending": "Invio…",
  "partnershipResponseForm.accept": "Accetta la partnership",
  "partnershipResponseForm.decline": "Rifiuta",
} satisfies Messages["calls"];
