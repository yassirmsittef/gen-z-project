import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `calls` — le fil des appels, le direct vidéo et les partenariats :
 * cartes et formulaires d'appel, soutien, témoignages filmés, copilote IA.
 */
export const calls = {
  // ── CallAnswerForm ────────────────────────────────────────────────────────
  "callAnswerForm.emptyHeading": "Tu peux être le remplaçant",
  "callAnswerForm.emptyBody":
    "Lance un projet qui répond à cet appel : ses soutiens sont tes premiers contributeurs, et ils seront prévenus dès que tu te déclares.",
  "callAnswerForm.launchReplacement": "Lancer le remplaçant de {target}",
  "callAnswerForm.heading": "Un de tes projets y répond ?",
  "callAnswerForm.body":
    "Déclare-le : l'auteur de l'appel et tous ses soutiens seront prévenus.",
  "callAnswerForm.projectLabel": "Ton projet",
  "callAnswerForm.projectPlaceholder": "Choisir un projet…",
  "callAnswerForm.success":
    "C'est déclaré — les soutiens de l'appel viennent d'être prévenus.",
  "callAnswerForm.pending": "Enregistrement…",
  "callAnswerForm.submit": "Mon projet remplace {target}",

  // ── CallCard ──────────────────────────────────────────────────────────────
  "callCard.replacementCount": {
    one: "{count} remplaçant",
    other: "{count} remplaçants",
  },
  "callCard.nobodyYet": "Personne encore",
  "callCard.noLongerWants": "Ne veut plus de",
  "callCard.instead": "À la place",
  "callCard.anonymousAuthor": "Auteur anonyme",
  "callCard.memberFallback": "Membre",
  "callCard.takeCall": "Prendre cet appel",

  // ── CallCommentForm ───────────────────────────────────────────────────────
  "callCommentForm.placeholder":
    "Apporte une précision, une source, une nuance — ou dis pourquoi tu n'es pas d'accord…",
  "callCommentForm.replyAria": "Ta réponse",
  "callCommentForm.pending": "Envoi…",
  "callCommentForm.submit": "Répondre",
  "callCommentForm.disclaimer":
    "Publié sous ton nom. La contradiction est bienvenue, l'attaque personnelle non.",

  // ── CallSupportButton ─────────────────────────────────────────────────────
  "callSupportButton.removeVoiceAria": {
    one: "Retirer ma voix — {count} soutien",
    other: "Retirer ma voix — {count} soutiens",
  },
  "callSupportButton.supportAria": {
    one: "Je veux ça remplacé aussi — {count} soutien",
    other: "Je veux ça remplacé aussi — {count} soutiens",
  },
  "callSupportButton.removeVoice": "Retirer ma voix",
  "callSupportButton.support": "Je veux ça remplacé aussi",
  "callSupportButton.signInToSupport": "Connecte-toi pour soutenir cet appel",
  "callSupportButton.supported": "Soutenu",
  "callSupportButton.supportShort": "Je veux ça remplacé",

  // ── CreateCallForm ────────────────────────────────────────────────────────
  "createCallForm.charterHeading": "Ce que tu signes en publiant",
  "createCallForm.charterBody":
    "Ton appel est publié sous ton nom. GeniGain héberge ce fil, ne l'écrit pas et ne le fait pas sien — tu restes responsable de ce que tu affirmes.",
  "createCallForm.targetLabel": "La marque ou l'entreprise",
  "createCallForm.targetPlaceholder": "Le nom, simplement…",
  "createCallForm.targetHint":
    "Une entreprise — jamais une personne ni une communauté.",
  "createCallForm.categoryLabel": "Le secteur à remplacer",
  "createCallForm.categoryPlaceholder": "Choisir…",
  "createCallForm.categoryHint":
    "C'est là que les porteurs viendront chercher des appels à prendre.",
  "createCallForm.reasonLabel": "Pourquoi tu n'en veux plus",
  "createCallForm.reasonPlaceholder":
    "Raconte ce que tu as constaté, vécu, lu. Distingue ce que tu sais de ce que tu supposes…",
  "createCallForm.reasonHint":
    "{min} caractères minimum. Les faits que tu avances t'engagent — les sources sont là pour ça.",
  "createCallForm.wantedLabel": "Ce que tu veux à la place",
  "createCallForm.wantedPlaceholder":
    "Le produit ou le service que tu achèterais demain s'il existait — et à quelles conditions…",
  "createCallForm.wantedHint":
    "C'est la partie qui fait naître un projet. Sois précis : un porteur doit pouvoir la lire comme un cahier des charges.",
  "createCallForm.sourcesLabel": "Sources (facultatif)",
  "createCallForm.sourcesHint":
    "Un lien par ligne, {max} maximum, en https. Un appel sourcé résiste ; un appel sans source tombe au premier signalement.",
  "createCallForm.pending": "Publication…",
  "createCallForm.anonymousStrong": "Publier anonymement",
  "createCallForm.anonymousRest": "ton nom ne sera pas affiché. Nous gardons un lien interne pour la modération et les plafonds, mais personne ne peut remonter jusqu'à toi depuis l'appel.",
  "createCallForm.submit": "Publier l'appel",
  "createCallForm.withdrawNote": "Tu pourras le retirer toi-même à tout moment.",

  // ── VideoFeed ─────────────────────────────────────────────────────────────
  "videoFeed.emptyHeading": "Personne n'a encore filmé.",
  "videoFeed.emptyBody":
    "Un témoignage se rattache toujours à un appel : ouvre un appel du fil et raconte, face caméra, pourquoi tu ne veux plus de cette marque.",
  "videoFeed.seeCalls": "Voir les appels",
  "videoFeed.soundOn": "Activer le son",
  "videoFeed.soundOff": "Couper le son",
  "videoFeed.resume": "Reprendre",
  "videoFeed.pause": "Mettre en pause",
  "videoFeed.resumePlayback": "Reprendre la lecture",
  "videoFeed.unreadable": "Ton navigateur ne sait pas lire cette vidéo.",
  "videoFeed.openInNewTab": "L'ouvrir dans un nouvel onglet",
  "videoFeed.noLongerWants": "Ne veut plus de",
  "videoFeed.memberFallback": "Membre",
  // Le nombre est rendu À CÔTÉ (span mono) ; `count` est passé pour que
  // d'autres langues puissent accorder via un objet pluriel.
  "videoFeed.voicesOnCall": "voix sur cet appel",
  "videoFeed.withdraw": "Retirer",
  "videoFeed.hostDisclaimer":
    "Témoignage publié par un membre. GeniGain héberge ce contenu et n'en est pas l'auteur.",
  "videoFeed.loading": "Chargement…",

  // ── VideoUploadForm ───────────────────────────────────────────────────────
  "videoUploadForm.unreadableRetry":
    "Vidéo illisible — essaie un autre fichier (MP4 ou WebM).",
  "videoUploadForm.formatRejected":
    "Format non accepté — il faut un MP4 ou un WebM. Depuis un iPhone, choisis la vidéo dans la photothèque : elle sera convertie automatiquement.",
  "videoUploadForm.tooHeavy":
    "Vidéo trop lourde ({size} Mo). Maximum {max} Mo — filme plus court ou en qualité moindre.",
  "videoUploadForm.tooLong":
    "{seconds} secondes, c'est trop long. {max} secondes maximum.",
  "videoUploadForm.unreadable": "Vidéo illisible.",
  "videoUploadForm.chooseFirst": "Choisis d'abord une vidéo.",
  "videoUploadForm.publishImpossible": "Publication impossible pour le moment.",
  "videoUploadForm.sendImpossible": "Envoi impossible.",
  "videoUploadForm.successHeading": "Ton témoignage est en ligne.",
  "videoUploadForm.successBody":
    "Il apparaît dans le direct, rattaché à l'appel sur {target}.",
  "videoUploadForm.seeLive": "Voir le direct",
  "videoUploadForm.heading": "Filme ton témoignage",
  "videoUploadForm.intro":
    "{maxSeconds} secondes maximum, {maxMb} Mo max. Ta vidéo est publiée sous ton nom, rattachée à cet appel — et tu restes responsable de ce que tu y affirmes, exactement comme pour un appel écrit.",
  "videoUploadForm.fileLabel": "Ta vidéo",
  "videoUploadForm.fileMetaPoster": "{seconds} s · {width}×{height} · vignette capturée",
  "videoUploadForm.fileMetaNoPoster": "{seconds} s · {width}×{height} · pas de vignette",
  "videoUploadForm.captionLabel": "Ce que montre ta vidéo",
  "videoUploadForm.captionPlaceholder":
    "Dis en une phrase ce qu'on voit et ce que ça prouve…",
  "videoUploadForm.uploading": "Envoi de la vidéo…",
  "videoUploadForm.publishing": "Publication…",
  "videoUploadForm.submit": "Publier mon témoignage",

  // ── DeepAnalysis ──────────────────────────────────────────────────────────
  "deepAnalysis.inProgress": "Analyse approfondie par l'IA en cours...",

  // ── PartnershipAnalysisPanel ──────────────────────────────────────────────
  "partnershipAnalysisPanel.verdictFavorable": "Offre a priori saine",
  "partnershipAnalysisPanel.verdictPrudence": "À clarifier avant de s'engager",
  "partnershipAnalysisPanel.verdictDeconseille": "Signaux d'arnaque — déconseillé",
  "partnershipAnalysisPanel.signalDanger": "Danger",
  "partnershipAnalysisPanel.signalAttention": "Attention",
  "partnershipAnalysisPanel.signalInfo": "Info",
  "partnershipAnalysisPanel.heading": "Copilote IA",
  "partnershipAnalysisPanel.engineDeep": "Analyse approfondie · Claude",
  "partnershipAnalysisPanel.engineQuick": "Analyse rapide",
  "partnershipAnalysisPanel.reliabilityLabel": "Fiabilité",
  "partnershipAnalysisPanel.reliabilitySub": "La marque semble-t-elle réelle ?",
  "partnershipAnalysisPanel.fairnessLabel": "Équité",
  "partnershipAnalysisPanel.fairnessSub": "Contrepartie vs travail demandé",
  "partnershipAnalysisPanel.signalsHeading": "Signaux détectés",
  "partnershipAnalysisPanel.questionsHeading": "À demander avant de t'engager",

  // ── PartnershipForm ───────────────────────────────────────────────────────
  "partnershipForm.brandNameLabel": "Marque / entreprise *",
  "partnershipForm.brandNamePlaceholder": "ex : Studio Nova",
  "partnershipForm.contactNameLabel": "Votre nom",
  "partnershipForm.contactNamePlaceholder": "ex : Camille Perrin",
  "partnershipForm.emailLabel": "Email professionnel *",
  "partnershipForm.emailPlaceholder": "prenom@votre-marque.com",
  "partnershipForm.websiteLabel": "Site web",
  "partnershipForm.websitePlaceholder": "https://votre-marque.com",
  "partnershipForm.compensationLabel": "Contrepartie proposée *",
  "partnershipForm.compensationPlaceholder": "Choisir…",
  "partnershipForm.budgetLabel": "Budget proposé ($)",
  "partnershipForm.budgetPlaceholder": "ex : 300",
  "partnershipForm.budgetHint": "Si rémunération en argent — soyez transparent.",
  "partnershipForm.messageLabel": "Votre proposition *",
  "partnershipForm.messagePlaceholder":
    "Qui vous êtes, pourquoi ce projet, ce que vous proposez concrètement (calendrier, modalités...).",
  "partnershipForm.deliverablesLabel": "Ce que vous attendez du créateur",
  "partnershipForm.deliverablesPlaceholder":
    "ex : 2 posts Instagram + 1 mention dans un épisode, avec brief fourni.",
  "partnershipForm.pending": "Envoi…",
  "partnershipForm.submit": "Envoyer la demande",
  "partnershipForm.afterSend":
    "Après envoi, vous recevrez un lien privé pour suivre la réponse du créateur ou de la créatrice.",

  // ── PartnershipResponseForm ───────────────────────────────────────────────
  "partnershipResponseForm.success":
    "Réponse envoyée — la marque la découvrira sur son lien de suivi.",
  "partnershipResponseForm.replyLabel": "Ta réponse à la marque",
  "partnershipResponseForm.replyHint":
    "Pré-rédigée par le copilote — relis, personnalise, puis choisis ta décision.",
  "partnershipResponseForm.pending": "Envoi…",
  "partnershipResponseForm.accept": "Accepter le partenariat",
  "partnershipResponseForm.decline": "Refuser",
} as const satisfies Dict;
