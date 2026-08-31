import type { Messages } from "../types";

/** Le chat : colonne des conversations, fils privé et de groupe, salons, modération. */
export const chat = {
  // chat-sidebar.tsx
  "chatSidebar.tabPrivate": "Private",
  "chatSidebar.tabGroups": "Gruppi",
  "chatSidebar.tablistLabel": "Conversazioni",
  "chatSidebar.unreadGroupsDot": {
    one: "{count} gruppo con messaggi non letti",
    other: "{count} gruppi con messaggi non letti",
  },
  "chatSidebar.emptyPrivate":
    "Nessuna conversazione privata. Scrivi a chi porta avanti un progetto dalla sua pagina progetto o dal suo profilo — oppure passa da un gruppo della tua categoria.",
  "chatSidebar.youPrefix": "Tu: ",
  "chatSidebar.emptyGroups":
    "Non sei ancora in nessun gruppo. Ogni categoria ha i suoi — apri il tuo o entra in una stanza esistente.",
  "chatSidebar.unreadDot": "Messaggi non letti",
  "chatSidebar.you": "Tu",
  "chatSidebar.someMember": "Un membro",
  "chatSidebar.lastMessageLine": "{name}: {body}",
  "chatSidebar.groupMeta": {
    one: "{category} · {count} membro",
    other: "{category} · {count} membri",
  },
  "chatSidebar.exploreGroups": "Esplora e crea gruppi",

  // message-form.tsx
  "messageForm.bodyLabel": "Il tuo messaggio",
  "messageForm.bodyPlaceholder": "Scrivi il tuo messaggio… (aiuto reciproco, collab, domande)",
  "messageForm.send": "Invia",

  // group-membership.tsx — JoinGroupButton
  "joinGroupButton.join": "Entra",
  "joinGroupButton.full": "Gruppo al completo",
  "joinGroupButton.pending": "Ti facciamo entrare…",

  // group-membership.tsx — LeaveGroupButton
  "leaveGroupButton.confirm": "Sì, esci",
  "leaveGroupButton.pending": "Uscita…",
  "leaveGroupButton.cancel": "Annulla",
  "leaveGroupButton.ownerHandover": "L'animazione passa al membro presente da più tempo.",
  "leaveGroupButton.leave": "Esci",

  // group-membership.tsx — MuteGroupButton
  "muteGroupButton.unmuteTitle": "Ricevi di nuovo le notifiche di questa stanza",
  "muteGroupButton.muteTitle": "Smetti di ricevere notifiche da questa stanza",
  "muteGroupButton.muted": "In silenzio",
  "muteGroupButton.mute": "Silenzia",

  // group-membership.tsx — DissolveGroupButton
  "dissolveGroupButton.confirm": "Sì, sciogli il gruppo",
  "dissolveGroupButton.pending": "Scioglimento…",
  "dissolveGroupButton.cancel": "Annulla",
  "dissolveGroupButton.warning": "La conversazione e i suoi messaggi scompaiono.",
  "dissolveGroupButton.dissolve": "Sciogli",

  // group-message-actions.tsx
  "groupMessageActions.confirm": "Conferma",
  "groupMessageActions.pending": "Ritiro…",
  "groupMessageActions.cancel": "Annulla",
  "groupMessageActions.remove": "Ritira questo messaggio",

  // group-message-form.tsx
  "groupMessageForm.bodyLabel": "Il tuo messaggio in {group}",
  "groupMessageForm.bodyPlaceholder": "Scrivi in {group}…",
  "groupMessageForm.send": "Invia",

  // group-moderation.tsx — MemberActions
  "memberActions.demote": "Rimuovi da gerente",
  "memberActions.promote": "Nomina gerente",
  "memberActions.excludeConfirm": "Sì, escludi {name}",
  "memberActions.excludePending": "Esclusione…",
  "memberActions.cancel": "Annulla",
  "memberActions.exclude": "Escludi",

  // group-moderation.tsx — ReadmitButton
  "readmitButton.pending": "Riammissione…",
  "readmitButton.readmit": "Riammetti",

  // create-group-form.tsx
  "createGroupForm.openWithCategory": "Crea un gruppo {category}",
  "createGroupForm.open": "Crea un gruppo",
  "createGroupForm.heading": "Apri un gruppo",
  "createGroupForm.intro":
    "Una stanza pubblica, ordinata nella sua categoria. La animi tu, chiunque può entrare.",
  "createGroupForm.close": "Chiudi",
  "createGroupForm.nameLabel": "Nome del gruppo",
  "createGroupForm.namePlaceholder": "I dev della domenica",
  "createGroupForm.categoryLabel": "Categoria",
  "createGroupForm.categoryPlaceholder": "Scegli…",
  "createGroupForm.purposeLabel": "A cosa serve questo gruppo?",
  "createGroupForm.purposePlaceholder":
    "Ci aiutiamo sui lanci di giochi indie: feedback, playtest, contatti.",
  "createGroupForm.pending": "Creazione…",
  "createGroupForm.submit": "Crea il gruppo",
  "createGroupForm.firstMember": "Ne diventi il primo membro.",

  // category-room-card.tsx
  "categoryRoomCard.roomLabel": "La stanza {category}",
  "categoryRoomCard.memberCount": {
    one: "{count} membro",
    other: "{count} membri",
  },
  "categoryRoomCard.openThread": "Apri la conversazione",
  "categoryRoomCard.joinRoom": "Entra nella stanza {category}",
  "categoryRoomCard.emptyBody":
    "Nessuna stanza {category} per ora. Apri la prima — spesso è quella che riunisce chi porta avanti progetti della stessa categoria.",
  "categoryRoomCard.openRoom": "Apri la stanza {category}",

  // language-rooms-banner.tsx
  "languageRoomsBanner.title": "Stanze di lingua",
  "languageRoomsBanner.missing": {
    one: "{count} stanza di benvenuto da aprire — una porta d'ingresso per i membri che non parlano francese.",
    other:
      "{count} stanze di benvenuto da aprire — una porta d'ingresso per i membri che non parlano francese.",
  },
  "languageRoomsBanner.pending": "Apertura…",
  "languageRoomsBanner.open": "Apri le stanze",
} satisfies Messages["chat"];
