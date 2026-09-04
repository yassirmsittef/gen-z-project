import type { Messages } from "../types";

/**
 * Namespace `projectsPages` — le 5 pagine server di /projects:
 * elenco, creazione (soglia compresa), scheda progetto, modifica, partnership.
 */
export const projectsPages = {
  // ---------- Metadati (una chiave per pagina del namespace) ----------
  "meta.listTitle": "Progetti",
  "meta.newTitle": "Lancia un progetto",
  "meta.detailNotFound": "Progetto non trovato",
  "meta.editTitle": "Modifica il progetto",
  "meta.partnershipTitle": "Proponi una partnership",

  // ---------- /projects — l'elenco ----------
  "hero.title": "I progetti della community",
  "hero.subtitle": "Ogni contributo conta — ed è il tuo biglietto per lanciare il tuo.",
  "search.placeholder": "Cerca un progetto, un'idea, una parola chiave…",
  "search.ariaLabel": "Cerca un progetto",
  "search.submit": "Cerca",
  "filters.categories": "Categorie",
  "filters.allCategories": "Tutte le categorie",
  "filters.statusesAndSort": "Stati e ordinamento",
  "filters.allStatuses": "Tutti gli stati",
  "filters.sortLabel": "Ordina",
  "sort.recent": "Più recenti",
  "sort.suivis": "Più seguiti",
  "sort.fin": "In scadenza",
  "sort.finances": "Più finanziati",
  "results.count": {
    one: "{count} risultato",
    other: "{count} risultati",
  },
  "results.forQuery": " per «{query}»",
  "empty.title": "Nessun progetto corrisponde.",
  "empty.body": "Prova un'altra parola chiave, cambia filtro — o sii il primo a lanciarti.",

  // ---------- /projects/new — la soglia, poi il modulo ----------
  "gate.title": "Prima, contribuisci",
  "gate.body":
    "Qui tutti mettono mano prima di chiedere: servono {required} di contributi cumulati (tutte le valute insieme, convertite al giorno del pagamento) per sbloccare la creazione del tuo progetto.",
  "gate.progressLabel": "I tuoi progressi",
  "gate.percent": "{percent}%",
  "gate.progressAria": "Avanzamento verso il diritto di pubblicare: {percent}%",
  // UNA frase per chiave: l'ordine delle parole appartiene a ogni lingua.
  "gate.progress": "{current} su {required} — mancano {left}.",
  "gate.callLabel": "Volevi sostituire",
  "gate.callBody": "L'appello ti aspetta: prima contribuisci, poi torna a prenderlo.",
  "gate.callLink": "Rivedi l'appello",
  "gate.explore": "Esplora i progetti",
  "gate.suggestionsTitle": "Aspettano il tuo sostegno",
  "form.title": "Lancia il tuo progetto",
  "form.titleReplace": "Sostituisci {target}",
  "form.subtitle":
    "Sii trasparente sul tuo piano: è quello che la community finanzia, tappa dopo tappa.",
  "form.subtitleReplace":
    "Qualcuno ha descritto cosa comprerebbe al suo posto. Mostra come pensi di costruirlo, tappa dopo tappa.",

  // ---------- /projects/[slug] — la scheda progetto ----------
  "detail.failedTitle": "Questo progetto non è andato in porto",
  "detail.failedBody": "I contributori sono stati rimborsati sul deposito rimanente.",
  "detail.failedRebound": "Rimbalza adesso →",
  "detail.failedViewer":
    "Il fallimento fa parte del gioco — chi l'ha creato viene orientato verso nuove opportunità.",
  "detail.completedTitle": "Progetto realizzato",
  "detail.completedBody":
    "Tutte le tappe sono state convalidate dalla community e i fondi interamente sbloccati.",
  "detail.replaces": "Si lancia per sostituire",
  "detail.followLoginTitle": "Accedi per seguire questo progetto",
  "detail.follow": "Segui",
  "detail.followerCount": {
    one: "{count} follower",
    other: "{count} follower",
  },
  "detail.contact": "Contatta",
  "detail.brandPartnership": "Partnership brand",
  "detail.ownerNotReadyOwner": "Per ricevere contributi, attiva prima i tuoi pagamenti: il denaro dei tuoi sostenitori arriva direttamente sul tuo conto Stripe, in deposito, e ha bisogno di una destinazione.",
  "detail.ownerNotReadyCta": "Attiva i miei pagamenti",
  "detail.ownerNotReadyVisitor": "Questo promotore non ha ancora attivato la ricezione dei fondi: per ora non è possibile contribuire.",
  "detail.edit": "Modifica",
  "detail.coverAlt": "Immagine del progetto {title}",
  "detail.aboutTitle": "Il progetto",
  "detail.skillsLabel": "Competenze cercate",
  "detail.milestonesTitle": "Tappe e prove di avanzamento",
  "detail.milestonesHint":
    "I fondi vengono sbloccati tappa dopo tappa: chi crea invia una prova, i contributori votano.",
  "detail.realizeBefore": "da realizzare entro il {date} · -{days} g",
  "detail.updatesTitle": "Novità del progetto",
  "detail.updatesByYou": "Le notizie dal campo, raccontate da te.",
  "detail.updatesBy": "Le notizie dal campo, raccontate da {name}.",
  "detail.updatesEmpty": "Ancora nessuna novità — appariranno qui man mano che il progetto avanza.",
  "detail.updateDelete": "Elimina questa novità",
  "detail.commentsTitle": "Discussione",
  "detail.commentsHint": "Domande, incoraggiamenti, una mano — la community del progetto.",
  "detail.commentsLogin": "Accedi",
  "detail.commentsLoginSuffix": "per partecipare alla discussione.",
  "detail.commentsEmpty": "Nessuno ha ancora commentato — apri tu la discussione!",
  "detail.commentReport": "Segnala questo commento",
  "detail.commentDelete": "Elimina questo commento",
  "detail.ofGoal": "su {goal}",
  "detail.contributorCount": {
    one: "{count} contributore",
    other: "{count} contributori",
  },
  "detail.daysLeft": "{count} g rimanenti",
  "detail.campaignEnded": "Campagna terminata il {date}",
  "detail.releasedNote":
    "sbloccati su {raised} — il resto è in deposito fino alla convalida delle tappe.",
  "detail.ownerShareHint": "È il tuo progetto — condividilo per raggiungere l'obiettivo.",
  "detail.loginToContribute": "Accedi per contribuire",
  "detail.contributorsTitle": "Contributori",
  "detail.moreContributors": "+ altri {count}",
  "detail.anonymous": "Contributi anonimi",

  // ---------- /projects/[slug]/modifica ----------
  "edit.back": "Torna al progetto",
  "edit.title": "Modifica il progetto",
  "edit.frozenLabel": "Quadro finanziario bloccato",
  "edit.frozenSummary": {
    one: "Obiettivo {goal} · fine campagna il {date} · {count} tappa ({amounts})",
    other: "Obiettivo {goal} · fine campagna il {date} · {count} tappe ({amounts})",
  },
  "edit.frozenHint":
    "I contributi sono impegnati su queste regole: obiettivo, tappe e durata non possono più cambiare.",
  "edit.frozenClosed":
    "La campagna è terminata: il contenuto del progetto è bloccato. Resta consultabile dalla community, con le sue prove e la sua cronologia.",
  "edit.dangerLabel": "Zona di ritiro",
  "edit.deleteHint":
    "Nessuno ha ancora contribuito: puoi ritirare definitivamente questo progetto. Tappe, commenti e chi lo segue spariranno con lui — non si torna indietro.",
  "edit.cancelMembers": {
    one: "{count} membro ha contribuito.",
    other: "{count} membri hanno contribuito.",
  },
  "edit.cancelBodyRefund":
    "Non puoi più ritirarlo del tutto, ma puoi fermarlo: passerà a «non raggiunto» e {amount} — il deposito rimanente — saranno rimborsati ai contributori.",
  "edit.cancelBodyNoRefund":
    "Non puoi più ritirarlo del tutto, ma puoi fermarlo: passerà a «non raggiunto» e {amount} — il deposito rimanente — sarebbero rimborsati ai contributori.",
  "edit.cancelReleased":
    "I {released} già sbloccati dai voti non sono interessati.",
  "edit.closedHint":
    "Questo progetto ha concluso il suo ciclo: resta consultabile dalla community, con la sua cronologia.",

  // ---------- /projects/[slug]/partnership ----------
  "partnership.back": "Torna al progetto",
  "partnership.title": "Proponi una partnership",
  "partnership.intro":
    "Rappresentate un brand e volete collaborare con {owner} intorno a «{title}»? Descrivete la vostra proposta — più è precisa e trasparente, più in fretta avrete una risposta.",
} satisfies Messages["projectsPages"];
