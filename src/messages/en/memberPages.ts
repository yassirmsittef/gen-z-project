import type { Messages } from "../types";

/**
 * Namespace `memberPages` — the member area pages (batch 7):
 * dashboard, notifications, chat (private threads, groups, members),
 * public profile, partnerships (inbox, detail, brand tracking).
 */
export const memberPages = {
  // page <title>s
  "meta.dashboardTitle": "Dashboard",
  "meta.notificationsTitle": "Notifications",
  "meta.chatTitle": "Chat",
  "meta.groupsTitle": "Groups",
  "meta.groupTitle": "Group",
  "meta.groupMembersTitle": "Group members",
  "meta.profileNotFound": "Profile not found",
  "meta.profileFallback": "Profile",
  "meta.profileDescription": "{name} on GeniGain: reputation, projects and skills.",
  "meta.profileDescriptionCity":
    "{name} on GeniGain — {city}: reputation, projects and skills.",
  "meta.partnershipsTitle": "Partnerships",
  "meta.partnershipRequestTitle": "Partnership request",
  "meta.trackingTitle": "Tracking your request",

  // dashboard/page.tsx
  "dashboard.connectDoneLive":
    "Setup sent to Stripe — your payouts switch on as soon as it's approved.",
  "dashboard.connectDoneTest":
    "Setup sent to Stripe — your payouts switch on as soon as it's approved (often instant in test mode).",
  "dashboard.connectRefresh":
    "The Stripe session expired — restart the payout setup whenever you like.",
  "dashboard.greeting": "Hey {name}",
  "dashboard.tagline": "Personal HQ · systems operational",
  "dashboard.editProfile": "Edit my profile",
  "dashboard.adminCockpit": "Admin cockpit",
  "dashboard.reportsToHandle": {
    one: "{count} report to handle",
    other: "{count} reports to handle",
  },
  "dashboard.nothingToModerate": "nothing to moderate",
  "dashboard.failedTitle": "A project didn't make it — now what?",
  "dashboard.failedBody":
    "Failure isn't an exit. Discover other opportunities and set off stronger.",
  "dashboard.seeOpportunities": "See the opportunities →",
  "dashboard.statReputation": "Reputation",
  "dashboard.nextLevelAt": "{label} at {target}",
  "dashboard.maxLevel": "Top level reached",
  "dashboard.statTowardProject": "Toward your project",
  "dashboard.gateExempt": "Founder — you post without the gate",
  "dashboard.gateReached": "Gate unlocked — you can post",
  "dashboard.gateRemaining": "{amount} before you can post",
  "dashboard.statSupports": "Supports",
  "dashboard.communityPillar": "Pillar of the community",
  "dashboard.supportGoal": "Goal: 10 projects backed",
  "dashboard.trajectoryTitle": "Your trajectory",
  "dashboard.pendingPartnerships": {
    one: "{count} partnership request waiting for your answer —",
    other: "{count} partnership requests waiting for your answer —",
  },
  "dashboard.seeWithCopilot": "look at it with the AI copilot →",
  "dashboard.myProjects": "My projects",
  "dashboard.partnershipsLink": "Partnerships",
  "dashboard.partnershipsLinkCount": "Partnerships ({count})",
  "dashboard.launchProject": "Launch a project",
  "dashboard.noProjects":
    "No project yet. Contribute to a project to unlock the creation of your own.",
  "dashboard.myCalls": "My calls",
  "dashboard.publishCall": "Publish a call",
  "dashboard.replaceTarget": "Replace {target}",
  "dashboard.callVoices": "{count} voices",
  "dashboard.callAnswerers": {
    one: "{count} replacement",
    other: "{count} replacements",
  },
  "dashboard.callNoAnswerers": "no replacement yet",
  "dashboard.followedProjects": "Projects followed",
  "dashboard.myContributions": "My contributions",
  "dashboard.noContributions": "No contribution yet.",
  "dashboard.findProject": "Find a project to back →",
  "dashboard.refunded": "refunded",
  "dashboard.myProfile": "My profile",
  "dashboard.mySkills": "My skills",
  "dashboard.myPayouts": "My payouts",
  "dashboard.security": "Security",
  "dashboard.myData": "My data",
  "dashboard.myDataBody":
    "Everything you've entrusted to GeniGain (profile, projects, contributions, votes, messages sent…), in a single JSON file — your right to portability.",
  "dashboard.downloadMyData": "Download my data",

  // notifications/page.tsx
  "notifications.title": "Notifications",
  "notifications.newSince": {
    one: "{count} new one since your last visit",
    other: "{count} new ones since your last visit",
  },
  "notifications.allCaughtUp": "All caught up",
  "notifications.empty":
    "Nothing yet. Contributions received, proofs to vote on, milestones released, messages, comments, updates and partnership requests will land here.",

  // chat/page.tsx + chat/[userId]/page.tsx — shared header
  "chatHeader.title": "Chat",
  "chatHeader.tagline": "Builders helping builders · collabs · a hand when you need one",

  // chat/page.tsx
  "chatIndex.pickConversation":
    "Pick a conversation — or join a group in your category to talk with several people at once.",
  "chatIndex.exploreGroups": "Explore the groups",

  // chat/[userId]/page.tsx
  "chatThread.allConversations": "All my conversations",
  "chatThread.olderMessages": "Older messages",
  "chatThread.startConversation":
    "Start the conversation — offer a hand, a collab, a skill swap.",
  "chatThread.backToLatest": "Back to the latest messages",

  // chat/groupes/page.tsx
  "groupsDir.title": "Groups",
  "groupsDir.tagline": "One room per craving · filed under the project categories",
  "groupsDir.searchPlaceholder": "Search a room (name, topic…)",
  "groupsDir.searchLabel": "Search a room",
  "groupsDir.search": "Search",
  "groupsDir.categoriesLabel": "Group categories",
  "groupsDir.allCategories": "All categories",
  "groupsDir.noRoomForQuery": "No room talks about “{query}”.",
  "groupsDir.noRoomForQueryInCategory": "No room talks about “{query}” in {category}.",
  "groupsDir.noGroupInCategory": "No group in {category} yet.",
  "groupsDir.noGroup": "No group yet.",
  "groupsDir.tryAnotherWord": "Try another word, or open the room that's missing.",
  "groupsDir.openFirst": "Open the first one — it's often the one that brings people together.",
  "groupsDir.officialRoomCategory": "Welcome room · {category}",
  "groupsDir.openThread": "Open the thread",

  // chat/groupes/[slug]/page.tsx
  // Rendus dans la langue du LECTEUR (et non du salon) : un mot
  // d'accueil figé dans une langue qu'on ne lit pas n'accueille personne.
  "groupThread.systemJoined": "{name} joined the room. Welcome!",
  "groupThread.emptyThread": "Nothing here yet. Start the conversation — introduce yourself, say what you need.",
  "groupThread.allGroups": "All the groups",
  "groupThread.membersCount": {
    one: "{count} member",
    other: "{count} members",
  },
  "groupThread.meta": "{category} · {members}",
  "groupThread.metaOfficial": "Welcome room · {category} · {members}",
  "groupThread.animatedBy": "Hosted by",
  "groupThread.openedOn": "· opened on {date}",
  "groupThread.seeMembers": "See the {count} members",
  "groupThread.membersAria": "{count} members",
  "groupThread.olderMessages": "Older messages",
  "groupThread.backToLatest": "Back to the latest messages",
  "groupThread.membersOnly": "The thread is for members only",
  "groupThread.joinToRead":
    "Join the group to read the exchanges and write — you can leave whenever you want.",

  // chat/groupes/[slug]/membres/page.tsx
  "groupMembers.backToThread": "Back to the thread",
  "groupMembers.membersCount": {
    one: "{count} member",
    other: "{count} members",
  },
  "groupMembers.bansCount": {
    one: "· {count} banned",
    other: "· {count} banned",
  },
  "groupMembers.owner": "Host",
  "groupMembers.manager": "Manager",
  "groupMembers.since": "since {date}",
  "groupMembers.thisMember": "this member",
  "groupMembers.exclusions": "Bans",
  "groupMembers.noBans":
    "Nobody has been banned from this room. A ban removes the person and shuts the door on them; their messages stay.",
  "groupMembers.bannedOn": "banned on {date}",

  // u/[id]/page.tsx
  "profile.seeOnGlobe": "See on the Community globe",
  "profile.memberSince": "Member since {date}",
  "profile.editProfile": "Edit my profile",
  "profile.sendMessage": "Send a message",
  "profile.reportProfile": "Report this profile",
  "profile.projectsLaunched": "Projects launched",
  "profile.contributions": "Contributions",
  "profile.investedInCommunity": "Invested in the community",
  "profile.votesOnProofs": "Votes on proofs",
  "profile.theirProjects": "Their projects",
  "profile.recentActivity": "Recent activity",
  "profile.repPoints": "{delta} rep.",

  // partnerships — shared by the three screens (inbox, detail, brand tracking)
  "partnership.budgetUsd": "${amount}",

  // partenariats/page.tsx
  "partnershipsInbox.title": "Partnerships",
  "partnershipsInbox.meta": {
    one: "{count} request received · {pending} pending · AI copilot before every answer",
    other: "{count} requests received · {pending} pending · AI copilot before every answer",
  },
  "partnershipsInbox.emptyBody":
    "No request yet. Brands can propose a partnership to you from the page of any of your projects (“Brand partnership”).",
  "partnershipsInbox.emptyHint":
    "When a request lands, the AI copilot helps you check that it's reliable and fair before you answer.",

  // partenariats/[id]/page.tsx
  "partnershipDetail.allRequests": "All the requests",
  "partnershipDetail.forQuoteOpen": "For “",
  "partnershipDetail.forQuoteClose": "” · received on {date}",
  "partnershipDetail.noWebsite": "No website provided",
  "partnershipDetail.contact": "Contact",
  "partnershipDetail.notSpecified": "Not specified",
  "partnershipDetail.compensation": "Compensation",
  "partnershipDetail.proposal": "Proposal",
  "partnershipDetail.deliverables": "What the brand expects",
  "partnershipDetail.replyToBrand": "Reply to the brand",
  "partnershipDetail.yourReply": "Your reply ({status})",
  "partnershipDetail.yourReplyDated": "Your reply ({status} on {date})",

  // partenariats/suivi/[token]/page.tsx — public brand-facing page
  "tracking.sentBanner":
    "Request sent! Keep the link to this page safe: this is where the answer will appear.",
  "tracking.title": "Your partnership request",
  "tracking.pairing": "× “",
  "tracking.sentOn": "” · sent on {date}",
  "tracking.compensationProposed": "Compensation offered: {compensation}",
  "tracking.pendingTitle": "Under review",
  "tracking.pendingBody":
    "{name} is looking at your proposal. The answer will appear on this page — remember to bookmark it.",
  "tracking.accepted": "Partnership accepted",
  "tracking.declined": "Proposal declined",
  "tracking.footerNote":
    "Representing another brand, or want to complete your request? Submit a new proposal from the project's page.",
} satisfies Messages["memberPages"];
