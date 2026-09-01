import type { Messages } from "../types";

/**
 * Namespace `ui` — componentes transversais (lote 6): pesquisa global ⌘K,
 * partilha, denúncia, sino de notificações, globo da comunidade,
 * navegação legal, distintivo de reputação.
 */
export const ui = {
  // Pesquisa global (⌘K)
  "commandPalette.triggerTitle": "Pesquisar (⌘K)",
  "commandPalette.triggerLabel": "Pesquisar projetos, salas e membros",
  "commandPalette.dialogLabel": "Pesquisa global",
  "commandPalette.inputPlaceholder": "Pesquisar um projeto, uma marca, uma sala, um membro…",
  "commandPalette.inputLabel": "Pesquisar um projeto, uma sala ou um membro",
  "commandPalette.sectionProjects": "Projetos",
  "commandPalette.sectionCalls": "Apelos",
  "commandPalette.sectionRooms": "Salas",
  "commandPalette.sectionMembers": "Membros",
  "commandPalette.replaceTarget": "Substituir {target}",
  "commandPalette.callVotes": {
    one: "{count} voz",
    other: "{count} vozes",
  },
  "commandPalette.callAnswerers": {
    one: "{count} substituto",
    other: "{count} substitutos",
  },
  "commandPalette.callNoAnswerers": "ainda ninguém",
  "commandPalette.roomMeta": {
    one: "{count} membro · {purpose}",
    other: "{count} membros · {purpose}",
  },
  "commandPalette.noResults": "Nada encontrado para «{query}».",
  "commandPalette.minChars": "Escreve pelo menos 2 caracteres — projetos por título ou pitch, membros por nome.",
  "commandPalette.shortcutsHint": "↑↓ navegar · ↵ abrir · esc fechar",

  // Partilha da página atual
  "shareButton.share": "Partilhar",
  "shareButton.copied": "Link copiado!",
  "shareButton.copyPrompt": "Copia o link do projeto:",

  // Denúncia à equipa
  "reportButton.defaultLabel": "Denunciar",
  "reportButton.triggerTitle": "Denunciar à equipa",
  "reportButton.dialogLabel": "Denunciar este conteúdo",
  "reportButton.sentTitle": "Denúncia enviada",
  "reportButton.sentBody":
    "Obrigado por cuidares da comunidade — a equipa vai analisar. A pessoa visada não é informada da tua denúncia.",
  "reportButton.close": "Fechar",
  "reportButton.heading": "Denunciar à equipa",
  "reportButton.reasonLegend": "Motivo",
  "reportButton.detailLabel": "Detalhes (opcional)",
  "reportButton.detailPlaceholder": "O que te alertou — links, contexto…",
  "reportButton.sending": "A enviar…",
  "reportButton.submit": "Enviar a denúncia",
  "reportButton.cancel": "Cancelar",

  // Sino de notificações
  "navbarBell.title": "Notificações",
  "navbarBell.overflow": "9+",
  "navbarBell.srUnread": "Notificações ({count} por ler)",

  // Globo da comunidade
  "communityGlobe.loading": "A inicializar o globo…",

  // Navegação do quadro legal
  "legalNav.ariaLabel": "Páginas legais",
  "legalNav.terms": "Condições de utilização",
  "legalNav.privacy": "Privacidade",
  "legalNav.legalNotice": "Menções legais",

  // Distintivo de reputação
  "reputationBadge.title": "Reputação: {reputation}",

  // Traduction sur l'appareil (Translator du navigateur — aucun service tiers)
  "translate.action": "Traduzir",
  "translate.title": "Traduz este texto para a tua língua",
  "translate.working": "A traduzir…",
  "translate.downloading": "A descarregar o modelo… {percent} %",
  "translate.showOriginal": "Ver o original",
  "translate.badge": "Traduzido no teu dispositivo",
  "translate.sameLanguage": "Este texto já está na tua língua.",
  "translate.unavailablePair": "Esta língua não pode ser traduzida.",
  "translate.failed": "A tradução não resultou — tenta de novo.",
  "translate.badgeService": "Traduzido por um serviço externo",
  "translate.tooFast": "Demasiadas traduções seguidas — volta daqui a pouco.",
  "translate.saturated": "A tradução automática não está disponível de momento — tenta mais tarde.",
  "translate.consentBody": "O teu dispositivo não sabe traduzir sozinho. Este texto será enviado para um serviço de tradução externo (Microsoft), que não o guarda.",
  "translate.consentAccept": "Está bem, traduzir",
  "translate.consentDecline": "Não, obrigado",
} satisfies Messages["ui"];
