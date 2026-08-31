import type { Dict } from "@/lib/i18n/t";

/** Pages d'authentification : connexion, inscription, mot de passe oublié, réinitialisation. */
export const authPages = {
  "meta.loginTitle": "Connexion",
  "meta.registerTitle": "Inscription",
  "meta.forgotTitle": "Mot de passe oublié",
  "meta.resetTitle": "Nouveau mot de passe",
  "login.title": "Re-bienvenue",
  "login.description": "Connecte-toi pour contribuer et suivre tes projets.",
  "register.title": "Rejoins la communauté",
  "register.description":
    "Contribue aux projets de ta génération par carte, dans leur devise — et lance le tien dès 20 $ de contributions cumulées.",
  "register.howItWorks": "Comment ça marche ?",
  "forgot.title": "Mot de passe oublié",
  "forgot.description":
    "Donne l'email de ton compte : on t'envoie un lien valable 1 heure pour en choisir un nouveau.",
  "reset.title": "Choisis ton nouveau mot de passe",
  "reset.description": "Le lien ne sert qu'une fois — dès que c'est enregistré, il est mort.",
} as const satisfies Dict;
