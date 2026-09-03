import type { Dict } from "@/lib/i18n/t";

/** Le chat : colonne des conversations, fils privé et de groupe, salons, modération. */
export const chat = {
  // chat-sidebar.tsx
  "chatSidebar.tabPrivate": "Privé",
  "chatSidebar.tabGroups": "Groupes",
  "chatSidebar.tablistLabel": "Conversations",
  "chatSidebar.unreadGroupsDot": "{count} groupe(s) avec des messages non lus",
  "chatSidebar.emptyPrivate":
    "Aucune conversation privée. Écris à un·e porteur·se depuis sa page projet ou son profil — ou passe par un groupe de ta catégorie.",
  "chatSidebar.youPrefix": "Toi : ",
  "chatSidebar.emptyGroups":
    "Tu n'as encore rejoint aucun groupe. Chaque catégorie a les siens — ouvre le tien ou entre dans un salon existant.",
  "chatSidebar.unreadDot": "Messages non lus",
  "chatSidebar.you": "Toi",
  "chatSidebar.someMember": "Un membre",
  "chatSidebar.lastMessageLine": "{name} : {body}",
  "chatSidebar.groupMeta": {
    one: "{category} · {count} membre",
    other: "{category} · {count} membres",
  },
  "chatSidebar.exploreGroups": "Explorer et créer des groupes",

  // message-form.tsx
  "messageForm.bodyLabel": "Ton message",
  "messageForm.bodyPlaceholder": "Écris ton message… (entraide, collab, questions)",
  "messageForm.send": "Envoyer",

  // group-membership.tsx — JoinGroupButton
  "joinGroupButton.join": "Rejoindre",
  "joinGroupButton.full": "Groupe complet",
  "joinGroupButton.pending": "On t'installe…",

  // group-membership.tsx — LeaveGroupButton
  "leaveGroupButton.confirm": "Oui, quitter",
  "leaveGroupButton.pending": "Sortie…",
  "leaveGroupButton.cancel": "Annuler",
  "leaveGroupButton.ownerHandover": "L'animation passe au membre le plus ancien.",
  "leaveGroupButton.leave": "Quitter",

  // group-membership.tsx — MuteGroupButton
  "muteGroupButton.unmuteTitle": "Recevoir à nouveau les notifications de ce salon",
  "muteGroupButton.muteTitle": "Ne plus être notifié·e de ce salon",
  "muteGroupButton.muted": "En silence",
  "muteGroupButton.mute": "Silence",

  // group-membership.tsx — DissolveGroupButton
  "dissolveGroupButton.confirm": "Oui, dissoudre le groupe",
  "dissolveGroupButton.pending": "Dissolution…",
  "dissolveGroupButton.cancel": "Annuler",
  "dissolveGroupButton.warning": "Le fil et ses messages disparaissent.",
  "dissolveGroupButton.dissolve": "Dissoudre",

  // group-message-actions.tsx
  "groupMessageActions.confirm": "Confirmer",
  "groupMessageActions.pending": "Retrait…",
  "groupMessageActions.cancel": "Annuler",
  "groupMessageActions.remove": "Retirer ce message",

  // group-message-form.tsx
  "groupMessageForm.bodyLabel": "Ton message dans {group}",
  "groupMessageForm.bodyPlaceholder": "Écris dans {group}…",
  "groupMessageForm.send": "Envoyer",

  // group-moderation.tsx — MemberActions
  "memberActions.demote": "Retirer la gérance",
  "memberActions.promote": "Nommer gérant·e",
  "memberActions.excludeConfirm": "Oui, exclure {name}",
  "memberActions.excludePending": "Exclusion…",
  "memberActions.cancel": "Annuler",
  "memberActions.exclude": "Exclure",

  // group-moderation.tsx — ReadmitButton
  "readmitButton.pending": "Réadmission…",
  "readmitButton.readmit": "Réadmettre",

  // create-group-form.tsx
  "createGroupForm.openWithCategory": "Créer un groupe {category}",
  "createGroupForm.open": "Créer un groupe",
  "createGroupForm.heading": "Ouvrir un groupe",
  "createGroupForm.intro":
    "Un salon public, rangé dans sa catégorie. Tu l'animes, tout le monde peut le rejoindre.",
  "createGroupForm.close": "Fermer",
  "createGroupForm.nameLabel": "Nom du groupe",
  "createGroupForm.namePlaceholder": "Les devs du dimanche",
  "createGroupForm.categoryLabel": "Catégorie",
  "createGroupForm.categoryPlaceholder": "Choisir…",
  "createGroupForm.purposeLabel": "À quoi sert ce groupe ?",
  "createGroupForm.purposePlaceholder":
    "On s'entraide sur les lancements de jeux indés : retours, playtests, contacts.",
  "createGroupForm.pending": "Création…",
  "addMember.title": "Ajouter un membre",
  "addMember.hint": "Cherche une personne par son nom et ajoute-la. C'est le seul moyen d'entrer dans ce groupe.",
  "addMember.searchPlaceholder": "Nom de la personne…",
  "addMember.search": "Chercher",
  "addMember.add": "Ajouter",
  "addMember.added": "Ajouté·e",
  "addMember.member": "Membre",
  "createGroupForm.privateStrong": "Groupe privé",
  "createGroupForm.privateRest": "personne ne peut le trouver ni le rejoindre. Seul un gérant ajoute les membres, un par un. Idéal pour coordonner à l'abri des regards.",
  "createGroupForm.submit": "Créer le groupe",
  "createGroupForm.firstMember": "Tu en deviens le premier membre.",

  // category-room-card.tsx
  "categoryRoomCard.roomLabel": "Le salon {category}",
  "categoryRoomCard.memberCount": {
    one: "{count} membre",
    other: "{count} membres",
  },
  "categoryRoomCard.openThread": "Ouvrir le fil",
  "categoryRoomCard.joinRoom": "Rejoindre le salon {category}",
  "categoryRoomCard.emptyBody":
    "Aucun salon {category} pour l'instant. Ouvre le premier — c'est souvent lui qui rassemble les porteurs d'une même catégorie.",
  "categoryRoomCard.openRoom": "Ouvrir le salon {category}",

  // language-rooms-banner.tsx
  "languageRoomsBanner.title": "Salons de langue",
  "languageRoomsBanner.missing": {
    one: "{count} salon d'accueil à ouvrir — une porte d'entrée pour les membres qui ne parlent pas français.",
    other:
      "{count} salons d'accueil à ouvrir — une porte d'entrée pour les membres qui ne parlent pas français.",
  },
  "languageRoomsBanner.pending": "Ouverture…",
  "languageRoomsBanner.open": "Ouvrir les salons",
} as const satisfies Dict;
