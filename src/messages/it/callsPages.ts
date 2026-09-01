import type { Messages } from "../types";

/**
 * Namespace `callsPages` — le pagine server del feed degli appelli:
 * /appels, /appels/nouveau, /appels/[slug] e /direct.
 */
export const callsPages = {
  // ---------- /appels (il feed) ----------
  "meta.listTitle": "Gli appelli",
  "meta.listDescription":
    "I brand di cui la community non vuole più, e i progetti che si lanciano per sostituirli.",
  "sort.orphelins": "Senza sostituto",
  "sort.soutenus": "I più sostenuti",
  "sort.recents": "I più recenti",
  "hero.label": "Il feed",
  "hero.title": "Quello che non vogliamo più — e quello che mettiamo al suo posto",
  "hero.body":
    "Ogni appello è pubblicato da un membro, a suo nome. Nomina un brand di cui non vuole più sapere e descrive cosa comprerebbe al suo posto. Qualcuno lo raccoglie, la community lo finanzia: è così che si sostituisce invece di limitarsi a rifiutare.",
  "hero.disclaimer": "GeniGain ospita questi appelli e non ne è l'autore.",
  "cta.publish": "Pubblica un appello",
  "search.placeholder": "Un brand, un settore, una parola…",
  "search.label": "Cerca un appello",
  "search.submit": "Cerca",
  "filters.sort": "Ordina",
  "filters.sectors": "Settori",
  "filters.allSectors": "Tutti i settori",
  "results.count": { one: "{count} appello", other: "{count} appelli" },
  "results.forQuery": " per «{query}»",
  "empty.noneYetTitle": "Il feed non ha ancora nessun appello.",
  "empty.noneYetBody":
    "Sii il primo a nominare un brand di cui non vuoi più sapere — e a dire cosa compreresti al suo posto.",
  "empty.allAnsweredTitle": "Tutti gli appelli hanno trovato un sostituto.",
  "empty.allAnsweredBody":
    "Buon segno. Aprine un altro se un brand ti è rimasto sullo stomaco.",
  "empty.noMatchTitle": "Nessun appello corrisponde.",
  "empty.noMatchBody": "Cambia filtro — o pubblica il tuo.",

  // ---------- /appels/nouveau ----------
  "meta.newTitle": "Pubblica un appello",
  "back.toFeed": "Torna al feed",
  "new.label": "Nuovo appello",
  "new.title": "Nomina ciò che vuoi vedere sostituito",
  "new.body":
    "Un appello non è uno sfogo: è un ordine passato a chi sa costruire. Più descrivi con precisione cosa compreresti al suo posto, più possibilità hai che qualcuno lo raccolga.",

  // ---------- /appels/[slug] ----------
  "meta.detailFallback": "Appello",
  "meta.detailTitle": "Sostituire {target}",
  "removed.title": "Questo appello è stato ritirato",
  "removed.byModeration": "Ritirato dalla moderazione — {reason}.",
  "removed.defaultReason": "non conforme alla carta degli appelli",
  "removed.byAuthor": "Ritirato da chi lo aveva pubblicato.",
  "badge.answered": { one: "{count} sostituto dichiarato", other: "{count} sostituti dichiarati" },
  "badge.none": "Nessun sostituto per ora",
  "target.label": "Non vuole più",
  "weight.calls": { one: "{count} appello", other: "{count} appelli" },
  "weight.aim": "prendono di mira questo brand, sostenuti da",
  "weight.total": "voci in totale.",
  "author.fallback": "Membro",
  "motive.title": "Il motivo",
  "wanted.title": "Cosa servirebbe al suo posto",
  "sources.title": "Fonti indicate dall'autore",
  "frame.disclaimer":
    "Appello pubblicato da un membro. GeniGain ospita questo contenuto, non ne è l'autore e non lo fa suo. Un brand chiamato in causa può chiederne la rimozione a",
  "share.title": "Sostituire {target}",
  "share.text": {
    one: "{count} persona vuole sostituire {target}. Al suo posto: {wanted}",
    other: "{count} persone vogliono sostituire {target}. Al suo posto: {wanted}",
  },
  "actions.removeMine": "Ritira il mio appello",
  "actions.removeModeration": "Ritira (moderazione)",
  "replacements.title": "I sostituti",
  "replacements.body":
    "Questi progetti si sono dichiarati su questo appello. Finanziarli significa far esistere l'alternativa.",
  "replacements.emptyTitle": "Nessuno l'ha ancora sostituito",
  "replacements.emptyBody":
    "Questo appello aspetta chi lo porti avanti. I sostegni qui sopra sono altrettanti primi contributori.",
  "replacements.withdrawMine": "Ritira questo progetto dall'appello",
  "replacements.detach": "Stacca questo progetto (occupa l'appello abusivamente)",
  "videos.title": "Le testimonianze filmate",
  "videos.attached": {
    one: "{count} testimonianza legata a questo appello —",
    other: "{count} testimonianze legate a questo appello —",
  },
  "videos.seeLive": "guardale nella diretta",
  "videos.emptyBody": "Una videocamera dice in trenta secondi quello che un paragrafo fatica a dimostrare.",
  "login.cta": "Accedi",
  "videos.loginSuffix": "per filmare la tua testimonianza.",
  "discussion.title": "La discussione",
  "discussion.body":
    "Confermare, sfumare, contraddire. L'azienda chiamata in causa può rispondere qui come chiunque altro.",
  "discussion.removeComment": "Ritira questo commento",
  "discussion.shown": "Sono mostrate le {shown} risposte più recenti, su {total}.",
  "discussion.loginSuffix": "per rispondere a questo appello.",
  "siblings.title": "Altri appelli prendono di mira {target}",
  "siblings.body": "Pubblicati separatamente, da altri membri, per altri motivi.",
  "siblings.voices": "voci",
  "siblings.by": "di {name}",
  "siblings.anonymous": "un membro",
  "siblings.answers": { one: " · {count} sostituto", other: " · {count} sostituti" },

  // ---------- /direct ----------
  "meta.directTitle": "La diretta",
  "meta.directDescription":
    "Le testimonianze filmate della community: perché non vogliamo più questi brand, e cosa vorremmo al loro posto.",
  "direct.label": "La diretta",
  "direct.title": "Quello che non vogliamo più, filmato",
  "direct.publish": "Pubblica",
} satisfies Messages["callsPages"];
