import type { Messages } from "../types";

/**
 * Namespace `callsPages` — die Serverseiten des Aufruf-Feeds:
 * /appels, /appels/nouveau, /appels/[slug] und /direct.
 */
export const callsPages = {
  // ---------- /appels (der Feed) ----------
  "meta.listTitle": "Die Aufrufe",
  "meta.listDescription":
    "Die Marken, von denen die Community genug hat, und die Projekte, die als Ersatz starten.",
  "sort.orphelins": "Ohne Ersatz",
  "sort.soutenus": "Am meisten unterstützt",
  "sort.recents": "Neueste",
  "hero.label": "Der Feed",
  "hero.title": "Was wir nicht mehr wollen — und was wir stattdessen hinstellen",
  "hero.body":
    "Jeder Aufruf wird von einem Mitglied veröffentlicht, unter seinem Namen. Es nennt eine Marke, von der es genug hat, und beschreibt, was es stattdessen kaufen würde. Ein Projektträger greift ihn auf, die Community finanziert ihn: So ersetzt man, statt nur abzulehnen.",
  "hero.disclaimer": "GeniGain hostet diese Aufrufe und ist nicht ihr Autor.",
  "cta.publish": "Aufruf veröffentlichen",
  "search.placeholder": "Eine Marke, eine Branche, ein Wort…",
  "search.label": "Aufruf suchen",
  "search.submit": "Suchen",
  "filters.sort": "Sortierung",
  "filters.sectors": "Branchen",
  "filters.allSectors": "Alle Branchen",
  "results.count": { one: "{count} Aufruf", other: "{count} Aufrufe" },
  "results.forQuery": " für „{query}“",
  "empty.noneYetTitle": "Der Feed hat noch keinen Aufruf.",
  "empty.noneYetBody":
    "Sei die erste Stimme: Nenn eine Marke, von der du genug hast — und sag, was du stattdessen kaufen würdest.",
  "empty.allAnsweredTitle": "Alle Aufrufe haben einen Ersatz gefunden.",
  "empty.allAnsweredBody":
    "Gutes Zeichen. Eröffne einen neuen, wenn dir eine Marke quer liegt.",
  "empty.noMatchTitle": "Kein Aufruf passt dazu.",
  "empty.noMatchBody": "Wechsel den Filter — oder veröffentliche deinen eigenen.",

  // ---------- /appels/nouveau ----------
  "meta.newTitle": "Aufruf veröffentlichen",
  "back.toFeed": "Zurück zum Feed",
  "new.label": "Neuer Aufruf",
  "new.title": "Nenn, was du ersetzt sehen willst",
  "new.body":
    "Ein Aufruf ist kein Wutausbruch: Er ist ein Auftrag an alle, die bauen können. Je genauer du beschreibst, was du stattdessen kaufen würdest, desto größer die Chance, dass ein Projektträger ihn aufgreift.",

  // ---------- /appels/[slug] ----------
  "meta.detailFallback": "Aufruf",
  "meta.detailTitle": "{target} ersetzen",
  "removed.title": "Dieser Aufruf wurde entfernt",
  "removed.byModeration": "Von der Moderation entfernt — {reason}.",
  "removed.defaultReason": "nicht konform mit der Aufruf-Charta",
  "removed.byAuthor": "Von der Person zurückgezogen, die ihn veröffentlicht hatte.",
  "badge.answered": {
    one: "{count} Ersatz erklärt",
    other: "{count} Ersatzprojekte erklärt",
  },
  "badge.none": "Vorerst kein Ersatz",
  "target.label": "Hat genug von",
  "weight.calls": { one: "{count} Aufruf", other: "{count} Aufrufe" },
  "weight.aim": "richten sich gegen diese Marke, getragen von",
  "weight.total": "Stimmen insgesamt.",
  "author.fallback": "Mitglied",
  "motive.title": "Der Grund",
  "wanted.title": "Was es stattdessen bräuchte",
  "sources.title": "Vom Autor angeführte Quellen",
  "frame.disclaimer":
    "Von einem Mitglied veröffentlichter Aufruf. GeniGain hostet diesen Inhalt, ist nicht sein Autor und macht ihn sich nicht zu eigen. Eine beschuldigte Marke kann eine Entfernung verlangen bei",
  "share.title": "{target} ersetzen",
  "share.text": {
    one: "{count} Person will {target} ersetzen. Stattdessen: {wanted}",
    other: "{count} Personen wollen {target} ersetzen. Stattdessen: {wanted}",
  },
  "actions.removeMine": "Meinen Aufruf zurückziehen",
  "actions.removeModeration": "Entfernen (Moderation)",
  "replacements.title": "Die Ersatzprojekte",
  "replacements.body":
    "Diese Projekte haben sich auf diesen Aufruf erklärt. Sie zu finanzieren heißt, die Alternative entstehen zu lassen.",
  "replacements.emptyTitle": "Noch hat niemand ersetzt",
  "replacements.emptyBody":
    "Dieser Aufruf wartet auf seinen Projektträger. Die Stimmen oben sind ebenso viele erste Unterstützer.",
  "replacements.withdrawMine": "Dieses Projekt vom Aufruf zurückziehen",
  "replacements.detach": "Dieses Projekt abkoppeln (es besetzt den Aufruf)",
  "videos.title": "Die gefilmten Erfahrungsberichte",
  "videos.attached": {
    one: "{count} Erfahrungsbericht hängt an diesem Aufruf —",
    other: "{count} Erfahrungsberichte hängen an diesem Aufruf —",
  },
  "videos.seeLive": "im Live-Feed ansehen",
  "videos.emptyBody":
    "Eine Kamera sagt in dreißig Sekunden, was ein Absatz erst beweisen muss.",
  "login.cta": "Melde dich an",
  "videos.loginSuffix": "und film deinen Erfahrungsbericht.",
  "discussion.title": "Die Diskussion",
  "discussion.body":
    "Bestätigen, differenzieren, widersprechen. Das beschuldigte Unternehmen kann hier antworten wie alle anderen.",
  "discussion.removeComment": "Diesen Kommentar entfernen",
  "discussion.shown": "Angezeigt werden die {shown} neuesten Antworten von insgesamt {total}.",
  "discussion.loginSuffix": "und antworte auf diesen Aufruf.",
  "siblings.title": "Weitere Aufrufe richten sich gegen {target}",
  "siblings.body": "Getrennt veröffentlicht, von anderen Mitgliedern, aus anderen Gründen.",
  "siblings.voices": "Stimmen",
  "siblings.by": "von {name}",
  "siblings.anonymous": "ein Mitglied",
  "siblings.answers": { one: " · {count} Ersatz", other: " · {count} Ersatzprojekte" },

  // ---------- /direct ----------
  "meta.directTitle": "Der Live-Feed",
  "meta.directDescription":
    "Die gefilmten Erfahrungsberichte der Community: warum wir diese Marken nicht mehr wollen und was wir stattdessen wollen.",
  "direct.label": "Der Live-Feed",
  "direct.title": "Was wir nicht mehr wollen, gefilmt",
  "direct.publish": "Veröffentlichen",
} satisfies Messages["callsPages"];
