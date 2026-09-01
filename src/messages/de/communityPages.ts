import type { Messages } from "../types";

/**
 * Namespace `communityPages` — die Serverseiten des Netzwerks:
 * /communaute (der Globus) und /classements.
 */
export const communityPages = {
  // ---------- Geteilte Zähler ----------
  "count.members": { one: "{count} Mitglied", other: "{count} Mitglieder" },
  "count.projects": { one: "{count} Projekt", other: "{count} Projekte" },
  "count.supports": { one: "{count} Unterstützung", other: "{count} Unterstützungen" },

  // ---------- /communaute ----------
  "meta.communityTitle": "Community",
  "community.title": "Community",
  "stats.cities": {
    one: "{count} Stadt auf dem Globus",
    other: "{count} Städte auf dem Globus",
  },
  "stats.network": "das Netzwerk in der Umlaufbahn",
  "globe.clearCity": "Stadtfilter entfernen",
  "globe.empty":
    "Der Globus wartet auf seine ersten Signale — füg deine Stadt in deinem Dashboard hinzu",
  "globe.hintDesktop": "Ziehen zum Erkunden · Punkt anklicken",
  "globe.hintMobile": "Ein Finger: drehen · zwei Finger: kippen",
  "locate.notYet": "Du erscheinst noch nicht auf dem Globus.",
  "locate.cta": "Füg deine Stadt in deinem Dashboard hinzu →",
  "search.placeholder": "Ein Name, ein Skill (Schnitt, Nähen...)",
  "search.memberLabel": "Mitglied suchen",
  "search.cityPlaceholder": "Alle Städte",
  "search.cityLabel": "Nach Stadt filtern",
  "search.submit": "Suchen",
  "search.reset": "Zurücksetzen",
  "results.inCity": " in {city}",
  "results.forQuery": " für „{query}“",
  "results.empty": "Niemand passt zu dieser Suche.",
  "results.resetCta": "Filter zurücksetzen →",
  "member.offRadar": "Außerhalb des Radars",
  "member.contact": "{name} kontaktieren",
  "member.invested": "{amount} investiert",

  // ---------- /classements ----------
  "meta.rankingsTitle": "Ranglisten",
  "rankings.title": "Ranglisten",
  "rankings.subtitle": "Die Projekte, die die Community bewegen",
  "rankings.empty": "Vorerst nichts zu ranken.",
  "rankings.active": "In Kampagne",
  "rankings.funded": "Finanziert & umgesetzt",
  "brands.title": "Die Marken, die wir ersetzen wollen",
  "brands.body":
    "Das Gesamtgewicht aller Aufrufe gegen ein und dieselbe Marke. Von Mitgliedern veröffentlicht — GeniGain hostet diesen Feed und ist nicht sein Autor.",
  "brands.calls": { one: "{count} Aufruf", other: "{count} Aufrufe" },
  "brands.answersOnTheWay": {
    one: " · {count} Ersatz unterwegs",
    other: " · {count} Ersatzprojekte unterwegs",
  },
  "brands.nobodyYet": " · noch nimmt sich niemand die Sache vor",
  "brands.upForGrabs": "Zu haben",
  "brands.voices": "Stimmen",
} satisfies Messages["communityPages"];
