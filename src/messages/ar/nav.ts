import type { Messages } from "../types";

export const nav = {
  skipToContent: "الانتقال إلى المحتوى",
  projects: "المشاريع",
  calls: "النداءات",
  live: "المباشر",
  community: "المجتمع",
  communityTitle: "المجتمع — الشبكة على الكرة الأرضية",
  rankings: "التصنيفات",
  launchProject: "أطلق مشروعًا",
  dashboard: "لوحة التحكم",
  chat: "الدردشة",
  chatTitle: "الدردشة — تعاون بين أصحاب المشاريع",
  adminCockpit: "قمرة الإشراف",
  adminOpenReports: {
    zero: "لا بلاغات مفتوحة",
    one: "بلاغ واحد مفتوح",
    two: "بلاغان مفتوحان",
    few: "{count} بلاغات مفتوحة",
    many: "{count} بلاغًا مفتوحًا",
    other: "{count} بلاغ مفتوح",
  },
  profileTitle: "ملفك العام",
  signOut: "تسجيل الخروج",
  signIn: "تسجيل الدخول",
  signUp: "إنشاء حساب",
  legalLinks: "روابط قانونية",
  terms: "شروط الاستخدام",
  privacy: "الخصوصية",
  legalNotice: "إشعارات قانونية",
  footerLive:
    "GeniGain · عمولة 0٪، تُطبق رسوم البنك فقط · المدفوعات مؤمَّنة عبر Stripe.",
  footerTest:
    "GeniGain · المرحلة 1 — مدفوعات Stripe في وضع الاختبار، لا خصم حقيقي · عمولة 0٪، رسوم البنك فقط.",
  notFoundLabel: "خطأ 404",
  notFoundHeading: "ضاعت هذه الصفحة في المدار",
  notFoundBody:
    "قد يكون الرابط منتهي الصلاحية — أو سُحب المشروع من طرف صاحبه. لا شيء يضيع: يواصل المجتمع البناء هنا بجانبك.",
  notFoundDiscover: "اكتشف المشاريع",
  notFoundHome: "الرئيسية",
} satisfies Messages["nav"];
