import type { Messages } from "../types";

/**
 * Namespace `communityPages` — the server pages of the network:
 * /communaute (the globe) and /classements.
 */
export const communityPages = {
  // ---------- Shared counters ----------
  "count.members": { one: "{count} member", other: "{count} members" },
  "count.projects": { one: "{count} project", other: "{count} projects" },
  "count.supports": { one: "{count} support", other: "{count} supports" },

  // ---------- /communaute ----------
  "meta.communityTitle": "Community",
  "community.title": "Community",
  "stats.cities": { one: "{count} city on the globe", other: "{count} cities on the globe" },
  "stats.network": "the network in orbit",
  "globe.clearCity": "Clear the city filter",
  "globe.empty": "The globe is waiting for its first signals — add your city from your dashboard",
  "globe.hintDesktop": "Drag to explore · click a dot",
  "globe.hintMobile": "One finger: spin · two fingers: tilt",
  "locate.notYet": "You don't show up on the globe yet.",
  "locate.cta": "Add your city from your dashboard →",
  "search.placeholder": "A name, a skill (editing, sewing...)",
  "search.memberLabel": "Search for a member",
  "search.cityPlaceholder": "All cities",
  "search.cityLabel": "Filter by city",
  "search.submit": "Search",
  "search.reset": "Reset",
  "results.inCity": " in {city}",
  "results.forQuery": " for “{query}”",
  "results.empty": "Nobody matches this search.",
  "results.resetCta": "Reset the filters →",
  "member.offRadar": "Off radar",
  "member.contact": "Contact {name}",
  "member.invested": "{amount} invested",

  // ---------- /classements ----------
  "meta.rankingsTitle": "Rankings",
  "rankings.title": "Rankings",
  "rankings.subtitle": "The projects the community is buzzing about",
  "rankings.empty": "Nothing to rank yet.",
  "rankings.active": "Campaigning",
  "rankings.funded": "Funded & delivered",
  "brands.title": "The brands we want replaced",
  "brands.body":
    "The combined weight of every call targeting the same brand. Published by members — GeniGain hosts this feed and is not its author.",
  "brands.calls": { one: "{count} call", other: "{count} calls" },
  "brands.answersOnTheWay": {
    one: " · {count} replacement on the way",
    other: " · {count} replacements on the way",
  },
  "brands.nobodyYet": " · nobody is taking it on yet",
  "brands.upForGrabs": "Up for grabs",
  "brands.voices": "voices",
} satisfies Messages["communityPages"];
