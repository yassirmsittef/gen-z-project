import type { Dict } from "@/lib/i18n/t";

/** Le shell : barre de navigation, pied de page, lien d'évitement, 404. */
export const nav = {
  skipToContent: "Aller au contenu",
  projects: "Projets",
  calls: "Appels",
  live: "Direct",
  community: "Communauté",
  communityTitle: "Communauté — le réseau sur le globe",
  rankings: "Classements",
  launchProject: "Lancer un projet",
  dashboard: "Dashboard",
  chat: "Chat",
  chatTitle: "Chat — entraide entre porteurs",
  adminCockpit: "Cockpit admin",
  adminOpenReports: {
    one: "{count} signalement ouvert",
    other: "{count} signalements ouverts",
  },
  profileTitle: "Ton profil public",
  signOut: "Se déconnecter",
  signIn: "Connexion",
  signUp: "S'inscrire",
  legalLinks: "Liens légaux",
  terms: "Conditions d'utilisation",
  privacy: "Confidentialité",
  legalNotice: "Mentions légales",
  footerLive:
    "GeniGain · 0 % de commission, seuls les frais bancaires s'appliquent · paiements sécurisés par Stripe.",
  footerTest:
    "GeniGain · Phase 1 — paiements Stripe en mode test, aucun vrai débit · 0 % de commission, seuls les frais bancaires s'appliquent.",
  notFoundLabel: "Erreur 404",
  notFoundHeading: "Cette page s'est perdue en orbite",
  notFoundBody:
    "Le lien est peut-être périmé — ou le projet a été retiré par la personne qui le portait. Rien n'est perdu : la communauté continue de construire juste à côté.",
  notFoundDiscover: "Découvrir les projets",
  notFoundHome: "Accueil",
} as const satisfies Dict;
