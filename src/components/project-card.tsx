import Link from "next/link";
import type { ProjectCardData } from "@/lib/project-card-data";
import { Clock, Swords, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReputationBadge } from "@/components/reputation-badge";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { daysLeft, progressPercent } from "@/lib/format";
import { formatMoney } from "@/lib/money";

export type { ProjectCardData };

/**
 * `replaces` : les marques que ce projet s'est engagé à remplacer (appels du
 * fil auxquels il répond). Optionnel — les pages qui n'ont pas fait la
 * requête n'affichent simplement pas le bandeau.
 */
export function ProjectCard({
  project,
  replaces = [],
}: {
  project: ProjectCardData;
  replaces?: { target: string }[];
}) {
  const percent = progressPercent(project.raised, project.goal);
  const remaining = daysLeft(project.deadline);

  return (
    <Link href={`/projects/${project.slug}`} data-reveal className="group block h-full">
      {/* Coin signature (rounded-tr-sm) + hover : élévation et glow, jamais de scale */}
      <Card className="flex h-full flex-col overflow-hidden rounded-tr-sm transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-glow">
        {project.coverUrl && (
          <div className="border-b border-white/[0.06]">
            {/* Domaine libre (URL collée par le porteur) : <img> natif, pas next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverUrl}
              alt=""
              loading="lazy"
              width={1280}
              height={720}
              className="aspect-video w-full object-cover"
            />
          </div>
        )}
        {replaces.length > 0 && (
          <p className="flex items-center gap-1.5 border-b border-secondary/20 bg-secondary/[0.08] px-6 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-secondary">
            <Swords aria-hidden className="h-3 w-3 shrink-0" />
            <span translate="no" className="truncate">
              Remplace {replaces.map((call) => call.target).join(", ")}
            </span>
          </p>
        )}
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{CATEGORY_LABELS[project.category]}</Badge>
            <StatusBadge status={project.status} />
          </div>
          <div className="space-y-1.5">
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">
              {project.title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{project.pitch}</p>
          </div>
        </CardHeader>

        <CardContent className="mt-auto space-y-3">
          <Progress value={percent} />
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">
              {formatMoney(project.raised, project.currency)}
              <span className="font-normal text-muted-foreground"> / {formatMoney(project.goal, project.currency)}</span>
            </span>
            <span className="font-display text-base font-semibold text-primary">{percent}%</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {project._count.contributions} contribution{project._count.contributions > 1 ? "s" : ""}
            </span>
            {project.status === "ACTIVE" && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {remaining} j restants
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="gap-2 border-t border-white/[0.08] pt-4 text-sm">
          <UserAvatar name={project.owner.name} avatarUrl={project.owner.avatarUrl} className="h-7 w-7 text-[10px]" />
          <span className="truncate font-medium">{project.owner.name}</span>
          <ReputationBadge
            reputation={project.owner.reputation}
            admin={project.owner.role === "ADMIN"}
            showScore={false}
            className="ml-auto"
          />
        </CardFooter>
      </Card>
    </Link>
  );
}
