import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { Flame, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { progressPercent } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Classements" };

type RankedProject = Prisma.ProjectGetPayload<{
  include: { owner: true; _count: { select: { contributions: true } } };
}>;

function RankedList({ projects, showPercent }: { projects: RankedProject[]; showPercent: boolean }) {
  if (projects.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/[0.12] p-8 text-center text-sm text-muted-foreground">
        Rien à classer pour l&apos;instant.
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
                {CATEGORY_LABELS[project.category]} · {project._count.contributions} soutien
                {project._count.contributions > 1 ? "s" : ""}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <UserAvatar name={project.owner.name} avatarUrl={project.owner.avatarUrl} className="h-7 w-7 text-[10px]" />
              <span className="max-w-24 truncate text-sm text-muted-foreground">
                {project.owner.name}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm">{formatMoney(project.raised, project.currency)}</p>
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
  const include = { owner: true, _count: { select: { contributions: true } } } as const;
  const [active, completed] = await Promise.all([
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
  ]);

  return (
    <div className="page-halo">
      <div className="container py-10">
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">Classements</h1>
          <p className="data-label">Les projets qui font vibrer la communauté</p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <section data-reveal className="min-w-0 space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Flame className="h-6 w-6 text-primary" aria-hidden />
              En campagne
            </h2>
            <RankedList projects={active} showPercent />
          </section>

          <section data-reveal className="min-w-0 space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Trophy className="h-6 w-6 text-secondary" aria-hidden />
              Financés &amp; réalisés
            </h2>
            <RankedList projects={completed} showPercent={false} />
          </section>
        </div>
      </div>
    </div>
  );
}
