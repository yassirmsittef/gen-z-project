import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `communityPages` — les pages serveur du réseau :
 * /communaute (le globe) et /classements.
 */
export const communityPages = {
  // ---------- Compteurs partagés ----------
  "count.members": { one: "{count} membre", other: "{count} membres" },
  "count.projects": { one: "{count} projet", other: "{count} projets" },
  "count.supports": { one: "{count} soutien", other: "{count} soutiens" },

  // ---------- /communaute ----------
  "meta.communityTitle": "Communauté",
  "community.title": "Communauté",
  "stats.cities": { one: "{count} ville sur le globe", other: "{count} villes sur le globe" },
  "stats.network": "le réseau en orbite",
  "globe.clearCity": "Retirer le filtre ville",
  "globe.empty": "Le globe attend ses premiers signaux — ajoute ta ville depuis ton dashboard",
  "globe.hintDesktop": "Glisse pour explorer · clique un point",
  "globe.hintMobile": "Un doigt : tourner · deux doigts : incliner",
  "locate.notYet": "Tu n'apparais pas encore sur le globe.",
  "locate.cta": "Ajoute ta ville depuis ton dashboard →",
  "search.placeholder": "Un nom, une compétence (montage, couture...)",
  "search.memberLabel": "Rechercher un membre",
  "search.cityPlaceholder": "Toutes les villes",
  "search.cityLabel": "Filtrer par ville",
  "search.submit": "Rechercher",
  "search.reset": "Réinitialiser",
  "results.inCity": " à {city}",
  "results.forQuery": " pour « {query} »",
  "results.empty": "Personne ne correspond à cette recherche.",
  "results.resetCta": "Réinitialiser les filtres →",
  "member.offRadar": "Hors radar",
  "member.contact": "Contacter {name}",
  "member.invested": "{amount} investis",

  // ---------- /classements ----------
  "meta.rankingsTitle": "Classements",
  "rankings.title": "Classements",
  "rankings.subtitle": "Les projets qui font vibrer la communauté",
  "rankings.empty": "Rien à classer pour l'instant.",
  "rankings.active": "En campagne",
  "rankings.funded": "Financés & réalisés",
  "brands.title": "Les marques qu'on veut remplacer",
  "brands.body":
    "Le poids cumulé de tous les appels visant une même marque. Publiés par des membres — GeniGain héberge ce fil et n'en est pas l'auteur.",
  "brands.calls": { one: "{count} appel", other: "{count} appels" },
  "brands.answersOnTheWay": {
    one: " · {count} remplaçant en route",
    other: " · {count} remplaçants en route",
  },
  "brands.nobodyYet": " · personne ne s'y attaque encore",
  "brands.upForGrabs": "À prendre",
  "brands.voices": "voix",
} as const satisfies Dict;
