import type { Messages } from "../types";

/**
 * Namespace `projectsPages` — as 5 páginas de servidor de /projects:
 * lista, criação (limiar incluído), ficha do projeto, edição, parceria.
 * Chaves prefixadas por página: meta.*, hero/search/filters/sort/results/empty
 * (lista), gate/form (criação), detail.*, edit.*, partnership.*.
 */
export const projectsPages = {
  // ---------- Metadados (uma chave por página do namespace) ----------
  "meta.listTitle": "Projetos",
  "meta.newTitle": "Lançar um projeto",
  "meta.detailNotFound": "Projeto não encontrado",
  "meta.editTitle": "Editar o projeto",
  "meta.partnershipTitle": "Propor uma parceria",

  // ---------- /projects — a lista ----------
  "hero.title": "Os projetos da comunidade",
  "hero.subtitle": "Cada contribuição conta — e é o teu bilhete para lançares o teu.",
  "search.placeholder": "Pesquisar um projeto, uma ideia, uma palavra-chave…",
  "search.ariaLabel": "Pesquisar um projeto",
  "search.submit": "Pesquisar",
  "filters.categories": "Categorias",
  "filters.allCategories": "Todas as categorias",
  "filters.statusesAndSort": "Estados e ordenação",
  "filters.allStatuses": "Todos os estados",
  "filters.sortLabel": "Ordenação",
  "sort.recent": "Mais recentes",
  "sort.suivis": "Mais seguidos",
  "sort.fin": "A terminar em breve",
  "sort.finances": "Mais financiados",
  "results.count": {
    one: "{count} resultado",
    other: "{count} resultados",
  },
  "results.forQuery": " para «{query}»",
  "empty.title": "Nenhum projeto corresponde.",
  "empty.body": "Tenta outra palavra-chave, muda de filtro — ou sê tu a primeira pessoa a lançar-se.",

  // ---------- /projects/new — o limiar e depois o formulário ----------
  "gate.title": "Primeiro, contribui",
  "gate.body":
    "Aqui toda a gente mete as mãos na massa antes de pedir: são precisos {required} de contribuições acumuladas (todas as moedas juntas, convertidas no dia do pagamento) para desbloquear a criação do teu projeto.",
  "gate.progressLabel": "O teu progresso",
  "gate.percent": "{percent} %",
  "gate.progressAria": "Progresso rumo ao direito de publicar: {percent} %",
  // UMA frase por chave: a ordem das palavras pertence a cada língua.
  "gate.progress": "{current} de {required} — faltam {left}.",
  "gate.callLabel": "Querias substituir",
  "gate.callBody": "O apelo está à tua espera: contribui primeiro e volta depois para o agarrar.",
  "gate.callLink": "Rever o apelo",
  "gate.explore": "Explorar os projetos",
  "gate.suggestionsTitle": "Estão à espera do teu apoio",
  "form.title": "Lança o teu projeto",
  "form.titleReplace": "Substitui {target}",
  "form.subtitle":
    "Sê transparente sobre o teu plano: é ele que a comunidade financia, etapa a etapa.",
  "form.subtitleReplace":
    "Alguém descreveu o que compraria em vez disso. Mostra como o pensas construir, etapa a etapa.",

  // ---------- /projects/[slug] — a ficha do projeto ----------
  "detail.failedTitle": "Este projeto não vingou",
  "detail.failedBody": "Os contribuidores foram reembolsados sobre a custódia restante.",
  "detail.failedRebound": "Ressaltar agora →",
  "detail.failedViewer":
    "O falhanço faz parte do jogo — quem criou é reencaminhado para novas oportunidades.",
  "detail.completedTitle": "Projeto concretizado",
  "detail.completedBody":
    "Todas as etapas foram validadas pela comunidade e os fundos integralmente desbloqueados.",
  "detail.replaces": "Lança-se para substituir",
  "detail.followLoginTitle": "Inicia sessão para seguires este projeto",
  "detail.follow": "Seguir",
  "detail.followerCount": {
    one: "{count} seguidor",
    other: "{count} seguidores",
  },
  "detail.contact": "Contactar",
  "detail.brandPartnership": "Parceria de marca",
  "detail.ownerNotReadyOwner": "Para receber contribuições, ativa primeiro os teus pagamentos: o dinheiro dos teus contribuidores vai diretamente para a tua conta Stripe, em depósito, e precisa de um destino.",
  "detail.ownerNotReadyCta": "Ativar os meus pagamentos",
  "detail.ownerNotReadyVisitor": "Este promotor ainda não ativou a receção de fundos: de momento não é possível contribuir.",
  "detail.edit": "Editar",
  "detail.coverAlt": "Visual do projeto {title}",
  "detail.aboutTitle": "O projeto",
  "detail.skillsLabel": "Competências procuradas",
  "detail.milestonesTitle": "Etapas e provas de progresso",
  "detail.milestonesHint":
    "Os fundos são desbloqueados etapa a etapa: quem criou envia uma prova, os contribuidores votam.",
  "detail.realizeBefore": "a concretizar antes de {date} · D-{days}",
  "detail.updatesTitle": "Novidades do projeto",
  "detail.updatesByYou": "As notícias do terreno, contadas por ti.",
  "detail.updatesBy": "As notícias do terreno, contadas por {name}.",
  "detail.updatesEmpty": "Ainda sem novidades — vão aparecer aqui ao longo do projeto.",
  "detail.updateDelete": "Eliminar esta novidade",
  "detail.commentsTitle": "Discussão",
  "detail.commentsHint": "Perguntas, incentivos, ajudas — a comunidade do projeto.",
  "detail.commentsLogin": "Inicia sessão",
  "detail.commentsLoginSuffix": "para participares na discussão.",
  "detail.commentsEmpty": "Ainda ninguém comentou — abre tu a discussão!",
  "detail.commentReport": "Denunciar este comentário",
  "detail.commentDelete": "Eliminar este comentário",
  "detail.ofGoal": "de {goal}",
  "detail.contributorCount": {
    one: "{count} contribuidor",
    other: "{count} contribuidores",
  },
  "detail.daysLeft": "{count} dias restantes",
  "detail.campaignEnded": "Campanha terminada a {date}",
  "detail.releasedNote":
    "desbloqueados em {raised} — o resto fica em custódia até à validação das etapas.",
  "detail.ownerShareHint": "É o teu projeto — partilha-o para alcançares o teu objetivo.",
  "detail.loginToContribute": "Inicia sessão para contribuíres",
  "detail.contributorsTitle": "Contribuidores",
  "detail.moreContributors": "+ {count} outros",
  "detail.anonymous": "Contribuições anónimas",

  // ---------- /projects/[slug]/modifier ----------
  "edit.back": "Voltar ao projeto",
  "edit.title": "Editar o projeto",
  "edit.frozenLabel": "Enquadramento financeiro fixado",
  "edit.frozenSummary": {
    one: "Objetivo {goal} · fim da campanha a {date} · {count} etapa ({amounts})",
    other: "Objetivo {goal} · fim da campanha a {date} · {count} etapas ({amounts})",
  },
  "edit.frozenHint":
    "As contribuições estão comprometidas com estas regras: objetivo, etapas e duração já não podem mudar.",
  "edit.frozenClosed":
    "A campanha terminou: o conteúdo do projeto está fixado. Continua consultável pela comunidade, com as suas provas e o seu histórico.",
  "edit.dangerLabel": "Zona de retirada",
  "edit.deleteHint":
    "Ainda ninguém contribuiu: podes retirar definitivamente este projeto. Etapas, comentários e seguidores vão com ele — não há volta atrás.",
  "edit.cancelMembers": {
    one: "{count} membro contribuiu.",
    other: "{count} membros contribuíram.",
  },
  "edit.cancelBodyRefund":
    "Já não o podes retirar sem mais, mas podes pará-lo: passará a «não alcançado» e {amount} — a custódia restante — serão reembolsados aos contribuidores.",
  "edit.cancelBodyNoRefund":
    "Já não o podes retirar sem mais, mas podes pará-lo: passará a «não alcançado» e {amount} — a custódia restante — seriam reembolsados aos contribuidores.",
  "edit.cancelReleased":
    "Os {released} já desbloqueados pelos votos não são afetados.",
  "edit.closedHint":
    "Este projeto terminou o seu ciclo: continua consultável pela comunidade, com o seu histórico.",

  // ---------- /projects/[slug]/partenariat ----------
  "partnership.back": "Voltar ao projeto",
  "partnership.title": "Propor uma parceria",
  "partnership.intro":
    "Representa uma marca e quer colaborar com {owner} em torno de «{title}»? Descreva a sua proposta — quanto mais precisa e transparente for, mais depressa terá resposta.",
} satisfies Messages["projectsPages"];
