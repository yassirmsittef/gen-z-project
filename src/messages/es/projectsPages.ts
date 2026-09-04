import type { Messages } from "../types";

/**
 * Namespace `projectsPages` — las 5 páginas de servidor de /projects:
 * lista, creación (umbral incluido), ficha de proyecto, edición, colaboración.
 * Claves prefijadas por página: meta.*, hero/search/filters/sort/results/empty
 * (lista), gate/form (creación), detail.*, edit.*, partnership.*.
 */
export const projectsPages = {
  // ---------- Metadatos (una clave por página del namespace) ----------
  "meta.listTitle": "Proyectos",
  "meta.newTitle": "Lanzar un proyecto",
  "meta.detailNotFound": "Proyecto no encontrado",
  "meta.editTitle": "Editar el proyecto",
  "meta.partnershipTitle": "Proponer una colaboración",

  // ---------- /projects — la lista ----------
  "hero.title": "Los proyectos de la comunidad",
  "hero.subtitle": "Cada contribución cuenta — y es tu billete para lanzar el tuyo.",
  "search.placeholder": "Buscar un proyecto, una idea, una palabra clave…",
  "search.ariaLabel": "Buscar un proyecto",
  "search.submit": "Buscar",
  "filters.categories": "Categorías",
  "filters.allCategories": "Todas las categorías",
  "filters.statusesAndSort": "Estados y orden",
  "filters.allStatuses": "Todos los estados",
  "filters.sortLabel": "Orden",
  "sort.recent": "Más recientes",
  "sort.suivis": "Más seguidos",
  "sort.fin": "Terminan pronto",
  "sort.finances": "Más financiados",
  "results.count": {
    one: "{count} resultado",
    other: "{count} resultados",
  },
  "results.forQuery": " para «{query}»",
  "empty.title": "Ningún proyecto coincide.",
  "empty.body": "Prueba otra palabra clave, cambia de filtro — o sé quien se lance primero.",

  // ---------- /projects/new — el umbral y luego el formulario ----------
  "gate.title": "Primero, contribuye",
  "gate.body":
    "Aquí todo el mundo arrima el hombro antes de pedir: hacen falta {required} de contribuciones acumuladas (en cualquier divisa, convertidas el día del pago) para desbloquear la creación de tu proyecto.",
  "gate.progressLabel": "Tu progreso",
  "gate.percent": "{percent} %",
  "gate.progressAria": "Progreso hacia el derecho a publicar: {percent} %",
  // UNA frase por clave: el orden de las palabras pertenece a cada idioma.
  "gate.progress": "{current} de {required} — faltan {left}.",
  "gate.callLabel": "Querías reemplazar a",
  "gate.callBody": "La llamada te espera: contribuye primero y vuelve luego a tomarla.",
  "gate.callLink": "Volver a ver la llamada",
  "gate.explore": "Explorar los proyectos",
  "gate.suggestionsTitle": "Esperan tu apoyo",
  "form.title": "Lanza tu proyecto",
  "form.titleReplace": "Reemplaza a {target}",
  "form.subtitle":
    "Sé transparente con tu plan: es lo que la comunidad financia, etapa por etapa.",
  "form.subtitleReplace":
    "Alguien ha descrito lo que compraría en su lugar. Muestra cómo piensas construirlo, etapa por etapa.",

  // ---------- /projects/[slug] — la ficha del proyecto ----------
  "detail.failedTitle": "Este proyecto no salió adelante",
  "detail.failedBody": "Los contribuyentes fueron reembolsados con el depósito restante.",
  "detail.failedRebound": "Rebotar ahora →",
  "detail.failedViewer":
    "El fracaso forma parte del juego — quien lo creó es orientado hacia nuevas oportunidades.",
  "detail.completedTitle": "Proyecto realizado",
  "detail.completedBody":
    "Todas las etapas fueron validadas por la comunidad y los fondos liberados íntegramente.",
  "detail.replaces": "Se lanza para reemplazar a",
  "detail.followLoginTitle": "Inicia sesión para seguir este proyecto",
  "detail.follow": "Seguir",
  "detail.followerCount": {
    one: "{count} seguidor·a",
    other: "{count} seguidores·as",
  },
  "detail.contact": "Contactar",
  "detail.brandPartnership": "Colaboración de marca",
  "detail.ownerNotReadyOwner": "Para recibir contribuciones, activa primero tus pagos: el dinero de tus contribuyentes llega directamente a tu cuenta Stripe, en depósito, y necesita un destino.",
  "detail.ownerNotReadyCta": "Activar mis pagos",
  "detail.ownerNotReadyVisitor": "Este creador aún no ha activado la recepción de fondos: no se puede contribuir por ahora.",
  "detail.edit": "Editar",
  "detail.coverAlt": "Imagen del proyecto {title}",
  "detail.aboutTitle": "El proyecto",
  "detail.skillsLabel": "Habilidades buscadas",
  "detail.milestonesTitle": "Etapas y pruebas de avance",
  "detail.milestonesHint":
    "Los fondos se liberan etapa por etapa: quien lleva el proyecto envía una prueba y los contribuyentes votan.",
  "detail.realizeBefore": "por realizar antes del {date} · D-{days}",
  "detail.updatesTitle": "Novedades del proyecto",
  "detail.updatesByYou": "Las noticias del terreno, contadas por ti.",
  "detail.updatesBy": "Las noticias del terreno, contadas por {name}.",
  "detail.updatesEmpty": "Todavía no hay novedades — aparecerán aquí a lo largo del proyecto.",
  "detail.updateDelete": "Eliminar esta novedad",
  "detail.commentsTitle": "Discusión",
  "detail.commentsHint": "Preguntas, ánimos, echar una mano — la comunidad del proyecto.",
  "detail.commentsLogin": "Inicia sesión",
  "detail.commentsLoginSuffix": "para participar en la discusión.",
  "detail.commentsEmpty": "Nadie ha comentado todavía — ¡abre tú la discusión!",
  "detail.commentReport": "Denunciar este comentario",
  "detail.commentDelete": "Eliminar este comentario",
  "detail.ofGoal": "de {goal}",
  "detail.contributorCount": {
    one: "{count} contribuyente",
    other: "{count} contribuyentes",
  },
  "detail.daysLeft": "{count} d restantes",
  "detail.campaignEnded": "Campaña terminada el {date}",
  "detail.releasedNote":
    "liberados sobre {raised} — el resto está en depósito hasta la validación de las etapas.",
  "detail.ownerShareHint": "Es tu proyecto — compártelo para alcanzar tu objetivo.",
  "detail.loginToContribute": "Inicia sesión para contribuir",
  "detail.contributorsTitle": "Contribuyentes",
  "detail.moreContributors": "+ {count} más",
  "detail.anonymous": "Contribuciones anónimas",

  // ---------- /projects/[slug]/modifier ----------
  "edit.back": "Volver al proyecto",
  "edit.title": "Editar el proyecto",
  "edit.frozenLabel": "Marco financiero congelado",
  "edit.frozenSummary": {
    one: "Objetivo {goal} · fin de campaña el {date} · {count} etapa ({amounts})",
    other: "Objetivo {goal} · fin de campaña el {date} · {count} etapas ({amounts})",
  },
  "edit.frozenHint":
    "Las contribuciones se han comprometido con estas reglas: objetivo, etapas y duración ya no pueden cambiar.",
  "edit.frozenClosed":
    "La campaña ha terminado: el contenido del proyecto queda congelado. Sigue siendo consultable por la comunidad, con sus pruebas y su historial.",
  "edit.dangerLabel": "Zona de retirada",
  "edit.deleteHint":
    "Todavía no ha contribuido nadie: puedes retirar este proyecto definitivamente. Etapas, comentarios y seguidores·as se irán con él — no hay vuelta atrás.",
  "edit.cancelMembers": {
    one: "{count} miembro ha contribuido.",
    other: "{count} miembros han contribuido.",
  },
  "edit.cancelBodyRefund":
    "Ya no puedes retirarlo sin más, pero sí detenerlo: pasará a «no alcanzado» y {amount} —el depósito restante— se reembolsarán a los contribuyentes.",
  "edit.cancelBodyNoRefund":
    "Ya no puedes retirarlo sin más, pero sí detenerlo: pasará a «no alcanzado» y {amount} —el depósito restante— se reembolsarían a los contribuyentes.",
  "edit.cancelReleased":
    "Los {released} ya liberados por los votos no se ven afectados.",
  "edit.closedHint":
    "Este proyecto ha terminado su ciclo: sigue siendo consultable por la comunidad, con su historial.",

  // ---------- /projects/[slug]/partenariat ----------
  "partnership.back": "Volver al proyecto",
  "partnership.title": "Proponer una colaboración",
  "partnership.intro":
    "¿Representa a una marca y quiere colaborar con {owner} en torno a «{title}»? Describa su propuesta — cuanto más precisa y transparente sea, antes tendrá respuesta.",
} satisfies Messages["projectsPages"];
