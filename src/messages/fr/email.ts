import type { Dict } from "@/lib/i18n/t";

/**
 * Habillage des emails (gabarit notification + reset). Règle absolue : ces
 * valeurs ne contiennent JAMAIS de balisage — l'échappement s'applique après
 * interpolation, une balise ici deviendrait du texte visible.
 */
export const email = {
  hello: "Salut {name} — ",
  cta: "Voir sur GeniGain",
  ctaText: "Voir sur GeniGain :",
  why: "Tu reçois cet email parce qu'un événement important concerne tes projets ou tes contributions.",
  managePrefs: "Gérer mes préférences",
  managePrefsText: "Gère tes préférences : {link}",
  signature: "GeniGain — la communauté qui finance ta génération",

  "verify.subject": "Confirme ton adresse email GeniGain",
  "verify.heading": "Confirme ton adresse email",
  "verify.intro": "Bienvenue ! Il reste un geste : confirmer que cette adresse est bien la tienne.",
  "verify.validity": "Le lien est valable 24 heures et ne sert qu'une fois.",
  "verify.cta": "Confirmer mon adresse",
  "verify.ignore": "Si tu n'as pas créé de compte GeniGain, ignore cet email.",
  "reset.subject": "Réinitialise ton mot de passe GeniGain",
  "reset.heading": "Réinitialise ton mot de passe",
  "reset.intro": "Quelqu'un (toi, normalement) a demandé à réinitialiser ton mot de passe GeniGain.",
  "reset.validity": "Le lien est valable 1 heure et ne sert qu'une fois.",
  "reset.cta": "Choisir un nouveau mot de passe",
  "reset.ignore": "Si ce n'était pas toi, ignore cet email — ton mot de passe reste inchangé.",
} as const satisfies Dict;
