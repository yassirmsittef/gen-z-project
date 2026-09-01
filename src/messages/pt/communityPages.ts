import type { Messages } from "../types";

/**
 * Namespace `communityPages` — as páginas de servidor da rede:
 * /communaute (o globo) e /classements.
 */
export const communityPages = {
  // ---------- Contadores partilhados ----------
  "count.members": { one: "{count} membro", other: "{count} membros" },
  "count.projects": { one: "{count} projeto", other: "{count} projetos" },
  "count.supports": { one: "{count} apoio", other: "{count} apoios" },

  // ---------- /communaute ----------
  "meta.communityTitle": "Comunidade",
  "community.title": "Comunidade",
  "stats.cities": { one: "{count} cidade no globo", other: "{count} cidades no globo" },
  "stats.network": "a rede em órbita",
  "globe.clearCity": "Retirar o filtro de cidade",
  "globe.empty": "O globo espera os primeiros sinais — acrescenta a tua cidade a partir do teu painel",
  "globe.hintDesktop": "Arrasta para explorar · clica num ponto",
  "globe.hintMobile": "Um dedo: rodar · dois dedos: inclinar",
  "locate.notYet": "Ainda não apareces no globo.",
  "locate.cta": "Acrescenta a tua cidade a partir do teu painel →",
  "search.placeholder": "Um nome, uma competência (edição, costura...)",
  "search.memberLabel": "Pesquisar um membro",
  "search.cityPlaceholder": "Todas as cidades",
  "search.cityLabel": "Filtrar por cidade",
  "search.submit": "Pesquisar",
  "search.reset": "Repor",
  "results.inCity": " em {city}",
  "results.forQuery": " para «{query}»",
  "results.empty": "Ninguém corresponde a esta pesquisa.",
  "results.resetCta": "Repor os filtros →",
  "member.offRadar": "Fora do radar",
  "member.contact": "Contactar {name}",
  "member.invested": "{amount} investidos",

  // ---------- /classements ----------
  "meta.rankingsTitle": "Classificações",
  "rankings.title": "Classificações",
  "rankings.subtitle": "Os projetos que fazem vibrar a comunidade",
  "rankings.empty": "Nada para classificar de momento.",
  "rankings.active": "Em campanha",
  "rankings.funded": "Financiados e concretizados",
  "brands.title": "As marcas que queremos substituir",
  "brands.body":
    "O peso acumulado de todos os apelos que visam a mesma marca. Publicados por membros — a GeniGain aloja este fio e não é a sua autora.",
  "brands.calls": { one: "{count} apelo", other: "{count} apelos" },
  "brands.answersOnTheWay": {
    one: " · {count} substituto a caminho",
    other: " · {count} substitutos a caminho",
  },
  "brands.nobodyYet": " · ainda ninguém lhe pegou",
  "brands.upForGrabs": "Por agarrar",
  "brands.voices": "vozes",
} satisfies Messages["communityPages"];
