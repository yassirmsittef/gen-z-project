import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Lock, PenLine } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { CancelProjectButton } from "@/components/cancel-project-button";
import { EditProjectForm } from "@/components/edit-project-form";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("projectsPages");
  return {
    title: t("meta.editTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [locale, t] = [await getRequestLocale(), await getT("projectsPages")];

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      milestones: { orderBy: { order: "asc" }, select: { order: true, title: true, amount: true } },
      contributions: { select: { userId: true } },
      _count: { select: { contributions: true } },
    },
  });
  if (!project) notFound();
  if (project.ownerId !== session.user.id) redirect(`/projects/${slug}`);

  const editable = project.status === "ACTIVE";
  const deletable = project._count.contributions === 0;
  // Arrêt volontaire : possible tant que le projet est en cours (ACTIVE/FUNDED)
  // et qu'au moins un membre a contribué (sinon, c'est un simple retrait).
  const cancellable =
    project._count.contributions > 0 &&
    (project.status === "ACTIVE" || project.status === "FUNDED");
  // Séquestre restant (raised − released) = ce qui repart aux contributeurs.
  const refundRemaining = project.raised - project.released;
  const distinctContributors = new Set(project.contributions.map((c) => c.userId)).size;

  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="-ms-3 text-muted-foreground">
          <Link href={`/projects/${slug}`}>
            <ArrowLeft aria-hidden className="rtl:-scale-x-100" />
            {t("edit.back")}
          </Link>
        </Button>
        <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
          <PenLine className="h-8 w-8 text-primary" aria-hidden />
          {t("edit.title")}
        </h1>
        <p className="font-medium text-muted-foreground" dir="auto">
          {project.title}
        </p>
      </div>

      {/* Cadre financier figé : c'est l'engagement sur lequel on contribue. */}
      <section className="glass rounded-2xl rounded-se-sm p-5">
        <p className="data-label flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          {t("edit.frozenLabel")}
        </p>
        <p className="mt-2 text-sm text-foreground/90">
          {t("edit.frozenSummary", {
            count: project.milestones.length,
            goal: formatMoney(project.goal, project.currency, locale),
            date: formatDate(project.deadline, locale),
            amounts: project.milestones
              .map((m) => formatMoney(m.amount, project.currency, locale))
              .join(" + "),
          })}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">{t("edit.frozenHint")}</p>
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
          {t("edit.frozenClosed")}
        </section>
      )}

      <section className="space-y-2 rounded-2xl border border-destructive/25 bg-destructive/[0.05] p-5">
        <p className="data-label text-destructive">{t("edit.dangerLabel")}</p>
        {deletable ? (
          <>
            <p className="text-sm text-muted-foreground">{t("edit.deleteHint")}</p>
            <DeleteProjectButton projectId={project.id} />
          </>
        ) : cancellable ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t("edit.cancelMembers", { count: project._count.contributions })}{" "}
              {t(refundRemaining > 0 ? "edit.cancelBodyRefund" : "edit.cancelBodyNoRefund", {
                amount: formatMoney(refundRemaining, project.currency, locale),
              })}
              {project.released > 0 && (
                <>
                  {" "}
                  {t("edit.cancelReleased", {
                    released: formatMoney(project.released, project.currency, locale),
                  })}
                </>
              )}
            </p>
            <CancelProjectButton
              projectId={project.id}
              slug={slug}
              refundLabel={formatMoney(refundRemaining, project.currency, locale)}
              contributorCount={distinctContributors}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("edit.closedHint")}</p>
        )}
      </section>
    </div>
  );
}
