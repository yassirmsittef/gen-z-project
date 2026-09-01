import type { Messages } from "../types";

/**
 * Namespace `memberPages` — las páginas del espacio de miembro (lote 7):
 * panel, notificaciones, chat (hilos privados, grupos, miembros),
 * perfil público, colaboraciones (bandeja, detalle, seguimiento de marca).
 */
export const memberPages = {
  // <title> de las páginas
  "meta.dashboardTitle": "Panel",
  "meta.notificationsTitle": "Notificaciones",
  "meta.chatTitle": "Chat",
  "meta.groupsTitle": "Grupos",
  "meta.groupTitle": "Grupo",
  "meta.groupMembersTitle": "Miembros del grupo",
  "meta.profileNotFound": "Perfil no encontrado",
  "meta.profileFallback": "Perfil",
  "meta.profileDescription": "{name} en GeniGain: reputación, proyectos y habilidades.",
  "meta.profileDescriptionCity":
    "{name} en GeniGain — {city}: reputación, proyectos y habilidades.",
  "meta.partnershipsTitle": "Colaboraciones",
  "meta.partnershipRequestTitle": "Solicitud de colaboración",
  "meta.trackingTitle": "Seguimiento de su solicitud",

  // dashboard/page.tsx
  "dashboard.connectDoneLive":
    "Configuración enviada a Stripe — tus transferencias se activan en cuanto se valide.",
  "dashboard.connectDoneTest":
    "Configuración enviada a Stripe — tus transferencias se activan en cuanto se valide (suele ser inmediato en modo de prueba).",
  "dashboard.connectRefresh":
    "La sesión de Stripe ha caducado — retoma la configuración de las transferencias cuando quieras.",
  "dashboard.greeting": "Hola {name}",
  "dashboard.tagline": "Cuartel general personal · sistemas operativos",
  "dashboard.editProfile": "Editar mi perfil",
  "dashboard.adminCockpit": "Cabina admin",
  "dashboard.reportsToHandle": {
    one: "{count} denuncia por tratar",
    other: "{count} denuncias por tratar",
  },
  "dashboard.nothingToModerate": "nada que moderar",
  "dashboard.failedTitle": "Un proyecto no salió adelante — ¿y ahora?",
  "dashboard.failedBody":
    "El fracaso no es una salida. Descubre otras oportunidades y vuelve más fuerte.",
  "dashboard.seeOpportunities": "Ver las oportunidades →",
  "dashboard.statReputation": "Reputación",
  "dashboard.nextLevelAt": "{label} a {target}",
  "dashboard.maxLevel": "Nivel máximo alcanzado",
  "dashboard.statTowardProject": "Hacia tu proyecto",
  "dashboard.gateExempt": "Fundador — publicas sin umbral",
  "dashboard.gateReached": "Umbral desbloqueado — ya puedes publicar",
  "dashboard.gateRemaining": "{amount} para poder publicar",
  "dashboard.statSupports": "Apoyos",
  "dashboard.communityPillar": "Pilar de la comunidad",
  "dashboard.supportGoal": "Objetivo: 10 proyectos apoyados",
  "dashboard.trajectoryTitle": "Tu trayectoria",
  "dashboard.pendingPartnerships": {
    one: "{count} solicitud de colaboración espera tu respuesta —",
    other: "{count} solicitudes de colaboración esperan tu respuesta —",
  },
  "dashboard.seeWithCopilot": "verlas con el copiloto IA →",
  "dashboard.myProjects": "Mis proyectos",
  "dashboard.partnershipsLink": "Colaboraciones",
  "dashboard.partnershipsLinkCount": "Colaboraciones ({count})",
  "dashboard.launchProject": "Lanzar un proyecto",
  "dashboard.noProjects":
    "Todavía ningún proyecto. Contribuye a un proyecto para desbloquear la creación del tuyo.",
  "dashboard.myCalls": "Mis llamadas",
  "dashboard.publishCall": "Publicar una llamada",
  "dashboard.replaceTarget": "Reemplazar a {target}",
  "dashboard.callVoices": "{count} voces",
  "dashboard.callAnswerers": {
    one: "{count} reemplazo",
    other: "{count} reemplazos",
  },
  "dashboard.callNoAnswerers": "ningún reemplazo por ahora",
  "dashboard.followedProjects": "Proyectos seguidos",
  "dashboard.myContributions": "Mis contribuciones",
  "dashboard.noContributions": "Ninguna contribución por ahora.",
  "dashboard.findProject": "Encuentra un proyecto que apoyar →",
  "dashboard.refunded": "reembolsada",
  "dashboard.myProfile": "Mi perfil",
  "dashboard.mySkills": "Mis habilidades",
  "dashboard.myPayouts": "Mis transferencias",
  "dashboard.security": "Seguridad",
  "dashboard.myData": "Mis datos",
  "dashboard.myDataBody":
    "Todo lo que has confiado a GeniGain (perfil, proyectos, contribuciones, votos, mensajes enviados…), en un archivo JSON — derecho a la portabilidad.",
  "dashboard.downloadMyData": "Descargar mis datos",

  // notifications/page.tsx
  "notifications.title": "Notificaciones",
  "notifications.newSince": {
    one: "{count} nueva desde tu última visita",
    other: "{count} nuevas desde tu última visita",
  },
  "notifications.allCaughtUp": "Todo al día",
  "notifications.empty":
    "Nada por ahora. Contribuciones recibidas, pruebas por votar, etapas desbloqueadas, mensajes, comentarios, novedades y solicitudes de colaboración llegarán aquí.",

  // chat/page.tsx + chat/[userId]/page.tsx — encabezado común
  "chatHeader.title": "Chat",
  "chatHeader.tagline": "Ayuda entre creadores · colabs · echar una mano",

  // chat/page.tsx
  "chatIndex.pickConversation":
    "Elige una conversación — o únete a un grupo de tu categoría para hablar entre varios.",
  "chatIndex.exploreGroups": "Explorar los grupos",

  // chat/[userId]/page.tsx
  "chatThread.allConversations": "Todas mis conversaciones",
  "chatThread.olderMessages": "Mensajes más antiguos",
  "chatThread.startConversation":
    "Empieza la conversación — propón echar una mano, una colab, un intercambio de habilidades.",
  "chatThread.backToLatest": "Volver a los últimos mensajes",

  // chat/groupes/page.tsx
  "groupsDir.title": "Grupos",
  "groupsDir.tagline": "Una sala para cada interés · ordenadas en las categorías de los proyectos",
  "groupsDir.searchPlaceholder": "Buscar una sala (nombre, tema…)",
  "groupsDir.searchLabel": "Buscar una sala",
  "groupsDir.search": "Buscar",
  "groupsDir.categoriesLabel": "Categorías de grupos",
  "groupsDir.allCategories": "Todas las categorías",
  "groupsDir.noRoomForQuery": "Ninguna sala habla de «{query}».",
  "groupsDir.noRoomForQueryInCategory": "Ninguna sala habla de «{query}» en {category}.",
  "groupsDir.noGroupInCategory": "Ningún grupo en {category} por ahora.",
  "groupsDir.noGroup": "Ningún grupo por ahora.",
  "groupsDir.tryAnotherWord": "Prueba otra palabra, o abre la sala que falta.",
  "groupsDir.openFirst": "Abre el primero — suele ser el que reúne.",
  "groupsDir.officialRoomCategory": "Sala de bienvenida · {category}",
  "groupsDir.openThread": "Abrir el hilo",

  // chat/groupes/[slug]/page.tsx
  // Rendus dans la langue du LECTEUR (et non du salon) : un mot
  // d'accueil figé dans une langue qu'on ne lit pas n'accueille personne.
  "groupThread.systemJoined": "{name} se ha unido a la sala. ¡Te damos la bienvenida!",
  "groupThread.emptyThread": "Aún no hay nada. Empieza la conversación: preséntate y di qué buscas.",
  "groupThread.allGroups": "Todos los grupos",
  "groupThread.membersCount": {
    one: "{count} miembro",
    other: "{count} miembros",
  },
  "groupThread.meta": "{category} · {members}",
  "groupThread.metaOfficial": "Sala de bienvenida · {category} · {members}",
  "groupThread.animatedBy": "Animado por",
  "groupThread.openedOn": "· abierto el {date}",
  "groupThread.seeMembers": "Ver los {count} miembros",
  "groupThread.membersAria": "{count} miembros",
  "groupThread.olderMessages": "Mensajes más antiguos",
  "groupThread.backToLatest": "Volver a los últimos mensajes",
  "groupThread.membersOnly": "El hilo está reservado a los miembros",
  "groupThread.joinToRead":
    "Únete al grupo para leer los intercambios y escribir — puedes salir cuando quieras.",

  // chat/groupes/[slug]/membres/page.tsx
  "groupMembers.backToThread": "Volver al hilo",
  "groupMembers.membersCount": {
    one: "{count} miembro",
    other: "{count} miembros",
  },
  "groupMembers.bansCount": {
    one: "· {count} excluido",
    other: "· {count} excluidos",
  },
  "groupMembers.owner": "Animador·a",
  "groupMembers.manager": "Gerente",
  "groupMembers.since": "desde el {date}",
  "groupMembers.thisMember": "este miembro",
  "groupMembers.exclusions": "Exclusiones",
  "groupMembers.noBans":
    "Nadie ha sido excluido de esta sala. Una exclusión retira a la persona y le cierra la puerta; sus mensajes, en cambio, se quedan.",
  "groupMembers.bannedOn": "excluido el {date}",

  // u/[id]/page.tsx
  "profile.seeOnGlobe": "Ver en el globo Comunidad",
  "profile.memberSince": "Miembro desde {date}",
  "profile.editProfile": "Editar mi perfil",
  "profile.sendMessage": "Enviar un mensaje",
  "profile.reportProfile": "Denunciar este perfil",
  "profile.projectsLaunched": "Proyectos lanzados",
  "profile.contributions": "Contribuciones",
  "profile.investedInCommunity": "Invertido en la comunidad",
  "profile.votesOnProofs": "Votos sobre pruebas",
  "profile.theirProjects": "Sus proyectos",
  "profile.recentActivity": "Actividad reciente",
  "profile.repPoints": "{delta} rep.",

  // colaboraciones — común a las tres pantallas (bandeja, detalle, seguimiento de marca)
  "partnership.budgetUsd": "{amount} $",

  // partenariats/page.tsx
  "partnershipsInbox.title": "Colaboraciones",
  "partnershipsInbox.meta": {
    one: "{count} solicitud recibida · {pending} en espera · copiloto IA antes de cada respuesta",
    other: "{count} solicitudes recibidas · {pending} en espera · copiloto IA antes de cada respuesta",
  },
  "partnershipsInbox.emptyBody":
    "Ninguna solicitud por ahora. Las marcas pueden proponerte una colaboración desde la página de cada uno de tus proyectos («Colaboración de marca»).",
  "partnershipsInbox.emptyHint":
    "Cuando llega una solicitud, el copiloto IA te ayuda a comprobar que sea fiable y equitativa antes de responder.",

  // partenariats/[id]/page.tsx
  "partnershipDetail.allRequests": "Todas las solicitudes",
  "partnershipDetail.forQuoteOpen": "Para «",
  "partnershipDetail.forQuoteClose": "» · recibida el {date}",
  "partnershipDetail.noWebsite": "No ha facilitado ningún sitio web",
  "partnershipDetail.contact": "Contacto",
  "partnershipDetail.notSpecified": "Sin especificar",
  "partnershipDetail.compensation": "Contraprestación",
  "partnershipDetail.proposal": "Propuesta",
  "partnershipDetail.deliverables": "Lo que espera la marca",
  "partnershipDetail.replyToBrand": "Responder a la marca",
  "partnershipDetail.yourReply": "Tu respuesta ({status})",
  "partnershipDetail.yourReplyDated": "Tu respuesta ({status} el {date})",

  // partenariats/suivi/[token]/page.tsx — página pública de marca (tratamiento de usted)
  "tracking.sentBanner":
    "¡Solicitud enviada! Guarde bien el enlace de esta página: es aquí donde aparecerá la respuesta.",
  "tracking.title": "Su solicitud de colaboración",
  "tracking.pairing": "× «",
  "tracking.sentOn": "» · enviada el {date}",
  "tracking.compensationProposed": "Contraprestación propuesta: {compensation}",
  "tracking.pendingTitle": "En estudio",
  "tracking.pendingBody":
    "{name} está estudiando su propuesta. La respuesta aparecerá en esta página — no olvide guardarla en favoritos.",
  "tracking.accepted": "Colaboración aceptada",
  "tracking.declined": "Propuesta rechazada",
  "tracking.footerNote":
    "¿Representa a otra marca o desea completar su solicitud? Deje una nueva propuesta desde la página del proyecto.",
} satisfies Messages["memberPages"];
