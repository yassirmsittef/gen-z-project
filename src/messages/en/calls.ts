import type { Messages } from "../types";

/**
 * Namespace `calls` — the calls feed, the video Live feed and partnerships:
 * call cards and forms, support, filmed testimonies, AI copilot.
 */
export const calls = {
  // ── CallAnswerForm ────────────────────────────────────────────────────────
  "callAnswerForm.emptyHeading": "You could be the replacement",
  "callAnswerForm.emptyBody":
    "Launch a project that answers this call: its supporters are your first contributors, and they'll be notified as soon as you declare yourself.",
  "callAnswerForm.launchReplacement": "Launch the replacement for {target}",
  "callAnswerForm.heading": "Does one of your projects answer it?",
  "callAnswerForm.body":
    "Declare it: the call's author and all its supporters will be notified.",
  "callAnswerForm.projectLabel": "Your project",
  "callAnswerForm.projectPlaceholder": "Pick a project…",
  "callAnswerForm.success":
    "Declared — the call's supporters have just been notified.",
  "callAnswerForm.pending": "Saving…",
  "callAnswerForm.submit": "My project replaces {target}",

  // ── CallCard ──────────────────────────────────────────────────────────────
  "callCard.replacementCount": {
    one: "{count} replacement",
    other: "{count} replacements",
  },
  "callCard.nobodyYet": "No one yet",
  "callCard.noLongerWants": "No longer wants",
  "callCard.instead": "Instead",
  "callCard.memberFallback": "Member",
  "callCard.takeCall": "Take this call",

  // ── CallCommentForm ───────────────────────────────────────────────────────
  "callCommentForm.placeholder":
    "Add a detail, a source, a nuance — or say why you disagree…",
  "callCommentForm.replyAria": "Your reply",
  "callCommentForm.pending": "Sending…",
  "callCommentForm.submit": "Reply",
  "callCommentForm.disclaimer":
    "Posted under your name. Disagreement is welcome, personal attacks are not.",

  // ── CallSupportButton ─────────────────────────────────────────────────────
  "callSupportButton.removeVoiceAria": {
    one: "Withdraw my voice — {count} supporter",
    other: "Withdraw my voice — {count} supporters",
  },
  "callSupportButton.supportAria": {
    one: "I want this replaced too — {count} supporter",
    other: "I want this replaced too — {count} supporters",
  },
  "callSupportButton.removeVoice": "Withdraw my voice",
  "callSupportButton.support": "I want this replaced too",
  "callSupportButton.signInToSupport": "Log in to support this call",
  "callSupportButton.supported": "Supported",
  "callSupportButton.supportShort": "I want this replaced",

  // ── CreateCallForm ────────────────────────────────────────────────────────
  "createCallForm.charterHeading": "What you sign by publishing",
  "createCallForm.charterBody":
    "Your call is published under your name. GeniGain hosts this feed, doesn't write it and doesn't make it its own — you remain responsible for what you claim.",
  "createCallForm.targetLabel": "The brand or company",
  "createCallForm.targetPlaceholder": "Just the name…",
  "createCallForm.targetHint":
    "A company — never a person or a community.",
  "createCallForm.categoryLabel": "The sector to replace",
  "createCallForm.categoryPlaceholder": "Pick…",
  "createCallForm.categoryHint":
    "That's where project owners will come looking for calls to take.",
  "createCallForm.reasonLabel": "Why you no longer want them",
  "createCallForm.reasonPlaceholder":
    "Tell what you've observed, experienced, read. Separate what you know from what you assume…",
  "createCallForm.reasonHint":
    "{min} characters minimum. The facts you put forward are on you — that's what sources are for.",
  "createCallForm.wantedLabel": "What you want instead",
  "createCallForm.wantedPlaceholder":
    "The product or service you'd buy tomorrow if it existed — and on what terms…",
  "createCallForm.wantedHint":
    "This is the part that sparks a project. Be precise: a project owner should be able to read it as a spec.",
  "createCallForm.sourcesLabel": "Sources (optional)",
  "createCallForm.sourcesHint":
    "One link per line, {max} max, https only. A sourced call holds up; an unsourced one falls at the first report.",
  "createCallForm.pending": "Publishing…",
  "createCallForm.submit": "Publish the call",
  "createCallForm.withdrawNote": "You can withdraw it yourself at any time.",

  // ── VideoFeed ─────────────────────────────────────────────────────────────
  "videoFeed.emptyHeading": "No one has filmed yet.",
  "videoFeed.emptyBody":
    "A testimony always attaches to a call: open a call from the feed and tell, on camera, why you no longer want that brand.",
  "videoFeed.seeCalls": "See the calls",
  "videoFeed.soundOn": "Turn sound on",
  "videoFeed.soundOff": "Turn sound off",
  "videoFeed.resume": "Resume",
  "videoFeed.pause": "Pause",
  "videoFeed.resumePlayback": "Resume playback",
  "videoFeed.unreadable": "Your browser can't play this video.",
  "videoFeed.openInNewTab": "Open it in a new tab",
  "videoFeed.noLongerWants": "No longer wants",
  "videoFeed.memberFallback": "Member",
  // The number is rendered NEXT TO this (mono span); `count` is passed so
  // languages can agree via a plural object — English needs it.
  "videoFeed.voicesOnCall": {
    one: "voice on this call",
    other: "voices on this call",
  },
  "videoFeed.withdraw": "Withdraw",
  "videoFeed.hostDisclaimer":
    "Testimony published by a member. GeniGain hosts this content and is not its author.",
  "videoFeed.loading": "Loading…",

  // ── VideoUploadForm ───────────────────────────────────────────────────────
  "videoUploadForm.unreadableRetry":
    "Unreadable video — try another file (MP4 or WebM).",
  "videoUploadForm.formatRejected":
    "Format not accepted — it needs to be MP4 or WebM. On an iPhone, pick the video from your photo library: it converts automatically.",
  "videoUploadForm.tooHeavy":
    "Video too heavy ({size} MB). {max} MB max — film shorter or at lower quality.",
  "videoUploadForm.tooLong":
    "{seconds} seconds is too long. {max} seconds max.",
  "videoUploadForm.unreadable": "Unreadable video.",
  "videoUploadForm.chooseFirst": "Pick a video first.",
  "videoUploadForm.publishImpossible": "Publishing isn't possible right now.",
  "videoUploadForm.sendImpossible": "Upload failed.",
  "videoUploadForm.successHeading": "Your testimony is live.",
  "videoUploadForm.successBody":
    "It's showing in the Live feed, attached to the call about {target}.",
  "videoUploadForm.seeLive": "See the Live feed",
  "videoUploadForm.heading": "Film your testimony",
  "videoUploadForm.intro":
    "{maxSeconds} seconds max, {maxMb} MB max. Your video is published under your name, attached to this call — and you remain responsible for what you claim in it, exactly like a written call.",
  "videoUploadForm.fileLabel": "Your video",
  "videoUploadForm.fileMetaPoster": "{seconds}s · {width}×{height} · thumbnail captured",
  "videoUploadForm.fileMetaNoPoster": "{seconds}s · {width}×{height} · no thumbnail",
  "videoUploadForm.captionLabel": "What your video shows",
  "videoUploadForm.captionPlaceholder":
    "Say in one sentence what we see and what it proves…",
  "videoUploadForm.uploading": "Uploading the video…",
  "videoUploadForm.publishing": "Publishing…",
  "videoUploadForm.submit": "Publish my testimony",

  // ── DeepAnalysis ──────────────────────────────────────────────────────────
  "deepAnalysis.inProgress": "Deep AI analysis in progress...",

  // ── PartnershipAnalysisPanel ──────────────────────────────────────────────
  "partnershipAnalysisPanel.verdictFavorable": "Offer looks sound",
  "partnershipAnalysisPanel.verdictPrudence": "Clarify before committing",
  "partnershipAnalysisPanel.verdictDeconseille": "Scam signals — not recommended",
  "partnershipAnalysisPanel.signalDanger": "Danger",
  "partnershipAnalysisPanel.signalAttention": "Caution",
  "partnershipAnalysisPanel.signalInfo": "Info",
  "partnershipAnalysisPanel.heading": "AI copilot",
  "partnershipAnalysisPanel.engineDeep": "Deep analysis · Claude",
  "partnershipAnalysisPanel.engineQuick": "Quick analysis",
  "partnershipAnalysisPanel.reliabilityLabel": "Reliability",
  "partnershipAnalysisPanel.reliabilitySub": "Does the brand look real?",
  "partnershipAnalysisPanel.fairnessLabel": "Fairness",
  "partnershipAnalysisPanel.fairnessSub": "Compensation vs work asked",
  "partnershipAnalysisPanel.signalsHeading": "Signals detected",
  "partnershipAnalysisPanel.questionsHeading": "To ask before you commit",

  // ── PartnershipForm ───────────────────────────────────────────────────────
  "partnershipForm.brandNameLabel": "Brand / company *",
  "partnershipForm.brandNamePlaceholder": "e.g. Studio Nova",
  "partnershipForm.contactNameLabel": "Your name",
  "partnershipForm.contactNamePlaceholder": "e.g. Alex Carter",
  "partnershipForm.emailLabel": "Work email *",
  "partnershipForm.emailPlaceholder": "firstname@your-brand.com",
  "partnershipForm.websiteLabel": "Website",
  "partnershipForm.websitePlaceholder": "https://your-brand.com",
  "partnershipForm.compensationLabel": "Compensation offered *",
  "partnershipForm.compensationPlaceholder": "Pick…",
  "partnershipForm.budgetLabel": "Proposed budget ($)",
  "partnershipForm.budgetPlaceholder": "e.g. 300",
  "partnershipForm.budgetHint": "If paying in money — be transparent.",
  "partnershipForm.messageLabel": "Your proposal *",
  "partnershipForm.messagePlaceholder":
    "Who you are, why this project, what you're concretely offering (timeline, terms...).",
  "partnershipForm.deliverablesLabel": "What you expect from the creator",
  "partnershipForm.deliverablesPlaceholder":
    "e.g. 2 Instagram posts + 1 mention in an episode, brief provided.",
  "partnershipForm.pending": "Sending…",
  "partnershipForm.submit": "Send the request",
  "partnershipForm.afterSend":
    "After sending, you'll receive a private link to follow the creator's response.",

  // ── PartnershipResponseForm ───────────────────────────────────────────────
  "partnershipResponseForm.success":
    "Reply sent — the brand will see it on their tracking link.",
  "partnershipResponseForm.replyLabel": "Your reply to the brand",
  "partnershipResponseForm.replyHint":
    "Pre-drafted by the copilot — reread, personalize, then make your decision.",
  "partnershipResponseForm.pending": "Sending…",
  "partnershipResponseForm.accept": "Accept the partnership",
  "partnershipResponseForm.decline": "Decline",
} satisfies Messages["calls"];
