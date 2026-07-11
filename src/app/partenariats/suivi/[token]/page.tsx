import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Handshake, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PARTNERSHIP_COMPENSATION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

// Lien privé à token : jamais indexé.
export const metadata: Metadata = {
  title: "Suivi de votre demande",
  robots: { index: false, follow: false },
};

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
            Demande envoyée ! Conservez précieusement le lien de cette page : c&apos;est ici que
            la réponse s&apos;affichera.
          </p>
        )}

        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
            <Handshake className="h-7 w-7 text-primary" aria-hidden />
            Votre demande de partenariat
          </h1>
          <p className="data-label">
            {request.brandName} × «{" "}
            <Link href={`/projects/${request.project.slug}`} className="text-primary hover:underline">
              {request.project.title}
            </Link>{" "}
            » · envoyée le {formatDate(request.createdAt)}
          </p>
        </div>

        <Card className="rounded-tr-sm">
          <CardContent className="space-y-5 pt-6">
            <div className="text-sm text-muted-foreground">
              <p>
                Contrepartie proposée : {PARTNERSHIP_COMPENSATION_LABELS[request.compensation]}
                {request.budget != null && (
                  <span className="ml-1.5 font-mono text-primary">{request.budget} $</span>
                )}
              </p>
            </div>

            {request.status === "PENDING" ? (
              <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.07] p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="text-sm">
                  <p className="font-semibold">En cours d&apos;examen</p>
                  <p className="mt-1 text-muted-foreground">
                    {request.project.owner.name} étudie votre proposition. La réponse
                    s&apos;affichera sur cette page — pensez à la mettre dans vos favoris.
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
                      ? "Partenariat accepté"
                      : "Proposition déclinée"}
                    {request.respondedAt && (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatDate(request.respondedAt)}
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

        <p className="text-xs text-muted-foreground">
          Vous représentez une autre marque ou souhaitez compléter votre demande ? Déposez une
          nouvelle proposition depuis la page du projet.
        </p>
      </div>
    </div>
  );
}
