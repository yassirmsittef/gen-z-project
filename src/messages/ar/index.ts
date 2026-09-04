import { adminPages } from "./adminPages";
import { authPages } from "./authPages";
import { callsPages } from "./callsPages";
import { communityPages } from "./communityPages";
import { home } from "./home";
import { howItWorks } from "./howItWorks";
import { legalPages } from "./legalPages";
import { memberPages } from "./memberPages";
import { projectsPages } from "./projectsPages";
import { rebound } from "./rebound";
import { account } from "./account";
import { calls } from "./calls";
import { chat } from "./chat";
import { project } from "./project";
import { ui } from "./ui";
import type { Messages } from "../types";
import { email } from "./email";
import { err } from "./err";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { notif } from "./notif";
import { v } from "./v";

export const ar = {
  email,
  err,
  account,
  adminPages,
  authPages,
  callsPages,
  communityPages,
  home,
  howItWorks,
  legalPages,
  memberPages,
  projectsPages,
  rebound,
  calls,
  chat,
  project,
  ui,
  common: {
    "support.link": "دعم GeniGain",
    "support.title": "دعم GeniGain",
    "support.lead": "GeniGain منصة بعمولة 0 %: لا تأخذ شيئًا من المشاريع. لتعيش وتنمو، تعتمد على من يؤمنون بالفكرة.",
    "support.what": "ما يموّله دعمك: تطوير المنصة وأمانها، ثم أماكن في المدن لمرافقة من يبدؤون — مكان للعمل والتعلّم ولقاء المساهمين.",
    "support.surplus": "التزام: كل ما يفوق حاجات المنصة يُوجَّه لتمويل مشاريع الأعضاء الآخرين.",
    "support.direct": "بخلاف المشاريع، هذا الدعم بلا مراحل ولا عهدة: إنه هبة للمنصة تُستلم مباشرة في حسابها.",
    "support.total": "المستلَم حتى الآن: {amount}",
    "support.amountLabel": "المبلغ (CHF)",
    "support.button": "ادعم",
    "support.pending": "جارٍ التحويل إلى الدفع…",
    "support.thanks": "شكرًا! وصل دعمك.",
    "support.cancelled": "أُلغي الدفع — لم يُخصم شيء.",
    "support.login": "سجّل الدخول لدعم GeniGain.",
    "support.unlock": "ويفتح بابًا: دعم GeniGain يُحتسب كمساهمة ويفتح لك حق إطلاق مشروعك الخاص.",
    someone: "شخص ما",
    justNow: "الآن",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
