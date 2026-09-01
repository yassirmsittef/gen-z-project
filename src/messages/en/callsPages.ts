import type { Messages } from "../types";

/**
 * Namespace `callsPages` — the server pages of the calls feed:
 * /appels, /appels/nouveau, /appels/[slug] and /direct.
 */
export const callsPages = {
  // ---------- /appels (the feed) ----------
  "meta.listTitle": "The calls",
  "meta.listDescription":
    "The brands the community no longer wants, and the projects launching to replace them.",
  "sort.orphelins": "Without a replacement",
  "sort.soutenus": "Most supported",
  "sort.recents": "Most recent",
  "hero.label": "The feed",
  "hero.title": "What we no longer want — and what we put in its place",
  "hero.body":
    "Every call is published by a member, under their name. They name a brand they no longer want and describe what they'd buy instead. An owner takes it on, the community funds it: that's how you replace instead of only refusing.",
  "hero.disclaimer": "GeniGain hosts these calls and is not their author.",
  "cta.publish": "Publish a call",
  "search.placeholder": "A brand, a sector, a word…",
  "search.label": "Search for a call",
  "search.submit": "Search",
  "filters.sort": "Sort",
  "filters.sectors": "Sectors",
  "filters.allSectors": "All sectors",
  "results.count": { one: "{count} call", other: "{count} calls" },
  "results.forQuery": " for “{query}”",
  "empty.noneYetTitle": "The feed has no call yet.",
  "empty.noneYetBody":
    "Be the first to name a brand you no longer want — and to say what you'd buy instead.",
  "empty.allAnsweredTitle": "Every call has found a replacement.",
  "empty.allAnsweredBody":
    "That's a good sign. Open another one if a brand is still stuck in your throat.",
  "empty.noMatchTitle": "No call matches.",
  "empty.noMatchBody": "Change a filter — or publish your own.",

  // ---------- /appels/nouveau ----------
  "meta.newTitle": "Publish a call",
  "back.toFeed": "Back to the feed",
  "new.label": "New call",
  "new.title": "Name what you want replaced",
  "new.body":
    "A call isn't a rant: it's an order placed with the people who know how to build. The more precisely you describe what you'd buy instead, the better your odds that an owner takes it on.",

  // ---------- /appels/[slug] ----------
  "meta.detailFallback": "Call",
  "meta.detailTitle": "Replace {target}",
  "removed.title": "This call was removed",
  "removed.byModeration": "Removed by moderation — {reason}.",
  "removed.defaultReason": "not compliant with the calls charter",
  "removed.byAuthor": "Removed by the person who published it.",
  "badge.answered": { one: "{count} replacement declared", other: "{count} replacements declared" },
  "badge.none": "No replacement yet",
  "target.label": "No longer wants",
  "weight.calls": { one: "{count} call", other: "{count} calls" },
  "weight.aim": "target this brand, carrying",
  "weight.total": "voices in total.",
  "author.fallback": "Member",
  "motive.title": "The reason",
  "wanted.title": "What we'd want instead",
  "sources.title": "Sources put forward by the author",
  "frame.disclaimer":
    "Call published by a member. GeniGain hosts this content, is not its author and does not endorse it. A brand named here can request a removal at",
  "share.title": "Replace {target}",
  "share.text": {
    one: "{count} person wants to replace {target}. Instead: {wanted}",
    other: "{count} people want to replace {target}. Instead: {wanted}",
  },
  "actions.removeMine": "Withdraw my call",
  "actions.removeModeration": "Remove (moderation)",
  "replacements.title": "The replacements",
  "replacements.body":
    "These projects declared themselves on this call. Funding them is what makes the alternative exist.",
  "replacements.emptyTitle": "Nobody has replaced it yet",
  "replacements.emptyBody":
    "This call is waiting for its owner. The supporters above are that many first contributors.",
  "replacements.withdrawMine": "Withdraw this project from the call",
  "replacements.detach": "Detach this project (it's squatting the call)",
  "videos.title": "The filmed testimonies",
  "videos.attached": {
    one: "{count} testimony attached to this call —",
    other: "{count} testimonies attached to this call —",
  },
  "videos.seeLive": "see them in the Live feed",
  "videos.emptyBody": "A camera says in thirty seconds what a paragraph struggles to prove.",
  "login.cta": "Log in",
  "videos.loginSuffix": "to film your testimony.",
  "discussion.title": "The discussion",
  "discussion.body":
    "Corroborate, qualify, contradict. The company named here can answer just like anyone else.",
  "discussion.removeComment": "Remove this comment",
  "discussion.shown": "The {shown} most recent replies are shown, out of {total}.",
  "discussion.loginSuffix": "to reply to this call.",
  "siblings.title": "Other calls target {target}",
  "siblings.body": "Published separately, by other members, for other reasons.",
  "siblings.voices": "voices",
  "siblings.by": "by {name}",
  "siblings.anonymous": "a member",
  "siblings.answers": { one: " · {count} replacement", other: " · {count} replacements" },

  // ---------- /direct ----------
  "meta.directTitle": "Live",
  "meta.directDescription":
    "The community's filmed testimonies: why we no longer want these brands, and what we'd want instead.",
  "direct.label": "Live",
  "direct.title": "What we no longer want, on camera",
  "direct.publish": "Publish",
} satisfies Messages["callsPages"];
