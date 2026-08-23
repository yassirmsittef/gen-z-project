import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { auth } from "@/auth";
import { getCallBrief } from "@/lib/boycott";
import { prisma } from "@/lib/prisma";
import { gateProgress, skillMatchScore } from "@/lib/project-service";
import { CreateProjectForm } from "@/components/create-project-form";
import { ProjectCard } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Lancer un projet" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ appel?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Projet lancé depuis un appel du fil : son cahier des charges accompagne
  // le porteur jusqu'au bout, gate compris.
  const callSlug = (await searchParams).appel;
  const answersCall = callSlug ? await getCallBrief(callSlug) : null;

  const gate = await gateProgress(session.user.id);

  // Le gate communautaire : 50 $ de contributions cumulées avant de poster.
  if (!gate.reached) {
    const [viewer, candidates] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { skills: true } }),
      prisma.project.findMany({
        where: { status: "ACTIVE", ownerId: { not: session.user.id } },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: PROJECT_CARD_INCLUDE,
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
            Ici, tout le monde met la main à la pâte avant de demander : il faut{" "}
            {formatMoney(gate.requiredCents, "usd")} de contributions cumulées (toutes devises
            confondues, converties au jour du paiement) pour débloquer la création de ton projet.
          </p>

          {/* La jauge du gate : traînée lumineuse vers les 50 $ */}
          <div className="glass w-full max-w-md space-y-3 rounded-2xl rounded-tr-sm p-5 text-left">
            <div className="flex items-baseline justify-between gap-3">
              <p className="data-label">Ta progression</p>
              <p className="font-display text-2xl font-semibold text-primary">{gate.percent}&nbsp;%</p>
            </div>
            <Progress
              value={gate.percent}
              aria-label={`Progression vers le droit de poster : ${gate.percent} %`}
            />
            <p className="text-sm text-muted-foreground">
              <span className="font-mono font-semibold text-foreground">
                {formatMoney(gate.cents, "usd")}
              </span>{" "}
              sur {formatMoney(gate.requiredCents, "usd")} —{" "}
              {formatMoney(gate.requiredCents - gate.cents, "usd")} restants.
            </p>
          </div>

          {/* Le gate ne doit pas faire oublier l'appel : on rappelle la
              promesse et on garde le lien de retour, paramètre compris. */}
          {answersCall && (
            <div className="w-full max-w-md rounded-2xl rounded-tr-sm border border-secondary/25 bg-secondary/[0.07] p-4 text-left">
              <p className="data-label">Tu voulais remplacer</p>
              <p className="mt-1 font-display text-lg font-semibold">{answersCall.target}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                L&apos;appel t&apos;attend : contribue d&apos;abord, puis reviens le prendre.{" "}
                <Link
                  href={`/appels/${answersCall.slug}`}
                  className="text-secondary underline-offset-4 hover:underline"
                >
                  Revoir l&apos;appel
                </Link>
              </p>
            </div>
          )}

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
        <h1 className="text-4xl font-semibold tracking-tight">
          {answersCall ? `Remplace ${answersCall.target}` : "Lance ton projet"}
        </h1>
        <p className="font-medium text-muted-foreground">
          {answersCall
            ? "Quelqu'un a décrit ce qu'il achèterait à la place. Montre comment tu comptes le construire, étape par étape."
            : "Sois transparent·e sur ton plan : c'est lui que la communauté finance, étape par étape."}
        </p>
      </div>
      <div className="hero-reveal" style={{ animationDelay: "0.35s" }}>
        <CreateProjectForm answersCall={answersCall ?? undefined} />
      </div>
    </div>
  );
}
