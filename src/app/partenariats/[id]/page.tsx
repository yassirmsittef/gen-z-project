import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DeepAnalysis } from "@/components/deep-analysis";
import { PartnershipAnalysisPanel } from "@/components/partnership-analysis-panel";
import { PartnershipResponseForm } from "@/components/partnership-response-form";
import { TranslateButton } from "@/components/translate-button";
import { aiEnabled, getOrCreateAnalysis } from "@/lib/partnership-ai";
import { formatDate } from "@/lib/format";
import { compensationLabel, partnershipStatusLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("memberPages");
  return {
    title: t("meta.partnershipRequestTitle"),
    robots: { index: false, follow: false },
  };
}

// L'analyse approfondie (action IA) peut prendre plusieurs dizaines de secondes.
export const maxDuration = 60;

/** Détail d'une demande : l'offre, l'analyse du copilote, la réponse. */
export default async function PartnershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const t = await getT("memberPages");
  const locale = await getRequestLocale();

  const request = await prisma.partnershipRequest.findUnique({
    where: { id },
    include: {
      project: {
        select: { title: true, slug: true, goal: true, ownerId: true, owner: { select: { name: true } } },
      },
    },
  });
  if (!request || request.project.ownerId !== session.user.id) notFound();

  // Analyse rapide instantanée (heuristiques) — l'approfondie arrive ensuite.
  const analysis = await getOrCreateAnalysis(request, {
    projectTitle: request.project.title,
    projectGoal: request.project.goal,
    ownerName: request.project.owner.name ?? "Le porteur du projet",
  });

  return (
    <div className="page-halo">
      <div className="container max-w-4xl space-y-8 py-10">
        <div className="space-y-3">
          <Link
            href="/partenariats"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            {t("partnershipDetail.allRequests")}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">{request.brandName}</h1>
            <span className="rounded-full border border-white/[0.15] bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {partnershipStatusLabel(locale, request.status)}
            </span>
          </div>
          <p className="data-label">
            {t("partnershipDetail.forQuoteOpen")}{" "}
            <Link href={`/projects/${request.project.slug}`} className="text-primary hover:underline">
              {request.project.title}
            </Link>{" "}
            {t("partnershipDetail.forQuoteClose", { date: formatDate(request.createdAt, locale) })}
          </p>
        </div>

        {/* L'offre de la marque */}
        <Card className="rounded-se-sm">
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{request.brandEmail}</span>
              </p>
              {request.brandWebsite ? (
                <a
                  href={request.brandWebsite}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{request.brandWebsite}</span>
                </a>
              ) : (
                <p className="text-muted-foreground/70">{t("partnershipDetail.noWebsite")}</p>
              )}
              <p>
                <span className="data-label">{t("partnershipDetail.contact")}</span>
                <span className="mt-1 block">
                  {request.contactName || t("partnershipDetail.notSpecified")}
                </span>
              </p>
              <p>
                <span className="data-label">{t("partnershipDetail.compensation")}</span>
                <span className="mt-1 block">
                  {compensationLabel(locale, request.compensation)}
                  {request.budget != null && (
                    <span className="ms-2 font-mono text-primary">
                      {t("partnership.budgetUsd", { amount: request.budget })}
                    </span>
                  )}
                </span>
              </p>
            </div>

            <div>
              <h2 className="data-label">{t("partnershipDetail.proposal")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {request.message}
              </p>
              <TranslateButton texte={request.message} />
            </div>

            {request.deliverables && (
              <div>
                <h2 className="data-label">{t("partnershipDetail.deliverables")}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {request.deliverables}
                </p>
                <TranslateButton texte={request.deliverables} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copilote IA */}
        <div className="space-y-3">
          <PartnershipAnalysisPanel analysis={analysis} />
          {aiEnabled && analysis.moteur === "heuristique" && request.status === "PENDING" && (
            <DeepAnalysis requestId={request.id} />
          )}
        </div>

        {/* Réponse */}
        {request.status === "PENDING" ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("partnershipDetail.replyToBrand")}
            </h2>
            <Card>
              <CardContent className="pt-6">
                <PartnershipResponseForm
                  requestId={request.id}
                  suggestedReply={analysis.reponseSuggeree}
                />
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              {request.respondedAt
                ? t("partnershipDetail.yourReplyDated", {
                    status: partnershipStatusLabel(locale, request.status).toLowerCase(),
                    date: formatDate(request.respondedAt, locale),
                  })
                : t("partnershipDetail.yourReply", {
                    status: partnershipStatusLabel(locale, request.status).toLowerCase(),
                  })}
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {request.ownerReply}
                </p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
