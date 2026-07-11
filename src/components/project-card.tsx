import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Clock, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReputationBadge } from "@/components/reputation-badge";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { daysLeft, formatCredits, progressPercent } from "@/lib/format";

export type ProjectCardData = Prisma.ProjectGetPayload<{
  include: { owner: true; _count: { select: { contributions: true } } };
}>;

export function ProjectCard({ project }: { project: ProjectCardData }) {
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
              className="aspect-video w-full object-cover"
            />
          </div>
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
              {formatCredits(project.raised)}
              <span className="font-normal text-muted-foreground"> / {formatCredits(project.goal)}</span>
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
            showScore={false}
            className="ml-auto"
          />
        </CardFooter>
      </Card>
    </Link>
  );
}
