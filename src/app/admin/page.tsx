import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Banknote,
  Clapperboard,
  FolderKanban,
  Handshake,
  HeartHandshake,
  ShieldAlert,
  Swords,
  Undo2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { auth } from "@/auth";
import { liveAnswer } from "@/lib/boycott";
import { storageStatus } from "@/lib/call-videos";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/moderation";
import { VIDEO_STORAGE_WARN_RATIO } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { statusLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { formatMoney, formatMoneyRounded } from "@/lib/money";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("adminPages");
  return {
    title: t("meta.cockpitTitle"),
    robots: { index: false, follow: false },
  };
}

/**
 * Cockpit admin : les chiffres de la plateforme d'un coup d'œil — collecte,
 * membres, projets, argent en mouvement (versements dus, remboursements à
 * rejouer) et files d'attente (signalements, partenariats). Lecture seule,
 * les actions vivent sur les pages dédiées.
 */

const DAYS = 30;

/** Regroupe des montants par devise (les sommes inter-devises n'existent qu'en équivalent USD). */
function sumByCurrency(rows: { currency: string; amountMinor: number }[]) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.currency, (totals.get(row.currency) ?? 0) + row.amountMinor);
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function AdminCockpitPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await isAdmin(session.user.id))) redirect("/");

  const locale = await getRequestLocale();
  const t = await getT("adminPages");

  const since7 = new Date(Date.now() - 7 * 86_400_000);
  const since30 = new Date(Date.now() - (DAYS - 1) * 86_400_000);

  const [
    totalUsers,
    newUsers7,
    projectsByStatus,
    contribAgg,
    recentContribs,
    contribByProject,
    projectCurrencies,
    pendingRefunds,
    payoutRows,
    openReports,
    pendingPartnerships,
    openCalls,
    answeredCalls,
    storage,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since7 } } }),
    prisma.project.groupBy({ by: ["status"], _count: true }),
    prisma.contribution.aggregate({ _count: true, _sum: { usdCents: true } }),
    prisma.contribution.findMany({
      where: { createdAt: { gte: since30 } },
      select: { usdCents: true, createdAt: true },
    }),
    prisma.contribution.groupBy({ by: ["projectId"], _sum: { amount: true } }),
    prisma.project.findMany({ select: { id: true, currency: true } }),
    // À rejouer par le cron : fléchés remboursement, pas encore exécutés chez
    // Stripe. Les contributions sans payment_intent (seed, fixtures) sont
    // ignorées par l'exécuteur — les compter serait du bruit éternel.
    prisma.contribution.findMany({
      where: {
        refunded: true,
        stripeRefundId: null,
        refundDueMinor: { gt: 0 },
        stripePaymentIntentId: { not: null },
      },
      select: { refundDueMinor: true, project: { select: { currency: true } } },
    }),
    prisma.milestonePayout.findMany({
      select: {
        amountMinor: true,
        stripeTransferId: true,
        contribution: { select: { project: { select: { currency: true } } } },
      },
    }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.partnershipRequest.count({ where: { status: "PENDING" } }),
    prisma.boycottCall.count({ where: { removedAt: null } }),
    // `liveAnswer` et pas `some: {}` : sinon une réponse détachée ou portée
    // par un projet échoué gonfle le « taux de transformation », qui ne peut
    // alors que monter — et contredit le tri « Sans remplaçant » du fil.
    prisma.boycottCall.count({ where: { removedAt: null, answers: { some: liveAnswer } } }),
    storageStatus(),
  ]);

  // ----- Collecte par jour (30 j) en équivalent USD — seule échelle commune.
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const dailyTotals = new Map<string, number>();
  for (const c of recentContribs) {
    dailyTotals.set(day(c.createdAt), (dailyTotals.get(day(c.createdAt)) ?? 0) + c.usdCents);
  }
  const buckets: { date: string; usdCents: number }[] = [];
  const cursor = new Date(since30);
  for (let i = 0; i < DAYS; i++) {
    buckets.push({ date: day(cursor), usdCents: dailyTotals.get(day(cursor)) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const recentUsd = buckets.reduce((sum, b) => sum + b.usdCents, 0);

  const W = 640;
  const H = 64;
  const PAD = 3;
  const max = Math.max(...buckets.map((b) => b.usdCents), 1);
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (DAYS - 1);
  const y = (v: number) => H - PAD - (v * (H - PAD * 2)) / max;
  const points = buckets.map((b, i) => `${x(i).toFixed(1)},${y(b.usdCents).toFixed(1)}`);
  const area = `M ${points.join(" L ")} L ${x(DAYS - 1).toFixed(1)},${H - PAD} L ${x(0).toFixed(1)},${H - PAD} Z`;

  // ----- Volumes par devise.
  const currencyOf = new Map(projectCurrencies.map((p) => [p.id, p.currency]));
  const collectedByCurrency = sumByCurrency(
    contribByProject.flatMap((g) => {
      const currency = currencyOf.get(g.projectId);
      return currency ? [{ currency, amountMinor: g._sum.amount ?? 0 }] : [];
    })
  );
  const duePayouts = payoutRows.filter((p) => !p.stripeTransferId);
  const duePayoutsByCurrency = sumByCurrency(
    duePayouts.map((p) => ({
      currency: p.contribution.project.currency,
      amountMinor: p.amountMinor,
    }))
  );
  const paidPayouts = payoutRows.length - duePayouts.length;
  const refundsByCurrency = sumByCurrency(
    pendingRefunds.map((r) => ({ currency: r.project.currency, amountMinor: r.refundDueMinor }))
  );

  const projectCount = projectsByStatus.reduce((sum, g) => sum + g._count, 0);
  const statusOrder = ["ACTIVE", "FUNDED", "COMPLETED", "FAILED"] as const;

  return (
    <div className="page-halo">
      <div className="container max-w-5xl space-y-8 py-10 md:py-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-label flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-primary" aria-hidden />
              {t("cockpit.zone")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {t("cockpit.title")}
            </h1>
          </div>
          <Link
            href="/admin/signalements"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-white/20 hover:text-foreground"
          >
            {t("cockpit.moderationQueue")}
            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
          </Link>
        </header>

        {/* Collecte par jour — la seule visualisation, tout le reste en tuiles. */}
        <section className="glass rounded-2xl rounded-se-sm p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {t("chart.caption", { days: DAYS })}
            </p>
            <p className="font-display text-lg font-semibold">
              {formatMoneyRounded(recentUsd, "usd", locale)}
            </p>
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-16 w-full"
            role="img"
            aria-label={t("chart.ariaLabel", {
              days: DAYS,
              total: formatMoney(recentUsd, "usd", locale),
            })}
          >
            <defs>
              <linearGradient id="admin-aurora" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#5EEAD4" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
              <linearGradient id="admin-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#38BDF8" stopOpacity="0.25" />
                <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1={PAD}
              y1={H - PAD}
              x2={W - PAD}
              y2={H - PAD}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <path d={area} fill="url(#admin-fill)" />
            <polyline
              points={points.join(" ")}
              fill="none"
              stroke="url(#admin-aurora)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={x(DAYS - 1)}
              cy={y(buckets[DAYS - 1].usdCents)}
              r="3"
              fill="#38BDF8"
              stroke="#0B0E14"
              strokeWidth="2"
            />
            {buckets.map((b, i) => (
              <rect
                key={b.date}
                x={x(i) - (W - PAD * 2) / (DAYS - 1) / 2}
                y="0"
                width={(W - PAD * 2) / (DAYS - 1)}
                height={H}
                fill="transparent"
              >
                <title>
                  {t("chart.dayTooltip", {
                    date: formatDate(new Date(b.date), locale),
                    amount: formatMoney(b.usdCents, "usd", locale),
                  })}
                </title>
              </rect>
            ))}
          </svg>
        </section>

        <section aria-label={t("tiles.ariaLabel")} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile Icon={Users} label={t("tiles.members")} value={String(totalUsers)}>
            {newUsers7 > 0 ? t("tiles.membersNew", { count: newUsers7 }) : t("tiles.membersNone")}
          </Tile>

          <Tile
            Icon={HeartHandshake}
            label={t("tiles.contributions")}
            value={String(contribAgg._count)}
          >
            {t("tiles.contributionsTotal", {
              amount: formatMoneyRounded(contribAgg._sum.usdCents ?? 0, "usd", locale),
            })}
          </Tile>

          <Tile Icon={FolderKanban} label={t("tiles.projects")} value={String(projectCount)}>
            {statusOrder
              .map((status) => {
                const count = projectsByStatus.find((g) => g.status === status)?._count ?? 0;
                return `${statusLabel(locale, status)} ${count}`;
              })
              .join(" · ")}
          </Tile>

          {/* Le taux de transformation du fil : un appel sans remplaçant est
              une demande qui attend, pas un échec — mais si le ratio reste à
              zéro, le fil ne sert qu'à râler. */}
          <Tile Icon={Swords} label={t("tiles.calls")} value={String(openCalls)}>
            {openCalls === 0
              ? t("tiles.callsNone")
              : t("tiles.callsSplit", {
                  answered: answeredCalls,
                  unanswered: openCalls - answeredCalls,
                })}
          </Tile>

          <Tile Icon={Banknote} label={t("tiles.collected")} value={collectedByCurrency.length === 0 ? "—" : formatMoney(collectedByCurrency[0][1], collectedByCurrency[0][0], locale)}>
            {collectedByCurrency.length > 1
              ? collectedByCurrency
                  .slice(1)
                  .map(([currency, amount]) => formatMoney(amount, currency, locale))
                  .join(" · ")
              : t("tiles.collectedSingle")}
          </Tile>

          <Tile
            Icon={Banknote}
            label={t("tiles.payouts")}
            value={
              duePayoutsByCurrency.length === 0
                ? t("tiles.payoutsUpToDate")
                : duePayoutsByCurrency
                    .map(([currency, amount]) => formatMoney(amount, currency, locale))
                    .join(" · ")
            }
            tone={duePayouts.length > 0 ? "amber" : undefined}
          >
            {duePayouts.length > 0
              ? `${t("tiles.payoutsPending", { count: duePayouts.length })} · ${t("tiles.payoutsPaidShort", { count: paidPayouts })}`
              : t("tiles.payoutsPaid", { count: paidPayouts })}
          </Tile>

          <Tile
            Icon={Undo2}
            label={t("tiles.refunds")}
            value={
              refundsByCurrency.length === 0
                ? t("tiles.refundsNone")
                : refundsByCurrency
                    .map(([currency, amount]) => formatMoney(amount, currency, locale))
                    .join(" · ")
            }
            tone={pendingRefunds.length > 0 ? "amber" : undefined}
          >
            {pendingRefunds.length > 0
              ? t("tiles.refundsPending", { count: pendingRefunds.length })
              : t("tiles.refundsIdle")}
          </Tile>

          <Link href="/admin/signalements" className="group block">
            <Tile
              Icon={ShieldAlert}
              label={t("tiles.reports")}
              value={String(openReports)}
              tone={openReports > 0 ? "red" : undefined}
              interactive
            >
              {openReports > 0 ? t("tiles.reportsOpen") : t("tiles.reportsNone")}
            </Tile>
          </Link>

          <Tile Icon={Handshake} label={t("tiles.partnerships")} value={String(pendingPartnerships)}>
            {t("tiles.partnershipsBody")}
          </Tile>

          {/* La jauge que Vercel Hobby n'offre pas : le plan coupe à 1 Go de
              Blob sans prévenir, notre garde refuse les dépôts avant — cette
              tuile dit combien de marge il reste. */}
          <Tile
            id="stockage"
            Icon={Clapperboard}
            label={t("tiles.storage")}
            value={
              storage.full
                ? t("tiles.storageFull")
                : // Arrondi vers le BAS : arrondir au plus proche afficherait
                  // « 80 % » en teinte neutre juste avant le seuil d'alerte,
                  // puis « 80 % » en ambre juste après — deux fois le même
                  // chiffre pour deux états différents.
                  t("tiles.storagePercent", {
                    percent: Math.floor((storage.usedBytes / storage.capBytes) * 100),
                  })
            }
            tone={
              storage.full
                ? "red"
                : storage.usedBytes >= storage.capBytes * VIDEO_STORAGE_WARN_RATIO
                  ? "amber"
                  : undefined
            }
          >
            {storage.usedBytes === 0
              ? t("tiles.storageEmpty", { cap: Math.round(storage.capBytes / (1024 * 1024)) })
              : `${t("tiles.storageUsed", {
                  used: Math.round(storage.usedBytes / (1024 * 1024)),
                  cap: Math.round(storage.capBytes / (1024 * 1024)),
                  video: Math.round(storage.videoBytes / (1024 * 1024)),
                  photos: Math.round(storage.avatarBytes / (1024 * 1024)),
                })}${storage.full ? t("tiles.storageRefusedSuffix") : ""}`}
          </Tile>
        </section>
      </div>
    </div>
  );
}

function Tile({
  Icon,
  label,
  value,
  children,
  tone,
  interactive = false,
  id,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  children: React.ReactNode;
  tone?: "amber" | "red";
  interactive?: boolean;
  /** Ancre visée par les notifications (scroll-mt : sous la barre collante). */
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`glass h-full scroll-mt-24 rounded-2xl rounded-se-sm p-4 ${
        tone === "amber" ? "border-amber-400/25" : tone === "red" ? "border-destructive/30" : ""
      } ${interactive ? "transition duration-200 ease-out group-hover:-translate-y-1 group-hover:border-white/20" : ""}`}
    >
      <p className="data-label flex items-center gap-1.5">
        <Icon
          className={`h-3.5 w-3.5 ${
            tone === "amber" ? "text-amber-300" : tone === "red" ? "text-destructive" : "text-primary"
          }`}
          aria-hidden
        />
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold [overflow-wrap:anywhere]">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{children}</p>
    </div>
  );
}
