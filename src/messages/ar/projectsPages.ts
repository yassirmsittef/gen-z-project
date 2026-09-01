import type { Messages } from "../types";

export const projectsPages = {
  // ---------- Métadonnées ----------
  "meta.listTitle": "المشاريع",
  "meta.newTitle": "أطلق مشروعًا",
  "meta.detailNotFound": "المشروع غير موجود",
  "meta.editTitle": "تعديل المشروع",
  "meta.partnershipTitle": "اقترح شراكة",

  // ---------- /projects — la liste ----------
  "hero.title": "مشاريع المجتمع",
  "hero.subtitle": "كل مساهمة تُحتسب — وهي تذكرتك لإطلاق مشروعك.",
  "search.placeholder": "ابحث عن مشروع أو فكرة أو كلمة مفتاحية…",
  "search.ariaLabel": "البحث عن مشروع",
  "search.submit": "بحث",
  "filters.categories": "الفئات",
  "filters.allCategories": "كل الفئات",
  "filters.statusesAndSort": "الحالات والترتيب",
  "filters.allStatuses": "كل الحالات",
  "filters.sortLabel": "الترتيب",
  "sort.recent": "الأحدث",
  "sort.suivis": "الأكثر متابعة",
  "sort.fin": "تنتهي قريبًا",
  "sort.finances": "الأكثر تمويلًا",
  "results.count": {
    zero: "لا نتائج",
    one: "نتيجة واحدة",
    two: "نتيجتان",
    few: "{count} نتائج",
    many: "{count} نتيجةً",
    other: "{count} نتيجة",
  },
  "results.forQuery": " لـ «{query}»",
  "empty.title": "لا مشروع يطابق البحث.",
  "empty.body": "جرّب كلمة أخرى، أو غيّر المرشّح — أو كن أول من ينطلق.",

  // ---------- /projects/new — le gate puis le formulaire ----------
  "gate.title": "أولًا، ساهم",
  "gate.body":
    "هنا يضع الجميع أيديهم في العمل قبل أن يطلبوا: تحتاج إلى {required} من المساهمات المتراكمة (بكل العملات، محوَّلةً بسعر يوم الدفع) لتفتح إنشاء مشروعك.",
  "gate.progressLabel": "تقدّمك",
  "gate.percent": "{percent}٪",
  "gate.progressAria": "التقدّم نحو حق النشر: {percent}٪",
  // UNE phrase par clé : l'ordre des mots appartient à chaque langue.
  "gate.progress": "{current} من {required} — بقي {left}.",
  "gate.callLabel": "كنت تريد استبدال",
  "gate.callBody": "النداء ينتظرك: ساهم أولًا، ثم عُد لتأخذه.",
  "gate.callLink": "مراجعة النداء",
  "gate.explore": "استكشف المشاريع",
  "gate.suggestionsTitle": "ينتظرون دعمك",
  "form.title": "أطلق مشروعك",
  "form.titleReplace": "استبدل {target}",
  "form.subtitle":
    "كن شفافًا بشأن خطتك: هي ما يموّله المجتمع، مرحلة بمرحلة.",
  "form.subtitleReplace":
    "وصف أحدهم ما كان سيشتريه بدلًا منها. أرِه كيف تنوي بناءه، مرحلة بمرحلة.",

  // ---------- /projects/[slug] — la fiche projet ----------
  "detail.failedTitle": "هذا المشروع لم يكتمل",
  "detail.failedBody": "استُرد للمساهمين ما تبقّى في الوديعة.",
  "detail.failedRebound": "انهض الآن ←",
  "detail.failedViewer":
    "الفشل جزء من اللعبة — ويُوجَّه صاحب المشروع نحو فرص جديدة.",
  "detail.completedTitle": "مشروع منجَز",
  "detail.completedBody":
    "اعتمد المجتمع كل المراحل، وفُتحت الأموال بالكامل.",
  "detail.replaces": "ينطلق ليحل محل",
  "detail.followLoginTitle": "سجّل الدخول لمتابعة هذا المشروع",
  "detail.follow": "متابعة",
  "detail.followerCount": {
    zero: "لا متابِعين",
    one: "متابِع واحد",
    two: "متابِعان",
    few: "{count} متابِعين",
    many: "{count} متابِعًا",
    other: "{count} متابِع",
  },
  "detail.contact": "مراسلة",
  "detail.brandPartnership": "شراكة علامة",
  "detail.edit": "تعديل",
  "detail.coverAlt": "صورة مشروع {title}",
  "detail.aboutTitle": "المشروع",
  "detail.skillsLabel": "المهارات المطلوبة",
  "detail.milestonesTitle": "المراحل وإثباتات التقدّم",
  "detail.milestonesHint":
    "تُفتح الأموال مرحلة بمرحلة: يقدّم صاحب المشروع إثباتًا، ويصوّت المساهمون.",
  "detail.realizeBefore": "الإنجاز قبل {date} · بقي {days} يومًا",
  "detail.updatesTitle": "مستجدات المشروع",
  "detail.updatesByYou": "أخبار الميدان، ترويها أنت.",
  "detail.updatesBy": "أخبار الميدان، يرويها {name}.",
  "detail.updatesEmpty": "لا مستجدات بعد — ستظهر هنا مع تقدّم المشروع.",
  "detail.updateDelete": "حذف هذا المستجدّ",
  "detail.commentsTitle": "النقاش",
  "detail.commentsHint": "أسئلة، تشجيع، أيادي عون — مجتمع المشروع.",
  "detail.commentsLogin": "سجّل الدخول",
  "detail.commentsLoginSuffix": "للمشاركة في النقاش.",
  "detail.commentsEmpty": "لم يعلّق أحد بعد — افتح النقاش!",
  "detail.commentReport": "الإبلاغ عن هذا التعليق",
  "detail.commentDelete": "حذف هذا التعليق",
  "detail.ofGoal": "من {goal}",
  "detail.contributorCount": {
    zero: "لا مساهمين",
    one: "مساهم واحد",
    two: "مساهمان",
    few: "{count} مساهمين",
    many: "{count} مساهمًا",
    other: "{count} مساهم",
  },
  "detail.daysLeft": {
    zero: "لم يتبقَّ أي يوم",
    one: "يوم واحد متبقٍّ",
    two: "يومان متبقيان",
    few: "{count} أيام متبقية",
    many: "{count} يومًا متبقيًا",
    other: "{count} يوم متبقٍّ",
  },
  "detail.campaignEnded": "انتهت الحملة في {date}",
  "detail.releasedNote":
    "مفتوحة من أصل {raised} — والباقي في وديعة حتى اعتماد المراحل.",
  "detail.ownerShareHint": "هذا مشروعك — شاركه لتبلغ هدفك.",
  "detail.loginToContribute": "سجّل الدخول للمساهمة",
  "detail.contributorsTitle": "المساهمون",
  "detail.moreContributors": "+ {count} آخرين",
  "detail.anonymous": "مساهمات باسم مجهول",

  // ---------- /projects/[slug]/modifier ----------
  "edit.back": "العودة إلى المشروع",
  "edit.title": "تعديل المشروع",
  "edit.frozenLabel": "الإطار المالي مجمَّد",
  "edit.frozenSummary": {
    zero: "الهدف {goal} · نهاية الحملة في {date} · بلا مراحل ({amounts})",
    one: "الهدف {goal} · نهاية الحملة في {date} · مرحلة واحدة ({amounts})",
    two: "الهدف {goal} · نهاية الحملة في {date} · مرحلتان ({amounts})",
    few: "الهدف {goal} · نهاية الحملة في {date} · {count} مراحل ({amounts})",
    many: "الهدف {goal} · نهاية الحملة في {date} · {count} مرحلةً ({amounts})",
    other: "الهدف {goal} · نهاية الحملة في {date} · {count} مرحلة ({amounts})",
  },
  "edit.frozenHint":
    "المساهمات ملتزمة بهذه القواعد: لم يعد بالإمكان تغيير الهدف ولا المراحل ولا المدة.",
  "edit.frozenClosed":
    "انتهت الحملة: محتوى المشروع مجمَّد. ويبقى متاحًا للمجتمع، بإثباتاته وسجلّه.",
  "edit.dangerLabel": "منطقة السحب",
  "edit.deleteHint":
    "لم يساهم أحد بعد: يمكنك سحب هذا المشروع نهائيًا. ستذهب معه المراحل والتعليقات والمتابِعون — ولا رجعة بعد ذلك.",
  "edit.cancelMembers": {
    zero: "لم يساهم أي عضو.",
    one: "ساهم عضو واحد.",
    two: "ساهم عضوان.",
    few: "ساهم {count} أعضاء.",
    many: "ساهم {count} عضوًا.",
    other: "ساهم {count} عضو.",
  },
  "edit.cancelBodyRefund":
    "لم يعد بإمكانك سحبه ببساطة، لكن يمكنك إيقافه: سيتحول إلى «لم يكتمل» ويُسترد {amount} — أي ما تبقّى في الوديعة — إلى المساهمين.",
  "edit.cancelBodyNoRefund":
    "لم يعد بإمكانك سحبه ببساطة، لكن يمكنك إيقافه: سيتحول إلى «لم يكتمل» ولكان سيُسترد {amount} — أي ما تبقّى في الوديعة — إلى المساهمين.",
  "edit.cancelReleased":
    "أما {released} التي فُتحت بالتصويت فلا تشملها العملية.",
  "edit.closedHint":
    "أنهى هذا المشروع دورته: ويبقى متاحًا للمجتمع، بسجلّه.",

  // ---------- /projects/[slug]/partenariat ----------
  "partnership.back": "العودة إلى المشروع",
  "partnership.title": "اقترح شراكة",
  "partnership.intro":
    "تمثّلون علامة وترغبون في التعاون مع {owner} حول «{title}»؟ صفوا مقترحكم — كلما كان أدق وأشفّ، جاءكم الرد أسرع.",
} satisfies Messages["projectsPages"];
