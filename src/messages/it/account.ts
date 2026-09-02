import type { Messages } from "../types";

/**
 * Namespace `account` — compte et profil : connexion, inscription, mot de
 * passe (changement + réinitialisation), suppression de compte, profil,
 * ville, compétences, préférences de notifications, versements Stripe.
 */
export const account = {
  // ── auth-forms.tsx · GoogleButton ─────────────────────────────────────
  "googleButton.or": "oppure",
  "googleButton.continueWithGoogle": "Continua con Google",

  // ── auth-forms.tsx · LoginForm ────────────────────────────────────────
  "loginForm.emailLabel": "Email",
  "loginForm.emailPlaceholder": "tu@esempio.it",
  "loginForm.passwordLabel": "Password",
  "loginForm.forgotPassword": "Password dimenticata?",
  "loginForm.submitPending": "Accesso…",
  "loginForm.submit": "Accedi",
  "loginForm.noAccount": "Non hai ancora un account?",
  "loginForm.signUpLink": "Registrati",

  // ── auth-forms.tsx · RegisterForm ─────────────────────────────────────
  "registerForm.nameLabel": "Nickname",
  "registerForm.namePlaceholder": "Il tuo nickname",
  "registerForm.emailLabel": "Email",
  "registerForm.emailPlaceholder": "tu@esempio.it",
  "registerForm.passwordLabel": "Password",
  "registerForm.passwordHint": "Minimo 8 caratteri.",
  "registerForm.confirmPasswordLabel": "Conferma la password",
  "registerForm.cityLabel": "La tua città",
  "registerForm.cityOptional": "(facoltativo)",
  "registerForm.cityPlaceholder": "es.: Milano — per apparire sul globo",
  "registerForm.cityHint":
    "La posizione della città sul globo Community, mai la tua posizione esatta. Modificabile in ogni momento.",
  "registerForm.languageLabel": "La tua lingua",
  "registerForm.languageHint":
    "L'interfaccia, le notifiche e le email ti parleranno in questa lingua.",
  "registerForm.currencyLabel": "La tua valuta",
  "registerForm.currencyHint":
    "I tuoi importi verranno mostrati in questa valuta. Il diritto di pubblicare un progetto resta contato in dollari (20 $ contribuiti): i tuoi contributi vengono convertiti automaticamente al tasso del giorno.",
  "registerForm.acceptPrefix": "Accetto le",
  "registerForm.termsLink": "condizioni d'uso",
  "registerForm.acceptMiddle": "e la",
  "registerForm.privacyLink": "politica sulla privacy",
  "registerForm.acceptSuffix": ".",
  "registerForm.googleAcceptPrefix": "Continuando con Google, accetti le",
  "registerForm.submitPending": "Creazione…",
  "registerForm.submit": "Crea il mio account",
  "registerForm.alreadyAccount": "Hai già un account?",
  "registerForm.signInLink": "Accedi",

  // ── password-form.tsx · PasswordForm ──────────────────────────────────
  "verifyBanner.text": "Il tuo indirizzo email non è ancora confermato — controlla la posta (e lo spam).",
  "verifyBanner.resend": "Reinvia l'email",
  "verifyBanner.sent": "Email reinviata. Sta arrivando.",
  "passwordForm.currentLabel": "Password attuale",
  "passwordForm.newLabel": "Nuova (min 8 caratteri)",
  "passwordForm.confirmLabel": "Conferma",
  "passwordForm.success": "Password modificata.",
  "passwordForm.submitPending": "Modifica…",
  "passwordForm.submit": "Cambia la password",
  "loginForm.codeLabel": "Codice di verifica",
  "loginForm.codeHint": "Questo account è protetto dall'autenticazione a due fattori: inserisci il codice a 6 cifre mostrato dalla tua app.",
  "mfa.title": "Autenticazione a due fattori",
  "mfa.body": "A ogni accesso, oltre alla password, verrà chiesto un codice monouso generato da un'app (Aegis, Google Authenticator, 1Password…).",
  "mfa.enable": "Attiva",
  "mfa.secretLabel": "Chiave da inserire nell'app",
  "mfa.uriLabel": "Oppure incolla questo link nell'app",
  "mfa.confirmLabel": "Codice mostrato dall'app",
  "mfa.confirm": "Conferma e attiva",
  "mfa.enabledSince": "Attiva dal {date}.",
  "mfa.disable": "Disattiva",
  "mfa.disableHint": "Per disattivarla serve la tua password.",
  "mfa.success": "Autenticazione a due fattori attivata.",
  "mfa.disabled": "Autenticazione a due fattori disattivata.",

  // ── password-reset-forms.tsx · ForgotPasswordForm ─────────────────────
  "forgotPasswordForm.sentTitle": "Email inviata",
  "forgotPasswordForm.sentBody":
    "Se esiste un account con questo indirizzo, un link di reimpostazione è appena partito — è valido per 1 ora. Ricordati di controllare lo spam.",
  "forgotPasswordForm.backToLogin": "Torna all'accesso",
  "forgotPasswordForm.emailLabel": "L'email del tuo account",
  "forgotPasswordForm.emailPlaceholder": "tu@esempio.it",
  "forgotPasswordForm.submitPending": "Invio…",
  "forgotPasswordForm.submit": "Inviami un link di reimpostazione",

  // ── password-reset-forms.tsx · ResetPasswordForm ──────────────────────
  "resetPasswordForm.success": "Password cambiata — puoi accedere.",
  "resetPasswordForm.signIn": "Accedi",
  "resetPasswordForm.newLabel": "Nuova password (min 8 caratteri)",
  "resetPasswordForm.confirmLabel": "Confermala",
  "resetPasswordForm.retryLink": "Rifai la richiesta",
  "resetPasswordForm.submitPending": "Salvataggio…",
  "resetPasswordForm.submit": "Cambia la mia password",

  // ── delete-account.tsx · DeleteAccount ────────────────────────────────
  "deleteAccount.summary": "Elimina il mio account",
  "deleteAccount.bodyBefore":
    "I tuoi dati personali vengono cancellati (profilo, avatar, bio, città, preferenze) e l'accesso disattivato per sempre.",
  "deleteAccount.bodyStrong":
    "Le tue testimonianze filmate vengono ritirate dalla diretta e i loro file eliminati",
  "deleteAccount.bodyAfter":
    ": mostrano il tuo volto, non possono sopravviverti — ed è senza ritorno. I tuoi contributi e la cronologia dei progetti già sostenuti restano, a nome di «Membro ritirato» — i conti della community non mentono mai. Impossibile finché una delle campagne che sostieni è in corso.",
  "deleteAccount.passwordLabel": "Conferma con la tua password",
  "deleteAccount.submitPending": "Eliminazione…",
  "deleteAccount.submit": "Elimina definitivamente il mio account",

  // ── profile-form.tsx · ProfileForm ────────────────────────────────────
  "profileForm.fileTooHeavy": "Immagine troppo pesante — scegli una foto sotto 1 MB.",
  "profileForm.avatarLabel": "Foto profilo",
  "profileForm.changeAvatarAria": "Cambia la foto profilo",
  "profileForm.addAvatarAria": "Aggiungi una foto profilo",
  "profileForm.changePhoto": "Cambia foto",
  "profileForm.addPhoto": "Aggiungi una foto",
  "profileForm.removePhoto": "Rimuovi",
  "profileForm.avatarHint":
    "Ritagliata in quadrato automaticamente. Visibile sul tuo profilo, sui tuoi progetti e nei tuoi messaggi.",
  "profileForm.nameLabel": "Nickname",
  "profileForm.bioLabel": "Bio (280 caratteri max, facoltativa)",
  "profileForm.bioPlaceholder": "Chi sei, cosa crei, cosa cerchi.",
  "profileForm.bioHint":
    "Mostrata sul tuo profilo pubblico, accanto alla tua reputazione e ai tuoi progetti.",
  "profileForm.linksLabel": "I tuoi link (max 3, facoltativi)",
  "profileForm.linkPlaceholder1": "https://instagram.com/te",
  "profileForm.linkPlaceholder2": "https://tiktok.com/@te",
  "profileForm.linkPlaceholder3": "https://iltuosito.it",
  "profileForm.linkAria": "Link {num}",
  "profileForm.linksHint":
    "Sito, social, portfolio — mostrati sul tuo profilo pubblico (solo https).",
  "profileForm.languageLabel": "La mia lingua",
  "profileForm.languageHint":
    "Interfaccia, notifiche ed email — anche la cronologia si rilegge nella lingua scelta.",
  "profileForm.currencyLabel": "La mia valuta",
  "profileForm.currencyHint":
    "Gli importi della tua dashboard vengono mostrati in questa valuta (conversione indicativa al tasso del giorno). Solo l'indicatore dei 20 $ per pubblicare resta in dollari.",
  "profileForm.success": "Profilo salvato.",
  "profileForm.submitPending": "Salvataggio…",
  "profileForm.submit": "Salva",

  // ── location-form.tsx · LocationForm ──────────────────────────────────
  "locationForm.cityLabel": "La tua città",
  "locationForm.cityPlaceholder": "es.: Torino — inizia a digitare",
  "locationForm.hintBefore": "Ti colloca sul globo della",
  "locationForm.hintLink": "pagina Community",
  "locationForm.hintAfter":
    "(posizione della città, mai la tua posizione esatta). Lascia vuoto per non apparirvi.",
  "locationForm.removedSuccess": "Non appari più sul globo.",
  "locationForm.savedSuccess": "Città salvata.",
  "locationForm.submitPending": "Salvataggio…",
  "locationForm.submit": "Salva",

  // ── skills-form.tsx · SkillsForm ──────────────────────────────────────
  "skillsForm.label": "Le tue competenze",
  "skillsForm.placeholder": "es.: montaggio, react, foto — separate da virgole",
  "skillsForm.hint":
    "Servono a consigliarti progetti che cercano una mano come la tua.",
  "skillsForm.success": "Competenze salvate.",
  "skillsForm.submitPending": "Salvataggio…",
  "skillsForm.submit": "Salva",

  // ── notification-prefs.tsx · NotificationPrefs ────────────────────────
  "notificationPrefs.summary": "Preferenze — scegli cosa ricevere",
  "notificationPrefs.success": "Preferenze salvate.",
  "notificationPrefs.submitPending": "Salvataggio…",
  "notificationPrefs.submit": "Salva",

  // ── connect-form.tsx · PayoutTotals ───────────────────────────────────
  "payoutTotals.due": "In attesa di versamento",
  "payoutTotals.sent": "Già versati",
  "payoutTotals.autoActive": "I bonifici partono automaticamente — al più tardi entro 24 ore.",
  "payoutTotals.autoPending":
    "Partiranno automaticamente non appena la tua configurazione sarà completata.",

  // ── connect-form.tsx · ConnectForm ────────────────────────────────────
  "connectForm.stripeDisabled":
    "I versamenti reali arrivano con Stripe — non configurato in questo ambiente.",
  "connectForm.activeTitle": "Versamenti attivi",
  "connectForm.activeBodyLive":
    "Quando la community convalida una tappa di un tuo progetto, il suo importo viene bonificato sul tuo conto Stripe, al netto delle commissioni carta.",
  "connectForm.activeBodyTest":
    "Quando la community convalida una tappa di un tuo progetto, il suo importo viene bonificato sul tuo conto Stripe (per ora in modalità test — nessun denaro reale in circolazione).",
  "connectForm.resumeBody":
    "La tua configurazione Stripe è incompleta — completala per ricevere i fondi delle tue tappe convalidate.",
  "connectForm.setupBodyLive":
    "Configura il tuo conto Stripe per ricevere i fondi delle tue tappe convalidate (2 minuti).",
  "connectForm.setupBodyTest":
    "Configura il tuo conto Stripe per ricevere i fondi delle tue tappe convalidate (modalità test, 2 minuti).",
  "connectForm.submitPending": "Reindirizzamento a Stripe…",
  "connectForm.resume": "Riprendi la configurazione",
  "connectForm.setup": "Configura i miei versamenti",

  // ── ui/password-input.tsx · PasswordInput ─────────────────────────────
  "passwordInput.show": "Mostra la password",
  "passwordInput.hide": "Nascondi la password",
} satisfies Messages["account"];
