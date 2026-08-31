import type { Messages } from "../types";

/** El chat: columna de conversaciones, hilos privado y de grupo, salas, moderación. */
export const chat = {
  // chat-sidebar.tsx
  "chatSidebar.tabPrivate": "Privado",
  "chatSidebar.tabGroups": "Grupos",
  "chatSidebar.tablistLabel": "Conversaciones",
  "chatSidebar.unreadGroupsDot": "{count} grupo(s) con mensajes sin leer",
  "chatSidebar.emptyPrivate":
    "Ninguna conversación privada. Escribe a quien lleva un proyecto desde su página de proyecto o su perfil — o pasa por un grupo de tu categoría.",
  "chatSidebar.youPrefix": "Tú: ",
  "chatSidebar.emptyGroups":
    "Aún no te has unido a ningún grupo. Cada categoría tiene los suyos — abre el tuyo o entra en una sala existente.",
  "chatSidebar.unreadDot": "Mensajes sin leer",
  "chatSidebar.you": "Tú",
  "chatSidebar.someMember": "Un miembro",
  "chatSidebar.lastMessageLine": "{name}: {body}",
  "chatSidebar.groupMeta": {
    one: "{category} · {count} miembro",
    other: "{category} · {count} miembros",
  },
  "chatSidebar.exploreGroups": "Explorar y crear grupos",

  // message-form.tsx
  "messageForm.bodyLabel": "Tu mensaje",
  "messageForm.bodyPlaceholder": "Escribe tu mensaje… (ayuda mutua, colabs, preguntas)",
  "messageForm.send": "Enviar",

  // group-membership.tsx — JoinGroupButton
  "joinGroupButton.join": "Unirse",
  "joinGroupButton.full": "Grupo completo",
  "joinGroupButton.pending": "Te hacemos sitio…",

  // group-membership.tsx — LeaveGroupButton
  "leaveGroupButton.confirm": "Sí, salir",
  "leaveGroupButton.pending": "Saliendo…",
  "leaveGroupButton.cancel": "Cancelar",
  "leaveGroupButton.ownerHandover": "La animación del grupo pasa al miembro más antiguo.",
  "leaveGroupButton.leave": "Salir",

  // group-membership.tsx — MuteGroupButton
  "muteGroupButton.unmuteTitle": "Volver a recibir las notificaciones de esta sala",
  "muteGroupButton.muteTitle": "No recibir más notificaciones de esta sala",
  "muteGroupButton.muted": "En silencio",
  "muteGroupButton.mute": "Silencio",

  // group-membership.tsx — DissolveGroupButton
  "dissolveGroupButton.confirm": "Sí, disolver el grupo",
  "dissolveGroupButton.pending": "Disolviendo…",
  "dissolveGroupButton.cancel": "Cancelar",
  "dissolveGroupButton.warning": "El hilo y sus mensajes desaparecen.",
  "dissolveGroupButton.dissolve": "Disolver",

  // group-message-actions.tsx
  "groupMessageActions.confirm": "Confirmar",
  "groupMessageActions.pending": "Retirando…",
  "groupMessageActions.cancel": "Cancelar",
  "groupMessageActions.remove": "Retirar este mensaje",

  // group-message-form.tsx
  "groupMessageForm.bodyLabel": "Tu mensaje en {group}",
  "groupMessageForm.bodyPlaceholder": "Escribe en {group}…",
  "groupMessageForm.send": "Enviar",

  // group-moderation.tsx — MemberActions
  "memberActions.demote": "Retirar la gestión",
  "memberActions.promote": "Nombrar gerente",
  "memberActions.excludeConfirm": "Sí, excluir a {name}",
  "memberActions.excludePending": "Excluyendo…",
  "memberActions.cancel": "Cancelar",
  "memberActions.exclude": "Excluir",

  // group-moderation.tsx — ReadmitButton
  "readmitButton.pending": "Readmitiendo…",
  "readmitButton.readmit": "Readmitir",

  // create-group-form.tsx
  "createGroupForm.openWithCategory": "Crear un grupo de {category}",
  "createGroupForm.open": "Crear un grupo",
  "createGroupForm.heading": "Abrir un grupo",
  "createGroupForm.intro":
    "Una sala pública, ordenada en su categoría. Tú la animas, todo el mundo puede unirse.",
  "createGroupForm.close": "Cerrar",
  "createGroupForm.nameLabel": "Nombre del grupo",
  "createGroupForm.namePlaceholder": "Los devs del domingo",
  "createGroupForm.categoryLabel": "Categoría",
  "createGroupForm.categoryPlaceholder": "Elegir…",
  "createGroupForm.purposeLabel": "¿Para qué sirve este grupo?",
  "createGroupForm.purposePlaceholder":
    "Nos ayudamos con los lanzamientos de juegos indies: feedback, playtests, contactos.",
  "createGroupForm.pending": "Creando…",
  "createGroupForm.submit": "Crear el grupo",
  "createGroupForm.firstMember": "Te conviertes en su primer miembro.",

  // category-room-card.tsx
  "categoryRoomCard.roomLabel": "La sala {category}",
  "categoryRoomCard.memberCount": {
    one: "{count} miembro",
    other: "{count} miembros",
  },
  "categoryRoomCard.openThread": "Abrir el hilo",
  "categoryRoomCard.joinRoom": "Unirse a la sala {category}",
  "categoryRoomCard.emptyBody":
    "Ninguna sala de {category} por ahora. Abre la primera — suele ser la que reúne a quienes llevan proyectos de una misma categoría.",
  "categoryRoomCard.openRoom": "Abrir la sala {category}",

  // language-rooms-banner.tsx
  "languageRoomsBanner.title": "Salas de idioma",
  "languageRoomsBanner.missing": {
    one: "{count} sala de bienvenida por abrir — una puerta de entrada para los miembros que no hablan francés.",
    other:
      "{count} salas de bienvenida por abrir — una puerta de entrada para los miembros que no hablan francés.",
  },
  "languageRoomsBanner.pending": "Abriendo…",
  "languageRoomsBanner.open": "Abrir las salas",
} satisfies Messages["chat"];
