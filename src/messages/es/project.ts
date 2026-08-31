import type { Messages } from "../types";

/**
 * Namespace `project` — creación/edición de proyecto, contribución, etapas de
 * desbloqueo (línea de tiempo + pruebas), cabina de campaña, botones de
 * detención y retirada, comentarios, novedades, seguimiento, tarjeta de
 * proyecto.
 * (Las etiquetas compartidas CATEGORY_LABELS / STATUS_LABELS siguen en sus
 * constantes — ver lote dedicado.)
 */
export const project = {
  // ——— CreateProjectForm ———
  "createProjectForm.answersCallLabel": "Respondes a una llamada",
  "createProjectForm.replaceTarget": "Reemplazar a {target}",
  "createProjectForm.quotedWanted": "«{wanted}»",
  "createProjectForm.answersCallHelp":
    "Es el pliego de condiciones escrito por la persona que lanzó la llamada. Tu proyecto quedará declarado como reemplazo desde su creación, y todos sus apoyos serán avisados.",
  "createProjectForm.projectSection": "Tu proyecto",
  "createProjectForm.titleLabel": "Título",
  "createProjectForm.titlePlaceholder": "Ej.: EP de 5 temas — LUNA NEGRA",
  "createProjectForm.pitchLabel": "Pitch (140 caracteres máx.)",
  "createProjectForm.pitchPlaceholder": "Una frase que dé ganas de financiarte.",
  "createProjectForm.descriptionLabel": "Descripción",
  "createProjectForm.descriptionPlaceholder":
    "Cuenta: qué es, para quién, por qué tú, y para qué servirá el dinero (50 caracteres mín.).",
  "createProjectForm.categoryLabel": "Categoría",
  "createProjectForm.categoryPlaceholder": "Elegir…",
  "createProjectForm.currencyLabel": "Divisa del proyecto",
  "createProjectForm.goalLabel": "Objetivo ({currency})",
  "createProjectForm.durationLabel": "Duración de la campaña ({min}–{max} días)",
  "createProjectForm.skillsLabel": "Habilidades buscadas (opcional)",
  "createProjectForm.skillsPlaceholder": "ej.: edición, mezcla, foto — separadas por comas",
  "createProjectForm.skillsHelp": "Orientamos hacia tu proyecto a los miembros que tienen estas habilidades.",
  "createProjectForm.coverLabel": "Imagen de portada (URL, opcional)",
  "createProjectForm.milestonesSection": "Etapas de desbloqueo",
  "createProjectForm.milestonesHelp":
    "Cada etapa desbloquea un importe en {currency}, previa prueba validada por el voto ponderado de tus contribuyentes. La suma debe ser igual a tu objetivo. Una vez financiado, tienes {days} días para realizarlo todo y hacerlo validar — pasado ese plazo, el resto del depósito se reembolsa a los contribuyentes.",
  "createProjectForm.milestonesHelpStrong": "0 % de comisión GeniGain",
  "createProjectForm.milestonesHelpAfterStrong":
    "— solo las tarifas bancarias se deducen de las transferencias.",
  "createProjectForm.milestoneNumber": "Etapa {number}",
  "createProjectForm.removeMilestoneTitle": "Eliminar esta etapa",
  "createProjectForm.milestoneTitleLabel": "Título",
  "createProjectForm.milestoneTitlePlaceholder": "Ej.: Maqueta terminada",
  "createProjectForm.milestoneAmountLabel": "Importe ({currency})",
  "createProjectForm.milestoneDeliverableLabel": "Lo que entregarás",
  "createProjectForm.milestoneDeliverablePlaceholder":
    "Lo que los contribuyentes podrán verificar en esta etapa.",
  "createProjectForm.addMilestone": "Añadir una etapa",
  "createProjectForm.submitPending": "Creando…",
  "createProjectForm.submit": "Lanzar mi proyecto",

  // ——— EditProjectForm ———
  "editProjectForm.titleLabel": "Título",
  "editProjectForm.titleHelp":
    "La dirección de la página no cambia: los enlaces ya compartidos siguen funcionando.",
  "editProjectForm.pitchLabel": "Pitch (140 caracteres máx.)",
  "editProjectForm.descriptionLabel": "Descripción",
  "editProjectForm.categoryLabel": "Categoría",
  "editProjectForm.coverLabel": "Imagen de portada (URL, opcional)",
  "editProjectForm.skillsLabel": "Habilidades buscadas (opcional)",
  "editProjectForm.skillsPlaceholder": "ej.: edición, mezcla, foto — separadas por comas",
  "editProjectForm.submitPending": "Guardando…",
  "editProjectForm.submit": "Guardar los cambios",

  // ——— ContributeForm ———
  "contributeForm.freeAmountLabel": "Importe libre ({currency})",
  "contributeForm.anonymousStrong": "Contribuir de forma anónima",
  "contributeForm.anonymousRest":
    "— tu nombre no aparecerá ni en el proyecto, ni ante quien lo lleva, ni en el hilo de actividad.",
  "contributeForm.redirecting": "Redirigiendo al pago…",
  "contributeForm.submit": "Contribuir con {amount}",
  "contributeForm.feeStrong": "0 % de comisión GeniGain",
  "contributeForm.feeRest":
    "— solo se aplican las comisiones de tarjeta (fijadas por Stripe, que GeniGain ni ve ni toca).",
  "contributeForm.escrowIntro":
    "Pago seguro con Stripe. Fondos en depósito, desbloqueados etapa por etapa por el voto de los contribuyentes. Si la campaña no sale adelante, se te reembolsa",
  "contributeForm.escrowStrong": "neto de las comisiones de tarjeta",
  "contributeForm.escrowAfterStrong":
    ": Stripe no las devuelve, GeniGain no se queda ninguna.",
  "contributeForm.feesLink": "Detalle de las comisiones",

  // ——— MilestoneTimeline ———
  "milestoneTimeline.statusLocked": "Bloqueada",
  "milestoneTimeline.statusAwaitingProof": "Prueba pendiente",
  "milestoneTimeline.statusUnderReview": "Votación en curso",
  "milestoneTimeline.statusReleased": "Fondos liberados",
  "milestoneTimeline.proofCounter": "Prueba {index}/{max}",
  "milestoneTimeline.proofRejected": "Rechazada",
  "milestoneTimeline.proofApproved": "Validada",
  "milestoneTimeline.proofPending": "Votación en curso",
  "milestoneTimeline.proofImageAlt": "Prueba de avance",
  "milestoneTimeline.majorityAt": "mayoría en {amount}",
  "milestoneTimeline.alreadyVoted": "Ya has votado",
  "milestoneTimeline.approve": "Validar",
  "milestoneTimeline.reject": "Rechazar",
  "milestoneTimeline.awaitingOwnerProof":
    "A la espera de la prueba de avance de quien lleva el proyecto...",

  // ——— ProofForm ———
  "proofForm.heading": "Envía tu prueba de avance",
  "proofForm.lastAttempt": "Último intento — ¡sé convincente!",
  "proofForm.contentLabel": "Lo que has realizado",
  "proofForm.contentPlaceholder":
    "Describe en concreto lo que se hizo en esta etapa (20 caracteres mín.)…",
  "proofForm.linksLabel": "Enlaces (uno por línea, opcional)",
  "proofForm.linksPlaceholder": "https://demo.ejemplo.com\nhttps://github.com/…",
  "proofForm.imagesLabel": "Imágenes (una URL por línea, opcional)",
  "proofForm.imagesPlaceholder": "https://.../foto-taller.jpg",
  "proofForm.submitPending": "Enviando…",
  "proofForm.submit": "Enviar la prueba a votación",

  // ——— CampaignCockpit ———
  "campaignCockpit.heading": "Pilotaje — visible solo para ti",
  "campaignCockpit.dailyCollection": "Recaudación por día",
  "campaignCockpit.emptyState":
    "Aún ninguna contribución — comparte tu enlace, el contador arranca aquí.",
  "campaignCockpit.sparklineAria": {
    one: "Recaudación por día desde el lanzamiento: {amount} en {count} día.",
    other: "Recaudación por día desde el lanzamiento: {amount} en {count} días.",
  },
  "campaignCockpit.todayPoint": "{amount} hoy",
  "campaignCockpit.paceLabel": "Ritmo para conseguirlo",
  "campaignCockpit.perDay": "{amount}/día",
  "campaignCockpit.goalReached": "Objetivo alcanzado",
  "campaignCockpit.milestonesValidated": "Etapas validadas",
  "campaignCockpit.contributorsLabel": "Contribuyentes",
  "campaignCockpit.followersLabel": "Seguidores·as",
  "campaignCockpit.convertedShare": "de ellos, un {percent} % contribuyó",
  "campaignCockpit.realizeBefore": "A realizar antes del",
  "campaignCockpit.daysToDeadline": "D-{days}",

  // ——— CancelProjectButton ———
  // UNA frase, no seis fragmentos: el orden de las palabras pertenece a cada
  // idioma (el alemán y el árabe no siguen la sintaxis francesa).
  "cancelProjectButton.confirmBody":
    "Al confirmar, el proyecto pasa definitivamente a «no alcanzado» y hasta {amount} vuelve a {contributors} (neto de las comisiones de tarjeta, unos días según su banco). No hay vuelta atrás.",
  "cancelProjectButton.contributorCount": {
    one: "{count} contribuyente",
    other: "{count} contribuyentes",
  },
  "cancelProjectButton.contributorsGeneric": "los contribuyentes",
  "cancelProjectButton.confirmPending": "Deteniendo…",
  "cancelProjectButton.confirmSubmit": "Sí, detener y reembolsar",
  "cancelProjectButton.cancel": "Cancelar",
  "cancelProjectButton.arm": "Detener el proyecto",

  // ——— DeleteProjectButton ———
  "deleteProjectButton.confirmPending": "Retirando…",
  "deleteProjectButton.confirmSubmit": "Sí, retirar definitivamente",
  "deleteProjectButton.cancel": "Cancelar",
  "deleteProjectButton.arm": "Retirar el proyecto",

  // ——— CommentForm ———
  "commentForm.placeholder": "Anima, haz una pregunta, ofrece tu ayuda…",
  "commentForm.ariaLabel": "Tu comentario",
  "commentForm.submitPending": "Enviando…",
  "commentForm.submit": "Comentar",

  // ——— ProjectUpdateForm ———
  "projectUpdateForm.titleLabel": "Título de la novedad",
  "projectUpdateForm.titlePlaceholder": "ej.: ¡Llegó el equipo!",
  "projectUpdateForm.bodyLabel": "¿Qué hay de nuevo?",
  "projectUpdateForm.bodyPlaceholder":
    "Avances, entre bastidores, agradecimientos... tus contribuyentes serán notificados.",
  "projectUpdateForm.success": "Novedad publicada — contribuyentes notificados.",
  "projectUpdateForm.submitPending": "Publicando…",
  "projectUpdateForm.submit": "Publicar la novedad",

  // ——— FollowButton ———
  "followButton.unfollowTitle": "Dejar de seguir este proyecto",
  "followButton.followTitle": "Seguir este proyecto",
  "followButton.following": "Siguiendo",
  "followButton.follow": "Seguir",

  // ——— ProjectCard ———
  "projectCard.replaces": "Reemplaza a {targets}",
  "projectCard.contributions": {
    one: "{count} contribución",
    other: "{count} contribuciones",
  },
  "projectCard.daysLeft": {
    one: "{count} día restante",
    other: "{count} días restantes",
  },
} satisfies Messages["project"];
