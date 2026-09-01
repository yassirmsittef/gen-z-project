import type { Messages } from "../types";

/**
 * Namespace `communityPages` — le pagine server della rete:
 * /communaute (il globo) e /classements.
 */
export const communityPages = {
  // ---------- Contatori condivisi ----------
  "count.members": { one: "{count} membro", other: "{count} membri" },
  "count.projects": { one: "{count} progetto", other: "{count} progetti" },
  "count.supports": { one: "{count} sostegno", other: "{count} sostegni" },

  // ---------- /communaute ----------
  "meta.communityTitle": "Community",
  "community.title": "Community",
  "stats.cities": { one: "{count} città sul globo", other: "{count} città sul globo" },
  "stats.network": "la rete in orbita",
  "globe.clearCity": "Rimuovi il filtro città",
  "globe.empty": "Il globo aspetta i suoi primi segnali — aggiungi la tua città dalla dashboard",
  "globe.hintDesktop": "Trascina per esplorare · clicca un punto",
  "globe.hintMobile": "Un dito: ruotare · due dita: inclinare",
  "locate.notYet": "Non appari ancora sul globo.",
  "locate.cta": "Aggiungi la tua città dalla dashboard →",
  "search.placeholder": "Un nome, una competenza (montaggio, cucito...)",
  "search.memberLabel": "Cerca un membro",
  "search.cityPlaceholder": "Tutte le città",
  "search.cityLabel": "Filtra per città",
  "search.submit": "Cerca",
  "search.reset": "Reimposta",
  "results.inCity": " a {city}",
  "results.forQuery": " per «{query}»",
  "results.empty": "Nessuno corrisponde a questa ricerca.",
  "results.resetCta": "Reimposta i filtri →",
  "member.offRadar": "Fuori radar",
  "member.contact": "Contatta {name}",
  "member.invested": "{amount} investiti",

  // ---------- /classements ----------
  "meta.rankingsTitle": "Classifiche",
  "rankings.title": "Classifiche",
  "rankings.subtitle": "I progetti che fanno vibrare la community",
  "rankings.empty": "Niente da classificare per ora.",
  "rankings.active": "In campagna",
  "rankings.funded": "Finanziati e realizzati",
  "brands.title": "I brand che vogliamo sostituire",
  "brands.body":
    "Il peso cumulato di tutti gli appelli che prendono di mira lo stesso brand. Pubblicati dai membri — GeniGain ospita questo feed e non ne è l'autore.",
  "brands.calls": { one: "{count} appello", other: "{count} appelli" },
  "brands.answersOnTheWay": {
    one: " · {count} sostituto in arrivo",
    other: " · {count} sostituti in arrivo",
  },
  "brands.nobodyYet": " · ancora nessuno se ne occupa",
  "brands.upForGrabs": "Da prendere",
  "brands.voices": "voci",
} satisfies Messages["communityPages"];
