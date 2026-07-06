import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canCreateProject, skillMatchScore } from "@/lib/project-service";
import { CreateProjectForm } from "@/components/create-project-form";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { MIN_CONTRIBUTION } from "@/lib/constants";

export const metadata: Metadata = { title: "Lancer un projet" };

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const allowed = await canCreateProject(session.user.id);

  // Le gate communautaire : contribuer avant de pouvoir poster.
  if (!allowed) {
    const [viewer, candidates] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { skills: true } }),
      prisma.project.findMany({
        where: { status: "ACTIVE", ownerId: { not: session.user.id } },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { owner: true, _count: { select: { contributions: true } } },
      }),
    ]);
    // Compétences de l'utilisateur d'abord : c'est là qu'il peut aider.
    const suggestions = candidates
      .sort(
        (a, b) =>
          skillMatchScore(viewer?.skills ?? [], b.neededSkills) -
          skillMatchScore(viewer?.skills ?? [], a.neededSkills)
      )
      .slice(0, 3);

    return (
      <div className="container max-w-4xl py-16">
        <div className="mb-12 flex flex-col items-center gap-5 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl rounded-br-sm border border-secondary/30 bg-secondary/15 shadow-glow-violet">
            <Lock className="h-8 w-8 text-secondary" aria-hidden />
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">D&apos;abord, contribue</h1>
          <p className="max-w-xl font-medium text-muted-foreground">
            Ici, tout le monde met la main à la pâte avant de demander. Soutiens au moins un projet
            (dès {MIN_CONTRIBUTION} tokens) pour débloquer la création du tien.
          </p>
          <Button asChild>
            <Link href="/projects">Explorer les projets</Link>
          </Button>
        </div>

        {suggestions.length > 0 && (
          <>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Ils attendent ton soutien</h2>
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

  return (
    <div className="container max-w-3xl py-10">
      {/* Réveil du rêve : la page émerge en douceur après la plongée du hero */}
      <div className="hero-reveal mb-8 space-y-2" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-4xl font-semibold tracking-tight">Lance ton projet</h1>
        <p className="font-medium text-muted-foreground">
          Sois transparent·e sur ton plan : c&apos;est lui que la communauté finance, étape par
          étape.
        </p>
      </div>
      <div className="hero-reveal" style={{ animationDelay: "0.35s" }}>
        <CreateProjectForm />
      </div>
    </div>
  );
}
