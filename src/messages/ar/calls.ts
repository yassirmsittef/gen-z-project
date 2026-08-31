import type { Messages } from "../types";

export const calls = {
  // ── CallAnswerForm ────────────────────────────────────────────────────────
  "callAnswerForm.emptyHeading": "يمكنك أن تكون البديل",
  "callAnswerForm.emptyBody":
    "أطلق مشروعًا يجيب على هذا النداء: داعموه هم مساهموك الأوائل، وسيُخطرون فور إعلانك.",
  "callAnswerForm.launchReplacement": "أطلق بديل {target}",
  "callAnswerForm.heading": "أحد مشاريعك يجيب عليه؟",
  "callAnswerForm.body":
    "أعلن ذلك: سيُخطر صاحب النداء وكل داعميه.",
  "callAnswerForm.projectLabel": "مشروعك",
  "callAnswerForm.projectPlaceholder": "اختر مشروعًا…",
  "callAnswerForm.success":
    "تم الإعلان — أُخطر داعمو النداء للتو.",
  "callAnswerForm.pending": "جارٍ الحفظ…",
  "callAnswerForm.submit": "مشروعي يحل محل {target}",

  // ── CallCard ──────────────────────────────────────────────────────────────
  "callCard.replacementCount": {
    zero: "لا بدائل",
    one: "بديل واحد",
    two: "بديلان",
    few: "{count} بدائل",
    many: "{count} بديلًا",
    other: "{count} بديل",
  },
  "callCard.nobodyYet": "لا أحد بعد",
  "callCard.noLongerWants": "لم يعد يريد",
  "callCard.instead": "بدلًا منها",
  "callCard.memberFallback": "عضو",
  "callCard.takeCall": "خذ هذا النداء",

  // ── CallCommentForm ───────────────────────────────────────────────────────
  "callCommentForm.placeholder":
    "أضف توضيحًا أو مصدرًا أو وجهة نظر — أو قل لماذا لا توافق…",
  "callCommentForm.replyAria": "ردّك",
  "callCommentForm.pending": "جارٍ الإرسال…",
  "callCommentForm.submit": "رد",
  "callCommentForm.disclaimer":
    "يُنشر باسمك. الاختلاف في الرأي مرحّب به، أما الهجوم الشخصي فلا.",

  // ── CallSupportButton ─────────────────────────────────────────────────────
  "callSupportButton.removeVoiceAria": {
    zero: "سحب صوتي — لا داعمين",
    one: "سحب صوتي — داعم واحد",
    two: "سحب صوتي — داعمان",
    few: "سحب صوتي — {count} داعمين",
    many: "سحب صوتي — {count} داعمًا",
    other: "سحب صوتي — {count} داعم",
  },
  "callSupportButton.supportAria": {
    zero: "أنا أيضًا أريد استبدالها — لا داعمين",
    one: "أنا أيضًا أريد استبدالها — داعم واحد",
    two: "أنا أيضًا أريد استبدالها — داعمان",
    few: "أنا أيضًا أريد استبدالها — {count} داعمين",
    many: "أنا أيضًا أريد استبدالها — {count} داعمًا",
    other: "أنا أيضًا أريد استبدالها — {count} داعم",
  },
  "callSupportButton.removeVoice": "سحب صوتي",
  "callSupportButton.support": "أنا أيضًا أريد استبدالها",
  "callSupportButton.signInToSupport": "سجّل الدخول لدعم هذا النداء",
  "callSupportButton.supported": "مدعوم",
  "callSupportButton.supportShort": "أريد استبدالها",

  // ── CreateCallForm ────────────────────────────────────────────────────────
  "createCallForm.charterHeading": "ما توقّعه عند النشر",
  "createCallForm.charterBody":
    "يُنشر نداؤك باسمك. تستضيف GeniGain هذا الفضاء، لا تكتبه ولا تتبنّاه — وتبقى أنت المسؤول عمّا تؤكّده.",
  "createCallForm.targetLabel": "العلامة أو الشركة",
  "createCallForm.targetPlaceholder": "الاسم، ببساطة…",
  "createCallForm.targetHint":
    "شركة — لا شخص ولا مجتمع أبدًا.",
  "createCallForm.categoryLabel": "القطاع المراد استبداله",
  "createCallForm.categoryPlaceholder": "اختر…",
  "createCallForm.categoryHint":
    "هنا سيأتي أصحاب المشاريع بحثًا عن نداءات يأخذونها.",
  "createCallForm.reasonLabel": "لماذا لم تعد تريدها",
  "createCallForm.reasonPlaceholder":
    "احكِ ما عاينته وعشته وقرأته. ميّز ما تعرفه عمّا تفترضه…",
  "createCallForm.reasonHint":
    "{min} حرفًا على الأقل. الوقائع التي تسوقها تُلزمك — والمصادر موجودة لهذا.",
  "createCallForm.wantedLabel": "ما الذي تريده بدلًا منها",
  "createCallForm.wantedPlaceholder":
    "المنتج أو الخدمة التي كنت ستشتريها غدًا لو وُجدت — وبأي شروط…",
  "createCallForm.wantedHint":
    "هذا هو الجزء الذي يولد منه مشروع. كن دقيقًا: يجب أن يستطيع صاحب مشروع قراءته كدفتر شروط.",
  "createCallForm.sourcesLabel": "المصادر (اختياري)",
  "createCallForm.sourcesHint":
    "رابط في كل سطر، {max} كحد أقصى، بصيغة https. النداء الموثّق يصمد؛ والنداء بلا مصادر يسقط عند أول بلاغ.",
  "createCallForm.pending": "جارٍ النشر…",
  "createCallForm.submit": "انشر النداء",
  "createCallForm.withdrawNote": "يمكنك سحبه بنفسك في أي وقت.",

  // ── VideoFeed ─────────────────────────────────────────────────────────────
  "videoFeed.emptyHeading": "لم يصوّر أحد بعد.",
  "videoFeed.emptyBody":
    "الشهادة ترتبط دائمًا بنداء: افتح نداءً من القائمة واحكِ، أمام الكاميرا، لماذا لم تعد تريد هذه العلامة.",
  "videoFeed.seeCalls": "عرض النداءات",
  "videoFeed.soundOn": "تشغيل الصوت",
  "videoFeed.soundOff": "كتم الصوت",
  "videoFeed.resume": "استئناف",
  "videoFeed.pause": "إيقاف مؤقت",
  "videoFeed.resumePlayback": "استئناف التشغيل",
  "videoFeed.unreadable": "متصفحك لا يستطيع قراءة هذا الفيديو.",
  "videoFeed.openInNewTab": "افتحه في علامة تبويب جديدة",
  "videoFeed.noLongerWants": "لم يعد يريد",
  "videoFeed.memberFallback": "عضو",
  // Le nombre est rendu À CÔTÉ (span mono) ; `count` est passé pour que
  // d'autres langues puissent accorder via un objet pluriel.
  "videoFeed.voicesOnCall": {
    zero: "أصوات على هذا النداء",
    one: "صوت على هذا النداء",
    two: "صوتان على هذا النداء",
    few: "أصوات على هذا النداء",
    many: "صوتًا على هذا النداء",
    other: "صوت على هذا النداء",
  },
  "videoFeed.withdraw": "سحب",
  "videoFeed.hostDisclaimer":
    "شهادة نشرها أحد الأعضاء. تستضيف GeniGain هذا المحتوى وليست مؤلفته.",
  "videoFeed.loading": "جارٍ التحميل…",

  // ── VideoUploadForm ───────────────────────────────────────────────────────
  "videoUploadForm.unreadableRetry":
    "تعذّرت قراءة الفيديو — جرّب ملفًا آخر (MP4 أو WebM).",
  "videoUploadForm.formatRejected":
    "صيغة غير مقبولة — المطلوب MP4 أو WebM. من iPhone، اختر الفيديو من مكتبة الصور: سيُحوَّل تلقائيًا.",
  "videoUploadForm.tooHeavy":
    "الفيديو ثقيل جدًا ({size} م.ب). الحد الأقصى {max} م.ب — صوّر مقطعًا أقصر أو بجودة أقل.",
  "videoUploadForm.tooLong":
    "{seconds} ثانية — هذا أطول من اللازم. {max} ثانية كحد أقصى.",
  "videoUploadForm.unreadable": "تعذّرت قراءة الفيديو.",
  "videoUploadForm.chooseFirst": "اختر فيديو أولًا.",
  "videoUploadForm.publishImpossible": "النشر متعذر حاليًا.",
  "videoUploadForm.sendImpossible": "الإرسال متعذر.",
  "videoUploadForm.successHeading": "شهادتك منشورة.",
  "videoUploadForm.successBody":
    "تظهر في المباشر، مرتبطةً بالنداء حول {target}.",
  "videoUploadForm.seeLive": "عرض المباشر",
  "videoUploadForm.heading": "صوّر شهادتك",
  "videoUploadForm.intro":
    "{maxSeconds} ثانية كحد أقصى، {maxMb} م.ب كحد أقصى. يُنشر الفيديو باسمك، مرتبطًا بهذا النداء — وتبقى مسؤولًا عمّا تؤكّده فيه، تمامًا كالنداء المكتوب.",
  "videoUploadForm.fileLabel": "الفيديو",
  "videoUploadForm.fileMetaPoster": "{seconds} ث · {width}×{height} · التُقطت صورة مصغّرة",
  "videoUploadForm.fileMetaNoPoster": "{seconds} ث · {width}×{height} · بلا صورة مصغّرة",
  "videoUploadForm.captionLabel": "ما الذي يعرضه الفيديو",
  "videoUploadForm.captionPlaceholder":
    "قل في جملة واحدة ما نراه وما يثبته…",
  "videoUploadForm.uploading": "جارٍ رفع الفيديو…",
  "videoUploadForm.publishing": "جارٍ النشر…",
  "videoUploadForm.submit": "انشر شهادتي",

  // ── DeepAnalysis ──────────────────────────────────────────────────────────
  "deepAnalysis.inProgress": "التحليل المعمّق بالذكاء الاصطناعي جارٍ...",

  // ── PartnershipAnalysisPanel ──────────────────────────────────────────────
  "partnershipAnalysisPanel.verdictFavorable": "عرض سليم في الظاهر",
  "partnershipAnalysisPanel.verdictPrudence": "يحتاج توضيحًا قبل الالتزام",
  "partnershipAnalysisPanel.verdictDeconseille": "مؤشرات احتيال — لا يُنصح به",
  "partnershipAnalysisPanel.signalDanger": "خطر",
  "partnershipAnalysisPanel.signalAttention": "انتباه",
  "partnershipAnalysisPanel.signalInfo": "معلومة",
  "partnershipAnalysisPanel.heading": "المساعد الذكي",
  "partnershipAnalysisPanel.engineDeep": "تحليل معمّق · Claude",
  "partnershipAnalysisPanel.engineQuick": "تحليل سريع",
  "partnershipAnalysisPanel.reliabilityLabel": "الموثوقية",
  "partnershipAnalysisPanel.reliabilitySub": "هل تبدو العلامة حقيقية؟",
  "partnershipAnalysisPanel.fairnessLabel": "الإنصاف",
  "partnershipAnalysisPanel.fairnessSub": "المقابل مقارنةً بالعمل المطلوب",
  "partnershipAnalysisPanel.signalsHeading": "مؤشرات مرصودة",
  "partnershipAnalysisPanel.questionsHeading": "أسئلة تطرحها قبل الالتزام",

  // ── PartnershipForm ───────────────────────────────────────────────────────
  "partnershipForm.brandNameLabel": "العلامة / الشركة *",
  "partnershipForm.brandNamePlaceholder": "مثال: Studio Nova",
  "partnershipForm.contactNameLabel": "اسمكم",
  "partnershipForm.contactNamePlaceholder": "مثال: سلمى بناني",
  "partnershipForm.emailLabel": "البريد الإلكتروني المهني *",
  "partnershipForm.emailPlaceholder": "name@your-brand.com",
  "partnershipForm.websiteLabel": "الموقع الإلكتروني",
  "partnershipForm.websitePlaceholder": "https://your-brand.com",
  "partnershipForm.compensationLabel": "المقابل المقترح *",
  "partnershipForm.compensationPlaceholder": "اختر…",
  "partnershipForm.budgetLabel": "الميزانية المقترحة ($)",
  "partnershipForm.budgetPlaceholder": "مثال: 300",
  "partnershipForm.budgetHint": "إن كان المقابل مالًا — كونوا شفافين.",
  "partnershipForm.messageLabel": "مقترحكم *",
  "partnershipForm.messagePlaceholder":
    "من أنتم، لماذا هذا المشروع، وما الذي تقترحونه بالتحديد (الجدول الزمني، التفاصيل...).",
  "partnershipForm.deliverablesLabel": "ما تنتظرونه من صاحب المشروع",
  "partnershipForm.deliverablesPlaceholder":
    "مثال: منشوران على Instagram + إشارة في حلقة، مع ملخص توجيهي.",
  "partnershipForm.pending": "جارٍ الإرسال…",
  "partnershipForm.submit": "إرسال الطلب",
  "partnershipForm.afterSend":
    "بعد الإرسال، ستتلقون رابطًا خاصًا لمتابعة رد صاحب المشروع.",

  // ── PartnershipResponseForm ───────────────────────────────────────────────
  "partnershipResponseForm.success":
    "أُرسل الرد — ستكتشفه العلامة عبر رابط المتابعة الخاص بها.",
  "partnershipResponseForm.replyLabel": "ردّك على العلامة",
  "partnershipResponseForm.replyHint":
    "صاغه المساعد الذكي مسبقًا — راجعه وخصّصه، ثم اختر قرارك.",
  "partnershipResponseForm.pending": "جارٍ الإرسال…",
  "partnershipResponseForm.accept": "قبول الشراكة",
  "partnershipResponseForm.decline": "رفض",
} satisfies Messages["calls"];
