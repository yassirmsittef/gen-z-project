import type { Dict } from "@/lib/i18n/t";

/**
 * Erreurs rendues au bord (server actions, routes API membres) et clés des
 * DomainError migrées au bi-mode. Même règle que `v` : les valeurs fr sont
 * celles d'avant, au caractère près.
 */
export const err = {
  // Actions — auth & compte
  mustAcceptTerms: "Tu dois accepter les conditions d'utilisation pour créer un compte.",
  cityUnknownOrEmpty: "Ville non reconnue — choisis-en une dans la liste, ou laisse vide.",
  emailTaken: "Un compte existe déjà avec cet email.",
  tooManyAttempts: "Trop de tentatives pour ce compte — attends quelques minutes avant de réessayer.",
  badCredentials: "Email ou mot de passe incorrect.",
  passwordToConfirm: "Mot de passe requis pour confirmer.",
  passwordIncorrect: "Mot de passe incorrect.",
  noPasswordToChange: "Ce compte n'a pas de mot de passe à changer.",
  currentPasswordIncorrect: "Mot de passe actuel incorrect.",
  newPasswordSame: "Le nouveau mot de passe doit être différent de l'actuel.",
  photoMustBeImage: "La photo doit être une image.",
  photoTooHeavy: "Photo trop lourde — réessaie avec une image plus petite.",
  photoStorageNotConfigured: "Le stockage des photos n'est pas configuré sur cet environnement.",
  cityUnknownPick: "Ville non reconnue — choisis une ville proposée par la liste.",

  // Actions — projets & contributions
  paymentsNotConfigured: "Les paiements ne sont pas configurés sur cet environnement.",
  stripeNoCheckout: "Stripe n'a pas fourni de page de paiement — réessaie.",
  supportAmountInvalid: "Montant invalide (1 CHF minimum).",
  invalidMilestones: "Étapes invalides.",
  projectNotFound: "Projet introuvable.",
  ownerOnlyUpdate: "Seul·e le·la porteur·se du projet peut poster une actu.",

  // Actions — messages & chat
  selfMessage: "Tu ne peux pas t'écrire à toi-même.",
  recipientNotFound: "Destinataire introuvable.",
  unknownGesture: "Geste inconnu.",

  // Actions — appels
  pickYourProject: "Choisis lequel de tes projets répond à cet appel.",

  // Actions — partenariats
  sendBlocked: "Envoi bloqué.",
  pendingRequestsAlready: "Vous avez déjà plusieurs demandes en attente pour ce projet.",
  requestNotFound: "Demande introuvable.",
  alreadyAnswered: "Cette demande a déjà reçu une réponse.",
  deepAnalysisFailed: "L'analyse approfondie n'a pas abouti — l'analyse rapide reste affichée.",

  // Actions — Stripe Connect
  stripeNotConfigured: "Stripe n'est pas configuré sur cet environnement.",
  stripeConnectFailed: "Stripe n'a pas pu démarrer la configuration — réessaie dans un instant.",

  // Routes API côté membre
  notLoggedIn: "Non connecté",
  uploadImpossible: "Envoi impossible.",
  tooManyRequests: "Trop de tentatives depuis ta connexion — réessaie dans une heure.",
  totpRequired: "Ce compte demande un code de vérification.",
  totpInvalid: "Code de vérification incorrect.",
  totpAdminOnly: "La double authentification est réservée aux comptes administrateurs pour l'instant.",
  totpAlreadyEnabled: "La double authentification est déjà activée.",
  totpNotStarted: "Commence par « Activer », puis confirme avec un code de l'application.",
} as const satisfies Dict;
