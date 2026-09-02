import type { NotificationType } from "@prisma/client";

/**
 * Le catalogue des gabarits de notification : la clé stockée en base
 * (`Notification.key`) → ce que le rendu attend. `body: true` signifie que
 * le gabarit a un corps (`notif.<clé>.body` dans les 7 langues) ; `excerpt`
 * signale que le corps CITE du contenu membre — la colonne dédiée,
 * neutralisable au retrait.
 *
 * Ajouter un gabarit ICI d'abord : le type `NotificationKey` verrouille les
 * sites d'appel, et le test de parité exige ses clés dans les 7 langues.
 */
export const NOTIFICATION_KEYS = {
  "contribution.received": { type: "CONTRIBUTION", body: false, excerpt: false },
  "contribution.confirmed": { type: "CONTRIBUTION_CONFIRMED", body: true, excerpt: false },
  "refund.lateClose": { type: "REFUND", body: true, excerpt: false },
  "refund.projectFailed": { type: "REFUND", body: true, excerpt: false },
  "projectFunded.owner": { type: "PROJECT_FUNDED", body: true, excerpt: false },
  "projectFunded.supporter": { type: "PROJECT_FUNDED", body: true, excerpt: false },
  "proofToVote": { type: "PROOF_TO_VOTE", body: true, excerpt: false },
  "milestoneReleased.next": { type: "MILESTONE_RELEASED", body: true, excerpt: false },
  "milestoneReleased.final": { type: "MILESTONE_RELEASED", body: true, excerpt: false },
  "proofRejected": { type: "PROOF_REJECTED", body: true, excerpt: false },
  "projectFailed.owner": { type: "PROJECT_FAILED", body: true, excerpt: false },
  "boycottAnswered": { type: "BOYCOTT_ANSWERED", body: true, excerpt: false },
  "boycottRemoved": { type: "BOYCOTT_REMOVED", body: true, excerpt: false },
  "callComment": { type: "CALL_COMMENT", body: true, excerpt: true },
  "callVideo.new": { type: "CALL_VIDEO", body: true, excerpt: true },
  "callVideo.removed": { type: "CALL_VIDEO", body: true, excerpt: true },
  "storageAlert.warn": { type: "STORAGE_ALERT", body: true, excerpt: false },
  "storageAlert.full": { type: "STORAGE_ALERT", body: true, excerpt: false },
  "securityAlert.loginBurst": { type: "SECURITY_ALERT", body: true, excerpt: false },
  "securityAlert.dispute": { type: "SECURITY_ALERT", body: true, excerpt: false },
  "securityAlert.translationSaturated": { type: "SECURITY_ALERT", body: true, excerpt: false },
  "groupMessage": { type: "GROUP_MESSAGE", body: false, excerpt: false },
  "comment": { type: "COMMENT", body: true, excerpt: true },
  "projectUpdate": { type: "PROJECT_UPDATE", body: false, excerpt: false },
  "message.new": { type: "MESSAGE", body: false, excerpt: false },
  "partnership.request": { type: "PARTNERSHIP", body: true, excerpt: false },
  "partnership.requestBudget": { type: "PARTNERSHIP", body: true, excerpt: false },
} as const satisfies Record<string, { type: NotificationType; body: boolean; excerpt: boolean }>;

export type NotificationKey = keyof typeof NOTIFICATION_KEYS;

/** Motifs d'échec de campagne — jeu FERMÉ (jamais de phrase libre en base). */
export const FAIL_REASON_KEYS = [
  "stoppedByOwner",
  "goalNotReached",
  "proofsRefused",
  "milestonesNotRealized",
] as const;
export type FailReasonKey = (typeof FAIL_REASON_KEYS)[number];
