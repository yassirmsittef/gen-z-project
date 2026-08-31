import type { Messages } from "../types";

export const account = {
  // ── auth-forms.tsx · GoogleButton ─────────────────────────────────────
  "googleButton.or": "أو",
  "googleButton.continueWithGoogle": "المتابعة عبر Google",

  // ── auth-forms.tsx · LoginForm ────────────────────────────────────────
  "loginForm.emailLabel": "البريد الإلكتروني",
  "loginForm.emailPlaceholder": "name@example.com",
  "loginForm.passwordLabel": "كلمة المرور",
  "loginForm.forgotPassword": "نسيت كلمة المرور؟",
  "loginForm.submitPending": "جارٍ تسجيل الدخول…",
  "loginForm.submit": "تسجيل الدخول",
  "loginForm.noAccount": "ليس لديك حساب بعد؟",
  "loginForm.signUpLink": "أنشئ حسابًا",

  // ── auth-forms.tsx · RegisterForm ─────────────────────────────────────
  "registerForm.nameLabel": "الاسم المستعار",
  "registerForm.namePlaceholder": "اسمك المستعار",
  "registerForm.emailLabel": "البريد الإلكتروني",
  "registerForm.emailPlaceholder": "name@example.com",
  "registerForm.passwordLabel": "كلمة المرور",
  "registerForm.passwordHint": "8 أحرف على الأقل.",
  "registerForm.confirmPasswordLabel": "أكّد كلمة المرور",
  "registerForm.cityLabel": "مدينتك",
  "registerForm.cityOptional": "(اختياري)",
  "registerForm.cityPlaceholder": "مثال: الدار البيضاء — لتظهر على الكرة الأرضية",
  "registerForm.cityHint":
    "يُعرض موقع المدينة على الكرة الأرضية في صفحة المجتمع، لا موقعك الدقيق أبدًا. يمكن تعديله في أي وقت.",
  "registerForm.languageLabel": "لغتك",
  "registerForm.languageHint":
    "بهذه اللغة ستخاطبك الواجهة والإشعارات والرسائل البريدية.",
  "registerForm.currencyLabel": "عملتك",
  "registerForm.currencyHint":
    "ستُعرض مبالغك بهذه العملة. يبقى حق نشر مشروع محسوبًا بالدولار (20 $ من المساهمات): تُحوَّل مساهماتك إليه تلقائيًا بسعر اليوم.",
  "registerForm.acceptPrefix": "أوافق على",
  "registerForm.termsLink": "شروط الاستخدام",
  "registerForm.acceptMiddle": "و",
  "registerForm.privacyLink": "سياسة الخصوصية",
  "registerForm.acceptSuffix": ".",
  "registerForm.googleAcceptPrefix": "بمتابعتك عبر Google، فأنت توافق على",
  "registerForm.submitPending": "جارٍ الإنشاء…",
  "registerForm.submit": "أنشئ حسابي",
  "registerForm.alreadyAccount": "لديك حساب بالفعل؟",
  "registerForm.signInLink": "سجّل الدخول",

  // ── password-form.tsx · PasswordForm ──────────────────────────────────
  "passwordForm.currentLabel": "كلمة المرور الحالية",
  "passwordForm.newLabel": "الجديدة (8 أحرف على الأقل)",
  "passwordForm.confirmLabel": "التأكيد",
  "passwordForm.success": "تم تغيير كلمة المرور.",
  "passwordForm.submitPending": "جارٍ التغيير…",
  "passwordForm.submit": "تغيير كلمة المرور",

  // ── password-reset-forms.tsx · ForgotPasswordForm ─────────────────────
  "forgotPasswordForm.sentTitle": "أُرسل البريد",
  "forgotPasswordForm.sentBody":
    "إن وُجد حساب بهذا العنوان، فقد انطلق للتو رابط إعادة التعيين — وهو صالح لمدة ساعة واحدة. تذكّر مراجعة البريد المزعج.",
  "forgotPasswordForm.backToLogin": "العودة إلى تسجيل الدخول",
  "forgotPasswordForm.emailLabel": "بريد حسابك الإلكتروني",
  "forgotPasswordForm.emailPlaceholder": "name@example.com",
  "forgotPasswordForm.submitPending": "جارٍ الإرسال…",
  "forgotPasswordForm.submit": "إرسال رابط إعادة التعيين إليّ",

  // ── password-reset-forms.tsx · ResetPasswordForm ──────────────────────
  "resetPasswordForm.success": "تغيّرت كلمة المرور — يمكنك تسجيل الدخول.",
  "resetPasswordForm.signIn": "تسجيل الدخول",
  "resetPasswordForm.newLabel": "كلمة المرور الجديدة (8 أحرف على الأقل)",
  "resetPasswordForm.confirmLabel": "أكّدها",
  "resetPasswordForm.retryLink": "إعادة الطلب",
  "resetPasswordForm.submitPending": "جارٍ الحفظ…",
  "resetPasswordForm.submit": "تغيير كلمة مروري",

  // ── delete-account.tsx · DeleteAccount ────────────────────────────────
  "deleteAccount.summary": "حذف حسابي",
  "deleteAccount.bodyBefore":
    "تُمحى بياناتك الشخصية (الملف الشخصي، الصورة، النبذة، المدينة، التفضيلات) ويُقطع الاتصال نهائيًا.",
  "deleteAccount.bodyStrong":
    "تُسحب شهاداتك المصوّرة من المباشر وتُحذف ملفاتها",
  "deleteAccount.bodyAfter":
    ": يظهر فيها وجهك، فلا يمكنها أن تبقى بعدك — بلا رجعة. تبقى مساهماتك وسجلّ المشاريع التي دعمتها باسم «عضو منسحب» — حسابات المجتمع لا تكذب أبدًا. الحذف متعذر ما دامت إحدى الحملات التي دعمتها جارية.",
  "deleteAccount.passwordLabel": "أكّد بكلمة مرورك",
  "deleteAccount.submitPending": "جارٍ الحذف…",
  "deleteAccount.submit": "احذف حسابي نهائيًا",

  // ── profile-form.tsx · ProfileForm ────────────────────────────────────
  "profileForm.fileTooHeavy": "الصورة ثقيلة جدًا — اختر صورة أقل من 1 م.ب.",
  "profileForm.avatarLabel": "صورة الملف الشخصي",
  "profileForm.changeAvatarAria": "تغيير صورة الملف الشخصي",
  "profileForm.addAvatarAria": "إضافة صورة ملف شخصي",
  "profileForm.changePhoto": "تغيير الصورة",
  "profileForm.addPhoto": "إضافة صورة",
  "profileForm.removePhoto": "إزالة",
  "profileForm.avatarHint":
    "تُقصّ مربعةً تلقائيًا. تظهر في ملفك الشخصي ومشاريعك ورسائلك.",
  "profileForm.nameLabel": "الاسم المستعار",
  "profileForm.bioLabel": "نبذة (280 حرفًا كحد أقصى، اختياري)",
  "profileForm.bioPlaceholder": "من أنت، ماذا تصنع، وعمّ تبحث.",
  "profileForm.bioHint":
    "تُعرض في ملفك العام، بجانب سمعتك ومشاريعك.",
  "profileForm.linksLabel": "روابطك (3 كحد أقصى، اختياري)",
  "profileForm.linkPlaceholder1": "https://instagram.com/you",
  "profileForm.linkPlaceholder2": "https://tiktok.com/@you",
  "profileForm.linkPlaceholder3": "https://your-site.com",
  "profileForm.linkAria": "الرابط {num}",
  "profileForm.linksHint":
    "موقع، شبكات اجتماعية، أعمال — تُعرض في ملفك العام (https فقط).",
  "profileForm.languageLabel": "لغتي",
  "profileForm.languageHint":
    "الواجهة والإشعارات والرسائل البريدية — حتى السجلّ يُقرأ باللغة المختارة.",
  "profileForm.currencyLabel": "عملتي",
  "profileForm.currencyHint":
    "تُعرض مبالغ لوحة تحكمك بهذه العملة (تحويل استرشادي بسعر اليوم). يبقى مؤشر الـ 20 $ للنشر بالدولار وحده.",
  "profileForm.success": "حُفظ الملف الشخصي.",
  "profileForm.submitPending": "جارٍ الحفظ…",
  "profileForm.submit": "حفظ",

  // ── location-form.tsx · LocationForm ──────────────────────────────────
  "locationForm.cityLabel": "مدينتك",
  "locationForm.cityPlaceholder": "مثال: الرباط — ابدأ بالكتابة",
  "locationForm.hintBefore": "تضعك على الكرة الأرضية في",
  "locationForm.hintLink": "صفحة المجتمع",
  "locationForm.hintAfter":
    "(موقع المدينة، لا موقعك الدقيق أبدًا). اتركه فارغًا كي لا تظهر عليها.",
  "locationForm.removedSuccess": "لم تعد تظهر على الكرة الأرضية.",
  "locationForm.savedSuccess": "حُفظت المدينة.",
  "locationForm.submitPending": "جارٍ الحفظ…",
  "locationForm.submit": "حفظ",

  // ── skills-form.tsx · SkillsForm ──────────────────────────────────────
  "skillsForm.label": "مهاراتك",
  "skillsForm.placeholder": "مثال: مونتاج، react، تصوير — مفصولة بفواصل",
  "skillsForm.hint":
    "تفيدنا في أن نرشّح لك مشاريع تبحث عن يد عون مثل يدك.",
  "skillsForm.success": "حُفظت المهارات.",
  "skillsForm.submitPending": "جارٍ الحفظ…",
  "skillsForm.submit": "حفظ",

  // ── notification-prefs.tsx · NotificationPrefs ────────────────────────
  "notificationPrefs.summary": "التفضيلات — اختيار ما يصلني",
  "notificationPrefs.success": "حُفظت التفضيلات.",
  "notificationPrefs.submitPending": "جارٍ الحفظ…",
  "notificationPrefs.submit": "حفظ",

  // ── connect-form.tsx · PayoutTotals ───────────────────────────────────
  "payoutTotals.due": "بانتظار التحويل",
  "payoutTotals.sent": "حُوِّلت بالفعل",
  "payoutTotals.autoActive": "تنطلق التحويلات تلقائيًا — خلال 24 ساعة على الأكثر.",
  "payoutTotals.autoPending":
    "ستنطلق تلقائيًا فور اكتمال إعدادك.",

  // ── connect-form.tsx · ConnectForm ────────────────────────────────────
  "connectForm.stripeDisabled":
    "التحويلات الحقيقية تأتي مع Stripe — غير مهيأة في هذه البيئة.",
  "connectForm.activeTitle": "التحويلات مفعّلة",
  "connectForm.activeBodyLive":
    "عندما يعتمد المجتمع مرحلةً من أحد مشاريعك، يُحوَّل مبلغها إلى حسابك على Stripe صافيًا من رسوم البطاقة.",
  "connectForm.activeBodyTest":
    "عندما يعتمد المجتمع مرحلةً من أحد مشاريعك، يُحوَّل مبلغها إلى حسابك على Stripe (وضع الاختبار حاليًا — لا أموال حقيقية تتحرك).",
  "connectForm.resumeBody":
    "إعداد Stripe لديك غير مكتمل — أكمله لتستلم أموال مراحلك المعتمدة.",
  "connectForm.setupBodyLive":
    "هيّئ حسابك على Stripe لتستلم أموال مراحلك المعتمدة (دقيقتان).",
  "connectForm.setupBodyTest":
    "هيّئ حسابك على Stripe لتستلم أموال مراحلك المعتمدة (وضع الاختبار، دقيقتان).",
  "connectForm.submitPending": "إعادة التوجيه إلى Stripe…",
  "connectForm.resume": "استئناف الإعداد",
  "connectForm.setup": "تهيئة تحويلاتي",

  // ── ui/password-input.tsx · PasswordInput ─────────────────────────────
  "passwordInput.show": "إظهار كلمة المرور",
  "passwordInput.hide": "إخفاء كلمة المرور",
} satisfies Messages["account"];
