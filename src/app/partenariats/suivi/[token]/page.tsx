import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Handshake, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { compensationLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";

// Lien privé à token : jamais indexé.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("memberPages");
  return {
    title: t("meta.trackingTitle"),
    robots: { index: false, follow: false },
  };
}

/**
 * Page PUBLIQUE de suivi pour la marque (lien privé à token, sans compte).
 * Montre uniquement le statut et la réponse — jamais l'analyse interne.
 */
export default async function PartnershipTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ nouveau?: string }>;
}) {
  const { token } = await params;
  const { nouveau } = await searchParams;
  const t = await getT("memberPages");
  const locale = await getRequestLocale();

  const request = await prisma.partnershipRequest.findUnique({
    where: { trackToken: token },
    include: { project: { select: { title: true, slug: true, owner: { select: { name: true } } } } },
  });
  if (!request) notFound();

  return (
    <div className="page-halo">
      <div className="container max-w-2xl space-y-8 py-10">
        {nouveau === "1" && (
          <p
            role="status"
            className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success"
          >
            {t("tracking.sentBanner")}
          </p>
        )}

        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
            <Handshake className="h-7 w-7 text-primary" aria-hidden />
            {t("tracking.title")}
          </h1>
          <p className="data-label">
            {request.brandName} {t("tracking.pairing")}{" "}
            <Link href={`/projects/${request.project.slug}`} className="text-primary hover:underline">
              {request.project.title}
            </Link>{" "}
            {t("tracking.sentOn", { date: formatDate(request.createdAt, locale) })}
          </p>
        </div>

        <Card className="rounded-se-sm">
          <CardContent className="space-y-5 pt-6">
            <div className="text-sm text-muted-foreground">
              <p>
                {t("tracking.compensationProposed", {
                  compensation: compensationLabel(locale, request.compensation),
                })}
                {request.budget != null && (
                  <span className="ms-1.5 font-mono text-primary">
                    {t("partnership.budgetUsd", { amount: request.budget })}
                  </span>
                )}
              </p>
            </div>

            {request.status === "PENDING" ? (
              <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.07] p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="text-sm">
                  <p className="font-semibold">{t("tracking.pendingTitle")}</p>
                  <p className="mt-1 text-muted-foreground">
                    {t("tracking.pendingBody", { name: request.project.owner.name ?? "" })}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={
                  request.status === "ACCEPTED"
                    ? "flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4"
                    : "flex items-start gap-3 rounded-2xl border border-white/[0.12] bg-card/60 p-4"
                }
              >
                {request.status === "ACCEPTED" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">
                    {request.status === "ACCEPTED"
                      ? t("tracking.accepted")
                      : t("tracking.declined")}
                    {request.respondedAt && (
                      <span className="ms-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatDate(request.respondedAt, locale)}
                      </span>
                    )}
                  </p>
                  {request.ownerReply && (
                    <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">
                      {request.ownerReply}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">{t("tracking.footerNote")}</p>
      </div>
    </div>
  );
}
