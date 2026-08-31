import type { Messages } from "../types";

/**
 * Namespace `project` — project creation/editing, contribution, release
 * milestones (timeline + proofs), campaign cockpit, stop and withdraw
 * buttons, comments, updates, following, project card.
 * (Shared CATEGORY_LABELS / STATUS_LABELS live in their own constants —
 * see the dedicated batch.)
 */
export const project = {
  // ——— CreateProjectForm ———
  "createProjectForm.answersCallLabel": "You're answering a call",
  "createProjectForm.replaceTarget": "Replace {target}",
  "createProjectForm.quotedWanted": "“{wanted}”",
  "createProjectForm.answersCallHelp":
    "This is the spec written by the person who launched the call. Your project will be declared a replacement the moment it's created, and all the call's supporters will be notified.",
  "createProjectForm.projectSection": "Your project",
  "createProjectForm.titleLabel": "Title",
  "createProjectForm.titlePlaceholder": "e.g. 5-track EP — LUNE NOIRE",
  "createProjectForm.pitchLabel": "Pitch (140 characters max)",
  "createProjectForm.pitchPlaceholder": "One sentence that makes people want to fund you.",
  "createProjectForm.descriptionLabel": "Description",
  "createProjectForm.descriptionPlaceholder":
    "Tell the story: what it is, who it's for, why you, and what the money will go toward (50 characters min).",
  "createProjectForm.categoryLabel": "Category",
  "createProjectForm.categoryPlaceholder": "Pick…",
  "createProjectForm.currencyLabel": "Project currency",
  "createProjectForm.goalLabel": "Goal ({currency})",
  "createProjectForm.durationLabel": "Campaign length ({min}–{max} days)",
  "createProjectForm.skillsLabel": "Skills wanted (optional)",
  "createProjectForm.skillsPlaceholder": "e.g. editing, mixing, photo — separated by commas",
  "createProjectForm.skillsHelp": "We steer members with these skills toward your project.",
  "createProjectForm.coverLabel": "Cover visual (URL, optional)",
  "createProjectForm.milestonesSection": "Release milestones",
  "createProjectForm.milestonesHelp":
    "Each milestone releases an amount in {currency}, on proof approved by your contributors' weighted vote. The total must equal your goal. Once funded, you have {days} days to deliver everything and get it approved — beyond that, the remaining escrow is refunded to contributors.",
  "createProjectForm.milestonesHelpStrong": "0% GeniGain commission",
  "createProjectForm.milestonesHelpAfterStrong":
    "— only bank fees are deducted from payouts.",
  "createProjectForm.milestoneNumber": "Milestone {number}",
  "createProjectForm.removeMilestoneTitle": "Remove this milestone",
  "createProjectForm.milestoneTitleLabel": "Title",
  "createProjectForm.milestoneTitlePlaceholder": "e.g. Demo finished",
  "createProjectForm.milestoneAmountLabel": "Amount ({currency})",
  "createProjectForm.milestoneDeliverableLabel": "What you'll deliver",
  "createProjectForm.milestoneDeliverablePlaceholder":
    "What contributors will be able to verify at this milestone.",
  "createProjectForm.addMilestone": "Add a milestone",
  "createProjectForm.submitPending": "Creating…",
  "createProjectForm.submit": "Launch my project",

  // ——— EditProjectForm ———
  "editProjectForm.titleLabel": "Title",
  "editProjectForm.titleHelp":
    "The page's address doesn't change: links you've already shared keep working.",
  "editProjectForm.pitchLabel": "Pitch (140 characters max)",
  "editProjectForm.descriptionLabel": "Description",
  "editProjectForm.categoryLabel": "Category",
  "editProjectForm.coverLabel": "Cover visual (URL, optional)",
  "editProjectForm.skillsLabel": "Skills wanted (optional)",
  "editProjectForm.skillsPlaceholder": "e.g. editing, mixing, photo — separated by commas",
  "editProjectForm.submitPending": "Saving…",
  "editProjectForm.submit": "Save changes",

  // ——— ContributeForm ———
  "contributeForm.freeAmountLabel": "Custom amount ({currency})",
  "contributeForm.anonymousStrong": "Contribute anonymously",
  "contributeForm.anonymousRest":
    "— your name won't appear on the project, to the owner, or in the activity feed.",
  "contributeForm.redirecting": "Redirecting to payment…",
  "contributeForm.submit": "Contribute {amount}",
  "contributeForm.feeStrong": "0% GeniGain commission",
  "contributeForm.feeRest":
    "— only card fees apply (set by Stripe, never seen or touched by GeniGain).",
  "contributeForm.escrowIntro":
    "Payment secured by Stripe. Funds held in escrow, released milestone by milestone by the contributors' vote. If the campaign doesn't make it, you're refunded",
  "contributeForm.escrowStrong": "net of card fees",
  "contributeForm.escrowAfterStrong":
    ": Stripe doesn't return them, GeniGain keeps none.",
  "contributeForm.feesLink": "Fee details",

  // ——— MilestoneTimeline ———
  "milestoneTimeline.statusLocked": "Locked",
  "milestoneTimeline.statusAwaitingProof": "Awaiting proof",
  "milestoneTimeline.statusUnderReview": "Vote in progress",
  "milestoneTimeline.statusReleased": "Funds released",
  "milestoneTimeline.proofCounter": "Proof {index}/{max}",
  "milestoneTimeline.proofRejected": "Rejected",
  "milestoneTimeline.proofApproved": "Approved",
  "milestoneTimeline.proofPending": "Vote in progress",
  "milestoneTimeline.proofImageAlt": "Proof of progress",
  "milestoneTimeline.majorityAt": "majority at {amount}",
  "milestoneTimeline.alreadyVoted": "You voted",
  "milestoneTimeline.approve": "Approve",
  "milestoneTimeline.reject": "Reject",
  "milestoneTimeline.awaitingOwnerProof":
    "Waiting for the owner's proof of progress...",

  // ——— ProofForm ———
  "proofForm.heading": "Submit your proof of progress",
  "proofForm.lastAttempt": "Last attempt — make it convincing!",
  "proofForm.contentLabel": "What you've done",
  "proofForm.contentPlaceholder":
    "Describe concretely what was done for this milestone (20 characters min)…",
  "proofForm.linksLabel": "Links (one per line, optional)",
  "proofForm.linksPlaceholder": "https://demo.example.com\nhttps://github.com/…",
  "proofForm.imagesLabel": "Images (one URL per line, optional)",
  "proofForm.imagesPlaceholder": "https://.../workshop-photo.jpg",
  "proofForm.submitPending": "Sending…",
  "proofForm.submit": "Send the proof to a vote",

  // ——— CampaignCockpit ———
  "campaignCockpit.heading": "Cockpit — visible to you only",
  "campaignCockpit.dailyCollection": "Raised per day",
  "campaignCockpit.emptyState":
    "No contributions yet — share your link, the counter starts here.",
  "campaignCockpit.sparklineAria": {
    one: "Raised per day since launch: {amount} in {count} day.",
    other: "Raised per day since launch: {amount} in {count} days.",
  },
  "campaignCockpit.todayPoint": "{amount} today",
  "campaignCockpit.paceLabel": "Pace to get there",
  "campaignCockpit.perDay": "{amount}/day",
  "campaignCockpit.goalReached": "Goal reached",
  "campaignCockpit.milestonesValidated": "Milestones approved",
  "campaignCockpit.contributorsLabel": "Contributors",
  "campaignCockpit.followersLabel": "Followers",
  "campaignCockpit.convertedShare": "{percent}% of whom contributed",
  "campaignCockpit.realizeBefore": "Deliver by",
  "campaignCockpit.daysToDeadline": "T-{days}",

  // ——— CancelProjectButton ———
  // ONE sentence, not six fragments: word order belongs to each language
  // (German and Arabic don't follow French syntax).
  "cancelProjectButton.confirmBody":
    "Confirm and the project permanently becomes “not funded”, and up to {amount} goes back to {contributors} (net of card fees, a few days depending on their bank). There's no going back.",
  "cancelProjectButton.contributorCount": {
    one: "{count} contributor",
    other: "{count} contributors",
  },
  "cancelProjectButton.contributorsGeneric": "the contributors",
  "cancelProjectButton.confirmPending": "Stopping…",
  "cancelProjectButton.confirmSubmit": "Yes, stop and refund",
  "cancelProjectButton.cancel": "Cancel",
  "cancelProjectButton.arm": "Stop the project",

  // ——— DeleteProjectButton ———
  "deleteProjectButton.confirmPending": "Withdrawing…",
  "deleteProjectButton.confirmSubmit": "Yes, withdraw permanently",
  "deleteProjectButton.cancel": "Cancel",
  "deleteProjectButton.arm": "Withdraw the project",

  // ——— CommentForm ———
  "commentForm.placeholder": "Cheer them on, ask a question, offer a hand…",
  "commentForm.ariaLabel": "Your comment",
  "commentForm.submitPending": "Sending…",
  "commentForm.submit": "Comment",

  // ——— ProjectUpdateForm ———
  "projectUpdateForm.titleLabel": "Update title",
  "projectUpdateForm.titlePlaceholder": "e.g. The gear has arrived!",
  "projectUpdateForm.bodyLabel": "What's new?",
  "projectUpdateForm.bodyPlaceholder":
    "Progress, behind the scenes, thank-yous... your contributors will be notified.",
  "projectUpdateForm.success": "Update posted — contributors notified.",
  "projectUpdateForm.submitPending": "Posting…",
  "projectUpdateForm.submit": "Post the update",

  // ——— FollowButton ———
  "followButton.unfollowTitle": "Unfollow this project",
  "followButton.followTitle": "Follow this project",
  "followButton.following": "Following",
  "followButton.follow": "Follow",

  // ——— ProjectCard ———
  "projectCard.replaces": "Replaces {targets}",
  "projectCard.contributions": {
    one: "{count} contribution",
    other: "{count} contributions",
  },
  "projectCard.daysLeft": {
    one: "{count} day left",
    other: "{count} days left",
  },
} satisfies Messages["project"];
