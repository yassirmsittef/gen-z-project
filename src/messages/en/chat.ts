import type { Messages } from "../types";

/** The chat: conversation column, private and group threads, rooms, moderation. */
export const chat = {
  // chat-sidebar.tsx
  "chatSidebar.tabPrivate": "Private",
  "chatSidebar.tabGroups": "Groups",
  "chatSidebar.tablistLabel": "Conversations",
  "chatSidebar.unreadGroupsDot": {
    one: "{count} group with unread messages",
    other: "{count} groups with unread messages",
  },
  "chatSidebar.emptyPrivate":
    "No private conversations. Message a project owner from their project page or profile — or go through a group in your category.",
  "chatSidebar.youPrefix": "You: ",
  "chatSidebar.emptyGroups":
    "You haven't joined any group yet. Every category has its own — open yours or step into an existing room.",
  "chatSidebar.unreadDot": "Unread messages",
  "chatSidebar.you": "You",
  "chatSidebar.someMember": "A member",
  "chatSidebar.lastMessageLine": "{name}: {body}",
  "chatSidebar.groupMeta": {
    one: "{category} · {count} member",
    other: "{category} · {count} members",
  },
  "chatSidebar.exploreGroups": "Explore and create groups",

  // message-form.tsx
  "messageForm.bodyLabel": "Your message",
  "messageForm.bodyPlaceholder": "Write your message… (mutual help, collabs, questions)",
  "messageForm.send": "Send",

  // group-membership.tsx — JoinGroupButton
  "joinGroupButton.join": "Join",
  "joinGroupButton.full": "Group full",
  "joinGroupButton.pending": "Getting you settled…",

  // group-membership.tsx — LeaveGroupButton
  "leaveGroupButton.confirm": "Yes, leave",
  "leaveGroupButton.pending": "Leaving…",
  "leaveGroupButton.cancel": "Cancel",
  "leaveGroupButton.ownerHandover": "Hosting passes to the longest-standing member.",
  "leaveGroupButton.leave": "Leave",

  // group-membership.tsx — MuteGroupButton
  "muteGroupButton.unmuteTitle": "Get notifications from this room again",
  "muteGroupButton.muteTitle": "Stop being notified about this room",
  "muteGroupButton.muted": "Muted",
  "muteGroupButton.mute": "Mute",

  // group-membership.tsx — DissolveGroupButton
  "dissolveGroupButton.confirm": "Yes, dissolve the group",
  "dissolveGroupButton.pending": "Dissolving…",
  "dissolveGroupButton.cancel": "Cancel",
  "dissolveGroupButton.warning": "The thread and its messages disappear.",
  "dissolveGroupButton.dissolve": "Dissolve",

  // group-message-actions.tsx
  "groupMessageActions.confirm": "Confirm",
  "groupMessageActions.pending": "Removing…",
  "groupMessageActions.cancel": "Cancel",
  "groupMessageActions.remove": "Remove this message",

  // group-message-form.tsx
  "groupMessageForm.bodyLabel": "Your message in {group}",
  "groupMessageForm.bodyPlaceholder": "Write in {group}…",
  "groupMessageForm.send": "Send",

  // group-moderation.tsx — MemberActions
  "memberActions.demote": "Remove as manager",
  "memberActions.promote": "Make a manager",
  "memberActions.excludeConfirm": "Yes, ban {name}",
  "memberActions.excludePending": "Banning…",
  "memberActions.cancel": "Cancel",
  "memberActions.exclude": "Ban",

  // group-moderation.tsx — ReadmitButton
  "readmitButton.pending": "Readmitting…",
  "readmitButton.readmit": "Readmit",

  // create-group-form.tsx
  "createGroupForm.openWithCategory": "Create a {category} group",
  "createGroupForm.open": "Create a group",
  "createGroupForm.heading": "Open a group",
  "createGroupForm.intro":
    "A public room, filed under its category. You host it, anyone can join.",
  "createGroupForm.close": "Close",
  "createGroupForm.nameLabel": "Group name",
  "createGroupForm.namePlaceholder": "The weekend devs",
  "createGroupForm.categoryLabel": "Category",
  "createGroupForm.categoryPlaceholder": "Pick…",
  "createGroupForm.purposeLabel": "What is this group for?",
  "createGroupForm.purposePlaceholder":
    "We help each other launch indie games: feedback, playtests, contacts.",
  "createGroupForm.pending": "Creating…",
  "createGroupForm.submit": "Create the group",
  "createGroupForm.firstMember": "You become its first member.",

  // category-room-card.tsx
  "categoryRoomCard.roomLabel": "The {category} room",
  "categoryRoomCard.memberCount": {
    one: "{count} member",
    other: "{count} members",
  },
  "categoryRoomCard.openThread": "Open the thread",
  "categoryRoomCard.joinRoom": "Join the {category} room",
  "categoryRoomCard.emptyBody":
    "No {category} room yet. Open the first one — it's often the place that brings a category's project owners together.",
  "categoryRoomCard.openRoom": "Open the {category} room",

  // language-rooms-banner.tsx
  "languageRoomsBanner.title": "Language rooms",
  "languageRoomsBanner.missing": {
    one: "{count} welcome room to open — a way in for members who don't speak French.",
    other:
      "{count} welcome rooms to open — a way in for members who don't speak French.",
  },
  "languageRoomsBanner.pending": "Opening…",
  "languageRoomsBanner.open": "Open the rooms",
} satisfies Messages["chat"];
