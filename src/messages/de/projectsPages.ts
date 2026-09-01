import type { Messages } from "../types";

/**
 * Namespace `projectsPages` — die 5 Serverseiten von /projects:
 * Liste, Erstellung (samt Gate), Projektseite, Bearbeitung, Partnerschaft.
 * Schlüssel nach Seite präfixiert: meta.*, hero/search/filters/sort/results/empty
 * (Liste), gate/form (Erstellung), detail.*, edit.*, partnership.*.
 */
export const projectsPages = {
  // ---------- Metadaten (ein Schlüssel pro Seite des Namespace) ----------
  "meta.listTitle": "Projekte",
  "meta.newTitle": "Projekt starten",
  "meta.detailNotFound": "Projekt nicht gefunden",
  "meta.editTitle": "Projekt bearbeiten",
  "meta.partnershipTitle": "Partnerschaft vorschlagen",

  // ---------- /projects — die Liste ----------
  "hero.title": "Die Projekte der Community",
  "hero.subtitle": "Jeder Beitrag zählt — und er ist dein Ticket, um dein eigenes zu starten.",
  "search.placeholder": "Projekt, Idee oder Stichwort suchen…",
  "search.ariaLabel": "Projekt suchen",
  "search.submit": "Suchen",
  "filters.categories": "Kategorien",
  "filters.allCategories": "Alle Kategorien",
  "filters.statusesAndSort": "Status und Sortierung",
  "filters.allStatuses": "Alle Status",
  "filters.sortLabel": "Sortierung",
  "sort.recent": "Neueste",
  "sort.suivis": "Meistgefolgt",
  "sort.fin": "Enden bald",
  "sort.finances": "Am meisten finanziert",
  "results.count": {
    one: "{count} Ergebnis",
    other: "{count} Ergebnisse",
  },
  "results.forQuery": " für „{query}“",
  "empty.title": "Kein Projekt passt dazu.",
  "empty.body": "Versuch ein anderes Stichwort, wechsel den Filter — oder leg als Erste·r los.",

  // ---------- /projects/new — erst das Gate, dann das Formular ----------
  "gate.title": "Zuerst: trag bei",
  "gate.body":
    "Hier packen alle mit an, bevor sie fragen: Es braucht {required} an gesammelten Beiträgen (alle Währungen zusammen, umgerechnet am Tag der Zahlung), um die Erstellung deines Projekts freizuschalten.",
  "gate.progressLabel": "Dein Fortschritt",
  "gate.percent": "{percent} %",
  "gate.progressAria": "Fortschritt zum Recht zu posten: {percent} %",
  // EIN Satz pro Schlüssel: Die Wortstellung gehört jeder Sprache selbst.
  "gate.progress": "{current} von {required} — {left} fehlen noch.",
  "gate.callLabel": "Du wolltest ersetzen",
  "gate.callBody": "Der Aufruf wartet auf dich: erst beitragen, dann zurückkommen und ihn annehmen.",
  "gate.callLink": "Aufruf nochmal ansehen",
  "gate.explore": "Projekte erkunden",
  "gate.suggestionsTitle": "Sie warten auf deine Unterstützung",
  "form.title": "Starte dein Projekt",
  "form.titleReplace": "Ersetze {target}",
  "form.subtitle":
    "Sei transparent bei deinem Plan: Genau ihn finanziert die Community, Etappe für Etappe.",
  "form.subtitleReplace":
    "Jemand hat beschrieben, was er stattdessen kaufen würde. Zeig, wie du es bauen willst, Etappe für Etappe.",

  // ---------- /projects/[slug] — die Projektseite ----------
  "detail.failedTitle": "Dieses Projekt hat es nicht geschafft",
  "detail.failedBody":
    "Die Unterstützer wurden aus dem verbleibenden Treuhandkonto zurückerstattet.",
  "detail.failedRebound": "Jetzt wieder aufstehen →",
  "detail.failedViewer":
    "Scheitern gehört zum Spiel — die Person dahinter wird zu neuen Chancen gelotst.",
  "detail.completedTitle": "Projekt umgesetzt",
  "detail.completedBody":
    "Alle Etappen wurden von der Community bestätigt und die Gelder vollständig freigegeben.",
  "detail.replaces": "Startet als Ersatz für",
  "detail.followLoginTitle": "Melde dich an, um diesem Projekt zu folgen",
  "detail.follow": "Folgen",
  "detail.followerCount": {
    one: "{count} Follower",
    other: "{count} Follower",
  },
  "detail.contact": "Kontaktieren",
  "detail.brandPartnership": "Markenpartnerschaft",
  "detail.edit": "Bearbeiten",
  "detail.coverAlt": "Visual des Projekts {title}",
  "detail.aboutTitle": "Das Projekt",
  "detail.skillsLabel": "Gesuchte Skills",
  "detail.milestonesTitle": "Etappen & Fortschrittsnachweise",
  "detail.milestonesHint":
    "Die Gelder werden Etappe für Etappe freigegeben: Der Projektträger reicht einen Nachweis ein, die Unterstützer stimmen ab.",
  "detail.realizeBefore": "umzusetzen bis {date} · noch {days} Tage",
  "detail.updatesTitle": "Updates zum Projekt",
  "detail.updatesByYou": "Neues von der Baustelle, erzählt von dir.",
  "detail.updatesBy": "Neues von der Baustelle, erzählt von {name}.",
  "detail.updatesEmpty": "Noch kein Update — sie erscheinen hier im Lauf des Projekts.",
  "detail.updateDelete": "Dieses Update löschen",
  "detail.commentsTitle": "Diskussion",
  "detail.commentsHint":
    "Fragen, Zuspruch, helfende Hände — die Community rund um das Projekt.",
  "detail.commentsLogin": "Melde dich an",
  "detail.commentsLoginSuffix": "und misch dich in die Diskussion ein.",
  "detail.commentsEmpty": "Noch hat niemand kommentiert — eröffne die Diskussion!",
  "detail.commentReport": "Diesen Kommentar melden",
  "detail.commentDelete": "Diesen Kommentar löschen",
  "detail.ofGoal": "von {goal}",
  "detail.contributorCount": {
    one: "{count} Unterstützer",
    other: "{count} Unterstützer",
  },
  "detail.daysLeft": "Noch {count} Tag(e)",
  "detail.campaignEnded": "Kampagne beendet am {date}",
  "detail.releasedNote":
    "freigegeben von {raised} — der Rest liegt im Treuhandkonto, bis die Etappen bestätigt sind.",
  "detail.ownerShareHint": "Das ist dein Projekt — teil es, um dein Ziel zu erreichen.",
  "detail.loginToContribute": "Melde dich an, um beizutragen",
  "detail.contributorsTitle": "Unterstützer·innen",
  "detail.moreContributors": "+ {count} weitere",
  "detail.anonymous": "Anonyme Beiträge",

  // ---------- /projects/[slug]/modifier ----------
  "edit.back": "Zurück zum Projekt",
  "edit.title": "Projekt bearbeiten",
  "edit.frozenLabel": "Finanzrahmen fixiert",
  "edit.frozenSummary": {
    one: "Ziel {goal} · Kampagnenende am {date} · {count} Etappe ({amounts})",
    other: "Ziel {goal} · Kampagnenende am {date} · {count} Etappen ({amounts})",
  },
  "edit.frozenHint":
    "Die Beiträge sind auf diese Regeln hin eingegangen: Ziel, Etappen und Dauer lassen sich nicht mehr ändern.",
  "edit.frozenClosed":
    "Die Kampagne ist beendet: Der Inhalt des Projekts ist eingefroren. Er bleibt für die Community einsehbar, mit seinen Nachweisen und seiner Historie.",
  "edit.dangerLabel": "Rückzugsbereich",
  "edit.deleteHint":
    "Noch hat niemand beigetragen: Du kannst dieses Projekt endgültig zurückziehen. Etappen, Kommentare und Follower gehen mit ihm — es gibt kein Zurück.",
  "edit.cancelMembers": {
    one: "{count} Mitglied hat beigetragen.",
    other: "{count} Mitglieder haben beigetragen.",
  },
  "edit.cancelBodyRefund":
    "Einfach zurückziehen geht nicht mehr, aber du kannst es stoppen: Es gilt dann als „nicht erreicht“, und {amount} — das verbleibende Treuhandkonto — gehen zurück an die Unterstützer.",
  "edit.cancelBodyNoRefund":
    "Einfach zurückziehen geht nicht mehr, aber du kannst es stoppen: Es gilt dann als „nicht erreicht“, und {amount} — das verbleibende Treuhandkonto — gingen zurück an die Unterstützer.",
  "edit.cancelReleased":
    "Die {released}, die die Abstimmungen bereits freigegeben haben, sind davon nicht betroffen.",
  "edit.closedHint":
    "Dieses Projekt hat seinen Zyklus beendet: Es bleibt für die Community einsehbar, mit seiner Historie.",

  // ---------- /projects/[slug]/partenariat ----------
  "partnership.back": "Zurück zum Projekt",
  "partnership.title": "Partnerschaft vorschlagen",
  "partnership.intro":
    "Sie vertreten eine Marke und möchten mit {owner} rund um „{title}“ zusammenarbeiten? Beschreiben Sie Ihren Vorschlag — je präziser und transparenter er ist, desto schneller bekommen Sie eine Antwort.",
} satisfies Messages["projectsPages"];
