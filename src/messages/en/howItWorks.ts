import type { Messages } from "../types";

/** /comment-ca-marche: the full manual — journey, FAQ, CTA. */
export const howItWorks = {
  "meta.title": "How it works",
  "meta.description":
    "Contribute first, launch second: funds held in escrow, released milestone by milestone by the contributors' vote, refunded if it doesn't happen.",
  "intro.label": "The manual",
  "intro.title": "How it works",
  "intro.lead": "GeniGain rests on one simple idea:",
  "intro.highlight": "money follows proof",
  "intro.after":
    ". You contribute before you post, the funds stay in escrow, and it's the contributors' vote that releases them, milestone by milestone.",
  "stages.contributeTitle": "Contribute first",
  "stages.contributeChipMin": "from {min} € / $ / …",
  "stages.contributeChipGate": "{gate} → right to post",
  "stages.contributeBody":
    "Nobody lands here with a hat out: you start by backing others. You contribute by card, in the project's currency. Every payment is converted into dollars at the day's rate and added to your counter — at {gate} contributed, you earn the right to launch your own project.",
  "stages.launchTitle": "Launch your project",
  "stages.launchChipDuration": "{min}–{max} days",
  "stages.launchChipMilestones": "{min}–{max} milestones",
  "stages.launchBody":
    "A goal between {minGoal} and {maxGoal} in the currency of your choice, a campaign of {minDays} to {maxDays} days, and above all: a plan cut into {minMilestones} to {maxMilestones} costed milestones that add up to the goal. That split is what keeps the rest honest — you never get everything at once.",
  "stages.fundTitle": "The community funds it",
  "stages.fundChipEscrow": "escrow",
  "stages.fundChipRefund": "refunded if it flops",
  "stages.fundBody":
    "During the campaign, contributions pile up in escrow: neither you nor anyone else touches them. Goal reached — the raise stops and the adventure begins. Goal missed at the deadline — every contributor is automatically refunded to their card, net of the card fees the bank doesn't return (GeniGain keeps none).",
  "stages.proveTitle": "Prove it, the community votes",
  "stages.proveChipVote": "weighted vote",
  "stages.proveChipDays": "{days} days to deliver",
  "stages.proveBody":
    "At each milestone you post a proof (links, images) and your contributors vote. Every voice weighs what it contributed: the majority of the amounts decides. Milestone approved = that milestone's funds released. The same milestone rejected {attempts} times, or the {days} days gone, and the project stops.",
  "stages.cashTitle": "Cash in — or bounce back",
  "stages.cashChipPayout": "payout per milestone",
  "stages.cashChipFee": "0% commission",
  "stages.cashChipProrata": "pro rata refunded",
  "stages.cashBody":
    "Every approved milestone heads to your Stripe payout account, net of bank fees — GeniGain takes nothing on the way. And if the project stops along the road? What the community approved stays yours, all the remaining escrow goes back pro rata to the contributors — and the community helps you bounce back onto what's next.",
  "faq.heading": "The questions we get asked",
  "faq.investmentQ": "Is this an investment?",
  "faq.investmentA":
    "No. A contribution is support: it gives you no share of the project, no interest, no financial return. What you get out of it is elsewhere: you bring to life projects you picked because they speak to you or will be useful to you — the app, the product, the place or the service you'd like to see exist and will enjoy once it's there. You keep a vote on their milestones, you build your reputation in the community, and you unlock the right to launch your own.",
  "faq.costQ": "How much does it cost?",
  "faq.costA":
    "0% GeniGain commission. Contributors pay exactly the amount they chose; bank fees (Stripe) are deducted from the payouts to the owner, like on any platform — GeniGain keeps nothing on the way. If a commission ever arrives, it will be announced in advance, shown before every payment, and never retroactive.",
  "faq.feesQ": "Who pays the card fees, exactly?",
  "faq.feesA":
    "Processing fees are set by Stripe (the payment provider) and vary with your card and your country — usually in the range of 1.5 to 3%. GeniGain doesn't set them, doesn't see them and adds none. Concretely: when you contribute, you pay exactly your amount; the fees are taken by Stripe and deducted from what the owner receives. If the project fails and you're refunded, Stripe doesn't return the fee it took upfront — so your refund is net of those fees, and here again GeniGain keeps none. That's the only “cost” of a contribution, and it never lands in the platform's pocket.",
  "faq.whoQ": "Who can take part?",
  "faq.whoA":
    "Sign-up is open from age 15. To contribute by card or launch a campaign, you must be of legal age or have your legal guardian's consent.",
  "faq.vanishQ": "And if the owner vanishes into thin air?",
  "faq.vanishA":
    "That's exactly what escrow prevents: the funds that haven't been released are never in their hands. Without an approved proof, nothing moves — and after {days} days, everything a vote hasn't released automatically goes back to the contributors (net of the card fees the bank doesn't return).",
  "faq.payoutQ": "How do I receive my funds as an owner?",
  "faq.payoutA":
    "Through Stripe Connect: you create your payout account from your dashboard and pass Stripe's identity check. Every approved milestone is then transferred automatically, in your project's currency. An approved milestone stays owed to you until your account is ready.",
  "faq.realMoneyQ": "Is this real money?",
  "faq.realMoneyALive":
    "Yes. Payments are real and secured by Stripe: your contribution is really charged, held in escrow, and released to the owner milestone by milestone by the contributors' vote. GeniGain never sees or stores your card number.",
  "faq.realMoneyATest":
    "The mechanics are real end to end, but the platform is in its test phase: Stripe payments run in test mode, no card is really charged. The switch to real payments will be announced clearly.",
  "legal.before": "The legal version of these rules lives in the",
  "legal.link": "terms of service",
  "legal.after": ".",
  "cta.discover": "Discover projects",
  "cta.register": "Create my account",
} satisfies Messages["howItWorks"];
