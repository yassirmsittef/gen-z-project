import type { Messages } from "../types";

export const notif = {
  "contribution.received.title": "{actor} apoyó «{projectTitle}» ({money})",

  "contribution.confirmed.title": "Tu contribución de {money} a «{projectTitle}» está confirmada",
  "contribution.confirmed.body":
    "Los fondos entran en el depósito del proyecto: se liberarán etapa por etapa, bajo el control del voto de los contribuyentes — incluido el tuyo. Si el proyecto no sale adelante, la parte no liberada vuelve automáticamente a tu tarjeta.",

  "refund.lateClose.title": "Tu contribución a «{projectTitle}» llegó tras el cierre",
  "refund.lateClose.body":
    "La campaña terminó entretanto: tu contribución vuelve a tu tarjeta, neta de las comisiones de tarjeta que el banco no devuelve (GeniGain no se queda ninguna).",

  "refund.projectFailed.title": "Reembolso de {money} — «{projectTitle}»",
  "refund.projectFailed.body":
    "La campaña no salió adelante: tu parte del depósito restante vuelve a tu tarjeta (unos días según tu banco), neta de las comisiones de tarjeta que el banco no devuelve — GeniGain no se queda ninguna.",

  "projectFunded.owner.title": "¡Objetivo alcanzado para «{projectTitle}»!",
  "projectFunded.owner.body":
    "La recaudación ha terminado — envía la prueba de la etapa 1 para desbloquear los primeros fondos.",

  "projectFunded.supporter.title": "¡«{projectTitle}» está financiado!",
  "projectFunded.supporter.body":
    "Los fondos se liberarán etapa por etapa, bajo el control de los contribuyentes.",

  "proofToVote.title": "Prueba por examinar — «{projectTitle}»",
  "proofToVote.body": "Etapa {order}: {milestoneTitle}. Tu voto desbloquea (o no) los fondos.",

  "milestoneReleased.next.title": "Etapa {order} validada — {money} liberados",
  "milestoneReleased.next.body":
    "La comunidad validó tu prueba para «{projectTitle}». Próxima etapa: «{nextTitle}». La transferencia sale hacia tu cuenta Stripe.",

  "milestoneReleased.final.title": "Etapa {order} validada — {money} liberados",
  "milestoneReleased.final.body":
    "«{projectTitle}» está completamente realizado. ¡Enhorabuena! La transferencia final sale hacia tu cuenta Stripe.",

  "proofRejected.title": "Prueba rechazada — «{projectTitle}»",
  "proofRejected.body": {
    one: "Etapa {order}: la comunidad no validó. Te queda {count} intento — refuerza tu prueba (fotos, enlaces públicos).",
    other:
      "Etapa {order}: la comunidad no validó. Te quedan {count} intentos — refuerza tu prueba (fotos, enlaces públicos).",
  },

  "projectFailed.owner.title": "«{projectTitle}» no salió adelante",
  "projectFailed.owner.body":
    "{reason} El fracaso no es una salida: te esperan oportunidades en el recorrido de rebote.",

  "failReason.stoppedByOwner": "Proyecto detenido por quien lo llevaba.",
  "failReason.goalNotReached": "Objetivo no alcanzado antes del fin de la campaña.",
  "failReason.proofsRefused": "Las pruebas de avance fueron rechazadas por la comunidad.",
  "failReason.milestonesNotRealized":
    "Etapas no realizadas en los {days} días posteriores a la financiación.",

  "boycottAnswered.title": "Un reemplazo para {target}",
  "boycottAnswered.body": "«{projectTitle}» se lanza para reemplazar a {target}.",

  "boycottRemoved.title": "Tu llamada fue retirada",
  "boycottRemoved.body": "«{target}» — {reason}.",
  "boycottRemoved.defaultReason": "no conforme con la carta de las llamadas",

  "callComment.title": "{actor} respondió a tu llamada sobre {target}",
  "callComment.body": "{excerpt}",

  "callVideo.new.title": "{actor} filmó un testimonio sobre {target}",
  "callVideo.new.body": "{excerpt}",

  "callVideo.removed.title": "Tu testimonio filmado fue retirado",
  "callVideo.removed.body": "{excerpt}",

  "storageAlert.warn.title": "Almacenamiento alojado al {warnPct} % ({usedMo} MB de {capMo} MB)",
  "storageAlert.warn.body":
    "El almacén (testimonios del directo Y fotos de perfil) se acerca a su tope. La cabina muestra el desglose. Haz limpieza, o sube el tope del alojamiento antes de que rechace los envíos.",

  "storageAlert.full.title":
    "Almacenamiento alojado saturado ({usedMo} MB de {capMo} MB) — los envíos se rechazan",
  "storageAlert.full.body":
    "El próximo testimonio podría superar el tope: la entrega de tokens de subida queda suspendida hasta que se libere espacio.",

  "securityAlert.loginBurst.title": "Ráfaga de inicios de sesión fallidos: {count} en {minutes} min",
  "securityAlert.loginBurst.body": "Alguien está probando contraseñas a gran escala. Los bloqueos por cuenta y por dirección están activos; si continúa, activa el cortafuegos de Vercel y revisa el registro.",
  "securityAlert.dispute.title": "Disputa bancaria abierta ({reason}) — {count} contribución(es) congelada(s)",
  "securityAlert.dispute.body": "Un contribuyente impugna su pago ante su banco. Su contribución ya no cuenta en los votos ni puede abonarse. Responde a la disputa desde el panel de Stripe.",
  "securityAlert.translationSaturated.title": "Traducción automática saturada este mes",
  "securityAlert.translationSaturated.body": "Se alcanzó el límite de caracteres: «Traducir» responde «saturado» hasta el mes que viene. Un pico anormal puede ser un abuso — la tabla TranslationUsage lo muestra.",

  "groupMessage.title": "{actor} escribió en {groupName}",

  "comment.title": "{actor} comentó «{projectTitle}»",
  "comment.body": "{excerpt}",

  "projectUpdate.title": "Novedad de «{projectTitle}»: {updateTitle}",

  "message.new.title": "Nuevo mensaje de {actor}",

  "partnership.request.title": "Solicitud de colaboración de {brandName}",
  "partnership.request.body": "Para «{projectTitle}». El copiloto IA preparó su análisis.",

  "partnership.requestBudget.title": "Solicitud de colaboración de {brandName}",
  "partnership.requestBudget.body":
    "Para «{projectTitle}» · {budgetUsd} $ propuestos. El copiloto IA preparó su análisis.",

  "tombstone.CALL_VIDEO": "Este testimonio fue retirado.",
  "tombstone.CALL_COMMENT": "Esta respuesta fue retirada.",
  "tombstone.COMMENT": "Este comentario fue retirado.",
} satisfies Messages["notif"];
