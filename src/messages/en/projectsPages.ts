import type { Messages } from "../types";

/**
 * Namespace `projectsPages` — the 5 server pages under /projects:
 * list, creation (gate included), project page, editing, partnership.
 * Keys prefixed by page: meta.*, hero/search/filters/sort/results/empty
 * (list), gate/form (creation), detail.*, edit.*, partnership.*.
 */
export const projectsPages = {
  // ---------- Metadata (one key per page of the namespace) ----------
  "meta.listTitle": "Projects",
  "meta.newTitle": "Launch a project",
  "meta.detailNotFound": "Project not found",
  "meta.editTitle": "Edit the project",
  "meta.partnershipTitle": "Propose a partnership",

  // ---------- /projects — the list ----------
  "hero.title": "The community's projects",
  "hero.subtitle": "Every contribution counts — and it's your ticket to launch your own.",
  "search.placeholder": "Search a project, an idea, a keyword…",
  "search.ariaLabel": "Search for a project",
  "search.submit": "Search",
  "filters.categories": "Categories",
  "filters.allCategories": "All categories",
  "filters.statusesAndSort": "Statuses and sorting",
  "filters.allStatuses": "All statuses",
  "filters.sortLabel": "Sort",
  "sort.recent": "Most recent",
  "sort.suivis": "Most followed",
  "sort.fin": "Ending soon",
  "sort.finances": "Most funded",
  "results.count": {
    one: "{count} result",
    other: "{count} results",
  },
  "results.forQuery": " for “{query}”",
  "empty.title": "No project matches.",
  "empty.body": "Try another keyword, change a filter — or be the first to go for it.",

  // ---------- /projects/new — the gate, then the form ----------
  "gate.title": "First, contribute",
  "gate.body":
    "Here, everyone pitches in before asking: you need {required} of contributions (any currency, converted on the day of payment) to unlock the creation of your project.",
  "gate.progressLabel": "Your progress",
  "gate.percent": "{percent}%",
  "gate.progressAria": "Progress toward the right to post: {percent}%",
  // ONE sentence per key: word order belongs to each language.
  "gate.progress": "{current} of {required} — {left} to go.",
  "gate.callLabel": "You wanted to replace",
  "gate.callBody": "The call is waiting: contribute first, then come back and take it.",
  "gate.callLink": "See the call again",
  "gate.explore": "Explore the projects",
  "gate.suggestionsTitle": "They're waiting for your support",
  "form.title": "Launch your project",
  "form.titleReplace": "Replace {target}",
  "form.subtitle":
    "Be transparent about your plan: that's what the community funds, milestone by milestone.",
  "form.subtitleReplace":
    "Someone described what they'd buy instead. Show how you mean to build it, milestone by milestone.",

  // ---------- /projects/[slug] — the project page ----------
  "detail.failedTitle": "This project didn't make it",
  "detail.failedBody": "The contributors were refunded from the remaining escrow.",
  "detail.failedRebound": "Bounce back now →",
  "detail.failedViewer":
    "Failure is part of the game — the creator is being steered toward new opportunities.",
  "detail.completedTitle": "Project delivered",
  "detail.completedBody":
    "Every milestone was approved by the community and the funds released in full.",
  "detail.replaces": "Launching to replace",
  "detail.followLoginTitle": "Log in to follow this project",
  "detail.follow": "Follow",
  "detail.followerCount": {
    one: "{count} follower",
    other: "{count} followers",
  },
  "detail.contact": "Contact",
  "detail.brandPartnership": "Brand partnership",
  "detail.ownerNotReadyOwner": "To receive contributions, activate your payouts first: your contributors' money goes straight to your Stripe account, in escrow, and it needs a destination.",
  "detail.ownerNotReadyCta": "Activate my payouts",
  "detail.ownerNotReadyVisitor": "This project owner hasn't activated fund reception yet: contributions aren't possible for now.",
  "detail.edit": "Edit",
  "detail.coverAlt": "Visual of the project {title}",
  "detail.aboutTitle": "The project",
  "detail.skillsLabel": "Skills wanted",
  "detail.milestonesTitle": "Milestones & proofs of progress",
  "detail.milestonesHint":
    "Funds are released milestone by milestone: the creator submits a proof, the contributors vote.",
  "detail.realizeBefore": "to deliver before {date} · T-{days}",
  "detail.updatesTitle": "Project updates",
  "detail.updatesByYou": "News from the ground, told by you.",
  "detail.updatesBy": "News from the ground, told by {name}.",
  "detail.updatesEmpty": "No update yet — they'll show up here as the project moves.",
  "detail.updateDelete": "Delete this update",
  "detail.commentsTitle": "Discussion",
  "detail.commentsHint": "Questions, cheers, a helping hand — the project's community.",
  "detail.commentsLogin": "Log in",
  "detail.commentsLoginSuffix": "to join the discussion.",
  "detail.commentsEmpty": "Nobody has commented yet — start the discussion!",
  "detail.commentReport": "Report this comment",
  "detail.commentDelete": "Delete this comment",
  "detail.ofGoal": "of {goal}",
  "detail.contributorCount": {
    one: "{count} contributor",
    other: "{count} contributors",
  },
  "detail.daysLeft": "{count} d left",
  "detail.campaignEnded": "Campaign ended on {date}",
  "detail.releasedNote":
    "released of {raised} — the rest stays in escrow until the milestones are approved.",
  "detail.ownerShareHint": "This is your project — share it to reach your goal.",
  "detail.loginToContribute": "Log in to contribute",
  "detail.contributorsTitle": "Contributors",
  "detail.moreContributors": "+ {count} more",
  "detail.anonymous": "Anonymous contributions",

  // ---------- /projects/[slug]/modifier ----------
  "edit.back": "Back to the project",
  "edit.title": "Edit the project",
  "edit.frozenLabel": "Financial frame locked",
  "edit.frozenSummary": {
    one: "Goal {goal} · campaign ends {date} · {count} milestone ({amounts})",
    other: "Goal {goal} · campaign ends {date} · {count} milestones ({amounts})",
  },
  "edit.frozenHint":
    "Contributions are committed on these rules: goal, milestones and duration can no longer change.",
  "edit.frozenClosed":
    "The campaign is over: the project's content is frozen. It stays readable by the community, with its proofs and its history.",
  "edit.dangerLabel": "Withdrawal zone",
  "edit.deleteHint":
    "Nobody has contributed yet: you can withdraw this project for good. Milestones, comments and followers go with it — there's no going back.",
  "edit.cancelMembers": {
    one: "{count} member has contributed.",
    other: "{count} members have contributed.",
  },
  "edit.cancelBodyRefund":
    "You can't withdraw it outright anymore, but you can stop it: it becomes “not funded” and {amount} — the remaining escrow — will be refunded to the contributors.",
  "edit.cancelBodyNoRefund":
    "You can't withdraw it outright anymore, but you can stop it: it becomes “not funded” and {amount} — the remaining escrow — would be refunded to the contributors.",
  "edit.cancelReleased":
    "The {released} already released by the votes aren't affected.",
  "edit.closedHint":
    "This project has finished its cycle: it stays readable by the community, with its history.",

  // ---------- /projects/[slug]/partenariat ----------
  "partnership.back": "Back to the project",
  "partnership.title": "Propose a partnership",
  "partnership.intro":
    "You represent a brand and want to work with {owner} around “{title}”? Describe your proposal — the more precise and transparent it is, the faster you'll get an answer.",
} satisfies Messages["projectsPages"];
