import type { Messages } from "../types";

export const memberPages = {
  // <title> des pages
  "meta.dashboardTitle": "لوحة التحكم",
  "meta.notificationsTitle": "الإشعارات",
  "meta.chatTitle": "الدردشة",
  "meta.groupsTitle": "المجموعات",
  "meta.groupTitle": "مجموعة",
  "meta.groupMembersTitle": "أعضاء المجموعة",
  "meta.profileNotFound": "الملف الشخصي غير موجود",
  "meta.profileFallback": "ملف شخصي",
  "meta.profileDescription": "{name} على GeniGain: السمعة والمشاريع والمهارات.",
  "meta.profileDescriptionCity":
    "{name} على GeniGain — {city}: السمعة والمشاريع والمهارات.",
  "meta.partnershipsTitle": "الشراكات",
  "meta.partnershipRequestTitle": "طلب شراكة",
  "meta.trackingTitle": "متابعة طلبكم",

  // dashboard/page.tsx
  "dashboard.connectDoneLive":
    "أُرسل الإعداد إلى Stripe — تُفعَّل تحويلاتك فور الاعتماد.",
  "dashboard.connectDoneTest":
    "أُرسل الإعداد إلى Stripe — تُفعَّل تحويلاتك فور الاعتماد (غالبًا فوريًا في وضع الاختبار).",
  "dashboard.connectRefresh":
    "انتهت جلسة Stripe — أعد إطلاق إعداد التحويلات متى شئت.",
  "dashboard.greeting": "أهلًا {name}",
  "dashboard.tagline": "مقرّك الشخصي · الأنظمة تعمل",
  "dashboard.editProfile": "تعديل ملفي الشخصي",
  "dashboard.adminCockpit": "قمرة الإشراف",
  "dashboard.reportsToHandle": {
    zero: "لا بلاغات للمعالجة",
    one: "بلاغ واحد للمعالجة",
    two: "بلاغان للمعالجة",
    few: "{count} بلاغات للمعالجة",
    many: "{count} بلاغًا للمعالجة",
    other: "{count} بلاغ للمعالجة",
  },
  "dashboard.nothingToModerate": "لا شيء للإشراف عليه",
  "dashboard.failedTitle": "مشروع لم يكتمل — وماذا الآن؟",
  "dashboard.failedBody":
    "الفشل ليس خروجًا. اكتشف فرصًا أخرى وانطلق أقوى مما كنت.",
  "dashboard.seeOpportunities": "عرض الفرص ←",
  "dashboard.statReputation": "السمعة",
  "dashboard.nextLevelAt": "{label} عند {target}",
  "dashboard.maxLevel": "بلغت أعلى مستوى",
  "dashboard.statTowardProject": "نحو مشروعك",
  "dashboard.gateExempt": "مؤسِّس — تنشر دون عتبة",
  "dashboard.gateReached": "فُتحت العتبة — يمكنك النشر",
  "dashboard.gateRemaining": "{amount} قبل أن تتمكن من النشر",
  "dashboard.statSupports": "المساندات",
  "dashboard.communityPillar": "ركن من أركان المجتمع",
  "dashboard.supportGoal": "الهدف: دعم 10 مشاريع",
  "dashboard.trajectoryTitle": "مسارك",
  "dashboard.pendingPartnerships": {
    zero: "لا طلبات شراكة تنتظر ردّك —",
    one: "طلب شراكة واحد ينتظر ردّك —",
    two: "طلبا شراكة ينتظران ردّك —",
    few: "{count} طلبات شراكة تنتظر ردّك —",
    many: "{count} طلبًا للشراكة تنتظر ردّك —",
    other: "{count} طلب شراكة ينتظر ردّك —",
  },
  "dashboard.seeWithCopilot": "راجعها مع المساعد الذكي ←",
  "dashboard.myProjects": "مشاريعي",
  "dashboard.partnershipsLink": "الشراكات",
  "dashboard.partnershipsLinkCount": "الشراكات ({count})",
  "dashboard.launchProject": "أطلق مشروعًا",
  "dashboard.noProjects":
    "لا مشروع بعد. ساهم في مشروع لتفتح إنشاء مشروعك الخاص.",
  "dashboard.myCalls": "نداءاتي",
  "dashboard.publishCall": "انشر نداءً",
  "dashboard.replaceTarget": "استبدال {target}",
  "dashboard.callVoices": {
    zero: "لا أصوات",
    one: "صوت واحد",
    two: "صوتان",
    few: "{count} أصوات",
    many: "{count} صوتًا",
    other: "{count} صوت",
  },
  "dashboard.callAnswerers": {
    zero: "لا بدائل",
    one: "بديل واحد",
    two: "بديلان",
    few: "{count} بدائل",
    many: "{count} بديلًا",
    other: "{count} بديل",
  },
  "dashboard.callNoAnswerers": "لا بديل حتى الآن",
  "dashboard.followedProjects": "المشاريع المتابَعة",
  "dashboard.myContributions": "مساهماتي",
  "dashboard.noContributions": "لا مساهمات حتى الآن.",
  "dashboard.findProject": "جِد مشروعًا تدعمه ←",
  "dashboard.refunded": "مستردّة",
  "dashboard.myProfile": "ملفي الشخصي",
  "dashboard.mySkills": "مهاراتي",
  "dashboard.myPayouts": "تحويلاتي",
  "dashboard.security": "الأمان",
  "dashboard.myData": "بياناتي",
  "dashboard.myDataBody":
    "كل ما ائتمنت GeniGain عليه (الملف الشخصي، المشاريع، المساهمات، الأصوات، الرسائل المرسلة…) في ملف JSON واحد — حق نقل البيانات.",
  "dashboard.downloadMyData": "تنزيل بياناتي",

  // notifications/page.tsx
  "notifications.title": "الإشعارات",
  "notifications.newSince": {
    zero: "لا جديد منذ زيارتك الأخيرة",
    one: "إشعار جديد واحد منذ زيارتك الأخيرة",
    two: "إشعاران جديدان منذ زيارتك الأخيرة",
    few: "{count} إشعارات جديدة منذ زيارتك الأخيرة",
    many: "{count} إشعارًا جديدًا منذ زيارتك الأخيرة",
    other: "{count} إشعار جديد منذ زيارتك الأخيرة",
  },
  "notifications.allCaughtUp": "كل شيء محدَّث",
  "notifications.empty":
    "لا شيء حتى الآن. ستصلك هنا المساهمات الواردة، والإثباتات التي تنتظر تصويتك، والمراحل المفتوحة، والرسائل والتعليقات والمستجدات وطلبات الشراكة.",

  // chat/page.tsx + chat/[userId]/page.tsx — en-tête commun
  "chatHeader.title": "الدردشة",
  "chatHeader.tagline": "تعاون بين أصحاب المشاريع · تعاونات · أيادي عون",

  // chat/page.tsx
  "chatIndex.pickConversation":
    "اختر محادثة — أو انضم إلى مجموعة من فئتك لتتحدث مع الجميع.",
  "chatIndex.exploreGroups": "استكشاف المجموعات",

  // chat/[userId]/page.tsx
  "chatThread.allConversations": "كل محادثاتي",
  "chatThread.olderMessages": "رسائل أقدم",
  "chatThread.startConversation":
    "ابدأ المحادثة — اعرض يد عون، أو تعاونًا، أو تبادل مهارات.",
  "chatThread.backToLatest": "العودة إلى أحدث الرسائل",

  // chat/groupes/page.tsx
  "groupsDir.title": "المجموعات",
  "groupsDir.tagline": "غرفة لكل رغبة · مرتّبة في فئات المشاريع",
  "groupsDir.searchPlaceholder": "ابحث عن غرفة (اسم، موضوع…)",
  "groupsDir.searchLabel": "البحث عن غرفة",
  "groupsDir.search": "بحث",
  "groupsDir.categoriesLabel": "فئات المجموعات",
  "groupsDir.allCategories": "كل الفئات",
  "groupsDir.noRoomForQuery": "لا غرفة تتحدث عن «{query}».",
  "groupsDir.noRoomForQueryInCategory": "لا غرفة تتحدث عن «{query}» في {category}.",
  "groupsDir.noGroupInCategory": "لا مجموعة في {category} حتى الآن.",
  "groupsDir.noGroup": "لا مجموعات حتى الآن.",
  "groupsDir.tryAnotherWord": "جرّب كلمة أخرى، أو افتح الغرفة الناقصة.",
  "groupsDir.openFirst": "افتح الأولى — فهي غالبًا ما تجمع الناس.",
  "groupsDir.officialRoomCategory": "غرفة استقبال · {category}",
  "groupsDir.openThread": "افتح المحادثة",

  // chat/groupes/[slug]/page.tsx
  "groupThread.allGroups": "كل المجموعات",
  "groupThread.membersCount": {
    zero: "لا أعضاء",
    one: "عضو واحد",
    two: "عضوان",
    few: "{count} أعضاء",
    many: "{count} عضوًا",
    other: "{count} عضو",
  },
  "groupThread.meta": "{category} · {members}",
  "groupThread.metaOfficial": "غرفة استقبال · {category} · {members}",
  "groupThread.animatedBy": "بإدارة",
  "groupThread.openedOn": "· فُتحت في {date}",
  "groupThread.seeMembers": "عرض الأعضاء ({count})",
  "groupThread.membersAria": {
    zero: "لا أعضاء",
    one: "عضو واحد",
    two: "عضوان",
    few: "{count} أعضاء",
    many: "{count} عضوًا",
    other: "{count} عضو",
  },
  "groupThread.olderMessages": "رسائل أقدم",
  "groupThread.backToLatest": "العودة إلى أحدث الرسائل",
  "groupThread.membersOnly": "المحادثة مخصّصة للأعضاء",
  "groupThread.joinToRead":
    "انضم إلى المجموعة لتقرأ النقاشات ولتكتب — ويمكنك المغادرة متى شئت.",

  // chat/groupes/[slug]/membres/page.tsx
  "groupMembers.backToThread": "العودة إلى المحادثة",
  "groupMembers.membersCount": {
    zero: "لا أعضاء",
    one: "عضو واحد",
    two: "عضوان",
    few: "{count} أعضاء",
    many: "{count} عضوًا",
    other: "{count} عضو",
  },
  "groupMembers.bansCount": {
    zero: "· لا مستبعَدين",
    one: "· مستبعَد واحد",
    two: "· مستبعَدان",
    few: "· {count} مستبعَدين",
    many: "· {count} مستبعَدًا",
    other: "· {count} مستبعَد",
  },
  "groupMembers.owner": "صاحب المجموعة",
  "groupMembers.manager": "مُدير",
  "groupMembers.since": "منذ {date}",
  "groupMembers.thisMember": "هذا العضو",
  "groupMembers.exclusions": "الاستبعادات",
  "groupMembers.noBans":
    "لم يُستبعد أحد من هذه الغرفة. الاستبعاد يُخرج الشخص ويغلق الباب أمامه؛ أما رسائله فتبقى.",
  "groupMembers.bannedOn": "استُبعد في {date}",

  // u/[id]/page.tsx
  "profile.seeOnGlobe": "شاهده على كرة المجتمع",
  "profile.memberSince": "عضو منذ {date}",
  "profile.editProfile": "تعديل ملفي الشخصي",
  "profile.sendMessage": "إرسال رسالة",
  "profile.reportProfile": "الإبلاغ عن هذا الملف",
  "profile.projectsLaunched": "مشاريع أُطلقت",
  "profile.contributions": "مساهمات",
  "profile.investedInCommunity": "مستثمَر في المجتمع",
  "profile.votesOnProofs": "أصوات على الإثباتات",
  "profile.theirProjects": "مشاريعه",
  "profile.recentActivity": "النشاط الأخير",
  "profile.repPoints": "{delta} سمعة",

  // partenariats — commun aux trois écrans
  "partnership.budgetUsd": "{amount} $",

  // partenariats/page.tsx
  "partnershipsInbox.title": "الشراكات",
  "partnershipsInbox.meta": {
    zero: "لا طلبات واردة · {pending} قيد الانتظار · مساعد ذكي قبل كل رد",
    one: "طلب واحد وارد · {pending} قيد الانتظار · مساعد ذكي قبل كل رد",
    two: "طلبان واردان · {pending} قيد الانتظار · مساعد ذكي قبل كل رد",
    few: "{count} طلبات واردة · {pending} قيد الانتظار · مساعد ذكي قبل كل رد",
    many: "{count} طلبًا واردًا · {pending} قيد الانتظار · مساعد ذكي قبل كل رد",
    other: "{count} طلب وارد · {pending} قيد الانتظار · مساعد ذكي قبل كل رد",
  },
  "partnershipsInbox.emptyBody":
    "لا طلبات حتى الآن. يمكن للعلامات أن تقترح عليك شراكة من صفحة كل مشروع من مشاريعك («شراكة علامة»).",
  "partnershipsInbox.emptyHint":
    "حين يصل طلب، يساعدك المساعد الذكي على التأكد من أنه موثوق ومنصف قبل أن تردّ.",

  // partenariats/[id]/page.tsx
  "partnershipDetail.allRequests": "كل الطلبات",
  "partnershipDetail.forQuoteOpen": "لأجل «",
  "partnershipDetail.forQuoteClose": "» · وصل في {date}",
  "partnershipDetail.noWebsite": "لا موقع إلكتروني مقدَّم",
  "partnershipDetail.contact": "جهة الاتصال",
  "partnershipDetail.notSpecified": "غير محدَّد",
  "partnershipDetail.compensation": "المقابل",
  "partnershipDetail.proposal": "المقترح",
  "partnershipDetail.deliverables": "ما تنتظره العلامة",
  "partnershipDetail.replyToBrand": "الرد على العلامة",
  "partnershipDetail.yourReply": "ردّك ({status})",
  "partnershipDetail.yourReplyDated": "ردّك ({status} في {date})",

  // partenariats/suivi/[token]/page.tsx — page publique marque
  "tracking.sentBanner":
    "أُرسل الطلب! احتفظوا برابط هذه الصفحة: هنا سيظهر الرد.",
  "tracking.title": "طلب الشراكة الخاص بكم",
  "tracking.pairing": "× «",
  "tracking.sentOn": "» · أُرسل في {date}",
  "tracking.compensationProposed": "المقابل المقترح: {compensation}",
  "tracking.pendingTitle": "قيد الدراسة",
  "tracking.pendingBody":
    "{name} يدرس مقترحكم. سيظهر الرد على هذه الصفحة — احفظوها في المفضلة.",
  "tracking.accepted": "شراكة مقبولة",
  "tracking.declined": "مقترح مرفوض",
  "tracking.footerNote":
    "تمثّلون علامة أخرى أو ترغبون في استكمال طلبكم؟ أودِعوا مقترحًا جديدًا من صفحة المشروع.",
} satisfies Messages["memberPages"];
