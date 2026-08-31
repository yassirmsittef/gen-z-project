import type { Messages } from "../types";

/**
 * Namespace `calls` — el hilo de las llamadas, el directo en vídeo y las
 * colaboraciones: tarjetas y formularios de llamada, apoyo, testimonios
 * filmados, copiloto IA.
 */
export const calls = {
  // ── CallAnswerForm ────────────────────────────────────────────────────────
  "callAnswerForm.emptyHeading": "Tú puedes ser el reemplazo",
  "callAnswerForm.emptyBody":
    "Lanza un proyecto que responda a esta llamada: sus apoyos son tus primeros contribuyentes, y serán avisados en cuanto te declares.",
  "callAnswerForm.launchReplacement": "Lanzar el reemplazo de {target}",
  "callAnswerForm.heading": "¿Alguno de tus proyectos responde?",
  "callAnswerForm.body":
    "Decláralo: quien lanzó la llamada y todos sus apoyos serán avisados.",
  "callAnswerForm.projectLabel": "Tu proyecto",
  "callAnswerForm.projectPlaceholder": "Elegir un proyecto…",
  "callAnswerForm.success":
    "Declarado — los apoyos de la llamada acaban de ser avisados.",
  "callAnswerForm.pending": "Guardando…",
  "callAnswerForm.submit": "Mi proyecto reemplaza a {target}",

  // ── CallCard ──────────────────────────────────────────────────────────────
  "callCard.replacementCount": {
    one: "{count} reemplazo",
    other: "{count} reemplazos",
  },
  "callCard.nobodyYet": "Nadie todavía",
  "callCard.noLongerWants": "Ya no quiere",
  "callCard.instead": "En su lugar",
  "callCard.memberFallback": "Miembro",
  "callCard.takeCall": "Responder a esta llamada",

  // ── CallCommentForm ───────────────────────────────────────────────────────
  "callCommentForm.placeholder":
    "Aporta una precisión, una fuente, un matiz — o di por qué no estás de acuerdo…",
  "callCommentForm.replyAria": "Tu respuesta",
  "callCommentForm.pending": "Enviando…",
  "callCommentForm.submit": "Responder",
  "callCommentForm.disclaimer":
    "Publicado con tu nombre. La contradicción es bienvenida; el ataque personal, no.",

  // ── CallSupportButton ─────────────────────────────────────────────────────
  "callSupportButton.removeVoiceAria": {
    one: "Retirar mi voz — {count} apoyo",
    other: "Retirar mi voz — {count} apoyos",
  },
  "callSupportButton.supportAria": {
    one: "Yo también quiero que lo reemplacen — {count} apoyo",
    other: "Yo también quiero que lo reemplacen — {count} apoyos",
  },
  "callSupportButton.removeVoice": "Retirar mi voz",
  "callSupportButton.support": "Yo también quiero que lo reemplacen",
  "callSupportButton.signInToSupport": "Inicia sesión para apoyar esta llamada",
  "callSupportButton.supported": "Apoyada",
  "callSupportButton.supportShort": "Quiero que lo reemplacen",

  // ── CreateCallForm ────────────────────────────────────────────────────────
  "createCallForm.charterHeading": "Lo que firmas al publicar",
  "createCallForm.charterBody":
    "Tu llamada se publica con tu nombre. GeniGain aloja este hilo, no lo escribe ni lo hace suyo — sigues siendo responsable de lo que afirmas.",
  "createCallForm.targetLabel": "La marca o la empresa",
  "createCallForm.targetPlaceholder": "El nombre, simplemente…",
  "createCallForm.targetHint":
    "Una empresa — nunca una persona ni una comunidad.",
  "createCallForm.categoryLabel": "El sector a reemplazar",
  "createCallForm.categoryPlaceholder": "Elegir…",
  "createCallForm.categoryHint":
    "Ahí es donde quienes llevan proyectos vendrán a buscar llamadas que responder.",
  "createCallForm.reasonLabel": "Por qué ya no la quieres",
  "createCallForm.reasonPlaceholder":
    "Cuenta lo que has constatado, vivido, leído. Distingue lo que sabes de lo que supones…",
  "createCallForm.reasonHint":
    "{min} caracteres como mínimo. Los hechos que afirmas te comprometen — para eso están las fuentes.",
  "createCallForm.wantedLabel": "Lo que quieres en su lugar",
  "createCallForm.wantedPlaceholder":
    "El producto o servicio que comprarías mañana si existiera — y con qué condiciones…",
  "createCallForm.wantedHint":
    "Esta es la parte que hace nacer un proyecto. Sé preciso: quien lleve un proyecto debe poder leerla como un pliego de condiciones.",
  "createCallForm.sourcesLabel": "Fuentes (opcional)",
  "createCallForm.sourcesHint":
    "Un enlace por línea, {max} como máximo, en https. Una llamada con fuentes resiste; una llamada sin fuentes cae a la primera denuncia.",
  "createCallForm.pending": "Publicando…",
  "createCallForm.submit": "Publicar la llamada",
  "createCallForm.withdrawNote": "Podrás retirarla por tu cuenta en cualquier momento.",

  // ── VideoFeed ─────────────────────────────────────────────────────────────
  "videoFeed.emptyHeading": "Nadie ha filmado todavía.",
  "videoFeed.emptyBody":
    "Un testimonio siempre va ligado a una llamada: abre una llamada del hilo y cuenta, frente a la cámara, por qué ya no quieres esa marca.",
  "videoFeed.seeCalls": "Ver las llamadas",
  "videoFeed.soundOn": "Activar el sonido",
  "videoFeed.soundOff": "Desactivar el sonido",
  "videoFeed.resume": "Reanudar",
  "videoFeed.pause": "Pausar",
  "videoFeed.resumePlayback": "Reanudar la reproducción",
  "videoFeed.unreadable": "Tu navegador no puede reproducir este vídeo.",
  "videoFeed.openInNewTab": "Abrirlo en una pestaña nueva",
  "videoFeed.noLongerWants": "Ya no quiere",
  "videoFeed.memberFallback": "Miembro",
  // El número se muestra AL LADO (span mono); `count` se pasa para que las
  // lenguas puedan concordar mediante un objeto plural — aquí hace falta.
  "videoFeed.voicesOnCall": {
    one: "voz en esta llamada",
    other: "voces en esta llamada",
  },
  "videoFeed.withdraw": "Retirar",
  "videoFeed.hostDisclaimer":
    "Testimonio publicado por un miembro. GeniGain aloja este contenido y no es su autor.",
  "videoFeed.loading": "Cargando…",

  // ── VideoUploadForm ───────────────────────────────────────────────────────
  "videoUploadForm.unreadableRetry":
    "Vídeo no reproducible — prueba con otro archivo (MP4 o WebM).",
  "videoUploadForm.formatRejected":
    "Formato no aceptado — hace falta un MP4 o un WebM. Desde un iPhone, elige el vídeo en la galería de fotos: se convertirá automáticamente.",
  "videoUploadForm.tooHeavy":
    "Vídeo demasiado pesado ({size} MB). Máximo {max} MB — graba más corto o con menor calidad.",
  "videoUploadForm.tooLong":
    "{seconds} segundos: demasiado largo. {max} segundos como máximo.",
  "videoUploadForm.unreadable": "Vídeo no reproducible.",
  "videoUploadForm.chooseFirst": "Elige primero un vídeo.",
  "videoUploadForm.publishImpossible": "Publicación imposible por el momento.",
  "videoUploadForm.sendImpossible": "Envío imposible.",
  "videoUploadForm.successHeading": "Tu testimonio está en línea.",
  "videoUploadForm.successBody":
    "Aparece en el directo, ligado a la llamada sobre {target}.",
  "videoUploadForm.seeLive": "Ver el directo",
  "videoUploadForm.heading": "Filma tu testimonio",
  "videoUploadForm.intro":
    "{maxSeconds} segundos como máximo, {maxMb} MB máx. Tu vídeo se publica con tu nombre, ligado a esta llamada — y sigues siendo responsable de lo que afirmas en él, exactamente igual que con una llamada escrita.",
  "videoUploadForm.fileLabel": "Tu vídeo",
  "videoUploadForm.fileMetaPoster": "{seconds} s · {width}×{height} · miniatura capturada",
  "videoUploadForm.fileMetaNoPoster": "{seconds} s · {width}×{height} · sin miniatura",
  "videoUploadForm.captionLabel": "Lo que muestra tu vídeo",
  "videoUploadForm.captionPlaceholder":
    "Di en una frase qué se ve y qué demuestra…",
  "videoUploadForm.uploading": "Subiendo el vídeo…",
  "videoUploadForm.publishing": "Publicando…",
  "videoUploadForm.submit": "Publicar mi testimonio",

  // ── DeepAnalysis ──────────────────────────────────────────────────────────
  "deepAnalysis.inProgress": "Análisis en profundidad por la IA en curso...",

  // ── PartnershipAnalysisPanel ──────────────────────────────────────────────
  "partnershipAnalysisPanel.verdictFavorable": "Oferta a priori sana",
  "partnershipAnalysisPanel.verdictPrudence": "Por aclarar antes de comprometerse",
  "partnershipAnalysisPanel.verdictDeconseille": "Señales de estafa — desaconsejado",
  "partnershipAnalysisPanel.signalDanger": "Peligro",
  "partnershipAnalysisPanel.signalAttention": "Atención",
  "partnershipAnalysisPanel.signalInfo": "Info",
  "partnershipAnalysisPanel.heading": "Copiloto IA",
  "partnershipAnalysisPanel.engineDeep": "Análisis en profundidad · Claude",
  "partnershipAnalysisPanel.engineQuick": "Análisis rápido",
  "partnershipAnalysisPanel.reliabilityLabel": "Fiabilidad",
  "partnershipAnalysisPanel.reliabilitySub": "¿La marca parece real?",
  "partnershipAnalysisPanel.fairnessLabel": "Equidad",
  "partnershipAnalysisPanel.fairnessSub": "Contraprestación vs. trabajo pedido",
  "partnershipAnalysisPanel.signalsHeading": "Señales detectadas",
  "partnershipAnalysisPanel.questionsHeading": "Qué preguntar antes de comprometerte",

  // ── PartnershipForm ───────────────────────────────────────────────────────
  "partnershipForm.brandNameLabel": "Marca / empresa *",
  "partnershipForm.brandNamePlaceholder": "ej.: Studio Nova",
  "partnershipForm.contactNameLabel": "Su nombre",
  "partnershipForm.contactNamePlaceholder": "ej.: Camila Pérez",
  "partnershipForm.emailLabel": "Email profesional *",
  "partnershipForm.emailPlaceholder": "nombre@su-marca.com",
  "partnershipForm.websiteLabel": "Sitio web",
  "partnershipForm.websitePlaceholder": "https://su-marca.com",
  "partnershipForm.compensationLabel": "Contraprestación propuesta *",
  "partnershipForm.compensationPlaceholder": "Elegir…",
  "partnershipForm.budgetLabel": "Presupuesto propuesto ($)",
  "partnershipForm.budgetPlaceholder": "ej.: 300",
  "partnershipForm.budgetHint": "Si hay remuneración en dinero — sea transparente.",
  "partnershipForm.messageLabel": "Su propuesta *",
  "partnershipForm.messagePlaceholder":
    "Quién es usted, por qué este proyecto, qué propone en concreto (calendario, condiciones...).",
  "partnershipForm.deliverablesLabel": "Lo que espera del creador",
  "partnershipForm.deliverablesPlaceholder":
    "ej.: 2 posts de Instagram + 1 mención en un episodio, con brief incluido.",
  "partnershipForm.pending": "Enviando…",
  "partnershipForm.submit": "Enviar la solicitud",
  "partnershipForm.afterSend":
    "Tras el envío, recibirá un enlace privado para seguir la respuesta del creador o de la creadora.",

  // ── PartnershipResponseForm ───────────────────────────────────────────────
  "partnershipResponseForm.success":
    "Respuesta enviada — la marca la descubrirá en su enlace de seguimiento.",
  "partnershipResponseForm.replyLabel": "Tu respuesta a la marca",
  "partnershipResponseForm.replyHint":
    "Prerredactada por el copiloto — relee, personaliza y elige tu decisión.",
  "partnershipResponseForm.pending": "Enviando…",
  "partnershipResponseForm.accept": "Aceptar la colaboración",
  "partnershipResponseForm.decline": "Rechazar",
} satisfies Messages["calls"];
