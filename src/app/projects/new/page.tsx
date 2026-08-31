import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { auth } from "@/auth";
import { getCallBrief } from "@/lib/boycott";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { gateProgress, skillMatchScore } from "@/lib/project-service";
import { CreateProjectForm } from "@/components/create-project-form";
import { ProjectCard } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/money";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("projectsPages");
  return { title: t("meta.newTitle") };
}

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ appel?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [locale, t] = [await getRequestLocale(), await getT("projectsPages")];

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
          <h1 className="text-4xl font-semibold tracking-tight">{t("gate.title")}</h1>
          <p className="max-w-xl font-medium text-muted-foreground">
            {t("gate.body", { required: formatMoney(gate.requiredCents, "usd", locale) })}
          </p>

          {/* La jauge du gate : traînée lumineuse vers les 50 $ */}
          <div className="glass w-full max-w-md space-y-3 rounded-2xl rounded-tr-sm p-5 text-left">
            <div className="flex items-baseline justify-between gap-3">
              <p className="data-label">{t("gate.progressLabel")}</p>
              <p className="font-display text-2xl font-semibold text-primary">
                {t("gate.percent", { percent: gate.percent })}
              </p>
            </div>
            <Progress
              value={gate.percent}
              aria-label={t("gate.progressAria", { percent: gate.percent })}
            />
            <p className="text-sm text-muted-foreground">
              {t("gate.progress", {
                current: formatMoney(gate.cents, "usd", locale),
                required: formatMoney(gate.requiredCents, "usd", locale),
                left: formatMoney(gate.requiredCents - gate.cents, "usd", locale),
              })}
            </p>
          </div>

          {/* Le gate ne doit pas faire oublier l'appel : on rappelle la
              promesse et on garde le lien de retour, paramètre compris. */}
          {answersCall && (
            <div className="w-full max-w-md rounded-2xl rounded-tr-sm border border-secondary/25 bg-secondary/[0.07] p-4 text-left">
              <p className="data-label">{t("gate.callLabel")}</p>
              <p className="mt-1 font-display text-lg font-semibold" dir="auto">
                {answersCall.target}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("gate.callBody")}{" "}
                <Link
                  href={`/appels/${answersCall.slug}`}
                  className="text-secondary underline-offset-4 hover:underline"
                >
                  {t("gate.callLink")}
                </Link>
              </p>
            </div>
          )}

          <Button asChild>
            <Link href="/projects">{t("gate.explore")}</Link>
          </Button>
        </div>

        {suggestions.length > 0 && (
          <>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">
              {t("gate.suggestionsTitle")}
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

  return (
    <div className="container max-w-3xl py-10">
      {/* Réveil du rêve : la page émerge en douceur après la plongée du hero */}
      <div className="hero-reveal mb-8 space-y-2" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-4xl font-semibold tracking-tight" dir="auto">
          {answersCall
            ? t("form.titleReplace", { target: answersCall.target })
            : t("form.title")}
        </h1>
        <p className="font-medium text-muted-foreground">
          {answersCall ? t("form.subtitleReplace") : t("form.subtitle")}
        </p>
      </div>
      <div className="hero-reveal" style={{ animationDelay: "0.35s" }}>
        <CreateProjectForm answersCall={answersCall ?? undefined} />
      </div>
    </div>
  );
}
