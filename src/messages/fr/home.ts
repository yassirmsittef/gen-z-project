import type { Dict } from "@/lib/i18n/t";

/** La page d'accueil : héros, appels à remplacer, étapes, vitrine, pouls. */
export const home = {
  "hero.badgeLive": "0 % de commission · paiements sécurisés par Stripe",
  "hero.badgeTest": "Bêta · 0 % de commission · paiements Stripe en mode test",
  "hero.titleLead": "La communauté qui finance",
  "hero.titleAccent": "ta génération",
  "hero.subtitle":
    "Contribue avant de poster. Débloque tes fonds avec des preuves. Construis ta réputation. Et si ça rate — rebondis.",
  "hero.discover": "Découvrir les projets",
  "hero.launchMine": "Lancer le mien",
  "hero.projects": "Projets",
  "hero.members": "Membres",
  "hero.invested": "Investis (équiv.)",
  "calls.heading": "À remplacer",
  "calls.introBefore": "Des marques dont des membres ne veulent plus, et pour lesquelles",
  "calls.introHighlight": "personne n'a encore lancé",
  "calls.introAfter": "de remplaçant. Chaque appel est une commande qui attend son porteur.",
  "calls.seeAll": "Voir tous les appels →",
  "calls.noLongerWants": "Ne veut plus de",
  "calls.wantReplaced": {
    one: "personne veut ça remplacé",
    other: "personnes veulent ça remplacé",
  },
  "calls.launchReplacement": "Lancer un remplaçant",
  "calls.publishCall": "Publier mon appel",
  "steps.heading": "Comment ça marche",
  "steps.contributeTitle": "1. Contribue",
  "steps.contributeText":
    "Soutiens les projets qui te parlent, par carte, dans leur devise — 20 $ de contributions cumulées débloquent la création du tien.",
  "steps.launchTitle": "2. Lance ton projet",
  "steps.launchText":
    "Poster est réservé à ceux qui ont déjà contribué. Fixe ton objectif, découpe ton plan en étapes claires.",
  "steps.unlockTitle": "3. Débloque par étapes",
  "steps.unlockText":
    "Les fonds restent sous séquestre. À chaque étape, tu montres une preuve d'avancement et tes contributeurs votent.",
  "steps.reboundTitle": "4. Rate ? Rebondis",
  "steps.reboundText":
    "Un échec n'est pas une sortie : les contributeurs sont remboursés et on te réoriente vers de nouvelles opportunités.",
  "steps.detailsLink": "Le fonctionnement en détail — séquestre, votes, remboursements",
  "featured.heading": "En campagne",
  "featured.seeAll": "Tout voir →",
  "pulse.heading": "Le pouls de GeniGain",
  "pulse.subheading": "Ce qui vient de se passer sur la plateforme",
  "pulse.anonymous": "Quelqu'un",
  "pulse.supported": "a soutenu « {title} »",
  "pulse.launched": "a lancé « {title} »",
  "pulse.update": "Actu de « {title} » :",
  "pulse.supportedPlatform": "a soutenu GeniGain",
  "pulse.joined": "a rejoint GeniGain",
} as const satisfies Dict;
