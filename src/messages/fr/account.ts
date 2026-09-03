import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `account` — compte et profil : connexion, inscription, mot de
 * passe (changement + réinitialisation), suppression de compte, profil,
 * ville, compétences, préférences de notifications, versements Stripe.
 */
export const account = {
  // ── auth-forms.tsx · GoogleButton ─────────────────────────────────────
  "googleButton.or": "ou",
  "googleButton.continueWithGoogle": "Continuer avec Google",

  // ── auth-forms.tsx · LoginForm ────────────────────────────────────────
  "loginForm.emailLabel": "Email",
  "loginForm.emailPlaceholder": "toi@exemple.fr",
  "loginForm.passwordLabel": "Mot de passe",
  "loginForm.forgotPassword": "Mot de passe oublié ?",
  "loginForm.submitPending": "Connexion…",
  "loginForm.submit": "Se connecter",
  "loginForm.noAccount": "Pas encore de compte ?",
  "loginForm.signUpLink": "Inscris-toi",

  // ── auth-forms.tsx · RegisterForm ─────────────────────────────────────
  "registerForm.nameLabel": "Pseudo",
  "registerForm.namePlaceholder": "Ton pseudo",
  "registerForm.emailLabel": "Email",
  "registerForm.emailPlaceholder": "toi@exemple.fr",
  "registerForm.passwordLabel": "Mot de passe",
  "registerForm.passwordHint": "8 caractères minimum.",
  "registerForm.confirmPasswordLabel": "Confirme le mot de passe",
  "registerForm.cityLabel": "Ta ville",
  "registerForm.cityOptional": "(optionnel)",
  "registerForm.cityPlaceholder": "ex : Lyon — pour apparaître sur le globe",
  "registerForm.cityHint":
    "Position de la ville sur le globe Communauté, jamais ta position exacte. Modifiable à tout moment.",
  "registerForm.languageLabel": "Ta langue",
  "registerForm.languageHint":
    "L'interface, les notifications et les emails te parleront dans cette langue.",
  "registerForm.currencyLabel": "Ta devise",
  "registerForm.currencyHint":
    "Tes montants s'afficheront dans cette devise. Le droit de poster un projet reste compté en dollars (20 $ contribués) : tes contributions y sont converties automatiquement au taux du jour.",
  "registerForm.acceptPrefix": "J'accepte les",
  "registerForm.termsLink": "conditions d'utilisation",
  "registerForm.acceptMiddle": "et la",
  "registerForm.privacyLink": "politique de confidentialité",
  "registerForm.acceptSuffix": ".",
  "registerForm.googleAcceptPrefix": "En continuant avec Google, tu acceptes les",
  "registerForm.submitPending": "Création…",
  "registerForm.submit": "Créer mon compte",
  "registerForm.alreadyAccount": "Déjà un compte ?",
  "registerForm.signInLink": "Connecte-toi",

  // ── password-form.tsx · PasswordForm ──────────────────────────────────
  "verifyBanner.text": "Ton adresse email n'est pas encore confirmée — regarde ta boîte (et les indésirables).",
  "verifyBanner.resend": "Renvoyer l'email",
  "verifyBanner.sent": "Email renvoyé. Il arrive.",
  "revoke.title": "Déconnecter tous mes appareils",
  "revoke.body": "Ferme toutes tes sessions ouvertes, partout — la tienne comprise. À faire si tu crains qu'un de tes appareils soit compromis. Tu te reconnectes ensuite.",
  "revoke.button": "Déconnecter partout",
  "passwordForm.currentLabel": "Mot de passe actuel",
  "passwordForm.newLabel": "Nouveau (8 caractères min)",
  "passwordForm.confirmLabel": "Confirmer",
  "passwordForm.success": "Mot de passe modifié.",
  "passwordForm.submitPending": "Modification…",
  "passwordForm.submit": "Changer le mot de passe",
  "loginForm.codeLabel": "Code de vérification",
  "loginForm.codeHint": "Ce compte est protégé par une double authentification : saisis le code à 6 chiffres affiché par ton application.",
  "mfa.title": "Double authentification",
  "mfa.body": "Un code à usage unique, généré par une application (Aegis, Google Authenticator, 1Password…), sera demandé à chaque connexion en plus du mot de passe.",
  "mfa.enable": "Activer",
  "mfa.secretLabel": "Clé à saisir dans l'application",
  "mfa.uriLabel": "Ou colle ce lien dans l'application",
  "mfa.confirmLabel": "Code affiché par l'application",
  "mfa.confirm": "Confirmer et activer",
  "mfa.enabledSince": "Activée le {date}.",
  "mfa.disable": "Désactiver",
  "mfa.disableHint": "Ton mot de passe est demandé pour désactiver.",
  "mfa.success": "Double authentification activée.",
  "mfa.disabled": "Double authentification désactivée.",

  // ── password-reset-forms.tsx · ForgotPasswordForm ─────────────────────
  "forgotPasswordForm.sentTitle": "Email envoyé",
  "forgotPasswordForm.sentBody":
    "Si un compte existe avec cette adresse, un lien de réinitialisation vient de partir — il est valable 1 heure. Pense à vérifier tes spams.",
  "forgotPasswordForm.backToLogin": "Retour à la connexion",
  "forgotPasswordForm.emailLabel": "Ton email de compte",
  "forgotPasswordForm.emailPlaceholder": "toi@exemple.fr",
  "forgotPasswordForm.submitPending": "Envoi…",
  "forgotPasswordForm.submit": "M'envoyer un lien de réinitialisation",

  // ── password-reset-forms.tsx · ResetPasswordForm ──────────────────────
  "resetPasswordForm.success": "Mot de passe changé — tu peux te connecter.",
  "resetPasswordForm.signIn": "Se connecter",
  "resetPasswordForm.newLabel": "Nouveau mot de passe (8 caractères min)",
  "resetPasswordForm.confirmLabel": "Confirme-le",
  "resetPasswordForm.retryLink": "Refaire une demande",
  "resetPasswordForm.submitPending": "Enregistrement…",
  "resetPasswordForm.submit": "Changer mon mot de passe",

  // ── delete-account.tsx · DeleteAccount ────────────────────────────────
  "deleteAccount.summary": "Supprimer mon compte",
  "deleteAccount.bodyBefore":
    "Tes données personnelles sont effacées (profil, avatar, bio, ville, préférences) et la connexion coupée définitivement.",
  "deleteAccount.bodyStrong":
    "Tes témoignages filmés sont retirés du direct et leurs fichiers supprimés",
  "deleteAccount.bodyAfter":
    ": on y voit ton visage, ils ne peuvent pas te survivre — c'est sans retour. Tes contributions et l'historique des projets déjà soutenus restent, au nom de « Membre retiré » — les comptes de la communauté ne mentent jamais. Impossible tant qu'une de tes campagnes soutenues est en cours.",
  "deleteAccount.passwordLabel": "Confirme avec ton mot de passe",
  "deleteAccount.submitPending": "Suppression…",
  "deleteAccount.submit": "Supprimer définitivement mon compte",

  // ── profile-form.tsx · ProfileForm ────────────────────────────────────
  "profileForm.fileTooHeavy": "Image trop lourde — choisis une photo de moins de 1 Mo.",
  "profileForm.avatarLabel": "Photo de profil",
  "profileForm.changeAvatarAria": "Changer la photo de profil",
  "profileForm.addAvatarAria": "Ajouter une photo de profil",
  "profileForm.changePhoto": "Changer la photo",
  "profileForm.addPhoto": "Ajouter une photo",
  "profileForm.removePhoto": "Retirer",
  "profileForm.avatarHint":
    "Recadrée en carré automatiquement. Visible sur ton profil, tes projets et tes messages.",
  "profileForm.nameLabel": "Pseudo",
  "profileForm.bioLabel": "Bio (280 caractères max, optionnel)",
  "profileForm.bioPlaceholder": "Qui tu es, ce que tu crées, ce que tu cherches.",
  "profileForm.bioHint":
    "Affichée sur ton profil public, à côté de ta réputation et de tes projets.",
  "profileForm.linksLabel": "Tes liens (3 max, optionnel)",
  "profileForm.linkPlaceholder1": "https://instagram.com/toi",
  "profileForm.linkPlaceholder2": "https://tiktok.com/@toi",
  "profileForm.linkPlaceholder3": "https://tonsite.fr",
  "profileForm.linkAria": "Lien {num}",
  "profileForm.linksHint":
    "Site, réseaux, portfolio — affichés sur ton profil public (https uniquement).",
  "profileForm.languageLabel": "Ma langue",
  "profileForm.languageHint":
    "Interface, notifications et emails — même l'historique se relit dans la langue choisie.",
  "profileForm.currencyLabel": "Ma devise",
  "profileForm.currencyHint":
    "Les montants de ton dashboard s'affichent dans cette devise (conversion indicative au taux du jour). Seule la jauge des 20 $ pour poster reste en dollars.",
  "profileForm.success": "Profil enregistré.",
  "profileForm.submitPending": "Enregistrement…",
  "profileForm.submit": "Enregistrer",

  // ── location-form.tsx · LocationForm ──────────────────────────────────
  "locationForm.cityLabel": "Ta ville",
  "locationForm.cityPlaceholder": "ex : Marseille — commence à taper",
  "locationForm.hintBefore": "Elle te place sur le globe de la",
  "locationForm.hintLink": "page Communauté",
  "locationForm.hintAfter":
    "(position de la ville, jamais ta position exacte). Laisse vide pour ne pas y apparaître.",
  "locationForm.removedSuccess": "Tu n'apparais plus sur le globe.",
  "locationForm.savedSuccess": "Ville enregistrée.",
  "locationForm.submitPending": "Enregistrement…",
  "locationForm.submit": "Enregistrer",

  // ── skills-form.tsx · SkillsForm ──────────────────────────────────────
  "skillsForm.label": "Tes compétences",
  "skillsForm.placeholder": "ex : montage, react, photo — séparées par des virgules",
  "skillsForm.hint":
    "Elles servent à te recommander des projets qui cherchent un coup de main comme le tien.",
  "skillsForm.success": "Compétences enregistrées.",
  "skillsForm.submitPending": "Enregistrement…",
  "skillsForm.submit": "Enregistrer",

  // ── notification-prefs.tsx · NotificationPrefs ────────────────────────
  "notificationPrefs.summary": "Préférences — choisir ce que je reçois",
  "notificationPrefs.success": "Préférences enregistrées.",
  "notificationPrefs.submitPending": "Enregistrement…",
  "notificationPrefs.submit": "Enregistrer",

  // ── connect-form.tsx · PayoutTotals ───────────────────────────────────
  "payoutTotals.due": "En attente de versement",
  "payoutTotals.sent": "Déjà versés",
  "payoutTotals.autoActive": "Les virements partent automatiquement — au plus tard sous 24 h.",
  "payoutTotals.autoPending":
    "Ils partiront automatiquement dès que ta configuration sera terminée.",

  // ── connect-form.tsx · ConnectForm ────────────────────────────────────
  "connectForm.stripeDisabled":
    "Les versements réels arrivent avec Stripe — non configuré sur cet environnement.",
  "connectForm.activeTitle": "Versements actifs",
  "connectForm.activeBodyLive":
    "Quand la communauté valide une étape d'un de tes projets, son montant est viré vers ton compte Stripe, net des frais de carte.",
  "connectForm.activeBodyTest":
    "Quand la communauté valide une étape d'un de tes projets, son montant est viré vers ton compte Stripe (mode test pour l'instant — aucun vrai argent ne circule).",
  "connectForm.resumeBody":
    "Ta configuration Stripe est incomplète — finis-la pour recevoir les fonds de tes étapes validées.",
  "connectForm.setupBodyLive":
    "Configure ton compte Stripe pour recevoir les fonds de tes étapes validées (2 minutes).",
  "connectForm.setupBodyTest":
    "Configure ton compte Stripe pour recevoir les fonds de tes étapes validées (mode test, 2 minutes).",
  "connectForm.submitPending": "Redirection vers Stripe…",
  "connectForm.resume": "Reprendre la configuration",
  "connectForm.setup": "Configurer mes versements",

  // ── ui/password-input.tsx · PasswordInput ─────────────────────────────
  "passwordInput.show": "Afficher le mot de passe",
  "passwordInput.hide": "Masquer le mot de passe",
} as const satisfies Dict;
