import Link from "next/link";
import { notFound } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { ReputationBadge } from "@/components/reputation-badge";
import { ReputationRing } from "@/components/reputation-ring";
import { SkillTag } from "@/components/skill-tag";
import { UserAvatar } from "@/components/user-avatar";
import { formatCredits, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      projects: {
        include: { owner: true, _count: { select: { contributions: true } } },
        orderBy: { createdAt: "desc" },
      },
      reputationEvents: { orderBy: { createdAt: "desc" }, take: 8 },
      _count: { select: { contributions: true, votes: true } },
    },
  });
  if (!user) notFound();

  return (
    <div className="container space-y-10 py-10">
      <div className="flex flex-wrap items-center gap-5">
        <ReputationRing reputation={user.reputation}>
          <UserAvatar name={user.name} className="h-20 w-20 border-0 text-2xl" />
        </ReputationRing>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <ReputationBadge reputation={user.reputation} />
            <span>Membre depuis {formatDate(user.createdAt)}</span>
          </div>
          {user.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {user.skills.map((skill) => (
                <SkillTag key={skill} skill={skill} />
              ))}
            </div>
          )}
        </div>
        {session?.user?.id && session.user.id !== user.id && (
          <Button variant="outline" size="sm" asChild className="ml-auto">
            <Link href={`/chat/${user.id}`}>
              <MessagesSquare aria-hidden />
              Envoyer un message
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{user.projects.length}</p>
            <p className="text-sm text-muted-foreground">Projets lancés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{user._count.contributions}</p>
            <p className="text-sm text-muted-foreground">Contributions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{formatCredits(user.totalContributed)}</p>
            <p className="text-sm text-muted-foreground">Investis dans la communauté</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{user._count.votes}</p>
            <p className="text-sm text-muted-foreground">Votes sur des preuves</p>
          </CardContent>
        </Card>
      </div>

      {user.projects.length > 0 && (
        <section className="space-y-4">
          <h2 data-reveal className="text-2xl font-semibold tracking-tight">Ses projets</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {user.reputationEvents.length > 0 && (
        <section data-reveal className="max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Activité récente</h2>
          <Card>
            <CardContent className="divide-y pt-6">
              {user.reputationEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{event.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      "ml-auto shrink-0 font-bold",
                      event.delta >= 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {event.delta >= 0 ? "+" : ""}
                    {event.delta} rép.
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
