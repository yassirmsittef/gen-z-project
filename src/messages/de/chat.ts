import type { Messages } from "../types";

/** Der Chat: Spalte der Unterhaltungen, private und Gruppen-Threads, Räume, Moderation. */
export const chat = {
  // chat-sidebar.tsx
  "chatSidebar.tabPrivate": "Privat",
  "chatSidebar.tabGroups": "Gruppen",
  "chatSidebar.tablistLabel": "Unterhaltungen",
  "chatSidebar.unreadGroupsDot": {
    one: "{count} Gruppe mit ungelesenen Nachrichten",
    other: "{count} Gruppen mit ungelesenen Nachrichten",
  },
  "chatSidebar.emptyPrivate":
    "Noch keine private Unterhaltung. Schreib der Person hinter einem Projekt über ihre Projektseite oder ihr Profil — oder geh über eine Gruppe deiner Kategorie.",
  "chatSidebar.youPrefix": "Du: ",
  "chatSidebar.emptyGroups":
    "Du bist noch keiner Gruppe beigetreten. Jede Kategorie hat ihre eigenen — eröffne deine oder tritt einem bestehenden Raum bei.",
  "chatSidebar.unreadDot": "Ungelesene Nachrichten",
  "chatSidebar.you": "Du",
  "chatSidebar.someMember": "Ein Mitglied",
  "chatSidebar.lastMessageLine": "{name}: {body}",
  "chatSidebar.groupMeta": {
    one: "{category} · {count} Mitglied",
    other: "{category} · {count} Mitglieder",
  },
  "chatSidebar.exploreGroups": "Gruppen entdecken und erstellen",

  // message-form.tsx
  "messageForm.bodyLabel": "Deine Nachricht",
  "messageForm.bodyPlaceholder": "Schreib deine Nachricht… (Hilfe, Collabs, Fragen)",
  "messageForm.send": "Senden",

  // group-membership.tsx — JoinGroupButton
  "joinGroupButton.join": "Beitreten",
  "joinGroupButton.full": "Gruppe voll",
  "joinGroupButton.pending": "Gleich bist du drin…",

  // group-membership.tsx — LeaveGroupButton
  "leaveGroupButton.confirm": "Ja, verlassen",
  "leaveGroupButton.pending": "Wird verlassen…",
  "leaveGroupButton.cancel": "Abbrechen",
  "leaveGroupButton.ownerHandover": "Die Moderation geht an das Mitglied, das am längsten dabei ist.",
  "leaveGroupButton.leave": "Verlassen",

  // group-membership.tsx — MuteGroupButton
  "muteGroupButton.unmuteTitle": "Wieder Benachrichtigungen aus diesem Raum erhalten",
  "muteGroupButton.muteTitle": "Keine Benachrichtigungen mehr aus diesem Raum erhalten",
  "muteGroupButton.muted": "Stumm",
  "muteGroupButton.mute": "Stummschalten",

  // group-membership.tsx — DissolveGroupButton
  "dissolveGroupButton.confirm": "Ja, Gruppe auflösen",
  "dissolveGroupButton.pending": "Wird aufgelöst…",
  "dissolveGroupButton.cancel": "Abbrechen",
  "dissolveGroupButton.warning": "Der Chat und alle seine Nachrichten verschwinden.",
  "dissolveGroupButton.dissolve": "Auflösen",

  // group-message-actions.tsx
  "groupMessageActions.confirm": "Bestätigen",
  "groupMessageActions.pending": "Wird entfernt…",
  "groupMessageActions.cancel": "Abbrechen",
  "groupMessageActions.remove": "Diese Nachricht entfernen",

  // group-message-form.tsx
  "groupMessageForm.bodyLabel": "Deine Nachricht in {group}",
  "groupMessageForm.bodyPlaceholder": "Schreib in {group}…",
  "groupMessageForm.send": "Senden",

  // group-moderation.tsx — MemberActions
  "memberActions.demote": "Moderation entziehen",
  "memberActions.promote": "Moderation übertragen",
  "memberActions.excludeConfirm": "Ja, {name} ausschließen",
  "memberActions.excludePending": "Wird ausgeschlossen…",
  "memberActions.cancel": "Abbrechen",
  "memberActions.exclude": "Ausschließen",

  // group-moderation.tsx — ReadmitButton
  "readmitButton.pending": "Wird wieder aufgenommen…",
  "readmitButton.readmit": "Wieder aufnehmen",

  // create-group-form.tsx
  "createGroupForm.openWithCategory": "{category}-Gruppe erstellen",
  "createGroupForm.open": "Gruppe erstellen",
  "createGroupForm.heading": "Eine Gruppe eröffnen",
  "createGroupForm.intro":
    "Ein öffentlicher Raum, einsortiert in seine Kategorie. Du moderierst ihn, alle können beitreten.",
  "createGroupForm.close": "Schließen",
  "createGroupForm.nameLabel": "Name der Gruppe",
  "createGroupForm.namePlaceholder": "Die Sonntags-Devs",
  "createGroupForm.categoryLabel": "Kategorie",
  "createGroupForm.categoryPlaceholder": "Auswählen…",
  "createGroupForm.purposeLabel": "Wozu ist diese Gruppe da?",
  "createGroupForm.purposePlaceholder":
    "Wir helfen uns bei Indie-Game-Launches: Feedback, Playtests, Kontakte.",
  "createGroupForm.pending": "Wird erstellt…",
  "createGroupForm.submit": "Gruppe erstellen",
  "createGroupForm.firstMember": "Du wirst ihr erstes Mitglied.",

  // category-room-card.tsx
  "categoryRoomCard.roomLabel": "Der {category}-Raum",
  "categoryRoomCard.memberCount": {
    one: "{count} Mitglied",
    other: "{count} Mitglieder",
  },
  "categoryRoomCard.openThread": "Chat öffnen",
  "categoryRoomCard.joinRoom": "Dem {category}-Raum beitreten",
  "categoryRoomCard.emptyBody":
    "Noch kein {category}-Raum. Eröffne den ersten — oft ist er es, der die Projektträger einer Kategorie zusammenbringt.",
  "categoryRoomCard.openRoom": "Den {category}-Raum eröffnen",

  // language-rooms-banner.tsx
  "languageRoomsBanner.title": "Sprachräume",
  "languageRoomsBanner.missing": {
    one: "{count} Willkommensraum noch zu eröffnen — eine Eintrittstür für Mitglieder, die kein Französisch sprechen.",
    other:
      "{count} Willkommensräume noch zu eröffnen — eine Eintrittstür für Mitglieder, die kein Französisch sprechen.",
  },
  "languageRoomsBanner.pending": "Wird eröffnet…",
  "languageRoomsBanner.open": "Räume eröffnen",
} satisfies Messages["chat"];
