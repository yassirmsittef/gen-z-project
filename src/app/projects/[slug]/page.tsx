import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, EyeOff, Handshake, Heart, LockOpen, MessagesSquare, PartyPopper, PenLine, Star, Trash2, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteCommentAction, deleteUpdateAction } from "@/actions/project-feed";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CampaignCockpit } from "@/components/campaign-cockpit";
import { CommentForm } from "@/components/comment-form";
import { ContributeForm } from "@/components/contribute-form";
import { FollowButton } from "@/components/follow-button";
import { MilestoneTimeline } from "@/components/milestone-timeline";
import { ProjectUpdateForm } from "@/components/project-update-form";
import { ReportButton } from "@/components/report-button";
import { ShareButton } from "@/components/share-button";
import { ReputationBadge } from "@/components/reputation-badge";
import { ReputationRing } from "@/components/reputation-ring";
import { SkillTag } from "@/components/skill-tag";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { daysLeft, formatDate, progressPercent } from "@/lib/format";
import { formatMoney } from "@/lib/money";

/** Aperçus de partage : titre + pitch du projet (l'image OG est générée à côté). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { title: true, pitch: true },
  });
  if (!project) return { title: "Projet introuvable" };
  return {
    title: project.title,
    description: project.pitch,
    openGraph: { title: project.title, description: project.pitch },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // La grosse requête projet démarre tout de suite ; la session (JWT, immédiate)
  // débloque la requête « viewer » qui se chevauche alors avec elle (Promise.all)
  // au lieu de s'enchaîner derrière — plus de cascade séquentielle.
  const projectPromise = prisma.project.findUnique({
    where: { slug },
    include: {
      owner: true,
      milestones: {
        orderBy: { order: "asc" },
        include: { proofs: { include: { votes: true } } },
      },
      contributions: { include: { user: true }, orderBy: { createdAt: "desc" } },
      updates: { orderBy: { createdAt: "desc" } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, avatarUrl: true, reputation: true } } },
      },
      follows: { select: { userId: true } },
      _count: { select: { follows: true } },
    },
  });

  const session = await auth();
  const viewerId = session?.user?.id;
  const [project, viewer] = await Promise.all([
    projectPromise,
    viewerId
      ? Promise.resolve(null) // plus de solde interne à charger
      : Promise.resolve(null),
  ]);
  if (!project) notFound();

  const isFollowing = viewerId
    ? Boolean(
        await prisma.follow.findUnique({
          where: { userId_projectId: { userId: viewerId, projectId: project.id } },
          select: { id: true },
        })
      )
    : false;

  const isOwner = viewerId === project.ownerId;
  const isContributor = project.contributions.some((c) => c.userId === viewerId);

  // Total par contributeur (une personne peut contribuer plusieurs fois).
  // Les contributions anonymes sortent du nominatif : un seul agrégat sans
  // identité — mais elles comptent dans la cagnotte et l'effectif.
  const byContributor = new Map<
    string,
    { name: string | null; avatarUrl: string | null; id: string; total: number }
  >();
  let anonymousTotal = 0;
  for (const c of project.contributions) {
    if (c.anonymous) {
      anonymousTotal += c.amount;
      continue;
    }
    const entry =
      byContributor.get(c.userId) ??
      { name: c.user.name, avatarUrl: c.user.avatarUrl, id: c.userId, total: 0 };
    entry.total += c.amount;
    byContributor.set(c.userId, entry);
  }
  const contributors = [...byContributor.values()].sort((a, b) => b.total - a.total);
  const contributorCount = new Set(project.contributions.map((c) => c.userId)).size;

  const percent = progressPercent(project.raised, project.goal);
  const remaining = daysLeft(project.deadline);

  return (
    <div className="container py-10">
      {project.status === "FAILED" && (
        <Alert variant="destructive" className="mb-8">
          <AlertTitle>Ce projet n&apos;a pas abouti</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {project.failureReason} Les contributeurs ont été remboursés sur le séquestre
              restant.
            </p>
            {isOwner ? (
              <Button size="sm" asChild>
                <Link href={`/rebond?from=${project.slug}`}>Rebondir maintenant →</Link>
              </Button>
            ) : (
              <p className="text-sm">
                L&apos;échec fait partie du jeu — le créateur est réorienté vers de nouvelles
                opportunités.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {project.status === "COMPLETED" && (
        <Alert variant="success" className="mb-8">
          <PartyPopper className="h-4 w-4" />
          <AlertTitle>Projet réalisé</AlertTitle>
          <AlertDescription>
            Toutes les étapes ont été validées par la communauté et les fonds intégralement
            débloqués.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{CATEGORY_LABELS[project.category]}</Badge>
          <StatusBadge status={project.status} />
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{project.title}</h1>
        <p className="max-w-3xl text-lg font-medium text-muted-foreground">{project.pitch}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/u/${project.owner.id}`} className="group inline-flex items-center gap-2">
            <ReputationRing reputation={project.owner.reputation}>
              <UserAvatar name={project.owner.name} avatarUrl={project.owner.avatarUrl} className="border-0" />
            </ReputationRing>
            <span className="font-semibold transition-colors duration-200 group-hover:text-primary">
              {project.owner.name}
            </span>
            <ReputationBadge reputation={project.owner.reputation} />
          </Link>
          {viewerId && !isOwner ? (
            <FollowButton
              projectId={project.id}
              following={isFollowing}
              count={project._count.follows}
            />
          ) : !viewerId ? (
            <Button variant="outline" size="sm" asChild title="Connecte-toi pour suivre ce projet">
              <Link href="/login">
                <Star aria-hidden />
                Suivre
                <span className="font-mono text-xs opacity-75">{project._count.follows}</span>
              </Link>
            </Button>
          ) : (
            project._count.follows > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-secondary">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                {project._count.follows} suivi{project._count.follows > 1 ? "s" : ""}
              </span>
            )
          )}
          {viewerId && !isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/chat/${project.owner.id}`}>
                <MessagesSquare aria-hidden />
                Contacter
              </Link>
            </Button>
          )}
          {!isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.slug}/partenariat`}>
                <Handshake aria-hidden />
                Partenariat marque
              </Link>
            </Button>
          )}
          {isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.slug}/modifier`}>
                <PenLine aria-hidden />
                Modifier
              </Link>
            </Button>
          )}
          <ShareButton title={project.title} text={project.pitch} />
          {viewerId && !isOwner && (
            <ReportButton
              targetType="PROJECT"
              targetId={project.id}
              className="text-muted-foreground"
            />
          )}
        </div>
      </div>

      {project.coverUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl rounded-tr-sm border border-white/[0.08]">
          {/* Domaine libre (URL collée par le porteur) : <img> natif, pas next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.coverUrl}
            alt={`Visuel du projet ${project.title}`}
            width={1680}
            height={720}
            className="aspect-[21/9] max-h-[380px] w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Le projet</h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">
              {project.description}
            </p>
            {project.neededSkills.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="data-label">Compétences recherchées</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.neededSkills.map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-1 text-2xl font-semibold tracking-tight">Étapes &amp; preuves d&apos;avancement</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Les fonds sont débloqués étape par étape : le créateur soumet une preuve, les
              contributeurs votent.
            </p>
            {project.status === "FUNDED" && project.realizationDeadline && (
              <p className="-mt-3 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-300">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  à réaliser avant le {formatDate(project.realizationDeadline)} · J-
                  {daysLeft(project.realizationDeadline)}
                </span>
              </p>
            )}
            <MilestoneTimeline
              milestones={project.milestones}
              project={project}
              viewerId={viewerId}
              isOwner={isOwner}
              isContributor={isContributor}
            />
          </section>

          {/* Actus : le fil de nouvelles du porteur (contributeurs notifiés) */}
          <section id="actus" className="scroll-mt-24">
            <h2 className="mb-1 text-2xl font-semibold tracking-tight">
              Actus du projet
              {project.updates.length > 0 && (
                <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
                  {project.updates.length}
                </span>
              )}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Les nouvelles du terrain, racontées par {isOwner ? "toi" : project.owner.name}.
            </p>

            {isOwner && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <ProjectUpdateForm projectId={project.id} />
                </CardContent>
              </Card>
            )}

            {project.updates.length === 0 ? (
              !isOwner && (
                <p className="rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
                  Pas encore d&apos;actu — elles apparaîtront ici au fil du projet.
                </p>
              )
            ) : (
              <ol className="relative space-y-6 border-l border-white/[0.08] pl-6">
                {project.updates.map((update) => (
                  <li key={update.id} className="relative">
                    <span
                      className="absolute -left-[30px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent-gradient shadow-glow"
                      aria-hidden
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold">{update.title}</h3>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {formatDate(update.createdAt)}
                        </span>
                        {isOwner && (
                          <form action={deleteUpdateAction}>
                            <input type="hidden" name="updateId" value={update.id} />
                            <button
                              type="submit"
                              title="Supprimer cette actu"
                              className="text-muted-foreground/60 transition-colors duration-200 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              <span className="sr-only">Supprimer cette actu</span>
                            </button>
                          </form>
                        )}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                      {update.body}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Discussion : commentaires publics, modération légère par le porteur */}
          <section id="discussion" className="scroll-mt-24">
            <h2 className="mb-1 text-2xl font-semibold tracking-tight">
              Discussion
              {project.comments.length > 0 && (
                <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
                  {project.comments.length}
                </span>
              )}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Questions, encouragements, coups de main — la communauté du projet.
            </p>

            {viewerId ? (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <CommentForm projectId={project.id} />
                </CardContent>
              </Card>
            ) : (
              <p className="mb-6 rounded-2xl border border-white/[0.08] bg-card/60 p-4 text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Connecte-toi
                </Link>{" "}
                pour participer à la discussion.
              </p>
            )}

            {project.comments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
                Personne n&apos;a encore commenté — lance la discussion !
              </p>
            ) : (
              <ul className="space-y-4">
                {project.comments.map((comment) => {
                  const canDelete = viewerId === comment.userId || isOwner;
                  return (
                    <li key={comment.id} className="flex items-start gap-3">
                      <Link href={`/u/${comment.user.id}`} className="shrink-0">
                        <UserAvatar name={comment.user.name} avatarUrl={comment.user.avatarUrl} className="h-9 w-9" />
                      </Link>
                      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-white/[0.08] bg-card/60 p-3.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <Link
                            href={`/u/${comment.user.id}`}
                            className="text-sm font-semibold transition-colors duration-200 hover:text-primary"
                          >
                            {comment.user.name}
                          </Link>
                          <ReputationBadge reputation={comment.user.reputation} showScore={false} />
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                          <span className="ml-auto flex items-center gap-1.5">
                            {viewerId && viewerId !== comment.userId && (
                              <ReportButton
                                targetType="COMMENT"
                                targetId={comment.id}
                                iconOnly
                                label="Signaler ce commentaire"
                                className="h-6 w-6 text-muted-foreground/60 hover:text-destructive [&_svg]:size-3.5"
                              />
                            )}
                          {canDelete && (
                            <form action={deleteCommentAction}>
                              <input type="hidden" name="commentId" value={comment.id} />
                              <button
                                type="submit"
                                title="Supprimer ce commentaire"
                                className="text-muted-foreground/60 transition-colors duration-200 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                <span className="sr-only">Supprimer ce commentaire</span>
                              </button>
                            </form>
                          )}
                          </span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                          {comment.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="font-display text-4xl font-semibold">
                  {formatMoney(project.raised, project.currency)}
                  <span className="font-sans text-base font-normal text-muted-foreground">
                    {" "}
                    sur {formatMoney(project.goal, project.currency)}
                  </span>
                </p>
              </div>
              <Progress value={percent} />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {contributorCount} contributeur{contributorCount > 1 ? "s" : ""}
                </span>
                {project.status === "ACTIVE" ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {remaining} j restants
                  </span>
                ) : (
                  <span>Campagne terminée le {formatDate(project.deadline)}</span>
                )}
              </div>

              {(project.status === "FUNDED" || project.status === "COMPLETED") && (
                <p className="rounded-xl border border-white/[0.08] bg-muted/50 p-3 text-sm">
                  <LockOpen className="mr-1 inline h-4 w-4 text-success" aria-hidden />
                  <span className="font-semibold">{formatMoney(project.released, project.currency)}</span>{" "}
                  débloqués sur {formatMoney(project.raised, project.currency)} — le reste est sous séquestre
                  jusqu&apos;à validation des étapes.
                </p>
              )}

              {project.status === "ACTIVE" &&
                (isOwner ? (
                  <p className="rounded-xl border border-white/[0.08] bg-muted/50 p-3 text-sm text-muted-foreground">
                    C&apos;est ton projet — partage-le pour atteindre ton objectif.
                  </p>
                ) : viewerId ? (
                  <ContributeForm projectId={project.id} currency={project.currency} />
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/login">Connecte-toi pour contribuer</Link>
                  </Button>
                ))}
            </CardContent>
          </Card>

          {isOwner && (
            <CampaignCockpit
              currency={project.currency}
              createdAt={project.createdAt}
              deadline={project.deadline}
              goal={project.goal}
              raised={project.raised}
              status={project.status}
              realizationDeadline={project.realizationDeadline}
              contributions={project.contributions.map((c) => ({
                amount: c.amount,
                createdAt: c.createdAt,
                userId: c.userId,
              }))}
              followerIds={project.follows.map((f) => f.userId)}
              milestones={project.milestones.map((m) => ({ status: m.status }))}
            />
          )}

          {(contributors.length > 0 || anonymousTotal > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4 text-primary" aria-hidden />
                  Contributeurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contributors.slice(0, 8).map((contributor) => (
                  <div key={contributor.id} className="flex items-center gap-3 text-sm">
                    <UserAvatar name={contributor.name} avatarUrl={contributor.avatarUrl} className="h-7 w-7 text-[10px]" />
                    <Link href={`/u/${contributor.id}`} className="truncate font-bold hover:text-primary">
                      {contributor.name}
                    </Link>
                    <span className="ml-auto font-bold text-muted-foreground">
                      {formatMoney(contributor.total, project.currency)}
                    </span>
                  </div>
                ))}
                {contributors.length > 8 && (
                  <p className="text-xs text-muted-foreground">
                    + {contributors.length - 8} autres
                  </p>
                )}
                {anonymousTotal > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-muted/60">
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    </span>
                    <span className="truncate font-bold text-muted-foreground">
                      Contributions anonymes
                    </span>
                    <span className="ml-auto font-bold text-muted-foreground">
                      {formatMoney(anonymousTotal, project.currency)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
