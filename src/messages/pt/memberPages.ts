import type { Messages } from "../types";

/**
 * Namespace `memberPages` — as páginas do espaço do membro (lote 7):
 * painel, notificações, chat (fios privados, grupos, membros),
 * perfil público, parcerias (caixa, detalhe, acompanhamento da marca).
 */
export const memberPages = {
  // <title> das páginas
  "meta.dashboardTitle": "Painel",
  "meta.notificationsTitle": "Notificações",
  "meta.chatTitle": "Chat",
  "meta.groupsTitle": "Grupos",
  "meta.groupTitle": "Grupo",
  "meta.groupMembersTitle": "Membros do grupo",
  "meta.profileNotFound": "Perfil não encontrado",
  "meta.profileFallback": "Perfil",
  "meta.profileDescription": "{name} na GeniGain: reputação, projetos e competências.",
  "meta.profileDescriptionCity":
    "{name} na GeniGain — {city}: reputação, projetos e competências.",
  "meta.partnershipsTitle": "Parcerias",
  "meta.partnershipRequestTitle": "Pedido de parceria",
  "meta.trackingTitle": "Acompanhamento do seu pedido",

  // dashboard/page.tsx
  "dashboard.connectDoneLive":
    "Configuração transmitida à Stripe — as tuas transferências ativam-se assim que for validada.",
  "dashboard.connectDoneTest":
    "Configuração transmitida à Stripe — as tuas transferências ativam-se assim que for validada (muitas vezes imediato em modo de teste).",
  "dashboard.connectRefresh":
    "A sessão Stripe expirou — retoma a configuração das transferências quando quiseres.",
  "dashboard.greeting": "Olá {name}",
  "dashboard.tagline": "QG pessoal · sistemas operacionais",
  "dashboard.editProfile": "Editar o meu perfil",
  "dashboard.adminCockpit": "Cockpit admin",
  "dashboard.reportsToHandle": {
    one: "{count} denúncia por tratar",
    other: "{count} denúncias por tratar",
  },
  "dashboard.nothingToModerate": "nada para moderar",
  "dashboard.failedTitle": "Um projeto não vingou — e agora?",
  "dashboard.failedBody":
    "O falhanço não é uma saída. Descobre outras oportunidades e volta mais forte.",
  "dashboard.seeOpportunities": "Ver as oportunidades →",
  "dashboard.statReputation": "Reputação",
  "dashboard.nextLevelAt": "{label} a {target}",
  "dashboard.maxLevel": "Nível máximo atingido",
  "dashboard.statTowardProject": "Rumo ao teu projeto",
  "dashboard.gateExempt": "Fundador — publicas sem passar pelo limiar",
  "dashboard.gateReached": "Limiar desbloqueado — já podes publicar",
  "dashboard.gateRemaining": "{amount} antes de poderes publicar",
  "dashboard.statSupports": "Apoios",
  "dashboard.communityPillar": "Pilar da comunidade",
  "dashboard.supportGoal": "Objetivo: 10 projetos apoiados",
  "dashboard.trajectoryTitle": "A tua trajetória",
  "dashboard.pendingPartnerships": {
    one: "{count} pedido de parceria à espera da tua resposta —",
    other: "{count} pedidos de parceria à espera da tua resposta —",
  },
  "dashboard.seeWithCopilot": "ver com o copiloto IA →",
  "dashboard.myProjects": "Os meus projetos",
  "dashboard.partnershipsLink": "Parcerias",
  "dashboard.partnershipsLinkCount": "Parcerias ({count})",
  "dashboard.launchProject": "Lançar um projeto",
  "dashboard.noProjects":
    "Ainda sem projeto. Contribui para um projeto para desbloqueares a criação do teu.",
  "dashboard.myCalls": "Os meus apelos",
  "dashboard.publishCall": "Publicar um apelo",
  "dashboard.replaceTarget": "Substituir {target}",
  "dashboard.callVoices": "{count} vozes",
  "dashboard.callAnswerers": {
    one: "{count} substituto",
    other: "{count} substitutos",
  },
  "dashboard.callNoAnswerers": "ainda sem substituto",
  "dashboard.followedProjects": "Projetos seguidos",
  "dashboard.myContributions": "As minhas contribuições",
  "dashboard.noContributions": "Ainda nenhuma contribuição.",
  "dashboard.findProject": "Encontra um projeto para apoiar →",
  "dashboard.refunded": "reembolsada",
  "dashboard.myProfile": "O meu perfil",
  "dashboard.mySkills": "As minhas competências",
  "dashboard.myPayouts": "As minhas transferências",
  "dashboard.security": "Segurança",
  "dashboard.myData": "Os meus dados",
  "dashboard.myDataBody":
    "Tudo o que confiaste à GeniGain (perfil, projetos, contribuições, votos, mensagens enviadas…), num ficheiro JSON — direito à portabilidade.",
  "dashboard.downloadMyData": "Descarregar os meus dados",

  // notifications/page.tsx
  "notifications.title": "Notificações",
  "notifications.newSince": {
    one: "{count} nova desde a tua última passagem",
    other: "{count} novas desde a tua última passagem",
  },
  "notifications.allCaughtUp": "Está tudo em dia",
  "notifications.empty":
    "Nada de momento. Contribuições recebidas, provas a votar, etapas desbloqueadas, mensagens, comentários, novidades e pedidos de parceria vão chegar aqui.",

  // chat/page.tsx + chat/[userId]/page.tsx — cabeçalho comum
  "chatHeader.title": "Chat",
  "chatHeader.tagline": "Entreajuda entre quem leva projetos · colabs · ajudas",

  // chat/page.tsx
  "chatIndex.pickConversation":
    "Escolhe uma conversa — ou entra num grupo da tua categoria para falares com mais gente.",
  "chatIndex.exploreGroups": "Explorar os grupos",

  // chat/[userId]/page.tsx
  "chatThread.allConversations": "Todas as minhas conversas",
  "chatThread.olderMessages": "Mensagens mais antigas",
  "chatThread.startConversation":
    "Começa a conversa — propõe uma ajuda, uma colab, uma troca de competências.",
  "chatThread.backToLatest": "Voltar às últimas mensagens",

  // chat/groupes/page.tsx
  "groupsDir.title": "Grupos",
  "groupsDir.tagline": "Uma sala por vontade · arrumadas nas categorias dos projetos",
  "groupsDir.searchPlaceholder": "Procurar uma sala (nome, tema…)",
  "groupsDir.searchLabel": "Procurar uma sala",
  "groupsDir.search": "Procurar",
  "groupsDir.categoriesLabel": "Categorias de grupos",
  "groupsDir.allCategories": "Todas as categorias",
  "groupsDir.noRoomForQuery": "Nenhuma sala fala de «{query}».",
  "groupsDir.noRoomForQueryInCategory": "Nenhuma sala fala de «{query}» em {category}.",
  "groupsDir.noGroupInCategory": "Ainda nenhum grupo em {category}.",
  "groupsDir.noGroup": "Ainda nenhum grupo.",
  "groupsDir.tryAnotherWord": "Tenta outra palavra, ou abre a sala que falta.",
  "groupsDir.openFirst": "Abre a primeira — é muitas vezes ela que junta.",
  "groupsDir.officialRoomCategory": "Sala de acolhimento · {category}",
  "groupsDir.openThread": "Abrir o fio",

  // chat/groupes/[slug]/page.tsx
  // Rendus dans la langue du LECTEUR (et non du salon) : un mot
  // d'accueil figé dans une langue qu'on ne lit pas n'accueille personne.
  "groupThread.systemJoined": "{name} juntou-se à sala. Damos-te as boas-vindas!",
  "groupThread.emptyThread": "Ainda não há nada. Começa a conversa: apresenta-te e diz o que procuras.",
  "groupThread.allGroups": "Todos os grupos",
  "groupThread.membersCount": {
    one: "{count} membro",
    other: "{count} membros",
  },
  "groupThread.meta": "{category} · {members}",
  "groupThread.metaOfficial": "Sala de acolhimento · {category} · {members}",
  "groupThread.animatedBy": "Dinamizado por",
  "groupThread.openedOn": "· aberto a {date}",
  "groupThread.seeMembers": "Ver os {count} membros",
  "groupThread.membersAria": "{count} membros",
  "groupThread.olderMessages": "Mensagens mais antigas",
  "groupThread.backToLatest": "Voltar às últimas mensagens",
  "groupThread.membersOnly": "O fio é reservado aos membros",
  "groupThread.joinToRead":
    "Entra no grupo para leres as trocas e escreveres — podes sair quando quiseres.",

  // chat/groupes/[slug]/membres/page.tsx
  "groupMembers.backToThread": "Voltar ao fio",
  "groupMembers.membersCount": {
    one: "{count} membro",
    other: "{count} membros",
  },
  "groupMembers.bansCount": {
    one: "· {count} excluído",
    other: "· {count} excluídos",
  },
  "groupMembers.owner": "Dinamizador·a",
  "groupMembers.manager": "Gerente",
  "groupMembers.since": "desde {date}",
  "groupMembers.thisMember": "este membro",
  "groupMembers.exclusions": "Exclusões",
  "groupMembers.noBans":
    "Ninguém foi excluído desta sala. Uma exclusão retira a pessoa e fecha-lhe a porta; as mensagens dela ficam.",
  "groupMembers.bannedOn": "excluído a {date}",

  // u/[id]/page.tsx
  "profile.seeOnGlobe": "Ver no globo da Comunidade",
  "profile.memberSince": "Membro desde {date}",
  "profile.editProfile": "Editar o meu perfil",
  "profile.sendMessage": "Enviar uma mensagem",
  "profile.reportProfile": "Denunciar este perfil",
  "profile.projectsLaunched": "Projetos lançados",
  "profile.contributions": "Contribuições",
  "profile.investedInCommunity": "Investido na comunidade",
  "profile.votesOnProofs": "Votos em provas",
  "profile.theirProjects": "Os projetos desta pessoa",
  "profile.recentActivity": "Atividade recente",
  "profile.repPoints": "{delta} rep.",

  // parcerias — comum aos três ecrãs (caixa, detalhe, acompanhamento da marca)
  "partnership.budgetUsd": "{amount} $",

  // partenariats/page.tsx
  "partnershipsInbox.title": "Parcerias",
  "partnershipsInbox.meta": {
    one: "{count} pedido recebido · {pending} à espera · copiloto IA antes de cada resposta",
    other: "{count} pedidos recebidos · {pending} à espera · copiloto IA antes de cada resposta",
  },
  "partnershipsInbox.emptyBody":
    "Ainda nenhum pedido. As marcas podem propor-te uma parceria a partir da página de cada um dos teus projetos («Parceria de marca»).",
  "partnershipsInbox.emptyHint":
    "Quando chega um pedido, o copiloto IA ajuda-te a verificar se é fiável e equitativo antes de responderes.",

  // partenariats/[id]/page.tsx
  "partnershipDetail.allRequests": "Todos os pedidos",
  "partnershipDetail.forQuoteOpen": "Para «",
  "partnershipDetail.forQuoteClose": "» · recebido a {date}",
  "partnershipDetail.noWebsite": "Nenhum site indicado",
  "partnershipDetail.contact": "Contacto",
  "partnershipDetail.notSpecified": "Não especificado",
  "partnershipDetail.compensation": "Contrapartida",
  "partnershipDetail.proposal": "Proposta",
  "partnershipDetail.deliverables": "O que a marca espera",
  "partnershipDetail.replyToBrand": "Responder à marca",
  "partnershipDetail.yourReply": "A tua resposta ({status})",
  "partnershipDetail.yourReplyDated": "A tua resposta ({status} a {date})",

  // partenariats/suivi/[token]/page.tsx — página pública da marca (tratamento formal)
  "tracking.sentBanner":
    "Pedido enviado! Guarde bem o link desta página: é aqui que a resposta vai aparecer.",
  "tracking.title": "O seu pedido de parceria",
  "tracking.pairing": "× «",
  "tracking.sentOn": "» · enviado a {date}",
  "tracking.compensationProposed": "Contrapartida proposta: {compensation}",
  "tracking.pendingTitle": "Em análise",
  "tracking.pendingBody":
    "{name} está a estudar a sua proposta. A resposta aparecerá nesta página — não se esqueça de a guardar nos favoritos.",
  "tracking.accepted": "Parceria aceite",
  "tracking.declined": "Proposta recusada",
  "tracking.footerNote":
    "Representa outra marca ou quer completar o seu pedido? Deixe uma nova proposta a partir da página do projeto.",
} satisfies Messages["memberPages"];
