import type { Messages } from "../types";

export const project = {
  // ——— CreateProjectForm ———
  "createProjectForm.answersCallLabel": "أنت تجيب على نداء",
  "createProjectForm.replaceTarget": "استبدال {target}",
  "createProjectForm.quotedWanted": "«{wanted}»",
  "createProjectForm.answersCallHelp":
    "هذا دفتر الشروط الذي كتبه صاحب النداء. سيُعلن مشروعك بديلًا فور إنشائه، وسيُخطر كل داعميه.",
  "createProjectForm.projectSection": "مشروعك",
  "createProjectForm.titleLabel": "العنوان",
  "createProjectForm.titlePlaceholder": "مثال: أسطوانة من 5 أغانٍ — «قمر أسود»",
  "createProjectForm.pitchLabel": "العرض الموجز (140 حرفًا كحد أقصى)",
  "createProjectForm.pitchPlaceholder": "جملة واحدة تجعلهم يرغبون في تمويلك.",
  "createProjectForm.descriptionLabel": "الوصف",
  "createProjectForm.descriptionPlaceholder":
    "احكِ: ما هو، لمن، لماذا أنت، وفيمَ سيُستخدم المال (50 حرفًا على الأقل).",
  "createProjectForm.categoryLabel": "الفئة",
  "createProjectForm.categoryPlaceholder": "اختر…",
  "createProjectForm.currencyLabel": "عملة المشروع",
  "createProjectForm.goalLabel": "الهدف ({currency})",
  "createProjectForm.durationLabel": "مدة الحملة (من {min} إلى {max} يومًا)",
  "createProjectForm.skillsLabel": "المهارات المطلوبة (اختياري)",
  "createProjectForm.skillsPlaceholder": "مثال: مونتاج، مكساج، تصوير — مفصولة بفواصل",
  "createProjectForm.skillsHelp": "نوجّه إلى مشروعك الأعضاء الذين يملكون هذه المهارات.",
  "createProjectForm.coverLabel": "صورة الغلاف (رابط URL، اختياري)",
  "createProjectForm.milestonesSection": "مراحل الإفراج عن الأموال",
  "createProjectForm.milestonesHelp":
    "كل مرحلة تفرج عن مبلغ بعملة {currency}، بناءً على إثبات يعتمده التصويت المرجَّح لمساهميك. يجب أن يساوي المجموع هدفك. بعد التمويل، أمامك {days} يومًا لإنجاز كل شيء واعتماده — وبعد ذلك يُسترد باقي الوديعة للمساهمين.",
  "createProjectForm.milestonesHelpStrong": "عمولة 0٪ من GeniGain",
  "createProjectForm.milestonesHelpAfterStrong":
    "— لا يُخصم من التحويلات سوى الرسوم البنكية.",
  "createProjectForm.milestoneNumber": "المرحلة {number}",
  "createProjectForm.removeMilestoneTitle": "حذف هذه المرحلة",
  "createProjectForm.milestoneTitleLabel": "العنوان",
  "createProjectForm.milestoneTitlePlaceholder": "مثال: اكتمال النموذج الأولي",
  "createProjectForm.milestoneAmountLabel": "المبلغ ({currency})",
  "createProjectForm.milestoneDeliverableLabel": "ما الذي ستسلّمه",
  "createProjectForm.milestoneDeliverablePlaceholder":
    "ما سيتمكن المساهمون من التحقق منه في هذه المرحلة.",
  "createProjectForm.addMilestone": "إضافة مرحلة",
  "createProjectForm.submitPending": "جارٍ الإنشاء…",
  "createProjectForm.submit": "أطلق مشروعي",

  // ——— EditProjectForm ———
  "editProjectForm.titleLabel": "العنوان",
  "editProjectForm.titleHelp":
    "عنوان الصفحة لا يتغيّر: الروابط التي سبق أن شاركتها تبقى صالحة.",
  "editProjectForm.pitchLabel": "العرض الموجز (140 حرفًا كحد أقصى)",
  "editProjectForm.descriptionLabel": "الوصف",
  "editProjectForm.categoryLabel": "الفئة",
  "editProjectForm.coverLabel": "صورة الغلاف (رابط URL، اختياري)",
  "editProjectForm.skillsLabel": "المهارات المطلوبة (اختياري)",
  "editProjectForm.skillsPlaceholder": "مثال: مونتاج، مكساج، تصوير — مفصولة بفواصل",
  "editProjectForm.submitPending": "جارٍ الحفظ…",
  "editProjectForm.submit": "حفظ التعديلات",

  // ——— ContributeForm ———
  "contributeForm.freeAmountLabel": "مبلغ حر ({currency})",
  "contributeForm.anonymousStrong": "المساهمة باسم مجهول",
  "contributeForm.anonymousRest":
    "— لن يظهر اسمك لا على المشروع، ولا لصاحبه، ولا في سجلّ النشاط.",
  "contributeForm.redirecting": "إعادة التوجيه إلى الدفع…",
  "contributeForm.submit": "ساهم بمبلغ {amount}",
  "contributeForm.feeStrong": "عمولة 0٪ من GeniGain",
  "contributeForm.feeRest":
    "— لا تُطبَّق سوى رسوم البطاقة (تحددها Stripe، ولا تراها GeniGain ولا تلمسها).",
  "contributeForm.escrowIntro":
    "دفع مؤمَّن عبر Stripe. الأموال في وديعة، تُفرج مرحلة بمرحلة بتصويت المساهمين. وإن لم تكتمل الحملة، تُسترد أموالك",
  "contributeForm.escrowStrong": "صافيةً من رسوم البطاقة",
  "contributeForm.escrowAfterStrong":
    ": لا تعيدها Stripe، ولا تحتفظ GeniGain بأي منها.",
  "contributeForm.feesLink": "تفاصيل الرسوم",

  // ——— MilestoneTimeline ———
  "milestoneTimeline.statusLocked": "مقفلة",
  "milestoneTimeline.statusAwaitingProof": "بانتظار الإثبات",
  "milestoneTimeline.statusUnderReview": "التصويت جارٍ",
  "milestoneTimeline.statusReleased": "أُفرج عن الأموال",
  "milestoneTimeline.proofCounter": "الإثبات {index}/{max}",
  "milestoneTimeline.proofRejected": "مرفوض",
  "milestoneTimeline.proofApproved": "معتمد",
  "milestoneTimeline.proofPending": "التصويت جارٍ",
  "milestoneTimeline.proofImageAlt": "إثبات تقدّم",
  "milestoneTimeline.majorityAt": "الأغلبية عند {amount}",
  "milestoneTimeline.alreadyVoted": "أدليت بصوتك",
  "milestoneTimeline.approve": "اعتماد",
  "milestoneTimeline.reject": "رفض",
  "milestoneTimeline.awaitingOwnerProof":
    "بانتظار إثبات التقدّم من صاحب المشروع...",

  // ——— ProofForm ———
  "proofForm.heading": "قدّم إثبات تقدّمك",
  "proofForm.lastAttempt": "المحاولة الأخيرة — كن مقنعًا!",
  "proofForm.contentLabel": "ما الذي أنجزته",
  "proofForm.contentPlaceholder":
    "صف بدقة ما أُنجز في هذه المرحلة (20 حرفًا على الأقل)…",
  "proofForm.linksLabel": "روابط (رابط في كل سطر، اختياري)",
  "proofForm.linksPlaceholder": "https://demo.example.com\nhttps://github.com/…",
  "proofForm.imagesLabel": "صور (رابط URL في كل سطر، اختياري)",
  "proofForm.imagesPlaceholder": "https://.../photo-atelier.jpg",
  "proofForm.submitPending": "جارٍ الإرسال…",
  "proofForm.submit": "أرسل الإثبات إلى التصويت",

  // ——— CampaignCockpit ———
  "campaignCockpit.heading": "القيادة — مرئية لك وحدك",
  "campaignCockpit.dailyCollection": "التحصيل اليومي",
  "campaignCockpit.emptyState":
    "لا مساهمات بعد — شارك رابطك، والعدّاد يبدأ من هنا.",
  "campaignCockpit.sparklineAria": {
    zero: "التحصيل اليومي منذ الانطلاق: {amount} في {count} يوم.",
    one: "التحصيل اليومي منذ الانطلاق: {amount} في يوم واحد.",
    two: "التحصيل اليومي منذ الانطلاق: {amount} في يومين.",
    few: "التحصيل اليومي منذ الانطلاق: {amount} في {count} أيام.",
    many: "التحصيل اليومي منذ الانطلاق: {amount} في {count} يومًا.",
    other: "التحصيل اليومي منذ الانطلاق: {amount} في {count} يوم.",
  },
  "campaignCockpit.todayPoint": "{amount} اليوم",
  "campaignCockpit.paceLabel": "الوتيرة المطلوبة للوصول",
  "campaignCockpit.perDay": "{amount}/يوم",
  "campaignCockpit.goalReached": "تم بلوغ الهدف",
  "campaignCockpit.milestonesValidated": "المراحل المعتمدة",
  "campaignCockpit.contributorsLabel": "المساهمون",
  "campaignCockpit.followersLabel": "المتابِعون",
  "campaignCockpit.convertedShare": "منهم {percent}٪ ساهموا",
  "campaignCockpit.realizeBefore": "الإنجاز قبل",
  "campaignCockpit.daysToDeadline": "بقي {days} يوم",

  // ——— CancelProjectButton ———
  // UNE phrase, pas six fragments : l'ordre des mots appartient à chaque
  // langue (l'allemand et l'arabe ne suivent pas la syntaxe française).
  "cancelProjectButton.confirmBody":
    "بتأكيدك، يتحول المشروع نهائيًا إلى «لم يكتمل» ويعود ما يصل إلى {amount} نحو {contributors} (صافيًا من رسوم البطاقة، خلال بضعة أيام حسب بنوكهم). لا رجعة بعد ذلك.",
  "cancelProjectButton.contributorCount": {
    zero: "{count} مساهم",
    one: "مساهم واحد",
    two: "مساهمَين",
    few: "{count} مساهمين",
    many: "{count} مساهمًا",
    other: "{count} مساهم",
  },
  "cancelProjectButton.contributorsGeneric": "المساهمين",
  "cancelProjectButton.confirmPending": "جارٍ الإيقاف…",
  "cancelProjectButton.confirmSubmit": "نعم، أوقِف وأعد الأموال",
  "cancelProjectButton.cancel": "إلغاء",
  "cancelProjectButton.arm": "إيقاف المشروع",

  // ——— DeleteProjectButton ———
  "deleteProjectButton.confirmPending": "جارٍ السحب…",
  "deleteProjectButton.confirmSubmit": "نعم، اسحبه نهائيًا",
  "deleteProjectButton.cancel": "إلغاء",
  "deleteProjectButton.arm": "سحب المشروع",

  // ——— CommentForm ———
  "commentForm.placeholder": "شجّع، اطرح سؤالًا، اعرض يد عون…",
  "commentForm.ariaLabel": "تعليقك",
  "commentForm.submitPending": "جارٍ الإرسال…",
  "commentForm.submit": "علّق",

  // ——— ProjectUpdateForm ———
  "projectUpdateForm.titleLabel": "عنوان المستجدّ",
  "projectUpdateForm.titlePlaceholder": "مثال: وصلت المعدّات!",
  "projectUpdateForm.bodyLabel": "ما الجديد؟",
  "projectUpdateForm.bodyPlaceholder":
    "تقدّم، كواليس، كلمات شكر... سيُخطر مساهموك.",
  "projectUpdateForm.success": "نُشر المستجدّ — أُخطر المساهمون.",
  "projectUpdateForm.submitPending": "جارٍ النشر…",
  "projectUpdateForm.submit": "انشر المستجدّ",

  // ——— FollowButton ———
  "followButton.unfollowTitle": "إلغاء متابعة هذا المشروع",
  "followButton.followTitle": "متابعة هذا المشروع",
  "followButton.following": "مُتابَع",
  "followButton.follow": "متابعة",

  // ——— ProjectCard ———
  "projectCard.replaces": "يحل محل {targets}",
  "projectCard.contributions": {
    zero: "لا مساهمات",
    one: "مساهمة واحدة",
    two: "مساهمتان",
    few: "{count} مساهمات",
    many: "{count} مساهمةً",
    other: "{count} مساهمة",
  },
  "projectCard.daysLeft": {
    zero: "لم يتبقَّ أي يوم",
    one: "يوم واحد متبقٍّ",
    two: "يومان متبقيان",
    few: "{count} أيام متبقية",
    many: "{count} يومًا متبقيًا",
    other: "{count} يوم متبقٍّ",
  },
} satisfies Messages["project"];
