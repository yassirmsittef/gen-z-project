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

  // Traduction sur l'appareil (Translator du navigateur — aucun service tiers)
  "translate.action": "Translate",
  "translate.title": "Translate this text into your language",
  "translate.working": "Translating…",
  "translate.downloading": "Downloading the model… {percent}%",
  "translate.showOriginal": "Show original",
  "translate.badge": "Translated on your device",
  "translate.sameLanguage": "This text is already in your language.",
  "translate.unavailablePair": "This language can't be translated.",
  "translate.failed": "The translation didn't go through — try again.",
  "translate.badgeService": "Translated by an external service",
  "translate.tooFast": "Too many translations in a row — come back in a moment.",
  "translate.saturated": "Automatic translation isn't available right now — try again later.",
  "translate.consentBody": "Your device can't translate on its own. This text will be sent to an external translation service (Microsoft), which doesn't keep it.",
  "translate.consentAccept": "OK, translate",
  "translate.consentDecline": "No thanks",
  "error.title": "Something broke on our side.",
  "error.body": "Nothing you did caused this. Try again; if it keeps happening, write to us at bonjour@genigain.com.",
  "error.retry": "Try again",
} satisfies Messages["ui"];
