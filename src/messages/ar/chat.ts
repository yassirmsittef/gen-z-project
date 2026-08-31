import type { Messages } from "../types";

export const chat = {
  // chat-sidebar.tsx
  "chatSidebar.tabPrivate": "خاص",
  "chatSidebar.tabGroups": "مجموعات",
  "chatSidebar.tablistLabel": "المحادثات",
  "chatSidebar.unreadGroupsDot": {
    zero: "لا مجموعات فيها رسائل غير مقروءة",
    one: "مجموعة واحدة فيها رسائل غير مقروءة",
    two: "مجموعتان فيهما رسائل غير مقروءة",
    few: "{count} مجموعات فيها رسائل غير مقروءة",
    many: "{count} مجموعةً فيها رسائل غير مقروءة",
    other: "{count} مجموعة فيها رسائل غير مقروءة",
  },
  "chatSidebar.emptyPrivate":
    "لا محادثات خاصة. راسل صاحب مشروع من صفحة مشروعه أو ملفه الشخصي — أو مرّ عبر مجموعة من فئتك.",
  "chatSidebar.youPrefix": "أنت: ",
  "chatSidebar.emptyGroups":
    "لم تنضم إلى أي مجموعة بعد. لكل فئة مجموعاتها — افتح مجموعتك أو ادخل غرفة قائمة.",
  "chatSidebar.unreadDot": "رسائل غير مقروءة",
  "chatSidebar.you": "أنت",
  "chatSidebar.someMember": "أحد الأعضاء",
  "chatSidebar.lastMessageLine": "{name}: {body}",
  "chatSidebar.groupMeta": {
    zero: "{category} · لا أعضاء",
    one: "{category} · عضو واحد",
    two: "{category} · عضوان",
    few: "{category} · {count} أعضاء",
    many: "{category} · {count} عضوًا",
    other: "{category} · {count} عضو",
  },
  "chatSidebar.exploreGroups": "استكشاف المجموعات وإنشاؤها",

  // message-form.tsx
  "messageForm.bodyLabel": "رسالتك",
  "messageForm.bodyPlaceholder": "اكتب رسالتك… (تعاون، مساعدة، أسئلة)",
  "messageForm.send": "إرسال",

  // group-membership.tsx — JoinGroupButton
  "joinGroupButton.join": "انضمام",
  "joinGroupButton.full": "المجموعة مكتملة",
  "joinGroupButton.pending": "نجهّز لك مكانك…",

  // group-membership.tsx — LeaveGroupButton
  "leaveGroupButton.confirm": "نعم، أغادر",
  "leaveGroupButton.pending": "جارٍ المغادرة…",
  "leaveGroupButton.cancel": "إلغاء",
  "leaveGroupButton.ownerHandover": "تنتقل الإدارة إلى أقدم الأعضاء.",
  "leaveGroupButton.leave": "مغادرة",

  // group-membership.tsx — MuteGroupButton
  "muteGroupButton.unmuteTitle": "استئناف إشعارات هذه الغرفة",
  "muteGroupButton.muteTitle": "إيقاف إشعارات هذه الغرفة",
  "muteGroupButton.muted": "مكتومة",
  "muteGroupButton.mute": "كتم",

  // group-membership.tsx — DissolveGroupButton
  "dissolveGroupButton.confirm": "نعم، حلّ المجموعة",
  "dissolveGroupButton.pending": "جارٍ الحلّ…",
  "dissolveGroupButton.cancel": "إلغاء",
  "dissolveGroupButton.warning": "تختفي المحادثة ورسائلها.",
  "dissolveGroupButton.dissolve": "حلّ المجموعة",

  // group-message-actions.tsx
  "groupMessageActions.confirm": "تأكيد",
  "groupMessageActions.pending": "جارٍ السحب…",
  "groupMessageActions.cancel": "إلغاء",
  "groupMessageActions.remove": "سحب هذه الرسالة",

  // group-message-form.tsx
  "groupMessageForm.bodyLabel": "رسالتك في {group}",
  "groupMessageForm.bodyPlaceholder": "اكتب في {group}…",
  "groupMessageForm.send": "إرسال",

  // group-moderation.tsx — MemberActions
  "memberActions.demote": "سحب الإدارة",
  "memberActions.promote": "منح الإدارة",
  "memberActions.excludeConfirm": "نعم، استبعد {name}",
  "memberActions.excludePending": "جارٍ الاستبعاد…",
  "memberActions.cancel": "إلغاء",
  "memberActions.exclude": "استبعاد",

  // group-moderation.tsx — ReadmitButton
  "readmitButton.pending": "جارٍ إعادة القبول…",
  "readmitButton.readmit": "إعادة القبول",

  // create-group-form.tsx
  "createGroupForm.openWithCategory": "إنشاء مجموعة {category}",
  "createGroupForm.open": "إنشاء مجموعة",
  "createGroupForm.heading": "افتح مجموعة",
  "createGroupForm.intro":
    "غرفة عامة، مصنّفة في فئتها. أنت تديرها، والجميع يمكنه الانضمام إليها.",
  "createGroupForm.close": "إغلاق",
  "createGroupForm.nameLabel": "اسم المجموعة",
  "createGroupForm.namePlaceholder": "مبرمجو آخر الليل",
  "createGroupForm.categoryLabel": "الفئة",
  "createGroupForm.categoryPlaceholder": "اختر…",
  "createGroupForm.purposeLabel": "ما الغاية من هذه المجموعة؟",
  "createGroupForm.purposePlaceholder":
    "نتعاون على إطلاق الألعاب المستقلة: ملاحظات، تجارب لعب، معارف.",
  "createGroupForm.pending": "جارٍ الإنشاء…",
  "createGroupForm.submit": "أنشئ المجموعة",
  "createGroupForm.firstMember": "تصبح أول عضو فيها.",

  // category-room-card.tsx
  "categoryRoomCard.roomLabel": "غرفة {category}",
  "categoryRoomCard.memberCount": {
    zero: "لا أعضاء",
    one: "عضو واحد",
    two: "عضوان",
    few: "{count} أعضاء",
    many: "{count} عضوًا",
    other: "{count} عضو",
  },
  "categoryRoomCard.openThread": "افتح المحادثة",
  "categoryRoomCard.joinRoom": "انضم إلى غرفة {category}",
  "categoryRoomCard.emptyBody":
    "لا غرفة لفئة {category} حتى الآن. افتح الأولى — فهي غالبًا ما تجمع أصحاب المشاريع من الفئة نفسها.",
  "categoryRoomCard.openRoom": "افتح غرفة {category}",

  // language-rooms-banner.tsx
  "languageRoomsBanner.title": "غرف اللغات",
  "languageRoomsBanner.missing": {
    zero: "لا غرف استقبال متبقية للفتح.",
    one: "غرفة استقبال واحدة ينبغي فتحها — باب دخول للأعضاء الذين لا يتحدثون الفرنسية.",
    two: "غرفتا استقبال ينبغي فتحهما — باب دخول للأعضاء الذين لا يتحدثون الفرنسية.",
    few: "{count} غرف استقبال ينبغي فتحها — باب دخول للأعضاء الذين لا يتحدثون الفرنسية.",
    many: "{count} غرفة استقبال ينبغي فتحها — باب دخول للأعضاء الذين لا يتحدثون الفرنسية.",
    other: "{count} غرفة استقبال ينبغي فتحها — باب دخول للأعضاء الذين لا يتحدثون الفرنسية.",
  },
  "languageRoomsBanner.pending": "جارٍ الفتح…",
  "languageRoomsBanner.open": "افتح الغرف",
} satisfies Messages["chat"];
