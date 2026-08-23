import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { skillMatchScore } from "@/lib/project-service";
import { Button } from "@/components/ui/button";
import { ProjectCard, type ProjectCardData } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";

export const metadata: Metadata = { title: "Rebondir" };

export default async function ReboundPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const session = await auth();

  const [failedProject, viewer] = await Promise.all([
    from ? prisma.project.findUnique({ where: { slug: from } }) : null,
    session?.user?.id
      ? prisma.user.findUnique({ where: { id: session.user.id }, select: { skills: true } })
      : null,
  ]);

  const candidates: ProjectCardData[] = await prisma.project.findMany({
    where: {
      status: "ACTIVE",
      ...(session?.user?.id ? { ownerId: { not: session.user.id } } : {}),
      ...(failedProject ? { id: { not: failedProject.id } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: PROJECT_CARD_INCLUDE,
  });

  // Réorientation : compétences de l'utilisateur d'abord, même catégorie ensuite.
  const suggestions = candidates
    .map((project) => ({
      project,
      score:
        skillMatchScore(viewer?.skills ?? [], project.neededSkills) * 10 +
        (failedProject && project.category === failedProject.category ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.project);

  return (
    <div className="container py-16">
      <div className="mb-12 flex flex-col items-center gap-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl rounded-br-sm border border-success/30 bg-success/15 shadow-glow-teal">
          <Sparkles className="h-8 w-8 text-success" aria-hidden />
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {failedProject
            ? `« ${failedProject.title} » n'a pas abouti. Et alors ?`
            : "Un projet raté n'est pas une fin."}
        </h1>
        <p className="max-w-2xl font-medium text-muted-foreground">
          Ici, l&apos;échec n&apos;est pas une sortie — c&apos;est un passage. Les contributeurs
          ont été remboursés, ta réputation encaisse le coup mais se reconstruit à chaque
          contribution, chaque vote, chaque étape validée. Le meilleur moyen de rebondir :
          replonger dans la communauté.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/projects">Soutenir un projet</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects/new">Relancer un projet</Link>
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <>
          <h2 data-reveal className="mb-6 text-2xl font-semibold tracking-tight">Des opportunités qui t&apos;attendent</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
