import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { skillMatchScore } from "@/lib/project-service";
import { Button } from "@/components/ui/button";
import { ProjectCard, type ProjectCardData } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("rebound");
  return { title: t("meta.title") };
}

export default async function ReboundPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const t = await getT("rebound");
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
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl rounded-ee-sm border border-success/30 bg-success/15 shadow-glow-teal">
          <Sparkles className="h-8 w-8 text-success" aria-hidden />
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {failedProject
            ? t("hero.failedTitle", { title: failedProject.title })
            : t("hero.title")}
        </h1>
        <p className="max-w-2xl font-medium text-muted-foreground">
          {t("hero.body")}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/projects">{t("hero.support")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects/new">{t("hero.relaunch")}</Link>
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <>
          <h2 data-reveal className="mb-6 text-2xl font-semibold tracking-tight">
            {t("suggestions.heading")}
          </h2>
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
