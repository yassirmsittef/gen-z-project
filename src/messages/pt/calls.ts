import type { Messages } from "../types";

/**
 * Namespace `calls` — o fio dos apelos, o direto em vídeo e as parcerias:
 * cartões e formulários de apelo, apoio, testemunhos filmados, copiloto IA.
 */
export const calls = {
  // ── CallAnswerForm ────────────────────────────────────────────────────────
  "callAnswerForm.emptyHeading": "Podes ser o substituto",
  "callAnswerForm.emptyBody":
    "Lança um projeto que responda a este apelo: os apoiantes são os teus primeiros contribuidores, e serão avisados assim que te declarares.",
  "callAnswerForm.launchReplacement": "Lançar o substituto de {target}",
  "callAnswerForm.heading": "Um dos teus projetos responde a este apelo?",
  "callAnswerForm.body":
    "Declara-o: quem lançou o apelo e todos os apoiantes serão avisados.",
  "callAnswerForm.projectLabel": "O teu projeto",
  "callAnswerForm.projectPlaceholder": "Escolher um projeto…",
  "callAnswerForm.success":
    "Está declarado — os apoiantes do apelo acabaram de ser avisados.",
  "callAnswerForm.pending": "A guardar…",
  "callAnswerForm.submit": "O meu projeto substitui {target}",

  // ── CallCard ──────────────────────────────────────────────────────────────
  "callCard.replacementCount": {
    one: "{count} substituto",
    other: "{count} substitutos",
  },
  "callCard.nobodyYet": "Ainda ninguém",
  "callCard.noLongerWants": "Já não quer",
  "callCard.instead": "Em vez disso",
  "callCard.anonymousAuthor": "Autor anónimo",
  "callCard.memberFallback": "Membro",
  "callCard.takeCall": "Agarrar este apelo",

  // ── CallCommentForm ───────────────────────────────────────────────────────
  "callCommentForm.placeholder":
    "Acrescenta uma precisão, uma fonte, uma nuance — ou diz porque não concordas…",
  "callCommentForm.replyAria": "A tua resposta",
  "callCommentForm.pending": "A enviar…",
  "callCommentForm.submit": "Responder",
  "callCommentForm.disclaimer":
    "Publicado em teu nome. A contradição é bem-vinda, o ataque pessoal não.",

  // ── CallSupportButton ─────────────────────────────────────────────────────
  "callSupportButton.removeVoiceAria": {
    one: "Retirar a minha voz — {count} apoio",
    other: "Retirar a minha voz — {count} apoios",
  },
  "callSupportButton.supportAria": {
    one: "Também quero isto substituído — {count} apoio",
    other: "Também quero isto substituído — {count} apoios",
  },
  "callSupportButton.removeVoice": "Retirar a minha voz",
  "callSupportButton.support": "Também quero isto substituído",
  "callSupportButton.signInToSupport": "Inicia sessão para apoiares este apelo",
  "callSupportButton.supported": "Apoiado",
  "callSupportButton.supportShort": "Quero isto substituído",

  // ── CreateCallForm ────────────────────────────────────────────────────────
  "createCallForm.charterHeading": "O que assinas ao publicar",
  "createCallForm.charterBody":
    "O teu apelo é publicado em teu nome. A GeniGain aloja este fio, não o escreve nem o faz seu — continuas responsável pelo que afirmas.",
  "createCallForm.targetLabel": "A marca ou a empresa",
  "createCallForm.targetPlaceholder": "O nome, simplesmente…",
  "createCallForm.targetHint":
    "Uma empresa — nunca uma pessoa nem uma comunidade.",
  "createCallForm.categoryLabel": "O setor a substituir",
  "createCallForm.categoryPlaceholder": "Escolher…",
  "createCallForm.categoryHint":
    "É aqui que quem leva projetos virá procurar apelos para agarrar.",
  "createCallForm.reasonLabel": "Porque já não a queres",
  "createCallForm.reasonPlaceholder":
    "Conta o que constataste, viveste, leste. Distingue o que sabes do que supões…",
  "createCallForm.reasonHint":
    "{min} caracteres no mínimo. Os factos que afirmas comprometem-te — as fontes servem para isso.",
  "createCallForm.wantedLabel": "O que queres em vez disso",
  "createCallForm.wantedPlaceholder":
    "O produto ou serviço que comprarias amanhã se existisse — e em que condições…",
  "createCallForm.wantedHint":
    "É a parte que faz nascer um projeto. Entra nos detalhes: quem leva um projeto deve poder lê-la como um caderno de encargos.",
  "createCallForm.sourcesLabel": "Fontes (facultativo)",
  "createCallForm.sourcesHint":
    "Um link por linha, {max} no máximo, em https. Um apelo com fontes resiste; um apelo sem fontes cai à primeira denúncia.",
  "createCallForm.pending": "A publicar…",
  "createCallForm.anonymousStrong": "Publicar anonimamente",
  "createCallForm.anonymousRest": "o teu nome não será mostrado. Guardamos uma ligação interna para moderação e limites, mas ninguém consegue chegar a ti a partir do apelo.",
  "createCallForm.submit": "Publicar o apelo",
  "createCallForm.withdrawNote": "Podes retirá-lo a qualquer momento.",

  // ── VideoFeed ─────────────────────────────────────────────────────────────
  "videoFeed.emptyHeading": "Ainda ninguém filmou.",
  "videoFeed.emptyBody":
    "Um testemunho liga-se sempre a um apelo: abre um apelo do fio e conta, de frente para a câmara, porque já não queres essa marca.",
  "videoFeed.seeCalls": "Ver os apelos",
  "videoFeed.soundOn": "Ativar o som",
  "videoFeed.soundOff": "Cortar o som",
  "videoFeed.resume": "Retomar",
  "videoFeed.pause": "Pausar",
  "videoFeed.resumePlayback": "Retomar a reprodução",
  "videoFeed.unreadable": "O teu navegador não consegue reproduzir este vídeo.",
  "videoFeed.openInNewTab": "Abrir num novo separador",
  "videoFeed.noLongerWants": "Já não quer",
  "videoFeed.memberFallback": "Membro",
  // O número aparece AO LADO (span mono); `count` é passado para que
  // outras línguas possam concordar via um objeto plural.
  "videoFeed.voicesOnCall": "vozes neste apelo",
  "videoFeed.withdraw": "Retirar",
  "videoFeed.hostDisclaimer":
    "Testemunho publicado por um membro. A GeniGain aloja este conteúdo e não é a sua autora.",
  "videoFeed.loading": "A carregar…",

  // ── VideoUploadForm ───────────────────────────────────────────────────────
  "videoUploadForm.unreadableRetry":
    "Vídeo ilegível — tenta outro ficheiro (MP4 ou WebM).",
  "videoUploadForm.formatRejected":
    "Formato não aceite — é preciso um MP4 ou um WebM. Num iPhone, escolhe o vídeo na fototeca: será convertido automaticamente.",
  "videoUploadForm.tooHeavy":
    "Vídeo demasiado pesado ({size} MB). Máximo {max} MB — filma mais curto ou com menos qualidade.",
  "videoUploadForm.tooLong":
    "{seconds} segundos é demasiado. Máximo de {max} segundos.",
  "videoUploadForm.unreadable": "Vídeo ilegível.",
  "videoUploadForm.chooseFirst": "Escolhe primeiro um vídeo.",
  "videoUploadForm.publishImpossible": "Publicação impossível de momento.",
  "videoUploadForm.sendImpossible": "Envio impossível.",
  "videoUploadForm.successHeading": "O teu testemunho está online.",
  "videoUploadForm.successBody":
    "Aparece no direto, ligado ao apelo sobre {target}.",
  "videoUploadForm.seeLive": "Ver o direto",
  "videoUploadForm.heading": "Filma o teu testemunho",
  "videoUploadForm.intro":
    "{maxSeconds} segundos no máximo, {maxMb} MB máx. O teu vídeo é publicado em teu nome, ligado a este apelo — e continuas responsável pelo que lá afirmas, exatamente como num apelo escrito.",
  "videoUploadForm.fileLabel": "O teu vídeo",
  "videoUploadForm.fileMetaPoster": "{seconds} s · {width}×{height} · miniatura capturada",
  "videoUploadForm.fileMetaNoPoster": "{seconds} s · {width}×{height} · sem miniatura",
  "videoUploadForm.captionLabel": "O que mostra o teu vídeo",
  "videoUploadForm.captionPlaceholder":
    "Diz numa frase o que se vê e o que isso prova…",
  "videoUploadForm.uploading": "A enviar o vídeo…",
  "videoUploadForm.publishing": "A publicar…",
  "videoUploadForm.submit": "Publicar o meu testemunho",

  // ── DeepAnalysis ──────────────────────────────────────────────────────────
  "deepAnalysis.inProgress": "Análise aprofundada pela IA em curso...",

  // ── PartnershipAnalysisPanel ──────────────────────────────────────────────
  "partnershipAnalysisPanel.verdictFavorable": "Oferta à partida saudável",
  "partnershipAnalysisPanel.verdictPrudence": "A clarificar antes de avançar",
  "partnershipAnalysisPanel.verdictDeconseille": "Sinais de burla — desaconselhado",
  "partnershipAnalysisPanel.signalDanger": "Perigo",
  "partnershipAnalysisPanel.signalAttention": "Atenção",
  "partnershipAnalysisPanel.signalInfo": "Info",
  "partnershipAnalysisPanel.heading": "Copiloto IA",
  "partnershipAnalysisPanel.engineDeep": "Análise aprofundada · Claude",
  "partnershipAnalysisPanel.engineQuick": "Análise rápida",
  "partnershipAnalysisPanel.reliabilityLabel": "Fiabilidade",
  "partnershipAnalysisPanel.reliabilitySub": "A marca parece real?",
  "partnershipAnalysisPanel.fairnessLabel": "Equidade",
  "partnershipAnalysisPanel.fairnessSub": "Contrapartida vs. trabalho pedido",
  "partnershipAnalysisPanel.signalsHeading": "Sinais detetados",
  "partnershipAnalysisPanel.questionsHeading": "A perguntar antes de te comprometeres",

  // ── PartnershipForm ───────────────────────────────────────────────────────
  "partnershipForm.brandNameLabel": "Marca / empresa *",
  "partnershipForm.brandNamePlaceholder": "ex.: Studio Nova",
  "partnershipForm.contactNameLabel": "O seu nome",
  "partnershipForm.contactNamePlaceholder": "ex.: Rita Fonseca",
  "partnershipForm.emailLabel": "Email profissional *",
  "partnershipForm.emailPlaceholder": "nome@sua-marca.com",
  "partnershipForm.websiteLabel": "Site",
  "partnershipForm.websitePlaceholder": "https://sua-marca.com",
  "partnershipForm.compensationLabel": "Contrapartida proposta *",
  "partnershipForm.compensationPlaceholder": "Escolher…",
  "partnershipForm.budgetLabel": "Orçamento proposto ($)",
  "partnershipForm.budgetPlaceholder": "ex.: 300",
  "partnershipForm.budgetHint": "Se houver remuneração em dinheiro — seja transparente.",
  "partnershipForm.messageLabel": "A sua proposta *",
  "partnershipForm.messagePlaceholder":
    "Quem é, porquê este projeto, o que propõe concretamente (calendário, modalidades...).",
  "partnershipForm.deliverablesLabel": "O que espera do criador ou da criadora",
  "partnershipForm.deliverablesPlaceholder":
    "ex.: 2 posts no Instagram + 1 menção num episódio, com briefing fornecido.",
  "partnershipForm.pending": "A enviar…",
  "partnershipForm.submit": "Enviar o pedido",
  "partnershipForm.afterSend":
    "Após o envio, receberá um link privado para acompanhar a resposta do criador ou da criadora.",

  // ── PartnershipResponseForm ───────────────────────────────────────────────
  "partnershipResponseForm.success":
    "Resposta enviada — a marca vai descobri-la no seu link de acompanhamento.",
  "partnershipResponseForm.replyLabel": "A tua resposta à marca",
  "partnershipResponseForm.replyHint":
    "Pré-redigida pelo copiloto — relê, personaliza e escolhe a tua decisão.",
  "partnershipResponseForm.pending": "A enviar…",
  "partnershipResponseForm.accept": "Aceitar a parceria",
  "partnershipResponseForm.decline": "Recusar",
} satisfies Messages["calls"];
