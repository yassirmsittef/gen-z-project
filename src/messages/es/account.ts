import type { Messages } from "../types";

/**
 * Namespace `account` — cuenta y perfil: inicio de sesión, registro,
 * contraseña (cambio + restablecimiento), eliminación de cuenta, perfil,
 * ciudad, habilidades, preferencias de notificaciones, transferencias Stripe.
 */
export const account = {
  // ── auth-forms.tsx · GoogleButton ─────────────────────────────────────
  "googleButton.or": "o",
  "googleButton.continueWithGoogle": "Continuar con Google",

  // ── auth-forms.tsx · LoginForm ────────────────────────────────────────
  "loginForm.emailLabel": "Email",
  "loginForm.emailPlaceholder": "tu@ejemplo.com",
  "loginForm.passwordLabel": "Contraseña",
  "loginForm.forgotPassword": "¿Has olvidado tu contraseña?",
  "loginForm.submitPending": "Iniciando sesión…",
  "loginForm.submit": "Iniciar sesión",
  "loginForm.noAccount": "¿Aún no tienes cuenta?",
  "loginForm.signUpLink": "Regístrate",

  // ── auth-forms.tsx · RegisterForm ─────────────────────────────────────
  "registerForm.nameLabel": "Alias",
  "registerForm.namePlaceholder": "Tu alias",
  "registerForm.emailLabel": "Email",
  "registerForm.emailPlaceholder": "tu@ejemplo.com",
  "registerForm.passwordLabel": "Contraseña",
  "registerForm.passwordHint": "8 caracteres como mínimo.",
  "registerForm.confirmPasswordLabel": "Confirma la contraseña",
  "registerForm.cityLabel": "Tu ciudad",
  "registerForm.cityOptional": "(opcional)",
  "registerForm.cityPlaceholder": "ej.: Madrid — para aparecer en el globo",
  "registerForm.cityHint":
    "La posición de la ciudad en el globo Comunidad, nunca tu posición exacta. Modificable en cualquier momento.",
  "registerForm.languageLabel": "Tu idioma",
  "registerForm.languageHint":
    "La interfaz, las notificaciones y los emails te hablarán en este idioma.",
  "registerForm.currencyLabel": "Tu divisa",
  "registerForm.currencyHint":
    "Tus importes se mostrarán en esta divisa. El derecho a publicar un proyecto se sigue contando en dólares (20 $ contribuidos): tus contribuciones se convierten automáticamente al tipo de cambio del día.",
  "registerForm.acceptPrefix": "Acepto las",
  "registerForm.termsLink": "condiciones de uso",
  "registerForm.acceptMiddle": "y la",
  "registerForm.privacyLink": "política de privacidad",
  "registerForm.acceptSuffix": ".",
  "registerForm.googleAcceptPrefix": "Al continuar con Google, aceptas las",
  "registerForm.submitPending": "Creando…",
  "registerForm.submit": "Crear mi cuenta",
  "registerForm.alreadyAccount": "¿Ya tienes cuenta?",
  "registerForm.signInLink": "Inicia sesión",

  // ── password-form.tsx · PasswordForm ──────────────────────────────────
  "passwordForm.currentLabel": "Contraseña actual",
  "passwordForm.newLabel": "Nueva (8 caracteres mín.)",
  "passwordForm.confirmLabel": "Confirmar",
  "passwordForm.success": "Contraseña modificada.",
  "passwordForm.submitPending": "Modificando…",
  "passwordForm.submit": "Cambiar la contraseña",
  "loginForm.codeLabel": "Código de verificación",
  "loginForm.codeHint": "Esta cuenta está protegida por autenticación en dos pasos: introduce el código de 6 cifras que muestra tu aplicación.",
  "mfa.title": "Autenticación en dos pasos",
  "mfa.body": "Se pedirá en cada inicio de sesión, además de la contraseña, un código de un solo uso generado por una aplicación (Aegis, Google Authenticator, 1Password…).",
  "mfa.enable": "Activar",
  "mfa.secretLabel": "Clave para introducir en la aplicación",
  "mfa.uriLabel": "O pega este enlace en la aplicación",
  "mfa.confirmLabel": "Código que muestra la aplicación",
  "mfa.confirm": "Confirmar y activar",
  "mfa.enabledSince": "Activada el {date}.",
  "mfa.disable": "Desactivar",
  "mfa.disableHint": "Se pide tu contraseña para desactivarla.",
  "mfa.success": "Autenticación en dos pasos activada.",
  "mfa.disabled": "Autenticación en dos pasos desactivada.",

  // ── password-reset-forms.tsx · ForgotPasswordForm ─────────────────────
  "forgotPasswordForm.sentTitle": "Email enviado",
  "forgotPasswordForm.sentBody":
    "Si existe una cuenta con esta dirección, acaba de salir un enlace de restablecimiento — es válido durante 1 hora. Recuerda revisar tu carpeta de spam.",
  "forgotPasswordForm.backToLogin": "Volver al inicio de sesión",
  "forgotPasswordForm.emailLabel": "El email de tu cuenta",
  "forgotPasswordForm.emailPlaceholder": "tu@ejemplo.com",
  "forgotPasswordForm.submitPending": "Enviando…",
  "forgotPasswordForm.submit": "Enviarme un enlace de restablecimiento",

  // ── password-reset-forms.tsx · ResetPasswordForm ──────────────────────
  "resetPasswordForm.success": "Contraseña cambiada — ya puedes iniciar sesión.",
  "resetPasswordForm.signIn": "Iniciar sesión",
  "resetPasswordForm.newLabel": "Nueva contraseña (8 caracteres mín.)",
  "resetPasswordForm.confirmLabel": "Confírmala",
  "resetPasswordForm.retryLink": "Hacer otra solicitud",
  "resetPasswordForm.submitPending": "Guardando…",
  "resetPasswordForm.submit": "Cambiar mi contraseña",

  // ── delete-account.tsx · DeleteAccount ────────────────────────────────
  "deleteAccount.summary": "Eliminar mi cuenta",
  "deleteAccount.bodyBefore":
    "Tus datos personales se borran (perfil, avatar, bio, ciudad, preferencias) y la conexión se corta definitivamente.",
  "deleteAccount.bodyStrong":
    "Tus testimonios filmados se retiran del directo y sus archivos se eliminan",
  "deleteAccount.bodyAfter":
    ": en ellos se ve tu cara, no pueden sobrevivirte — no hay vuelta atrás. Tus contribuciones y el historial de los proyectos ya apoyados se conservan, a nombre de «Miembro retirado» — las cuentas de la comunidad nunca mienten. Imposible mientras una de las campañas que apoyas siga en curso.",
  "deleteAccount.passwordLabel": "Confirma con tu contraseña",
  "deleteAccount.submitPending": "Eliminando…",
  "deleteAccount.submit": "Eliminar mi cuenta definitivamente",

  // ── profile-form.tsx · ProfileForm ────────────────────────────────────
  "profileForm.fileTooHeavy": "Imagen demasiado pesada — elige una foto de menos de 1 MB.",
  "profileForm.avatarLabel": "Foto de perfil",
  "profileForm.changeAvatarAria": "Cambiar la foto de perfil",
  "profileForm.addAvatarAria": "Añadir una foto de perfil",
  "profileForm.changePhoto": "Cambiar la foto",
  "profileForm.addPhoto": "Añadir una foto",
  "profileForm.removePhoto": "Quitar",
  "profileForm.avatarHint":
    "Recortada en cuadrado automáticamente. Visible en tu perfil, tus proyectos y tus mensajes.",
  "profileForm.nameLabel": "Alias",
  "profileForm.bioLabel": "Bio (280 caracteres máx., opcional)",
  "profileForm.bioPlaceholder": "Quién eres, qué creas, qué buscas.",
  "profileForm.bioHint":
    "Se muestra en tu perfil público, junto a tu reputación y tus proyectos.",
  "profileForm.linksLabel": "Tus enlaces (3 máx., opcional)",
  "profileForm.linkPlaceholder1": "https://instagram.com/tu",
  "profileForm.linkPlaceholder2": "https://tiktok.com/@tu",
  "profileForm.linkPlaceholder3": "https://tusitio.com",
  "profileForm.linkAria": "Enlace {num}",
  "profileForm.linksHint":
    "Web, redes, portfolio — se muestran en tu perfil público (solo https).",
  "profileForm.languageLabel": "Mi idioma",
  "profileForm.languageHint":
    "Interfaz, notificaciones y emails — hasta el historial se relee en el idioma elegido.",
  "profileForm.currencyLabel": "Mi divisa",
  "profileForm.currencyHint":
    "Los importes de tu panel se muestran en esta divisa (conversión indicativa al tipo de cambio del día). Solo el medidor de los 20 $ para publicar sigue en dólares.",
  "profileForm.success": "Perfil guardado.",
  "profileForm.submitPending": "Guardando…",
  "profileForm.submit": "Guardar",

  // ── location-form.tsx · LocationForm ──────────────────────────────────
  "locationForm.cityLabel": "Tu ciudad",
  "locationForm.cityPlaceholder": "ej.: Barcelona — empieza a escribir",
  "locationForm.hintBefore": "Te sitúa en el globo de la",
  "locationForm.hintLink": "página Comunidad",
  "locationForm.hintAfter":
    "(la posición de la ciudad, nunca tu posición exacta). Déjalo vacío para no aparecer ahí.",
  "locationForm.removedSuccess": "Ya no apareces en el globo.",
  "locationForm.savedSuccess": "Ciudad guardada.",
  "locationForm.submitPending": "Guardando…",
  "locationForm.submit": "Guardar",

  // ── skills-form.tsx · SkillsForm ──────────────────────────────────────
  "skillsForm.label": "Tus habilidades",
  "skillsForm.placeholder": "ej.: edición, react, foto — separadas por comas",
  "skillsForm.hint":
    "Sirven para recomendarte proyectos que buscan una ayuda como la tuya.",
  "skillsForm.success": "Habilidades guardadas.",
  "skillsForm.submitPending": "Guardando…",
  "skillsForm.submit": "Guardar",

  // ── notification-prefs.tsx · NotificationPrefs ────────────────────────
  "notificationPrefs.summary": "Preferencias — elegir lo que recibo",
  "notificationPrefs.success": "Preferencias guardadas.",
  "notificationPrefs.submitPending": "Guardando…",
  "notificationPrefs.submit": "Guardar",

  // ── connect-form.tsx · PayoutTotals ───────────────────────────────────
  "payoutTotals.due": "Pendiente de transferencia",
  "payoutTotals.sent": "Ya transferidos",
  "payoutTotals.autoActive": "Las transferencias salen automáticamente — como máximo en 24 h.",
  "payoutTotals.autoPending":
    "Saldrán automáticamente en cuanto termines tu configuración.",

  // ── connect-form.tsx · ConnectForm ────────────────────────────────────
  "connectForm.stripeDisabled":
    "Las transferencias reales llegan con Stripe — no configurado en este entorno.",
  "connectForm.activeTitle": "Transferencias activas",
  "connectForm.activeBodyLive":
    "Cuando la comunidad valida una etapa de uno de tus proyectos, su importe se transfiere a tu cuenta Stripe, neto de las comisiones de tarjeta.",
  "connectForm.activeBodyTest":
    "Cuando la comunidad valida una etapa de uno de tus proyectos, su importe se transfiere a tu cuenta Stripe (modo de prueba por ahora — no circula dinero real).",
  "connectForm.resumeBody":
    "Tu configuración de Stripe está incompleta — termínala para recibir los fondos de tus etapas validadas.",
  "connectForm.setupBodyLive":
    "Configura tu cuenta Stripe para recibir los fondos de tus etapas validadas (2 minutos).",
  "connectForm.setupBodyTest":
    "Configura tu cuenta Stripe para recibir los fondos de tus etapas validadas (modo de prueba, 2 minutos).",
  "connectForm.submitPending": "Redirigiendo a Stripe…",
  "connectForm.resume": "Retomar la configuración",
  "connectForm.setup": "Configurar mis transferencias",

  // ── ui/password-input.tsx · PasswordInput ─────────────────────────────
  "passwordInput.show": "Mostrar la contraseña",
  "passwordInput.hide": "Ocultar la contraseña",
} satisfies Messages["account"];
