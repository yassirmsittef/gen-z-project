import type { Messages } from "../types";

/**
 * Namespace `account` — conta e perfil: início de sessão, registo,
 * palavra-passe (mudança + reposição), eliminação de conta, perfil,
 * cidade, competências, preferências de notificações, transferências Stripe.
 */
export const account = {
  // ── auth-forms.tsx · GoogleButton ─────────────────────────────────────
  "googleButton.or": "ou",
  "googleButton.continueWithGoogle": "Continuar com o Google",

  // ── auth-forms.tsx · LoginForm ────────────────────────────────────────
  "loginForm.emailLabel": "Email",
  "loginForm.emailPlaceholder": "tu@exemplo.pt",
  "loginForm.passwordLabel": "Palavra-passe",
  "loginForm.forgotPassword": "Esqueceste-te da palavra-passe?",
  "loginForm.submitPending": "A iniciar sessão…",
  "loginForm.submit": "Iniciar sessão",
  "loginForm.noAccount": "Ainda sem conta?",
  "loginForm.signUpLink": "Regista-te",

  // ── auth-forms.tsx · RegisterForm ─────────────────────────────────────
  "registerForm.nameLabel": "Alias",
  "registerForm.namePlaceholder": "O teu alias",
  "registerForm.emailLabel": "Email",
  "registerForm.emailPlaceholder": "tu@exemplo.pt",
  "registerForm.passwordLabel": "Palavra-passe",
  "registerForm.passwordHint": "Mínimo de 8 caracteres.",
  "registerForm.confirmPasswordLabel": "Confirma a palavra-passe",
  "registerForm.cityLabel": "A tua cidade",
  "registerForm.cityOptional": "(opcional)",
  "registerForm.cityPlaceholder": "ex.: Lisboa — para apareceres no globo",
  "registerForm.cityHint":
    "Posição da cidade no globo da Comunidade, nunca a tua posição exata. Podes mudar a qualquer momento.",
  "registerForm.languageLabel": "A tua língua",
  "registerForm.languageHint":
    "A interface, as notificações e os emails vão falar contigo nesta língua.",
  "registerForm.currencyLabel": "A tua moeda",
  "registerForm.currencyHint":
    "Os teus montantes serão mostrados nesta moeda. O direito de publicar um projeto continua contado em dólares (20 $ contribuídos): as tuas contribuições são convertidas automaticamente à taxa do dia.",
  "registerForm.acceptPrefix": "Aceito as",
  "registerForm.termsLink": "condições de utilização",
  "registerForm.acceptMiddle": "e a",
  "registerForm.privacyLink": "política de privacidade",
  "registerForm.acceptSuffix": ".",
  "registerForm.googleAcceptPrefix": "Ao continuar com o Google, aceitas as",
  "registerForm.submitPending": "A criar…",
  "registerForm.submit": "Criar a minha conta",
  "registerForm.alreadyAccount": "Já tens conta?",
  "registerForm.signInLink": "Inicia sessão",

  // ── password-form.tsx · PasswordForm ──────────────────────────────────
  "verifyBanner.text": "O teu endereço de email ainda não está confirmado — vê a tua caixa (e o spam).",
  "verifyBanner.resend": "Reenviar o email",
  "verifyBanner.sent": "Email reenviado. Está a caminho.",
  "passwordForm.currentLabel": "Palavra-passe atual",
  "passwordForm.newLabel": "Nova (mín. 8 caracteres)",
  "passwordForm.confirmLabel": "Confirmar",
  "passwordForm.success": "Palavra-passe alterada.",
  "passwordForm.submitPending": "A alterar…",
  "passwordForm.submit": "Mudar a palavra-passe",
  "loginForm.codeLabel": "Código de verificação",
  "loginForm.codeHint": "Esta conta está protegida por autenticação de dois fatores: introduz o código de 6 dígitos mostrado pela tua aplicação.",
  "mfa.title": "Autenticação de dois fatores",
  "mfa.body": "A cada início de sessão será pedido, além da palavra-passe, um código de utilização única gerado por uma aplicação (Aegis, Google Authenticator, 1Password…).",
  "mfa.enable": "Ativar",
  "mfa.secretLabel": "Chave a introduzir na aplicação",
  "mfa.uriLabel": "Ou cola esta ligação na aplicação",
  "mfa.confirmLabel": "Código mostrado pela aplicação",
  "mfa.confirm": "Confirmar e ativar",
  "mfa.enabledSince": "Ativa desde {date}.",
  "mfa.disable": "Desativar",
  "mfa.disableHint": "A tua palavra-passe é pedida para desativar.",
  "mfa.success": "Autenticação de dois fatores ativada.",
  "mfa.disabled": "Autenticação de dois fatores desativada.",

  // ── password-reset-forms.tsx · ForgotPasswordForm ─────────────────────
  "forgotPasswordForm.sentTitle": "Email enviado",
  "forgotPasswordForm.sentBody":
    "Se existir uma conta com este endereço, acabou de partir um link de reposição — é válido durante 1 hora. Não te esqueças de ver o spam.",
  "forgotPasswordForm.backToLogin": "Voltar ao início de sessão",
  "forgotPasswordForm.emailLabel": "O email da tua conta",
  "forgotPasswordForm.emailPlaceholder": "tu@exemplo.pt",
  "forgotPasswordForm.submitPending": "A enviar…",
  "forgotPasswordForm.submit": "Enviar-me um link de reposição",

  // ── password-reset-forms.tsx · ResetPasswordForm ──────────────────────
  "resetPasswordForm.success": "Palavra-passe mudada — já podes iniciar sessão.",
  "resetPasswordForm.signIn": "Iniciar sessão",
  "resetPasswordForm.newLabel": "Nova palavra-passe (mín. 8 caracteres)",
  "resetPasswordForm.confirmLabel": "Confirma-a",
  "resetPasswordForm.retryLink": "Fazer novo pedido",
  "resetPasswordForm.submitPending": "A guardar…",
  "resetPasswordForm.submit": "Mudar a minha palavra-passe",

  // ── delete-account.tsx · DeleteAccount ────────────────────────────────
  "deleteAccount.summary": "Eliminar a minha conta",
  "deleteAccount.bodyBefore":
    "Os teus dados pessoais são apagados (perfil, avatar, bio, cidade, preferências) e o acesso é cortado definitivamente.",
  "deleteAccount.bodyStrong":
    "Os teus testemunhos filmados são retirados do direto e os ficheiros eliminados",
  "deleteAccount.bodyAfter":
    ": mostram o teu rosto, não podem sobreviver-te — não há volta atrás. As tuas contribuições e o histórico dos projetos já apoiados ficam, em nome de «Membro retirado» — as contas da comunidade nunca mentem. Impossível enquanto uma das campanhas que apoias estiver em curso.",
  "deleteAccount.passwordLabel": "Confirma com a tua palavra-passe",
  "deleteAccount.submitPending": "A eliminar…",
  "deleteAccount.submit": "Eliminar definitivamente a minha conta",

  // ── profile-form.tsx · ProfileForm ────────────────────────────────────
  "profileForm.fileTooHeavy": "Imagem demasiado pesada — escolhe uma foto com menos de 1 MB.",
  "profileForm.avatarLabel": "Foto de perfil",
  "profileForm.changeAvatarAria": "Mudar a foto de perfil",
  "profileForm.addAvatarAria": "Adicionar uma foto de perfil",
  "profileForm.changePhoto": "Mudar a foto",
  "profileForm.addPhoto": "Adicionar uma foto",
  "profileForm.removePhoto": "Remover",
  "profileForm.avatarHint":
    "Recortada automaticamente em quadrado. Visível no teu perfil, nos teus projetos e nas tuas mensagens.",
  "profileForm.nameLabel": "Alias",
  "profileForm.bioLabel": "Bio (280 caracteres máx., opcional)",
  "profileForm.bioPlaceholder": "Quem és, o que crias, o que procuras.",
  "profileForm.bioHint":
    "Mostrada no teu perfil público, ao lado da tua reputação e dos teus projetos.",
  "profileForm.linksLabel": "Os teus links (3 máx., opcional)",
  "profileForm.linkPlaceholder1": "https://instagram.com/tu",
  "profileForm.linkPlaceholder2": "https://tiktok.com/@tu",
  "profileForm.linkPlaceholder3": "https://oteusite.pt",
  "profileForm.linkAria": "Link {num}",
  "profileForm.linksHint":
    "Site, redes, portefólio — mostrados no teu perfil público (apenas https).",
  "profileForm.languageLabel": "A minha língua",
  "profileForm.languageHint":
    "Interface, notificações e emails — até o histórico se relê na língua escolhida.",
  "profileForm.currencyLabel": "A minha moeda",
  "profileForm.currencyHint":
    "Os montantes do teu painel são mostrados nesta moeda (conversão indicativa à taxa do dia). Só o medidor dos 20 $ para publicar fica em dólares.",
  "profileForm.success": "Perfil guardado.",
  "profileForm.submitPending": "A guardar…",
  "profileForm.submit": "Guardar",

  // ── location-form.tsx · LocationForm ──────────────────────────────────
  "locationForm.cityLabel": "A tua cidade",
  "locationForm.cityPlaceholder": "ex.: Porto — começa a escrever",
  "locationForm.hintBefore": "Ela coloca-te no globo da",
  "locationForm.hintLink": "página Comunidade",
  "locationForm.hintAfter":
    "(posição da cidade, nunca a tua posição exata). Deixa vazio para não apareceres.",
  "locationForm.removedSuccess": "Já não apareces no globo.",
  "locationForm.savedSuccess": "Cidade guardada.",
  "locationForm.submitPending": "A guardar…",
  "locationForm.submit": "Guardar",

  // ── skills-form.tsx · SkillsForm ──────────────────────────────────────
  "skillsForm.label": "As tuas competências",
  "skillsForm.placeholder": "ex.: edição, react, foto — separadas por vírgulas",
  "skillsForm.hint":
    "Servem para te recomendar projetos à procura de uma ajuda como a tua.",
  "skillsForm.success": "Competências guardadas.",
  "skillsForm.submitPending": "A guardar…",
  "skillsForm.submit": "Guardar",

  // ── notification-prefs.tsx · NotificationPrefs ────────────────────────
  "notificationPrefs.summary": "Preferências — escolher o que recebo",
  "notificationPrefs.success": "Preferências guardadas.",
  "notificationPrefs.submitPending": "A guardar…",
  "notificationPrefs.submit": "Guardar",

  // ── connect-form.tsx · PayoutTotals ───────────────────────────────────
  "payoutTotals.due": "A aguardar transferência",
  "payoutTotals.sent": "Já transferidos",
  "payoutTotals.autoActive": "As transferências partem automaticamente — no máximo em 24 h.",
  "payoutTotals.autoPending":
    "Partirão automaticamente assim que a tua configuração estiver concluída.",

  // ── connect-form.tsx · ConnectForm ────────────────────────────────────
  "connectForm.stripeDisabled":
    "As transferências reais chegam com a Stripe — não configurada neste ambiente.",
  "connectForm.activeTitle": "Transferências ativas",
  "connectForm.activeBodyLive":
    "Quando a comunidade valida uma etapa de um dos teus projetos, o montante é transferido para a tua conta Stripe, líquido das taxas de cartão.",
  "connectForm.activeBodyTest":
    "Quando a comunidade valida uma etapa de um dos teus projetos, o montante é transferido para a tua conta Stripe (modo de teste por agora — nenhum dinheiro real circula).",
  "connectForm.resumeBody":
    "A tua configuração Stripe está incompleta — termina-a para receberes os fundos das tuas etapas validadas.",
  "connectForm.setupBodyLive":
    "Configura a tua conta Stripe para receberes os fundos das tuas etapas validadas (2 minutos).",
  "connectForm.setupBodyTest":
    "Configura a tua conta Stripe para receberes os fundos das tuas etapas validadas (modo de teste, 2 minutos).",
  "connectForm.submitPending": "A redirecionar para a Stripe…",
  "connectForm.resume": "Retomar a configuração",
  "connectForm.setup": "Configurar as minhas transferências",

  // ── ui/password-input.tsx · PasswordInput ─────────────────────────────
  "passwordInput.show": "Mostrar a palavra-passe",
  "passwordInput.hide": "Ocultar a palavra-passe",
} satisfies Messages["account"];
