import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Handshake } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  PARTNERSHIP_COMPENSATION_LABELS,
  PARTNERSHIP_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Partenariats",
  robots: { index: false, follow: false },
};

const STATUS_TONES = {
  PENDING: "border-primary/40 bg-primary/10 text-primary",
  ACCEPTED: "border-success/40 bg-success/10 text-success",
  DECLINED: "border-white/[0.15] bg-card/60 text-muted-foreground",
} as const;

/** Boîte de réception des demandes de partenariat du porteur connecté. */
export default async function PartnershipsInboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const requests = await prisma.partnershipRequest.findMany({
    where: { project: { ownerId: session.user.id } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { project: { select: { title: true, slug: true } } },
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="page-halo">
      <div className="container max-w-4xl space-y-8 py-10">
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
            <Handshake className="h-8 w-8 text-primary" aria-hidden />
            Partenariats
          </h1>
          <p className="data-label">
            {requests.length} demande{requests.length > 1 ? "s" : ""} reçue
            {requests.length > 1 ? "s" : ""} · {pendingCount} en attente · copilote IA avant
            chaque réponse
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.12] p-10 text-center text-sm text-muted-foreground">
            <p>
              Aucune demande pour l&apos;instant. Les marques peuvent te proposer un partenariat
              depuis la page de chacun de tes projets (« Partenariat marque »).
            </p>
            <p className="mt-2">
              Quand une demande arrive, le copilote IA t&apos;aide à vérifier qu&apos;elle est
              fiable et équitable avant de répondre.
            </p>
          </div>
        ) : (
          <ul data-spotlight className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl rounded-tr-sm">
            {requests.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/partenariats/${request.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 transition-colors duration-200 hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {request.brandName}
                      {request.budget != null && (
                        <span className="ml-2 font-mono text-sm text-primary">
                          {request.budget} $
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {request.project.title} · {PARTNERSHIP_COMPENSATION_LABELS[request.compensation]}{" "}
                      · {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                      STATUS_TONES[request.status]
                    )}
                  >
                    {PARTNERSHIP_STATUS_LABELS[request.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
