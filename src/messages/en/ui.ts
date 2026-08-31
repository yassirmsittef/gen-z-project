import type { Messages } from "../types";

/**
 * Namespace `ui` — cross-cutting components (batch 6): global ⌘K search,
 * sharing, reporting, notification bell, community globe,
 * legal navigation, reputation badge.
 */
export const ui = {
  // Global search (⌘K)
  "commandPalette.triggerTitle": "Search (⌘K)",
  "commandPalette.triggerLabel": "Search projects, rooms and members",
  "commandPalette.dialogLabel": "Global search",
  "commandPalette.inputPlaceholder": "Search for a project, a brand, a room, a member…",
  "commandPalette.inputLabel": "Search for a project, a room or a member",
  "commandPalette.sectionProjects": "Projects",
  "commandPalette.sectionCalls": "Calls",
  "commandPalette.sectionRooms": "Rooms",
  "commandPalette.sectionMembers": "Members",
  "commandPalette.replaceTarget": "Replace {target}",
  "commandPalette.callVotes": {
    one: "{count} voice",
    other: "{count} voices",
  },
  "commandPalette.callAnswerers": {
    one: "{count} replacement",
    other: "{count} replacements",
  },
  "commandPalette.callNoAnswerers": "no one yet",
  "commandPalette.roomMeta": {
    one: "{count} member · {purpose}",
    other: "{count} members · {purpose}",
  },
  "commandPalette.noResults": "Nothing found for “{query}”.",
  "commandPalette.minChars": "Type at least 2 characters — projects by title or pitch, members by name.",
  "commandPalette.shortcutsHint": "↑↓ navigate · ↵ open · esc close",

  // Sharing the current page
  "shareButton.share": "Share",
  "shareButton.copied": "Link copied!",
  "shareButton.copyPrompt": "Copy the project link:",

  // Reporting to the team
  "reportButton.defaultLabel": "Report",
  "reportButton.triggerTitle": "Report to the team",
  "reportButton.dialogLabel": "Report this content",
  "reportButton.sentTitle": "Report sent",
  "reportButton.sentBody":
    "Thanks for looking out for the community — the team will take a look. The person concerned isn't told about your report.",
  "reportButton.close": "Close",
  "reportButton.heading": "Report to the team",
  "reportButton.reasonLegend": "Reason",
  "reportButton.detailLabel": "Details (optional)",
  "reportButton.detailPlaceholder": "What tipped you off — links, context…",
  "reportButton.sending": "Sending…",
  "reportButton.submit": "Send the report",
  "reportButton.cancel": "Cancel",

  // Notification bell
  "navbarBell.title": "Notifications",
  "navbarBell.overflow": "9+",
  "navbarBell.srUnread": "Notifications ({count} unread)",

  // Community globe
  "communityGlobe.loading": "Spinning up the globe…",

  // Legal framework navigation
  "legalNav.ariaLabel": "Legal pages",
  "legalNav.terms": "Terms of service",
  "legalNav.privacy": "Privacy",
  "legalNav.legalNotice": "Legal notice",

  // Reputation badge
  "reputationBadge.title": "Reputation: {reputation}",
} satisfies Messages["ui"];
