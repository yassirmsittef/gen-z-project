import type { Messages } from "../types";

/**
 * Namespace `account` — Konto und Profil: Anmeldung, Registrierung, Passwort
 * (Änderung + Zurücksetzen), Kontolöschung, Profil, Stadt, Skills,
 * Benachrichtigungs-Einstellungen, Stripe-Auszahlungen.
 */
export const account = {
  // ── auth-forms.tsx · GoogleButton ─────────────────────────────────────
  "googleButton.or": "oder",
  "googleButton.continueWithGoogle": "Mit Google fortfahren",

  // ── auth-forms.tsx · LoginForm ────────────────────────────────────────
  "loginForm.emailLabel": "E-Mail",
  "loginForm.emailPlaceholder": "du@beispiel.de",
  "loginForm.passwordLabel": "Passwort",
  "loginForm.forgotPassword": "Passwort vergessen?",
  "loginForm.submitPending": "Anmeldung…",
  "loginForm.submit": "Anmelden",
  "loginForm.noAccount": "Noch kein Konto?",
  "loginForm.signUpLink": "Registrier dich",

  // ── auth-forms.tsx · RegisterForm ─────────────────────────────────────
  "registerForm.nameLabel": "Nutzername",
  "registerForm.namePlaceholder": "Dein Nutzername",
  "registerForm.emailLabel": "E-Mail",
  "registerForm.emailPlaceholder": "du@beispiel.de",
  "registerForm.passwordLabel": "Passwort",
  "registerForm.passwordHint": "Mindestens 8 Zeichen.",
  "registerForm.confirmPasswordLabel": "Passwort bestätigen",
  "registerForm.cityLabel": "Deine Stadt",
  "registerForm.cityOptional": "(optional)",
  "registerForm.cityPlaceholder": "z. B. Berlin — um auf dem Globus zu erscheinen",
  "registerForm.cityHint":
    "Position der Stadt auf dem Community-Globus, nie dein genauer Standort. Jederzeit änderbar.",
  "registerForm.languageLabel": "Deine Sprache",
  "registerForm.languageHint":
    "Interface, Benachrichtigungen und E-Mails sprechen mit dir in dieser Sprache.",
  "registerForm.currencyLabel": "Deine Währung",
  "registerForm.currencyHint":
    "Deine Beträge werden in dieser Währung angezeigt. Das Recht, ein Projekt zu posten, wird weiter in Dollar gezählt (20 $ beigetragen): Deine Beiträge werden dafür automatisch zum Tageskurs umgerechnet.",
  "registerForm.acceptPrefix": "Ich akzeptiere die",
  "registerForm.termsLink": "Nutzungsbedingungen",
  "registerForm.acceptMiddle": "und die",
  "registerForm.privacyLink": "Datenschutzerklärung",
  "registerForm.acceptSuffix": ".",
  "registerForm.googleAcceptPrefix": "Wenn du mit Google fortfährst, akzeptierst du die",
  "registerForm.submitPending": "Wird erstellt…",
  "registerForm.submit": "Konto erstellen",
  "registerForm.alreadyAccount": "Schon ein Konto?",
  "registerForm.signInLink": "Meld dich an",

  // ── password-form.tsx · PasswordForm ──────────────────────────────────
  "passwordForm.currentLabel": "Aktuelles Passwort",
  "passwordForm.newLabel": "Neues Passwort (mind. 8 Zeichen)",
  "passwordForm.confirmLabel": "Bestätigen",
  "passwordForm.success": "Passwort geändert.",
  "passwordForm.submitPending": "Wird geändert…",
  "passwordForm.submit": "Passwort ändern",
  "loginForm.codeLabel": "Bestätigungscode",
  "loginForm.codeHint": "Dieses Konto ist durch Zwei-Faktor-Authentifizierung geschützt: gib den 6-stelligen Code aus deiner App ein.",
  "mfa.title": "Zwei-Faktor-Authentifizierung",
  "mfa.body": "Bei jeder Anmeldung wird zusätzlich zum Passwort ein Einmalcode aus einer App (Aegis, Google Authenticator, 1Password…) verlangt.",
  "mfa.enable": "Aktivieren",
  "mfa.secretLabel": "Schlüssel für die App",
  "mfa.uriLabel": "Oder diesen Link in die App einfügen",
  "mfa.confirmLabel": "Code aus der App",
  "mfa.confirm": "Bestätigen und aktivieren",
  "mfa.enabledSince": "Aktiv seit dem {date}.",
  "mfa.disable": "Deaktivieren",
  "mfa.disableHint": "Zum Deaktivieren wird dein Passwort verlangt.",
  "mfa.success": "Zwei-Faktor-Authentifizierung aktiviert.",
  "mfa.disabled": "Zwei-Faktor-Authentifizierung deaktiviert.",

  // ── password-reset-forms.tsx · ForgotPasswordForm ─────────────────────
  "forgotPasswordForm.sentTitle": "E-Mail gesendet",
  "forgotPasswordForm.sentBody":
    "Wenn ein Konto mit dieser Adresse existiert, ist gerade ein Link zum Zurücksetzen rausgegangen — er ist 1 Stunde gültig. Schau auch in deinen Spam-Ordner.",
  "forgotPasswordForm.backToLogin": "Zurück zur Anmeldung",
  "forgotPasswordForm.emailLabel": "Die E-Mail deines Kontos",
  "forgotPasswordForm.emailPlaceholder": "du@beispiel.de",
  "forgotPasswordForm.submitPending": "Wird gesendet…",
  "forgotPasswordForm.submit": "Link zum Zurücksetzen schicken",

  // ── password-reset-forms.tsx · ResetPasswordForm ──────────────────────
  "resetPasswordForm.success": "Passwort geändert — du kannst dich anmelden.",
  "resetPasswordForm.signIn": "Anmelden",
  "resetPasswordForm.newLabel": "Neues Passwort (mind. 8 Zeichen)",
  "resetPasswordForm.confirmLabel": "Bestätige es",
  "resetPasswordForm.retryLink": "Neue Anfrage stellen",
  "resetPasswordForm.submitPending": "Wird gespeichert…",
  "resetPasswordForm.submit": "Mein Passwort ändern",

  // ── delete-account.tsx · DeleteAccount ────────────────────────────────
  "deleteAccount.summary": "Mein Konto löschen",
  "deleteAccount.bodyBefore":
    "Deine persönlichen Daten werden gelöscht (Profil, Avatar, Bio, Stadt, Einstellungen) und der Zugang endgültig gekappt.",
  "deleteAccount.bodyStrong":
    "Deine gefilmten Erfahrungsberichte werden aus dem Live-Feed entfernt und ihre Dateien gelöscht",
  "deleteAccount.bodyAfter":
    ": Sie zeigen dein Gesicht und können dich nicht überdauern — es gibt kein Zurück. Deine Beiträge und die Historie der unterstützten Projekte bleiben, unter dem Namen „Entferntes Mitglied“ — die Konten der Community lügen nie. Nicht möglich, solange eine von dir unterstützte Kampagne läuft.",
  "deleteAccount.passwordLabel": "Bestätige mit deinem Passwort",
  "deleteAccount.submitPending": "Wird gelöscht…",
  "deleteAccount.submit": "Mein Konto endgültig löschen",

  // ── profile-form.tsx · ProfileForm ────────────────────────────────────
  "profileForm.fileTooHeavy": "Bild zu groß — wähle ein Foto unter 1 MB.",
  "profileForm.avatarLabel": "Profilfoto",
  "profileForm.changeAvatarAria": "Profilfoto ändern",
  "profileForm.addAvatarAria": "Profilfoto hinzufügen",
  "profileForm.changePhoto": "Foto ändern",
  "profileForm.addPhoto": "Foto hinzufügen",
  "profileForm.removePhoto": "Entfernen",
  "profileForm.avatarHint":
    "Wird automatisch quadratisch zugeschnitten. Sichtbar auf deinem Profil, deinen Projekten und deinen Nachrichten.",
  "profileForm.nameLabel": "Nutzername",
  "profileForm.bioLabel": "Bio (max. 280 Zeichen, optional)",
  "profileForm.bioPlaceholder": "Wer du bist, was du erschaffst, was du suchst.",
  "profileForm.bioHint":
    "Wird auf deinem öffentlichen Profil angezeigt, neben deiner Reputation und deinen Projekten.",
  "profileForm.linksLabel": "Deine Links (max. 3, optional)",
  "profileForm.linkPlaceholder1": "https://instagram.com/du",
  "profileForm.linkPlaceholder2": "https://tiktok.com/@du",
  "profileForm.linkPlaceholder3": "https://deineseite.de",
  "profileForm.linkAria": "Link {num}",
  "profileForm.linksHint":
    "Website, Socials, Portfolio — auf deinem öffentlichen Profil angezeigt (nur https).",
  "profileForm.languageLabel": "Meine Sprache",
  "profileForm.languageHint":
    "Interface, Benachrichtigungen und E-Mails — selbst der Verlauf liest sich in der gewählten Sprache.",
  "profileForm.currencyLabel": "Meine Währung",
  "profileForm.currencyHint":
    "Die Beträge deines Dashboards werden in dieser Währung angezeigt (unverbindliche Umrechnung zum Tageskurs). Nur die 20-$-Anzeige fürs Posten bleibt in Dollar.",
  "profileForm.success": "Profil gespeichert.",
  "profileForm.submitPending": "Wird gespeichert…",
  "profileForm.submit": "Speichern",

  // ── location-form.tsx · LocationForm ──────────────────────────────────
  "locationForm.cityLabel": "Deine Stadt",
  "locationForm.cityPlaceholder": "z. B. Hamburg — fang an zu tippen",
  "locationForm.hintBefore": "Sie platziert dich auf dem Globus der",
  "locationForm.hintLink": "Community-Seite",
  "locationForm.hintAfter":
    "(Position der Stadt, nie dein genauer Standort). Lass das Feld leer, um dort nicht zu erscheinen.",
  "locationForm.removedSuccess": "Du erscheinst nicht mehr auf dem Globus.",
  "locationForm.savedSuccess": "Stadt gespeichert.",
  "locationForm.submitPending": "Wird gespeichert…",
  "locationForm.submit": "Speichern",

  // ── skills-form.tsx · SkillsForm ──────────────────────────────────────
  "skillsForm.label": "Deine Skills",
  "skillsForm.placeholder": "z. B. Schnitt, React, Foto — durch Kommas getrennt",
  "skillsForm.hint":
    "Damit empfehlen wir dir Projekte, die genau so eine helfende Hand suchen wie deine.",
  "skillsForm.success": "Skills gespeichert.",
  "skillsForm.submitPending": "Wird gespeichert…",
  "skillsForm.submit": "Speichern",

  // ── notification-prefs.tsx · NotificationPrefs ────────────────────────
  "notificationPrefs.summary": "Einstellungen — auswählen, was ich erhalte",
  "notificationPrefs.success": "Einstellungen gespeichert.",
  "notificationPrefs.submitPending": "Wird gespeichert…",
  "notificationPrefs.submit": "Speichern",

  // ── connect-form.tsx · PayoutTotals ───────────────────────────────────
  "payoutTotals.due": "Ausstehende Auszahlungen",
  "payoutTotals.sent": "Bereits ausgezahlt",
  "payoutTotals.autoActive": "Überweisungen gehen automatisch raus — spätestens innerhalb von 24 h.",
  "payoutTotals.autoPending":
    "Sie gehen automatisch raus, sobald deine Einrichtung abgeschlossen ist.",

  // ── connect-form.tsx · ConnectForm ────────────────────────────────────
  "connectForm.stripeDisabled":
    "Echte Auszahlungen kommen mit Stripe — in dieser Umgebung nicht konfiguriert.",
  "connectForm.activeTitle": "Auszahlungen aktiv",
  "connectForm.activeBodyLive":
    "Wenn die Community eine Etappe eines deiner Projekte bestätigt, wird ihr Betrag auf dein Stripe-Konto überwiesen, abzüglich der Kartengebühren.",
  "connectForm.activeBodyTest":
    "Wenn die Community eine Etappe eines deiner Projekte bestätigt, wird ihr Betrag auf dein Stripe-Konto überwiesen (vorerst Testmodus — kein echtes Geld fließt).",
  "connectForm.resumeBody":
    "Deine Stripe-Einrichtung ist unvollständig — schließ sie ab, um die Gelder deiner bestätigten Etappen zu erhalten.",
  "connectForm.setupBodyLive":
    "Richte dein Stripe-Konto ein, um die Gelder deiner bestätigten Etappen zu erhalten (2 Minuten).",
  "connectForm.setupBodyTest":
    "Richte dein Stripe-Konto ein, um die Gelder deiner bestätigten Etappen zu erhalten (Testmodus, 2 Minuten).",
  "connectForm.submitPending": "Weiterleitung zu Stripe…",
  "connectForm.resume": "Einrichtung fortsetzen",
  "connectForm.setup": "Meine Auszahlungen einrichten",

  // ── ui/password-input.tsx · PasswordInput ─────────────────────────────
  "passwordInput.show": "Passwort anzeigen",
  "passwordInput.hide": "Passwort verbergen",
} satisfies Messages["account"];
