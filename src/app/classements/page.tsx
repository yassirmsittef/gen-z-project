import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { Flame, Rocket, Swords, Trophy } from "lucide-react";
import { mostTargetedBrands } from "@/lib/boycott";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/user-avatar";
import { progressPercent } from "@/lib/format";
import { categoryLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/locales";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import type { Translator } from "@/lib/i18n/t";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Messages } from "@/messages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("communityPages");
  return { title: t("meta.rankingsTitle") };
}

type RankedProject = Prisma.ProjectGetPayload<{
  include: typeof PROJECT_CARD_INCLUDE;
}>;

function RankedList({
  projects,
  showPercent,
  t,
  locale,
}: {
  projects: RankedProject[];
  showPercent: boolean;
  t: Translator<Messages["communityPages"]>;
  locale: Locale;
}) {
  if (projects.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/[0.12] p-8 text-center text-sm text-muted-foreground">
        {t("rankings.empty")}
      </p>
    );
  }
  return (
    <ol data-spotlight className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
      {projects.map((project, index) => (
        <li key={project.id}>
          <Link
            href={`/projects/${project.slug}`}
            className={cn(
              "flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-accent",
              index === 0 && "bg-primary/[0.07]"
            )}
          >
            <span
              className={cn(
                "w-10 shrink-0 text-center font-display text-2xl font-semibold",
                index === 0
                  ? "bg-accent-gradient bg-clip-text text-transparent"
                  : index < 3
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{project.title}</p>
              <p className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {categoryLabel(locale, project.category)} ·{" "}
                {t("count.supports", { count: project._count.contributions })}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <UserAvatar name={project.owner.name} avatarUrl={project.owner.avatarUrl} className="h-7 w-7 text-[10px]" />
              <span className="max-w-24 truncate text-sm text-muted-foreground">
                {project.owner.name}
              </span>
            </div>
            <div className="shrink-0 text-end">
              <p className="font-mono text-sm">
                {formatMoney(project.raised, project.currency, locale)}
              </p>
              {showPercent && (
                <p className="font-mono text-[10px] text-primary">
                  {progressPercent(project.raised, project.goal)}%
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function RankingsPage() {
  const t = await getT("communityPages");
  const locale = await getRequestLocale();
  const include = PROJECT_CARD_INCLUDE;
  const [active, completed, brands] = await Promise.all([
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ raised: "desc" }, { createdAt: "asc" }],
      take: 10,
      include,
    }),
    prisma.project.findMany({
      where: { status: { in: ["COMPLETED", "FUNDED"] } },
      orderBy: [{ raised: "desc" }, { createdAt: "asc" }],
      take: 10,
      include,
    }),
    mostTargetedBrands(10),
  ]);

  return (
    <div className="page-halo">
      <div className="container py-10">
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">{t("rankings.title")}</h1>
          <p className="data-label">{t("rankings.subtitle")}</p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <section data-reveal className="min-w-0 space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Flame className="h-6 w-6 text-primary" aria-hidden />
              {t("rankings.active")}
            </h2>
            <RankedList projects={active} showPercent t={t} locale={locale} />
          </section>

          <section data-reveal className="min-w-0 space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Trophy className="h-6 w-6 text-secondary" aria-hidden />
              {t("rankings.funded")}
            </h2>
            <RankedList projects={completed} showPercent={false} t={t} locale={locale} />
          </section>
        </div>

        {/* La demande agrégée. Placée sous les projets et pleine largeur :
            c'est une lecture d'ensemble, pas une colonne de plus. */}
        {brands.length > 0 && (
          <section data-reveal className="mt-12 min-w-0 space-y-4">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <Swords className="h-6 w-6 text-secondary" aria-hidden />
                {t("brands.title")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("brands.body")}</p>
            </div>

            <ol data-spotlight className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
              {brands.map((brand, index) => (
                <li key={brand.slug}>
                  <Link
                    href={`/appels/${brand.slug}`}
                    className="flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-accent"
                  >
                    <span
                      className={cn(
                        "w-7 shrink-0 text-center font-display text-lg font-semibold",
                        index === 0 ? "text-secondary" : "text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span translate="no" className="block truncate font-semibold">
                        {brand.target}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t("brands.calls", { count: brand.calls })}
                        {brand.answers > 0 ? (
                          <span className="text-success">
                            {t("brands.answersOnTheWay", { count: brand.answers })}
                          </span>
                        ) : (
                          t("brands.nobodyYet")
                        )}
                      </span>
                    </span>
                    {brand.answers === 0 && (
                      <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-dashed border-secondary/30 px-3 py-1 text-xs font-semibold text-secondary sm:inline-flex">
                        <Rocket aria-hidden className="h-3 w-3" />
                        {t("brands.upForGrabs")}
                      </span>
                    )}
                    <span className="shrink-0 text-end">
                      <span className="block font-mono text-lg font-semibold tabular-nums text-secondary">
                        {brand.voices}
                      </span>
                      <span className="data-label">{t("brands.voices")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
