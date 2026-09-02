import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, EyeOff, Handshake, Heart, LockOpen, MessagesSquare, PartyPopper, PenLine, Star, Swords, Trash2, Users } from "lucide-react";
import { auth } from "@/auth";
import { callsAnsweredBy } from "@/lib/boycott";
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
import { CategoryRoomCard } from "@/components/category-room-card";
import { SkillTag } from "@/components/skill-tag";
import { StatusBadge } from "@/components/status-badge";
import { TranslateButton } from "@/components/translate-button";
import { UserAvatar } from "@/components/user-avatar";
import { categoryLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";
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
  if (!project) {
    const t = await getT("projectsPages");
    return { title: t("meta.detailNotFound") };
  }
  return {
    title: project.title,
    description: project.pitch,
    openGraph: { title: project.title, description: project.pitch },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [locale, t] = [await getRequestLocale(), await getT("projectsPages")];

  // La grosse requête projet démarre tout de suite ; la session (JWT, immédiate)
  // débloque la requête « viewer » qui se chevauche alors avec elle (Promise.all)
  // au lieu de s'enchaîner derrière — plus de cascade séquentielle.
  const projectPromise = prisma.project.findUnique({
    where: { slug },
    include: {
      // Select explicite : seuls ces quatre champs sont rendus. Charger la
      // ligne User entière ferait transiter passwordHash et email par l'arbre
      // de rendu d'une page publique.
      owner: { select: { id: true, name: true, avatarUrl: true, reputation: true, role: true } },
      milestones: {
        orderBy: { order: "asc" },
        include: { proofs: { include: { votes: true } } },
      },
      // Jamais la ligne User entière : elle porte passwordHash, email, Stripe…
      contributions: {
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
      updates: { orderBy: { createdAt: "desc" } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, avatarUrl: true, reputation: true, role: true } } },
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

  // Ce que ce projet s'est engagé à remplacer. On passe par `callsAnsweredBy`
  // plutôt que de refaire le `where` ici : cette page l'avait réimplémenté en
  // oubliant `withdrawnAt`, si bien qu'un projet détaché de l'appel continuait
  // d'afficher sa promesse — sur l'écran même que son porteur diffuse. Un
  // invariant écrit à deux endroits finit toujours par diverger.
  const replaces = await callsAnsweredBy(project.id);
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
          <AlertTitle>{t("detail.failedTitle")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {project.failureReason} {t("detail.failedBody")}
            </p>
            {isOwner ? (
              <Button size="sm" asChild>
                <Link href={`/rebond?from=${project.slug}`}>{t("detail.failedRebound")}</Link>
              </Button>
            ) : (
              <p className="text-sm">{t("detail.failedViewer")}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {project.status === "COMPLETED" && (
        <Alert variant="success" className="mb-8">
          <PartyPopper className="h-4 w-4" />
          <AlertTitle>{t("detail.completedTitle")}</AlertTitle>
          <AlertDescription>{t("detail.completedBody")}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{categoryLabel(locale, project.category)}</Badge>
          <StatusBadge status={project.status} />
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{project.title}</h1>
        {/* L'engagement pris : ce projet s'est déclaré sur un appel du fil.
            C'est une promesse publique, elle se lit avant le pitch. */}
        {replaces.length > 0 && (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <Swords aria-hidden className="h-4 w-4 text-secondary" />
            <span className="text-muted-foreground">{t("detail.replaces")}</span>
            {replaces.map((call) => (
              <Link
                key={call.slug}
                href={`/appels/${call.slug}`}
                className="rounded-full border border-secondary/30 bg-secondary/15 px-3 py-1 font-semibold text-secondary transition-colors duration-200 hover:bg-secondary/25"
              >
                {call.target}
              </Link>
            ))}
          </p>
        )}
        {/* Le pitch est du texte de membre : traduisible sur l'appareil du
            lecteur. Le wrapper garde le bouton collé au pitch — en enfant
            direct de `space-y-4`, il flotterait à mi-chemin de l'auteur. */}
        <div>
          <p className="max-w-3xl text-lg font-medium text-muted-foreground">{project.pitch}</p>
          {!isOwner && <TranslateButton texte={project.pitch} />}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/u/${project.owner.id}`} className="group inline-flex items-center gap-2">
            <ReputationRing reputation={project.owner.reputation} admin={project.owner.role === "ADMIN"}>
              <UserAvatar name={project.owner.name} avatarUrl={project.owner.avatarUrl} className="border-0" />
            </ReputationRing>
            <span className="font-semibold transition-colors duration-200 group-hover:text-primary">
              {project.owner.name}
            </span>
            <ReputationBadge reputation={project.owner.reputation} admin={project.owner.role === "ADMIN"} />
          </Link>
          {viewerId && !isOwner ? (
            <FollowButton
              projectId={project.id}
              following={isFollowing}
              count={project._count.follows}
            />
          ) : !viewerId ? (
            <Button variant="outline" size="sm" asChild title={t("detail.followLoginTitle")}>
              <Link href="/login">
                <Star aria-hidden />
                {t("detail.follow")}
                <span className="font-mono text-xs opacity-75">{project._count.follows}</span>
              </Link>
            </Button>
          ) : (
            project._count.follows > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-secondary">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                {t("detail.followerCount", { count: project._count.follows })}
              </span>
            )
          )}
          {viewerId && !isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/chat/${project.owner.id}`}>
                <MessagesSquare aria-hidden />
                {t("detail.contact")}
              </Link>
            </Button>
          )}
          {!isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.slug}/partenariat`}>
                <Handshake aria-hidden />
                {t("detail.brandPartnership")}
              </Link>
            </Button>
          )}
          {isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.slug}/modifier`}>
                <PenLine aria-hidden />
                {t("detail.edit")}
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
        <div className="mb-8 overflow-hidden rounded-2xl rounded-se-sm border border-white/[0.08]">
          {/* Domaine libre (URL collée par le porteur) : <img> natif, pas next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.coverUrl}
            alt={t("detail.coverAlt", { title: project.title })}
            width={1680}
            height={720}
            className="aspect-[21/9] max-h-[380px] w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">{t("detail.aboutTitle")}</h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">
              {project.description}
            </p>
            {!isOwner && <TranslateButton texte={project.description} />}
            {project.neededSkills.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="data-label">{t("detail.skillsLabel")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.neededSkills.map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-1 text-2xl font-semibold tracking-tight">
              {t("detail.milestonesTitle")}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">{t("detail.milestonesHint")}</p>
            {project.status === "FUNDED" && project.realizationDeadline && (
              <p className="-mt-3 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-300">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {t("detail.realizeBefore", {
                    date: formatDate(project.realizationDeadline, locale),
                    days: daysLeft(project.realizationDeadline),
                  })}
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
              {t("detail.updatesTitle")}
              {project.updates.length > 0 && (
                <span className="ms-2 font-mono text-sm font-normal text-muted-foreground">
                  {project.updates.length}
                </span>
              )}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {isOwner
                ? t("detail.updatesByYou")
                : t("detail.updatesBy", { name: project.owner.name })}
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
                  {t("detail.updatesEmpty")}
                </p>
              )
            ) : (
              <ol className="relative space-y-6 border-s border-white/[0.08] ps-6">
                {project.updates.map((update) => (
                  <li key={update.id} className="relative">
                    <span
                      className="absolute -start-[30px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent-gradient shadow-glow"
                      aria-hidden
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold">{update.title}</h3>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {formatDate(update.createdAt, locale)}
                        </span>
                        {isOwner && (
                          <form action={deleteUpdateAction}>
                            <input type="hidden" name="updateId" value={update.id} />
                            <button
                              type="submit"
                              title={t("detail.updateDelete")}
                              className="text-muted-foreground/60 transition-colors duration-200 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              <span className="sr-only">{t("detail.updateDelete")}</span>
                            </button>
                          </form>
                        )}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                      {update.body}
                    </p>
                    {/* Les actus sont écrites par le porteur : inutile de lui
                        proposer de traduire sa propre langue. */}
                    {!isOwner && <TranslateButton texte={update.body} />}
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Discussion : commentaires publics, modération légère par le porteur */}
          <section id="discussion" className="scroll-mt-24">
            <h2 className="mb-1 text-2xl font-semibold tracking-tight">
              {t("detail.commentsTitle")}
              {project.comments.length > 0 && (
                <span className="ms-2 font-mono text-sm font-normal text-muted-foreground">
                  {project.comments.length}
                </span>
              )}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">{t("detail.commentsHint")}</p>

            {viewerId ? (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <CommentForm projectId={project.id} />
                </CardContent>
              </Card>
            ) : (
              <p className="mb-6 rounded-2xl border border-white/[0.08] bg-card/60 p-4 text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  {t("detail.commentsLogin")}
                </Link>{" "}
                {t("detail.commentsLoginSuffix")}
              </p>
            )}

            {project.comments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
                {t("detail.commentsEmpty")}
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
                      <div className="min-w-0 flex-1 rounded-2xl rounded-ss-sm border border-white/[0.08] bg-card/60 p-3.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <Link
                            href={`/u/${comment.user.id}`}
                            className="text-sm font-semibold transition-colors duration-200 hover:text-primary"
                          >
                            {comment.user.name}
                          </Link>
                          <ReputationBadge reputation={comment.user.reputation} admin={comment.user.role === "ADMIN"} showScore={false} />
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {formatDate(comment.createdAt, locale)}
                          </span>
                          <span className="ms-auto flex items-center gap-1.5">
                            {viewerId && viewerId !== comment.userId && (
                              <ReportButton
                                targetType="COMMENT"
                                targetId={comment.id}
                                iconOnly
                                label={t("detail.commentReport")}
                                className="h-6 w-6 text-muted-foreground/60 hover:text-destructive [&_svg]:size-3.5"
                              />
                            )}
                          {canDelete && (
                            <form action={deleteCommentAction}>
                              <input type="hidden" name="commentId" value={comment.id} />
                              <button
                                type="submit"
                                title={t("detail.commentDelete")}
                                className="text-muted-foreground/60 transition-colors duration-200 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                <span className="sr-only">{t("detail.commentDelete")}</span>
                              </button>
                            </form>
                          )}
                          </span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                          {comment.body}
                        </p>
                        {viewerId !== comment.userId && (
                          <TranslateButton texte={comment.body} />
                        )}
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
                  {formatMoney(project.raised, project.currency, locale)}
                  <span className="font-sans text-base font-normal text-muted-foreground">
                    {" "}
                    {t("detail.ofGoal", {
                      goal: formatMoney(project.goal, project.currency, locale),
                    })}
                  </span>
                </p>
              </div>
              <Progress value={percent} />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {t("detail.contributorCount", { count: contributorCount })}
                </span>
                {project.status === "ACTIVE" ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t("detail.daysLeft", { count: remaining })}
                  </span>
                ) : (
                  <span>
                    {t("detail.campaignEnded", { date: formatDate(project.deadline, locale) })}
                  </span>
                )}
              </div>

              {(project.status === "FUNDED" || project.status === "COMPLETED") && (
                <p className="rounded-xl border border-white/[0.08] bg-muted/50 p-3 text-sm">
                  <LockOpen className="me-1 inline h-4 w-4 text-success" aria-hidden />
                  <span className="font-semibold">
                    {formatMoney(project.released, project.currency, locale)}
                  </span>{" "}
                  {t("detail.releasedNote", {
                    raised: formatMoney(project.raised, project.currency, locale),
                  })}
                </p>
              )}

              {project.status === "ACTIVE" &&
                (isOwner ? (
                  <p className="rounded-xl border border-white/[0.08] bg-muted/50 p-3 text-sm text-muted-foreground">
                    {t("detail.ownerShareHint")}
                  </p>
                ) : viewerId ? (
                  <ContributeForm projectId={project.id} currency={project.currency} />
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/login">{t("detail.loginToContribute")}</Link>
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
                  {t("detail.contributorsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contributors.slice(0, 8).map((contributor) => (
                  <div key={contributor.id} className="flex items-center gap-3 text-sm">
                    <UserAvatar name={contributor.name} avatarUrl={contributor.avatarUrl} className="h-7 w-7 text-[10px]" />
                    <Link href={`/u/${contributor.id}`} className="truncate font-bold hover:text-primary">
                      {contributor.name}
                    </Link>
                    <span className="ms-auto font-bold text-muted-foreground">
                      {formatMoney(contributor.total, project.currency, locale)}
                    </span>
                  </div>
                ))}
                {contributors.length > 8 && (
                  <p className="text-xs text-muted-foreground">
                    {t("detail.moreContributors", { count: contributors.length - 8 })}
                  </p>
                )}
                {anonymousTotal > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-muted/60">
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    </span>
                    <span className="truncate font-bold text-muted-foreground">
                      {t("detail.anonymous")}
                    </span>
                    <span className="ms-auto font-bold text-muted-foreground">
                      {formatMoney(anonymousTotal, project.currency, locale)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Le salon de la catégorie : soutenir un projet, c'est bien ; en
              parler avec ceux qui font la même chose, c'est la suite. */}
          <CategoryRoomCard category={project.category} viewerId={viewerId ?? null} />
        </aside>
      </div>
    </div>
  );
}
