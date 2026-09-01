import type { Messages } from "../types";

export const ui = {
  // Recherche globale (⌘K)
  "commandPalette.triggerTitle": "بحث (⌘K)",
  "commandPalette.triggerLabel": "البحث في المشاريع والغرف والأعضاء",
  "commandPalette.dialogLabel": "البحث الشامل",
  "commandPalette.inputPlaceholder": "ابحث عن مشروع، علامة، غرفة، عضو…",
  "commandPalette.inputLabel": "البحث عن مشروع أو غرفة أو عضو",
  "commandPalette.sectionProjects": "المشاريع",
  "commandPalette.sectionCalls": "النداءات",
  "commandPalette.sectionRooms": "الغرف",
  "commandPalette.sectionMembers": "الأعضاء",
  "commandPalette.replaceTarget": "استبدال {target}",
  "commandPalette.callVotes": {
    zero: "لا أصوات",
    one: "صوت واحد",
    two: "صوتان",
    few: "{count} أصوات",
    many: "{count} صوتًا",
    other: "{count} صوت",
  },
  "commandPalette.callAnswerers": {
    zero: "لا بدائل",
    one: "بديل واحد",
    two: "بديلان",
    few: "{count} بدائل",
    many: "{count} بديلًا",
    other: "{count} بديل",
  },
  "commandPalette.callNoAnswerers": "لا أحد بعد",
  "commandPalette.roomMeta": {
    zero: "لا أعضاء · {purpose}",
    one: "عضو واحد · {purpose}",
    two: "عضوان · {purpose}",
    few: "{count} أعضاء · {purpose}",
    many: "{count} عضوًا · {purpose}",
    other: "{count} عضو · {purpose}",
  },
  "commandPalette.noResults": "لا نتائج لـ «{query}».",
  "commandPalette.minChars": "اكتب حرفين على الأقل — المشاريع بالعنوان أو العرض الموجز، والأعضاء بالاسم.",
  "commandPalette.shortcutsHint": "↑↓ تنقّل · ↵ فتح · esc إغلاق",

  // Partage de la page courante
  "shareButton.share": "مشاركة",
  "shareButton.copied": "نُسخ الرابط!",
  "shareButton.copyPrompt": "انسخ رابط المشروع:",

  // Signalement à l'équipe
  "reportButton.defaultLabel": "إبلاغ",
  "reportButton.triggerTitle": "إبلاغ الفريق",
  "reportButton.dialogLabel": "الإبلاغ عن هذا المحتوى",
  "reportButton.sentTitle": "أُرسل البلاغ",
  "reportButton.sentBody":
    "شكرًا لسهرك على المجتمع — سينظر الفريق في الأمر. الشخص المعني لا يُعلم ببلاغك.",
  "reportButton.close": "إغلاق",
  "reportButton.heading": "إبلاغ الفريق",
  "reportButton.reasonLegend": "السبب",
  "reportButton.detailLabel": "توضيح (اختياري)",
  "reportButton.detailPlaceholder": "ما الذي أثار انتباهك — روابط، سياق…",
  "reportButton.sending": "جارٍ الإرسال…",
  "reportButton.submit": "أرسل البلاغ",
  "reportButton.cancel": "إلغاء",

  // Cloche de notifications
  "navbarBell.title": "الإشعارات",
  "navbarBell.overflow": "9+",
  "navbarBell.srUnread": {
    zero: "الإشعارات (لا إشعارات غير مقروءة)",
    one: "الإشعارات (إشعار واحد غير مقروء)",
    two: "الإشعارات (إشعاران غير مقروءين)",
    few: "الإشعارات ({count} إشعارات غير مقروءة)",
    many: "الإشعارات ({count} إشعارًا غير مقروء)",
    other: "الإشعارات ({count} إشعار غير مقروء)",
  },

  // Globe de la communauté
  "communityGlobe.loading": "جارٍ تهيئة الكرة الأرضية…",

  // Navigation du cadre légal
  "legalNav.ariaLabel": "الصفحات القانونية",
  "legalNav.terms": "شروط الاستخدام",
  "legalNav.privacy": "الخصوصية",
  "legalNav.legalNotice": "إشعارات قانونية",

  // Badge de réputation
  "reputationBadge.title": "السمعة: {reputation}",

  // Traduction sur l'appareil (Translator du navigateur — aucun service tiers)
  "translate.action": "ترجمة",
  "translate.title": "ترجم هذا النص إلى لغتك، على جهازك",
  "translate.working": "جارٍ الترجمة…",
  "translate.downloading": "جارٍ تنزيل النموذج… {percent}٪",
  "translate.showOriginal": "اعرض الأصل",
  "translate.badge": "تُرجم على جهازك",
  "translate.sameLanguage": "هذا النص بلغتك أصلًا.",
  "translate.unavailablePair": "متصفحك لا يترجم هذه اللغة.",
  "translate.failed": "لم تنجح الترجمة — أعد المحاولة.",
} satisfies Messages["ui"];
