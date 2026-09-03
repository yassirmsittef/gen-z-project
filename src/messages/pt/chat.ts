import type { Messages } from "../types";

/** O chat: coluna das conversas, fios privado e de grupo, salas, moderação. */
export const chat = {
  // chat-sidebar.tsx
  "chatSidebar.tabPrivate": "Privado",
  "chatSidebar.tabGroups": "Grupos",
  "chatSidebar.tablistLabel": "Conversas",
  "chatSidebar.unreadGroupsDot": {
    one: "{count} grupo com mensagens por ler",
    other: "{count} grupos com mensagens por ler",
  },
  "chatSidebar.emptyPrivate":
    "Nenhuma conversa privada. Escreve a quem leva um projeto a partir da página do projeto ou do perfil — ou passa por um grupo da tua categoria.",
  "chatSidebar.youPrefix": "Tu: ",
  "chatSidebar.emptyGroups":
    "Ainda não entraste em nenhum grupo. Cada categoria tem os seus — abre o teu ou entra numa sala existente.",
  "chatSidebar.unreadDot": "Mensagens por ler",
  "chatSidebar.you": "Tu",
  "chatSidebar.someMember": "Um membro",
  "chatSidebar.lastMessageLine": "{name}: {body}",
  "chatSidebar.groupMeta": {
    one: "{category} · {count} membro",
    other: "{category} · {count} membros",
  },
  "chatSidebar.exploreGroups": "Explorar e criar grupos",

  // message-form.tsx
  "messageForm.bodyLabel": "A tua mensagem",
  "messageForm.bodyPlaceholder": "Escreve a tua mensagem… (entreajuda, colaborações, perguntas)",
  "messageForm.send": "Enviar",

  // group-membership.tsx — JoinGroupButton
  "joinGroupButton.join": "Entrar",
  "joinGroupButton.full": "Grupo cheio",
  "joinGroupButton.pending": "A dar-te entrada…",

  // group-membership.tsx — LeaveGroupButton
  "leaveGroupButton.confirm": "Sim, sair",
  "leaveGroupButton.pending": "A sair…",
  "leaveGroupButton.cancel": "Cancelar",
  "leaveGroupButton.ownerHandover": "A dinamização passa ao membro mais antigo.",
  "leaveGroupButton.leave": "Sair",

  // group-membership.tsx — MuteGroupButton
  "muteGroupButton.unmuteTitle": "Voltar a receber as notificações desta sala",
  "muteGroupButton.muteTitle": "Deixar de receber notificações desta sala",
  "muteGroupButton.muted": "Em silêncio",
  "muteGroupButton.mute": "Silenciar",

  // group-membership.tsx — DissolveGroupButton
  "dissolveGroupButton.confirm": "Sim, dissolver o grupo",
  "dissolveGroupButton.pending": "A dissolver…",
  "dissolveGroupButton.cancel": "Cancelar",
  "dissolveGroupButton.warning": "O fio e as suas mensagens desaparecem.",
  "dissolveGroupButton.dissolve": "Dissolver",

  // group-message-actions.tsx
  "groupMessageActions.confirm": "Confirmar",
  "groupMessageActions.pending": "A remover…",
  "groupMessageActions.cancel": "Cancelar",
  "groupMessageActions.remove": "Remover esta mensagem",

  // group-message-form.tsx
  "groupMessageForm.bodyLabel": "A tua mensagem em {group}",
  "groupMessageForm.bodyPlaceholder": "Escreve em {group}…",
  "groupMessageForm.send": "Enviar",

  // group-moderation.tsx — MemberActions
  "memberActions.demote": "Retirar a gerência",
  "memberActions.promote": "Nomear gerente",
  "memberActions.excludeConfirm": "Sim, excluir {name}",
  "memberActions.excludePending": "A excluir…",
  "memberActions.cancel": "Cancelar",
  "memberActions.exclude": "Excluir",

  // group-moderation.tsx — ReadmitButton
  "readmitButton.pending": "A readmitir…",
  "readmitButton.readmit": "Readmitir",

  // create-group-form.tsx
  "createGroupForm.openWithCategory": "Criar um grupo {category}",
  "createGroupForm.open": "Criar um grupo",
  "createGroupForm.heading": "Abrir um grupo",
  "createGroupForm.intro":
    "Uma sala pública, arrumada na sua categoria. Tu dinamizas, toda a gente pode entrar.",
  "createGroupForm.close": "Fechar",
  "createGroupForm.nameLabel": "Nome do grupo",
  "createGroupForm.namePlaceholder": "Os devs de domingo",
  "createGroupForm.categoryLabel": "Categoria",
  "createGroupForm.categoryPlaceholder": "Escolher…",
  "createGroupForm.purposeLabel": "Para que serve este grupo?",
  "createGroupForm.purposePlaceholder":
    "Entreajuda nos lançamentos de jogos indie: feedback, playtests, contactos.",
  "createGroupForm.pending": "A criar…",
  "addMember.title": "Adicionar um membro",
  "addMember.hint": "Procura uma pessoa pelo nome e adiciona-a. É a única forma de entrar neste grupo.",
  "addMember.searchPlaceholder": "Nome da pessoa…",
  "addMember.search": "Procurar",
  "addMember.add": "Adicionar",
  "addMember.added": "Adicionado",
  "addMember.member": "Membro",
  "createGroupForm.privateStrong": "Grupo privado",
  "createGroupForm.privateRest": "ninguém o pode encontrar nem juntar-se. Só um gestor adiciona membros, um a um. Ideal para coordenar longe de olhares.",
  "createGroupForm.submit": "Criar o grupo",
  "createGroupForm.firstMember": "Tornas-te o primeiro membro.",

  // category-room-card.tsx
  "categoryRoomCard.roomLabel": "A sala {category}",
  "categoryRoomCard.memberCount": {
    one: "{count} membro",
    other: "{count} membros",
  },
  "categoryRoomCard.openThread": "Abrir o fio",
  "categoryRoomCard.joinRoom": "Entrar na sala {category}",
  "categoryRoomCard.emptyBody":
    "Ainda nenhuma sala {category}. Abre a primeira — é muitas vezes ela que junta quem leva projetos da mesma categoria.",
  "categoryRoomCard.openRoom": "Abrir a sala {category}",

  // language-rooms-banner.tsx
  "languageRoomsBanner.title": "Salas de língua",
  "languageRoomsBanner.missing": {
    one: "{count} sala de acolhimento por abrir — uma porta de entrada para os membros que não falam francês.",
    other:
      "{count} salas de acolhimento por abrir — uma porta de entrada para os membros que não falam francês.",
  },
  "languageRoomsBanner.pending": "A abrir…",
  "languageRoomsBanner.open": "Abrir as salas",
} satisfies Messages["chat"];
