import type { Messages } from "../types";

export const notif = {
  "contribution.received.title": "{actor} backed “{projectTitle}” ({money})",

  "contribution.confirmed.title": "Your {money} contribution to “{projectTitle}” is confirmed",
  "contribution.confirmed.body":
    "The funds join the project's escrow: they'll be released step by step, under the control of the contributors' vote — including yours. If the project doesn't make it, the unreleased share automatically returns to your card.",

  "refund.lateClose.title": "Your contribution to “{projectTitle}” arrived after closing",
  "refund.lateClose.body":
    "The campaign ended in the meantime: your contribution goes back to your card, net of the card fees the bank doesn't return (GeniGain keeps none).",

  "refund.projectFailed.title": "{money} refund — “{projectTitle}”",
  "refund.projectFailed.body":
    "The campaign didn't make it: your share of the remaining escrow goes back to your card (a few days depending on your bank), net of the card fees the bank doesn't return — GeniGain keeps none.",

  "projectFunded.owner.title": "Goal reached for “{projectTitle}”!",
  "projectFunded.owner.body":
    "The raise is complete — submit the proof for milestone 1 to unlock the first funds.",

  "projectFunded.supporter.title": "“{projectTitle}” is funded!",
  "projectFunded.supporter.body":
    "Funds will be released step by step, under the contributors' control.",

  "proofToVote.title": "Proof to review — “{projectTitle}”",
  "proofToVote.body": "Milestone {order}: {milestoneTitle}. Your vote unlocks (or not) the funds.",

  "milestoneReleased.next.title": "Milestone {order} approved — {money} released",
  "milestoneReleased.next.body":
    "The community approved your proof for “{projectTitle}”. Next milestone: “{nextTitle}”. The transfer is on its way to your Stripe account.",

  "milestoneReleased.final.title": "Milestone {order} approved — {money} released",
  "milestoneReleased.final.body":
    "“{projectTitle}” is fully delivered. Congratulations! The final transfer is on its way to your Stripe account.",

  "proofRejected.title": "Proof rejected — “{projectTitle}”",
  "proofRejected.body": {
    one: "Milestone {order}: the community didn't approve. You have {count} attempt left — strengthen your proof (photos, public links).",
    other:
      "Milestone {order}: the community didn't approve. You have {count} attempts left — strengthen your proof (photos, public links).",
  },

  "projectFailed.owner.title": "“{projectTitle}” didn't make it",
  "projectFailed.owner.body":
    "{reason} Failure isn't an exit: opportunities await you on the rebound track.",

  "failReason.stoppedByOwner": "Project stopped by its owner.",
  "failReason.goalNotReached": "Goal not reached before the campaign's end.",
  "failReason.proofsRefused": "The progress proofs were rejected by the community.",
  "failReason.milestonesNotRealized":
    "Milestones not delivered within {days} days of funding.",

  "boycottAnswered.title": "A replacement for {target}",
  "boycottAnswered.body": "“{projectTitle}” is launching to replace {target}.",

  "boycottRemoved.title": "Your call was removed",
  "boycottRemoved.body": "“{target}” — {reason}.",
  "boycottRemoved.defaultReason": "not compliant with the calls charter",

  "callComment.title": "{actor} replied to your call about {target}",
  "callComment.body": "{excerpt}",

  "callVideo.new.title": "{actor} filmed a testimony about {target}",
  "callVideo.new.body": "{excerpt}",

  "callVideo.removed.title": "Your filmed testimony was removed",
  "callVideo.removed.body": "{excerpt}",

  "storageAlert.warn.title": "Hosted storage at {warnPct}% ({usedMo} MB of {capMo} MB)",
  "storageAlert.warn.body":
    "The store (live testimonies AND profile photos) is nearing its cap. The cockpit shows the breakdown. Clean up, or raise the hosting cap before it starts refusing uploads.",

  "storageAlert.full.title":
    "Hosted storage full ({usedMo} MB of {capMo} MB) — uploads are refused",
  "storageAlert.full.body":
    "The next testimony could exceed the cap: upload token delivery is suspended until space frees up.",

  "groupMessage.title": "{actor} wrote in {groupName}",

  "comment.title": "{actor} commented on “{projectTitle}”",
  "comment.body": "{excerpt}",

  "projectUpdate.title": "Update from “{projectTitle}”: {updateTitle}",

  "message.new.title": "New message from {actor}",

  "partnership.request.title": "Partnership request from {brandName}",
  "partnership.request.body": "For “{projectTitle}”. The AI copilot has prepared its analysis.",

  "partnership.requestBudget.title": "Partnership request from {brandName}",
  "partnership.requestBudget.body":
    "For “{projectTitle}” · {budgetUsd} $ offered. The AI copilot has prepared its analysis.",

  "tombstone.CALL_VIDEO": "This testimony has been removed.",
  "tombstone.CALL_COMMENT": "This reply has been removed.",
  "tombstone.COMMENT": "This comment has been removed.",
} satisfies Messages["notif"];
