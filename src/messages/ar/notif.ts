import type { Messages } from "../types";

export const notif = {
  "contribution.received.title": "{actor} دعم «{projectTitle}» ({money})",

  "contribution.confirmed.title": "تأكدت مساهمتك بمبلغ {money} في «{projectTitle}»",
  "contribution.confirmed.body":
    "تنضم الأموال إلى وديعة المشروع: ستُفرج مرحلة بمرحلة، تحت رقابة تصويت المساهمين — ومنهم أنت. وإن لم يكتمل المشروع، يعود الجزء غير المُفرج عنه تلقائيًا إلى بطاقتك.",

  "refund.lateClose.title": "وصلت مساهمتك في «{projectTitle}» بعد الإغلاق",
  "refund.lateClose.body":
    "انتهت الحملة في هذه الأثناء: تعود مساهمتك إلى بطاقتك، صافيةً من رسوم البطاقة التي لا يعيدها البنك (لا تحتفظ GeniGain بأي منها).",

  "refund.projectFailed.title": "استرداد {money} — «{projectTitle}»",
  "refund.projectFailed.body":
    "لم تكتمل الحملة: يعود نصيبك من الوديعة المتبقية إلى بطاقتك (بضعة أيام حسب بنكك)، صافيًا من رسوم البطاقة التي لا يعيدها البنك — لا تحتفظ GeniGain بأي منها.",

  "projectFunded.owner.title": "تم بلوغ الهدف لـ «{projectTitle}»!",
  "projectFunded.owner.body": "انتهى الجمع — قدّم إثبات المرحلة 1 لفتح الأموال الأولى.",

  "projectFunded.supporter.title": "«{projectTitle}» مموَّل!",
  "projectFunded.supporter.body": "ستُفرج الأموال مرحلة بمرحلة، تحت رقابة المساهمين.",

  "proofToVote.title": "إثبات للمراجعة — «{projectTitle}»",
  "proofToVote.body": "المرحلة {order}: {milestoneTitle}. صوتك يفتح الأموال (أو لا).",

  "milestoneReleased.next.title": "المرحلة {order} اعتُمدت — أُفرج عن {money}",
  "milestoneReleased.next.body":
    "اعتمد المجتمع إثباتك لـ «{projectTitle}». المرحلة التالية: «{nextTitle}». التحويل في طريقه إلى حسابك على Stripe.",

  "milestoneReleased.final.title": "المرحلة {order} اعتُمدت — أُفرج عن {money}",
  "milestoneReleased.final.body":
    "«{projectTitle}» أُنجز بالكامل. مبروك! التحويل الأخير في طريقه إلى حسابك على Stripe.",

  "proofRejected.title": "إثبات مرفوض — «{projectTitle}»",
  "proofRejected.body": {
    zero: "المرحلة {order}: لم يعتمد المجتمع الإثبات. لم تتبقَّ لك محاولات — عزّز إثباتك (صور، روابط عامة).",
    one: "المرحلة {order}: لم يعتمد المجتمع الإثبات. تبقّت لك محاولة واحدة — عزّز إثباتك (صور، روابط عامة).",
    two: "المرحلة {order}: لم يعتمد المجتمع الإثبات. تبقّت لك محاولتان — عزّز إثباتك (صور، روابط عامة).",
    few: "المرحلة {order}: لم يعتمد المجتمع الإثبات. تبقّت لك {count} محاولات — عزّز إثباتك (صور، روابط عامة).",
    many: "المرحلة {order}: لم يعتمد المجتمع الإثبات. تبقّت لك {count} محاولةً — عزّز إثباتك (صور، روابط عامة).",
    other: "المرحلة {order}: لم يعتمد المجتمع الإثبات. تبقّت لك {count} محاولة — عزّز إثباتك (صور، روابط عامة).",
  },

  "projectFailed.owner.title": "«{projectTitle}» لم يكتمل",
  "projectFailed.owner.body":
    "{reason} الفشل ليس خروجًا: تنتظرك فرص على مسار الانطلاق من جديد.",

  "failReason.stoppedByOwner": "أوقف المشروعَ صاحبُه.",
  "failReason.goalNotReached": "لم يُبلغ الهدف قبل نهاية الحملة.",
  "failReason.proofsRefused": "رفض المجتمع إثباتات التقدم.",
  "failReason.milestonesNotRealized": "لم تُنجز المراحل خلال {days} يومًا بعد التمويل.",

  "boycottAnswered.title": "بديل لـ {target}",
  "boycottAnswered.body": "«{projectTitle}» ينطلق ليحل محل {target}.",

  "boycottRemoved.title": "سُحب نداؤك",
  "boycottRemoved.body": "«{target}» — {reason}.",
  "boycottRemoved.defaultReason": "غير مطابق لميثاق النداءات",

  "callComment.title": "{actor} ردّ على ندائك حول {target}",
  "callComment.body": "{excerpt}",

  "callVideo.new.title": "{actor} صوّر شهادة حول {target}",
  "callVideo.new.body": "{excerpt}",

  "callVideo.removed.title": "سُحبت شهادتك المصوّرة",
  "callVideo.removed.body": "{excerpt}",

  "storageAlert.warn.title": "التخزين المستضاف عند {warnPct}٪ ({usedMo} م.ب من {capMo} م.ب)",
  "storageAlert.warn.body":
    "المخزن (شهادات المباشر وصور الملفات الشخصية) يقترب من سقفه. تعرض قمرة الإشراف التوزيع. رتّب المساحة، أو ارفع سقف الاستضافة قبل أن تُرفض الإيداعات.",

  "storageAlert.full.title":
    "التخزين المستضاف ممتلئ ({usedMo} م.ب من {capMo} م.ب) — تُرفض الإيداعات",
  "storageAlert.full.body":
    "الشهادة القادمة قد تتجاوز السقف: تعليق تسليم رموز الرفع حتى تتحرر مساحة.",

  "securityAlert.loginBurst.title": "موجة من محاولات تسجيل الدخول الفاشلة: {count} خلال {minutes} دقيقة",
  "securityAlert.loginBurst.body": "أحدهم يجرّب كلمات المرور على نطاق واسع. أقفال الحساب والعنوان تعمل؛ إن استمر ذلك فعّل جدار حماية Vercel وراجع السجل.",
  "securityAlert.dispute.title": "نزاع مصرفي مفتوح ({reason}) — {count} مساهمة مجمّدة",
  "securityAlert.dispute.body": "أحد المساهمين يعترض على دفعته لدى مصرفه. لم تعد مساهمته تُحتسب في التصويت ولا يمكن صرفها. ردّ على النزاع من لوحة Stripe.",
  "securityAlert.translationSaturated.title": "الترجمة الآلية استُنفدت لهذا الشهر",
  "securityAlert.translationSaturated.body": "بلغ الحدّ الأقصى للأحرف: يجيب زر «ترجمة» بـ«مشبع» حتى الشهر القادم. الذروة غير الطبيعية قد تكون إساءة استخدام — يظهرها جدول TranslationUsage.",

  "groupMessage.title": "{actor} كتب في {groupName}",

  "comment.title": "{actor} علّق على «{projectTitle}»",
  "comment.body": "{excerpt}",

  "projectUpdate.title": "مستجدّ من «{projectTitle}»: {updateTitle}",

  "message.new.title": "رسالة جديدة من {actor}",

  "partnership.request.title": "طلب شراكة من {brandName}",
  "partnership.request.body": "لـ «{projectTitle}». أعدّ المساعد الذكي تحليله.",

  "partnership.requestBudget.title": "طلب شراكة من {brandName}",
  "partnership.requestBudget.body":
    "لـ «{projectTitle}» · {budgetUsd} $ معروضة. أعدّ المساعد الذكي تحليله.",

  "tombstone.CALL_VIDEO": "سُحبت هذه الشهادة.",
  "tombstone.CALL_COMMENT": "سُحب هذا الرد.",
  "tombstone.COMMENT": "سُحب هذا التعليق.",
} satisfies Messages["notif"];
