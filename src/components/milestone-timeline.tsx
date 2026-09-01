import type { Prisma, Project } from "@prisma/client";
import { Check, ExternalLink, Hourglass, Lock, Scale, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { voteProofAction } from "@/actions/milestones";
import { ProofForm } from "@/components/proof-form";
import { Button } from "@/components/ui/button";
import { MAX_PROOF_ATTEMPTS } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type MilestoneWithProofs = Prisma.MilestoneGetPayload<{
  include: { proofs: { include: { votes: true } } };
}>;

const STATUS_CONFIG = {
  LOCKED: {
    labelKey: "milestoneTimeline.statusLocked",
    chip: "border-white/[0.12] bg-card/60 text-muted-foreground",
  },
  AWAITING_PROOF: {
    labelKey: "milestoneTimeline.statusAwaitingProof",
    chip: "border-primary/30 bg-primary/15 text-primary",
  },
  UNDER_REVIEW: {
    labelKey: "milestoneTimeline.statusUnderReview",
    chip: "border-secondary/30 bg-secondary/15 text-secondary",
  },
  RELEASED: {
    labelKey: "milestoneTimeline.statusReleased",
    chip: "border-success/30 bg-success/15 text-success",
  },
} as const;

/**
 * Ligne de trajectoire (motif DA) : nœuds lumineux reliés — validé = plein,
 * en cours = pulsation lente (seule animation de l'écran), verrouillé = contour.
 * Votes pondérés : le poids d'un vote = crédits contribués par le votant.
 */
export async function MilestoneTimeline({
  milestones,
  project,
  viewerId,
  isOwner,
  isContributor,
}: {
  milestones: MilestoneWithProofs[];
  project: Pick<Project, "status" | "raised" | "goal" | "currency">;
  viewerId?: string;
  isOwner: boolean;
  isContributor: boolean;
}) {
  const t = await getT("project");
  return (
    <ol className="space-y-2">
      {milestones.map((milestone) => {
        const config = STATUS_CONFIG[milestone.status];
        const proofs = [...milestone.proofs].sort(
          (a, b) => a.submittedAt.getTime() - b.submittedAt.getTime()
        );
        const inProgress =
          milestone.status === "AWAITING_PROOF" || milestone.status === "UNDER_REVIEW";

        return (
          <li key={milestone.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold",
                  milestone.status === "RELEASED" &&
                    "bg-accent-gradient text-primary-foreground shadow-glow",
                  inProgress &&
                    "animate-pulse-slow border border-primary/50 bg-primary/15 text-primary shadow-glow",
                  milestone.status === "LOCKED" &&
                    "border border-white/15 bg-transparent text-muted-foreground"
                )}
              >
                {milestone.status === "RELEASED" ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : milestone.status === "LOCKED" ? (
                  <Lock className="h-4 w-4" aria-hidden />
                ) : (
                  milestone.order
                )}
              </span>
              <span
                className="mt-1 w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent"
                aria-hidden
              />
            </div>

            {/* min-w-0 : sans lui, le contenu (liens de preuve, poids de vote)
                impose sa largeur intrinsèque et fait déborder à 375px */}
            <div className="min-w-0 flex-1 space-y-3 pb-8">
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <h3 className="font-semibold">{milestone.title}</h3>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
                    config.chip
                  )}
                >
                  {t(config.labelKey)}
                </span>
                <span className="ms-auto font-mono text-xs text-muted-foreground">
                  {formatMoney(milestone.amount, project.currency)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{milestone.description}</p>

              {proofs.map((proof, index) => {
                const approveWeight = proof.votes
                  .filter((v) => v.decision === "APPROVE")
                  .reduce((sum, v) => sum + v.weight, 0);
                const rejectWeight = proof.votes
                  .filter((v) => v.decision === "REJECT")
                  .reduce((sum, v) => sum + v.weight, 0);
                const alreadyVoted = Boolean(
                  viewerId && proof.votes.some((v) => v.userId === viewerId)
                );
                const canVote =
                  proof.status === "PENDING" && isContributor && !isOwner && !alreadyVoted;

                return (
                  <div
                    key={proof.id}
                    className={cn(
                      "glass space-y-2.5 rounded-xl p-3.5 text-sm",
                      proof.status === "REJECTED" && "border-destructive/25 opacity-70"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      <span>
                        {t("milestoneTimeline.proofCounter", {
                          index: index + 1,
                          max: MAX_PROOF_ATTEMPTS,
                        })}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{formatDate(proof.submittedAt)}</span>
                      {proof.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <X className="h-3 w-3" aria-hidden /> {t("milestoneTimeline.proofRejected")}
                        </span>
                      )}
                      {proof.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check className="h-3 w-3" aria-hidden /> {t("milestoneTimeline.proofApproved")}
                        </span>
                      )}
                      {proof.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-secondary">
                          <Hourglass className="h-3 w-3" aria-hidden /> {t("milestoneTimeline.proofPending")}
                        </span>
                      )}
                    </div>

                    <p className="whitespace-pre-line">{proof.content}</p>

                    {proof.links.length > 0 && (
                      <ul className="space-y-1">
                        {proof.links.map((link) => (
                          <li key={link}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex max-w-full items-center gap-1 truncate font-medium text-primary underline-offset-4 hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              <span className="truncate">{link}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}

                    {proof.imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {proof.imageUrls.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={t("milestoneTimeline.proofImageAlt")}
                              loading="lazy"
                              className="aspect-video w-full rounded-lg border border-white/[0.08] object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Balance des votes pondérés par les crédits contribués */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-success">
                        <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {formatMoney(approveWeight, project.currency)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <ThumbsDown className="h-3.5 w-3.5" aria-hidden /> {formatMoney(rejectWeight, project.currency)}
                      </span>
                      {proof.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Scale className="h-3.5 w-3.5" aria-hidden />
                          {t("milestoneTimeline.majorityAt", {
                            amount: formatMoney(Math.floor(project.raised / 2) + 1, project.currency),
                          })}
                        </span>
                      )}
                      {alreadyVoted && proof.status === "PENDING" && (
                        <span className="text-muted-foreground">{t("milestoneTimeline.alreadyVoted")}</span>
                      )}
                    </div>

                    {canVote && (
                      <div className="flex gap-2 pt-1">
                        <form action={voteProofAction.bind(null, proof.id, "APPROVE")}>
                          <Button type="submit" size="sm" variant="success">
                            <ThumbsUp aria-hidden /> {t("milestoneTimeline.approve")}
                          </Button>
                        </form>
                        <form action={voteProofAction.bind(null, proof.id, "REJECT")}>
                          <Button type="submit" size="sm" variant="outline">
                            <ThumbsDown aria-hidden /> {t("milestoneTimeline.reject")}
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}

              {milestone.status === "AWAITING_PROOF" &&
                project.status === "FUNDED" &&
                (isOwner ? (
                  <ProofForm
                    milestoneId={milestone.id}
                    lastAttempt={milestone.rejectionCount === MAX_PROOF_ATTEMPTS - 1}
                  />
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    {t("milestoneTimeline.awaitingOwnerProof")}
                  </p>
                ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
