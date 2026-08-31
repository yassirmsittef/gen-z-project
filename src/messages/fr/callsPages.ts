import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `callsPages` — les pages serveur du fil des appels :
 * /appels, /appels/nouveau, /appels/[slug] et /direct.
 */
export const callsPages = {
  // ---------- /appels (le fil) ----------
  "meta.listTitle": "Les appels",
  "meta.listDescription":
    "Les marques dont la communauté ne veut plus, et les projets qui se lancent pour les remplacer.",
  "sort.orphelins": "Sans remplaçant",
  "sort.soutenus": "Les plus soutenus",
  "sort.recents": "Les plus récents",
  "hero.label": "Le fil",
  "hero.title": "Ce qu'on ne veut plus — et ce qu'on met à la place",
  "hero.body":
    "Chaque appel est publié par un membre, sous son nom. Il nomme une marque dont il ne veut plus et décrit ce qu'il achèterait à la place. Un porteur s'en saisit, la communauté le finance : c'est comme ça qu'on remplace au lieu de seulement refuser.",
  "hero.disclaimer": "GeniGain héberge ces appels et n'en est pas l'auteur.",
  "cta.publish": "Publier un appel",
  "search.placeholder": "Une marque, un secteur, un mot…",
  "search.label": "Rechercher un appel",
  "search.submit": "Rechercher",
  "filters.sort": "Tri",
  "filters.sectors": "Secteurs",
  "filters.allSectors": "Tous secteurs",
  "results.count": { one: "{count} appel", other: "{count} appels" },
  "results.forQuery": " pour « {query} »",
  "empty.noneYetTitle": "Le fil n'a pas encore d'appel.",
  "empty.noneYetBody":
    "Sois le premier à nommer une marque dont tu ne veux plus — et à dire ce que tu achèterais à la place.",
  "empty.allAnsweredTitle": "Tous les appels ont trouvé un remplaçant.",
  "empty.allAnsweredBody":
    "C'est bon signe. Ouvre-en un autre si une marque te reste en travers.",
  "empty.noMatchTitle": "Aucun appel ne correspond.",
  "empty.noMatchBody": "Change de filtre — ou publie le tien.",

  // ---------- /appels/nouveau ----------
  "meta.newTitle": "Publier un appel",
  "back.toFeed": "Retour au fil",
  "new.label": "Nouvel appel",
  "new.title": "Nomme ce que tu veux voir remplacé",
  "new.body":
    "Un appel n'est pas un coup de gueule : c'est une commande passée à ceux qui savent construire. Plus tu décris précisément ce que tu achèterais à la place, plus tu as de chances qu'un porteur s'en saisisse.",

  // ---------- /appels/[slug] ----------
  "meta.detailFallback": "Appel",
  "meta.detailTitle": "Remplacer {target}",
  "removed.title": "Cet appel a été retiré",
  "removed.byModeration": "Retiré par la modération — {reason}.",
  "removed.defaultReason": "non conforme à la charte des appels",
  "removed.byAuthor": "Retiré par la personne qui l'avait publié.",
  "badge.answered": { one: "{count} remplaçant déclaré", other: "{count} remplaçants déclarés" },
  "badge.none": "Aucun remplaçant pour l'instant",
  "target.label": "Ne veut plus de",
  "weight.calls": { one: "{count} appel", other: "{count} appels" },
  "weight.aim": "visent cette marque, portés par",
  "weight.total": "voix au total.",
  "author.fallback": "Membre",
  "motive.title": "Le motif",
  "wanted.title": "Ce qu'il faudrait à la place",
  "sources.title": "Sources avancées par l'auteur",
  "frame.disclaimer":
    "Appel publié par un membre. GeniGain héberge ce contenu, n'en est pas l'auteur et ne l'endosse pas. Une marque mise en cause peut demander un retrait à",
  "share.title": "Remplacer {target}",
  "share.text": {
    one: "{count} personne veut remplacer {target}. À la place : {wanted}",
    other: "{count} personnes veulent remplacer {target}. À la place : {wanted}",
  },
  "actions.removeMine": "Retirer mon appel",
  "actions.removeModeration": "Retirer (modération)",
  "replacements.title": "Les remplaçants",
  "replacements.body":
    "Ces projets se sont déclarés sur cet appel. Les financer, c'est faire exister l'alternative.",
  "replacements.emptyTitle": "Personne ne l'a encore remplacé",
  "replacements.emptyBody":
    "Cet appel attend son porteur. Les soutiens ci-dessus sont autant de premiers contributeurs.",
  "replacements.withdrawMine": "Retirer ce projet de l'appel",
  "replacements.detach": "Détacher ce projet (il squatte l'appel)",
  "videos.title": "Les témoignages filmés",
  "videos.attached": {
    one: "{count} témoignage rattaché à cet appel —",
    other: "{count} témoignages rattachés à cet appel —",
  },
  "videos.seeLive": "les voir dans le direct",
  "videos.emptyBody": "Une caméra dit en trente secondes ce qu'un paragraphe met à prouver.",
  "login.cta": "Connecte-toi",
  "videos.loginSuffix": "pour filmer ton témoignage.",
  "discussion.title": "La discussion",
  "discussion.body":
    "Corroborer, nuancer, contredire. L'entreprise mise en cause peut répondre ici comme n'importe qui.",
  "discussion.removeComment": "Retirer ce commentaire",
  "discussion.shown": "Les {shown} réponses les plus récentes sont affichées, sur {total}.",
  "discussion.loginSuffix": "pour répondre à cet appel.",
  "siblings.title": "D'autres appels visent {target}",
  "siblings.body": "Publiés séparément, par d'autres membres, pour d'autres raisons.",
  "siblings.voices": "voix",
  "siblings.by": "par {name}",
  "siblings.anonymous": "un membre",
  "siblings.answers": { one: " · {count} remplaçant", other: " · {count} remplaçants" },

  // ---------- /direct ----------
  "meta.directTitle": "Le direct",
  "meta.directDescription":
    "Les témoignages filmés de la communauté : pourquoi on ne veut plus de ces marques, et ce qu'on voudrait à la place.",
  "direct.label": "Le direct",
  "direct.title": "Ce qu'on ne veut plus, filmé",
  "direct.publish": "Publier",
} as const satisfies Dict;
