import type { Messages } from "../types";

/**
 * Namespace `callsPages` — as páginas de servidor do fio dos apelos:
 * /appels, /appels/nouveau, /appels/[slug] e /direct.
 */
export const callsPages = {
  // ---------- /appels (o fio) ----------
  "meta.listTitle": "Os apelos",
  "meta.listDescription":
    "As marcas de que a comunidade já não quer, e os projetos que se lançam para as substituir.",
  "sort.orphelins": "Sem substituto",
  "sort.soutenus": "Mais apoiados",
  "sort.recents": "Mais recentes",
  "hero.label": "O fio",
  "hero.title": "O que já não queremos — e o que pomos no lugar",
  "hero.body":
    "Cada apelo é publicado por um membro, em seu nome. Nomeia uma marca de que já não quer e descreve o que compraria em vez disso. Alguém o agarra, a comunidade financia-o: é assim que se substitui em vez de apenas recusar.",
  "hero.disclaimer": "A GeniGain aloja estes apelos e não é a sua autora.",
  "cta.publish": "Publicar um apelo",
  "search.placeholder": "Uma marca, um setor, uma palavra…",
  "search.label": "Pesquisar um apelo",
  "search.submit": "Pesquisar",
  "filters.sort": "Ordenação",
  "filters.sectors": "Setores",
  "filters.allSectors": "Todos os setores",
  "results.count": { one: "{count} apelo", other: "{count} apelos" },
  "results.forQuery": " para «{query}»",
  "empty.noneYetTitle": "O fio ainda não tem nenhum apelo.",
  "empty.noneYetBody":
    "Sê a primeira pessoa a nomear uma marca de que já não queres — e a dizer o que comprarias em vez disso.",
  "empty.allAnsweredTitle": "Todos os apelos encontraram um substituto.",
  "empty.allAnsweredBody":
    "É bom sinal. Abre outro se alguma marca te ficou atravessada.",
  "empty.noMatchTitle": "Nenhum apelo corresponde.",
  "empty.noMatchBody": "Muda de filtro — ou publica o teu.",

  // ---------- /appels/nouveau ----------
  "meta.newTitle": "Publicar um apelo",
  "back.toFeed": "Voltar ao fio",
  "new.label": "Novo apelo",
  "new.title": "Nomeia o que queres ver substituído",
  "new.body":
    "Um apelo não é um desabafo: é uma encomenda feita a quem sabe construir. Quanto melhor descreveres o que comprarias em vez disso, mais hipóteses tens de que alguém o agarre.",

  // ---------- /appels/[slug] ----------
  "meta.detailFallback": "Apelo",
  "meta.detailTitle": "Substituir {target}",
  "removed.title": "Este apelo foi retirado",
  "removed.byModeration": "Retirado pela moderação — {reason}.",
  "removed.defaultReason": "não conforme com a carta dos apelos",
  "removed.byAuthor": "Retirado por quem o tinha publicado.",
  "badge.answered": { one: "{count} substituto declarado", other: "{count} substitutos declarados" },
  "badge.none": "Ainda sem substituto",
  "target.label": "Já não quer",
  "weight.calls": { one: "{count} apelo", other: "{count} apelos" },
  "weight.aim": "visam esta marca, com o peso de",
  "weight.total": "vozes no total.",
  "author.fallback": "Membro",
  "motive.title": "O motivo",
  "wanted.title": "O que seria preciso em vez disso",
  "sources.title": "Fontes apresentadas por quem escreveu",
  "frame.disclaimer":
    "Apelo publicado por um membro. A GeniGain aloja este conteúdo, não é a sua autora e não o subscreve. Uma marca visada pode pedir a remoção para",
  "share.title": "Substituir {target}",
  "share.text": {
    one: "{count} pessoa quer substituir {target}. Em vez disso: {wanted}",
    other: "{count} pessoas querem substituir {target}. Em vez disso: {wanted}",
  },
  "actions.removeMine": "Retirar o meu apelo",
  "actions.removeModeration": "Retirar (moderação)",
  "replacements.title": "Os substitutos",
  "replacements.body":
    "Estes projetos declararam-se sobre este apelo. Financiá-los é fazer existir a alternativa.",
  "replacements.emptyTitle": "Ainda ninguém a substituiu",
  "replacements.emptyBody":
    "Este apelo espera por quem o leve. Os apoios acima são outros tantos primeiros contribuidores.",
  "replacements.withdrawMine": "Retirar este projeto do apelo",
  "replacements.detach": "Separar este projeto (está a ocupar o apelo indevidamente)",
  "videos.title": "Os testemunhos filmados",
  "videos.attached": {
    one: "{count} testemunho ligado a este apelo —",
    other: "{count} testemunhos ligados a este apelo —",
  },
  "videos.seeLive": "vê-los no direto",
  "videos.emptyBody": "Uma câmara diz em trinta segundos o que um parágrafo demora a provar.",
  "login.cta": "Inicia sessão",
  "videos.loginSuffix": "para filmares o teu testemunho.",
  "discussion.title": "A discussão",
  "discussion.body":
    "Corroborar, matizar, contradizer. A empresa visada pode responder aqui como qualquer pessoa.",
  "discussion.removeComment": "Retirar este comentário",
  "discussion.shown": "São mostradas as {shown} respostas mais recentes, de {total}.",
  "discussion.loginSuffix": "para responderes a este apelo.",
  "siblings.title": "Outros apelos visam {target}",
  "siblings.body": "Publicados separadamente, por outros membros, por outras razões.",
  "siblings.voices": "vozes",
  "siblings.by": "por {name}",
  "siblings.anonymous": "um membro",
  "siblings.answers": { one: " · {count} substituto", other: " · {count} substitutos" },

  // ---------- /direct ----------
  "meta.directTitle": "O direto",
  "meta.directDescription":
    "Os testemunhos filmados da comunidade: porque já não queremos estas marcas, e o que queríamos em vez delas.",
  "direct.label": "O direto",
  "direct.title": "O que já não queremos, filmado",
  "direct.publish": "Publicar",
} satisfies Messages["callsPages"];
