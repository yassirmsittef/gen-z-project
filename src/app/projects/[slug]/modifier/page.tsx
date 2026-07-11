import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Lock, PenLine } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { EditProjectForm } from "@/components/edit-project-form";
import { Button } from "@/components/ui/button";
import { formatCredits, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Modifier le projet",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      milestones: { orderBy: { order: "asc" }, select: { order: true, title: true, amount: true } },
      _count: { select: { contributions: true } },
    },
  });
  if (!project) notFound();
  if (project.ownerId !== session.user.id) redirect(`/projects/${slug}`);

  const editable = project.status === "ACTIVE";
  const deletable = project._count.contributions === 0;

  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
          <Link href={`/projects/${slug}`}>
            <ArrowLeft aria-hidden />
            Retour au projet
          </Link>
        </Button>
        <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
          <PenLine className="h-8 w-8 text-primary" aria-hidden />
          Modifier le projet
        </h1>
        <p className="font-medium text-muted-foreground">{project.title}</p>
      </div>

      {/* Cadre financier figé : c'est l'engagement sur lequel on contribue. */}
      <section className="glass rounded-2xl rounded-tr-sm p-5">
        <p className="data-label flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Cadre financier figé
        </p>
        <p className="mt-2 text-sm text-foreground/90">
          Objectif {formatCredits(project.goal)} · fin de campagne le {formatDate(project.deadline)} ·{" "}
          {project.milestones.length} étape{project.milestones.length > 1 ? "s" : ""} (
          {project.milestones.map((m) => formatCredits(m.amount)).join(" + ")})
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Les contributions sont engagées sur ces règles : objectif, étapes et durée ne peuvent
          plus changer.
        </p>
      </section>

      {editable ? (
        <section className="glass rounded-2xl p-6 sm:p-8">
          <EditProjectForm
            project={{
              id: project.id,
              title: project.title,
              pitch: project.pitch,
              description: project.description,
              category: project.category,
              coverUrl: project.coverUrl,
              neededSkills: project.neededSkills,
            }}
          />
        </section>
      ) : (
        <section className="glass rounded-2xl p-6 text-sm text-muted-foreground">
          La campagne est terminée : le contenu du projet est figé. Il reste consultable par la
          communauté, avec ses preuves et son historique.
        </section>
      )}

      <section className="space-y-2 rounded-2xl border border-destructive/25 bg-destructive/[0.05] p-5">
        <p className="data-label text-destructive">Zone de retrait</p>
        {deletable ? (
          <>
            <p className="text-sm text-muted-foreground">
              Personne n&apos;a encore contribué : tu peux retirer définitivement ce projet.
              Étapes, commentaires et abonnés partiront avec lui — il n&apos;y a pas de retour en
              arrière.
            </p>
            <DeleteProjectButton projectId={project.id} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Des membres ont déjà contribué ({project._count.contributions}) : le projet ne peut
            plus être retiré, il vivra son cycle jusqu&apos;au bout — c&apos;est la règle du jeu.
          </p>
        )}
      </section>
    </div>
  );
}
