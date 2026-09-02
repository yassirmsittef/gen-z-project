import type { Messages } from "../types";

export const email = {
  hello: "مرحبًا {name} — ",
  cta: "اعرض على GeniGain",
  ctaText: "اعرض على GeniGain:",
  why: "تصلك هذه الرسالة لأن حدثًا مهمًا يخص مشاريعك أو مساهماتك.",
  managePrefs: "إدارة تفضيلاتي",
  managePrefsText: "أدر تفضيلاتك: {link}",
  signature: "GeniGain — المجتمع الذي يموّل جيلك",

  "verify.subject": "أكّد عنوان بريدك في GeniGain",
  "verify.heading": "أكّد عنوان بريدك الإلكتروني",
  "verify.intro": "مرحبًا بك! بقيت خطوة واحدة: تأكيد أن هذا العنوان لك فعلًا.",
  "verify.validity": "الرابط صالح لمدة 24 ساعة ويعمل مرة واحدة فقط.",
  "verify.cta": "تأكيد عنواني",
  "verify.ignore": "إن لم تُنشئ حسابًا في GeniGain فتجاهل هذه الرسالة.",
  "reset.subject": "أعد تعيين كلمة مرورك على GeniGain",
  "reset.heading": "أعد تعيين كلمة مرورك",
  "reset.intro": "طلب أحدهم (أنت عادةً) إعادة تعيين كلمة مرورك على GeniGain.",
  "reset.validity": "الرابط صالح لمدة ساعة واحدة ويعمل مرة واحدة فقط.",
  "reset.cta": "اختر كلمة مرور جديدة",
  "reset.ignore": "إن لم يكن أنت، فتجاهل هذه الرسالة — كلمة مرورك تبقى كما هي.",
} satisfies Messages["email"];
