import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Handshake } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { compensationLabel, partnershipStatusLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("memberPages");
  return {
    title: t("meta.partnershipsTitle"),
    robots: { index: false, follow: false },
  };
}

const STATUS_TONES = {
  PENDING: "border-primary/40 bg-primary/10 text-primary",
  ACCEPTED: "border-success/40 bg-success/10 text-success",
  DECLINED: "border-white/[0.15] bg-card/60 text-muted-foreground",
} as const;

/** Boîte de réception des demandes de partenariat du porteur connecté. */
export default async function PartnershipsInboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const t = await getT("memberPages");
  const locale = await getRequestLocale();

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
            {t("partnershipsInbox.title")}
          </h1>
          <p className="data-label">
            {t("partnershipsInbox.meta", { count: requests.length, pending: pendingCount })}
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.12] p-10 text-center text-sm text-muted-foreground">
            <p>{t("partnershipsInbox.emptyBody")}</p>
            <p className="mt-2">{t("partnershipsInbox.emptyHint")}</p>
          </div>
        ) : (
          <ul data-spotlight className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl rounded-se-sm">
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
                        <span className="ms-2 font-mono text-sm text-primary">
                          {t("partnership.budgetUsd", { amount: request.budget })}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {request.project.title} · {compensationLabel(locale, request.compensation)}{" "}
                      · {formatDate(request.createdAt, locale)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                      STATUS_TONES[request.status]
                    )}
                  >
                    {partnershipStatusLabel(locale, request.status)}
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
