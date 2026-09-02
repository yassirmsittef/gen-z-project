import type { Messages } from "../types";

/**
 * Namespace `ui` — componentes transversales (lote 6): búsqueda global ⌘K,
 * compartir, denuncia, campana de notificaciones, globo de la comunidad,
 * navegación legal, insignia de reputación.
 */
export const ui = {
  // Búsqueda global (⌘K)
  "commandPalette.triggerTitle": "Buscar (⌘K)",
  "commandPalette.triggerLabel": "Buscar proyectos, salas y miembros",
  "commandPalette.dialogLabel": "Búsqueda global",
  "commandPalette.inputPlaceholder": "Buscar un proyecto, una marca, una sala, un miembro…",
  "commandPalette.inputLabel": "Buscar un proyecto, una sala o un miembro",
  "commandPalette.sectionProjects": "Proyectos",
  "commandPalette.sectionCalls": "Llamadas",
  "commandPalette.sectionRooms": "Salas",
  "commandPalette.sectionMembers": "Miembros",
  "commandPalette.replaceTarget": "Reemplazar a {target}",
  "commandPalette.callVotes": {
    one: "{count} voz",
    other: "{count} voces",
  },
  "commandPalette.callAnswerers": {
    one: "{count} reemplazo",
    other: "{count} reemplazos",
  },
  "commandPalette.callNoAnswerers": "nadie todavía",
  "commandPalette.roomMeta": {
    one: "{count} miembro · {purpose}",
    other: "{count} miembros · {purpose}",
  },
  "commandPalette.noResults": "Nada encontrado para «{query}».",
  "commandPalette.minChars": "Escribe al menos 2 caracteres — proyectos por título o pitch, miembros por nombre.",
  "commandPalette.shortcutsHint": "↑↓ navegar · ↵ abrir · esc cerrar",

  // Compartir la página actual
  "shareButton.share": "Compartir",
  "shareButton.copied": "¡Enlace copiado!",
  "shareButton.copyPrompt": "Copia el enlace del proyecto:",

  // Denuncia al equipo
  "reportButton.defaultLabel": "Denunciar",
  "reportButton.triggerTitle": "Denunciar ante el equipo",
  "reportButton.dialogLabel": "Denunciar este contenido",
  "reportButton.sentTitle": "Denuncia enviada",
  "reportButton.sentBody":
    "Gracias por cuidar de la comunidad — el equipo lo revisará. La persona señalada no es informada de tu denuncia.",
  "reportButton.close": "Cerrar",
  "reportButton.heading": "Denunciar ante el equipo",
  "reportButton.reasonLegend": "Motivo",
  "reportButton.detailLabel": "Detalle (opcional)",
  "reportButton.detailPlaceholder": "Lo que te alertó — enlaces, contexto…",
  "reportButton.sending": "Enviando…",
  "reportButton.submit": "Enviar la denuncia",
  "reportButton.cancel": "Cancelar",

  // Campana de notificaciones
  "navbarBell.title": "Notificaciones",
  "navbarBell.overflow": "9+",
  "navbarBell.srUnread": "Notificaciones ({count} sin leer)",

  // Globo de la comunidad
  "communityGlobe.loading": "Inicializando el globo…",

  // Navegación del marco legal
  "legalNav.ariaLabel": "Páginas legales",
  "legalNav.terms": "Condiciones de uso",
  "legalNav.privacy": "Privacidad",
  "legalNav.legalNotice": "Aviso legal",

  // Insignia de reputación
  "reputationBadge.title": "Reputación: {reputation}",

  // Traduction sur l'appareil (Translator du navigateur — aucun service tiers)
  "translate.action": "Traducir",
  "translate.title": "Traduce este texto a tu idioma",
  "translate.working": "Traduciendo…",
  "translate.downloading": "Descargando el modelo… {percent} %",
  "translate.showOriginal": "Ver el original",
  "translate.badge": "Traducido en tu dispositivo",
  "translate.sameLanguage": "Este texto ya está en tu idioma.",
  "translate.unavailablePair": "Este idioma no se puede traducir.",
  "translate.failed": "La traducción no salió — inténtalo de nuevo.",
  "translate.badgeService": "Traducido por un servicio externo",
  "translate.tooFast": "Demasiadas traducciones seguidas — vuelve dentro de un rato.",
  "translate.saturated": "La traducción automática no está disponible ahora mismo — inténtalo más tarde.",
  "translate.consentBody": "Tu dispositivo no sabe traducir por sí solo. Este texto se enviará a un servicio de traducción externo (Microsoft), que no lo conserva.",
  "translate.consentAccept": "De acuerdo, traducir",
  "translate.consentDecline": "No, gracias",
  "error.title": "Algo se rompió de nuestro lado.",
  "error.body": "No es por algo que hayas hecho. Inténtalo de nuevo; si persiste, escríbenos a bonjour@genigain.com.",
  "error.retry": "Reintentar",
} satisfies Messages["ui"];
