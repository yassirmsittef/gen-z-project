import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Target, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import {
  deleteCallCommentAction,
  removeCallAction,
  withdrawAnswerAction,
} from "@/actions/boycott";
import { CallAnswerForm } from "@/components/call-answer-form";
import { CallCommentForm } from "@/components/call-comment-form";
import { VideoUploadForm } from "@/components/video-upload-form";
import { CallSupportButton } from "@/components/call-support-button";
import { ProjectCard } from "@/components/project-card";
import { ReportButton } from "@/components/report-button";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { getCall, siblingCalls, targetWeight } from "@/lib/boycott";
import { videoCountForCall } from "@/lib/call-videos";
import { formatDate, formatRelative } from "@/lib/format";
import { categoryLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Requête maigre : `generateMetadata` et le rendu s'exécutent tous deux,
  // inutile de charger deux fois la discussion et les remplaçants.
  const call = await prisma.boycottCall.findUnique({
    where: { slug: (await params).slug },
    select: { target: true, wanted: true, removedAt: true },
  });
  const t = await getT("callsPages");
  if (!call || call.removedAt) return { title: t("meta.detailFallback") };
  return {
    title: t("meta.detailTitle", { target: call.target }),
    description: call.wanted.slice(0, 160),
  };
}

export default async function AppelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getT("callsPages");
  const locale = await getRequestLocale();

  const call = await getCall(slug, userId);
  if (!call) notFound();

  // Un appel retiré ne s'efface pas : il laisse une pierre tombale. Un fil où
  // les contenus gênants disparaissent sans trace n'est plus auditable.
  if (call.removedAt) {
    return (
      <div className="container max-w-3xl py-16">
        <div className="glass rounded-2xl rounded-tr-sm p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">{t("removed.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {call.removedById
              ? t("removed.byModeration", {
                  reason: call.removalReason ?? t("removed.defaultReason"),
                })
              : t("removed.byAuthor")}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/appels">{t("back.toFeed")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // `supports` ne contient au plus que la ligne du lecteur (sonde bornée).
  const supporting = call.supports.length > 0;
  const answeredProjectIds = new Set(call.answers.map((answer) => answer.projectId));
  const isAuthor = call.authorId === userId;

  const [admin, siblings, weight, nbVideos] = await Promise.all([
    userId ? isAdmin(userId) : Promise.resolve(false),
    siblingCalls(call.id, call.targetKey),
    targetWeight(call.targetKey),
    videoCountForCall(call.id),
  ]);

  // Les projets que ce membre peut encore déclarer sur cet appel.
  const ownProjects = userId
    ? (
        await prisma.project.findMany({
          where: { ownerId: userId, status: { in: ["ACTIVE", "FUNDED"] } },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true },
        })
      ).filter((project) => !answeredProjectIds.has(project.id))
    : [];

  return (
    <div className="container max-w-4xl py-10">
      <Link
        href="/appels"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        {t("back.toFeed")}
      </Link>

      <article className="glass rounded-2xl rounded-tr-sm p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{categoryLabel(locale, call.category)}</Badge>
          {call.answers.length > 0 ? (
            <Badge variant="success">
              {t("badge.answered", { count: call.answers.length })}
            </Badge>
          ) : (
            <Badge variant="outline">{t("badge.none")}</Badge>
          )}
        </div>

        <p className="data-label">{t("target.label")}</p>
        {/* Nom de marque : soustrait à la traduction automatique. */}
        <h1
          translate="no"
          className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          {call.target}
        </h1>
        {/* Le poids de la marque, pas seulement celui de cet appel : c'est
            l'accumulation qui transforme un rejet isolé en signal. */}
        {weight.calls > 1 && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-secondary">
              {t("weight.calls", { count: weight.calls })}
            </span>{" "}
            {t("weight.aim")}{" "}
            <span className="font-mono tabular-nums text-secondary">{weight.voices}</span>{" "}
            {t("weight.total")}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/u/${call.author.id}`}
            className="flex items-center gap-2.5 text-sm transition-colors duration-200 hover:text-secondary"
          >
            <UserAvatar name={call.author.name} avatarUrl={call.author.avatarUrl} />
            <span>
              <span className="font-semibold">{call.author.name ?? t("author.fallback")}</span>
              <span className="block text-xs text-muted-foreground">
                {formatDate(call.createdAt, locale)}
              </span>
            </span>
          </Link>

          <CallSupportButton
            callId={call.id}
            count={call._count.supports}
            supporting={supporting}
            authenticated={Boolean(userId)}
          />
        </div>

        <div className="mt-7 space-y-6">
          <section>
            <h2 className="data-label mb-2">{t("motive.title")}</h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">{call.reason}</p>
          </section>

          <section className="rounded-xl border border-secondary/20 bg-secondary/[0.06] p-5">
            <h2 className="data-label mb-2 flex items-center gap-1.5">
              <Target aria-hidden className="h-3 w-3" />
              {t("wanted.title")}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">{call.wanted}</p>
          </section>

          {call.sources.length > 0 && (
            <section>
              <h2 className="data-label mb-2">{t("sources.title")}</h2>
              <ul className="space-y-1.5">
                {call.sources.map((source) => (
                  <li key={source}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer nofollow ugc"
                      className="inline-flex items-center gap-1.5 break-all text-sm text-primary underline-offset-4 hover:underline"
                    >
                      <ExternalLink aria-hidden className="h-3.5 w-3.5 shrink-0" />
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Le cadre : qui parle, et qui ne parle pas. */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
          <p className="max-w-md text-xs text-muted-foreground">
            {t("frame.disclaimer")}{" "}
            <a href="mailto:bonjour@genigain.com" className="text-primary hover:underline">
              bonjour@genigain.com
            </a>
            .
          </p>
          <div className="flex items-center gap-2">
            {/* Partager : c'est ce qui recrute un porteur. Avant le signalement,
                parce que c'est l'action qu'on veut voir en premier. */}
            <ShareButton
              title={t("share.title", { target: call.target })}
              text={t("share.text", {
                count: call._count.supports,
                target: call.target,
                wanted: call.wanted,
              })}
            />
            {userId && !isAuthor && <ReportButton targetType="BOYCOTT_CALL" targetId={call.id} />}
            {(isAuthor || admin) && (
              <form action={removeCallAction}>
                <input type="hidden" name="callId" value={call.id} />
                {/* Un DRAPEAU, pas une phrase : le motif type est rendu en
                    français par l'action (l'équipe modère en français), sinon
                    la langue du modérateur se figerait dans la base et serait
                    relue telle quelle par tout le monde. */}
                {admin && !isAuthor && (
                  <input type="hidden" name="standardReason" value="1" />
                )}
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 aria-hidden />
                  {isAuthor ? t("actions.removeMine") : t("actions.removeModeration")}
                </Button>
              </form>
            )}
          </div>
        </footer>
      </article>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {call.answers.length > 0 ? t("replacements.title") : t("replacements.emptyTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {call.answers.length > 0 ? t("replacements.body") : t("replacements.emptyBody")}
        </p>

        {call.answers.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {call.answers.map((answer) => (
              <div key={answer.id} className="space-y-2">
                <ProjectCard project={answer.project} />
                {(answer.project.ownerId === userId || isAuthor || admin) && (
                  <form action={withdrawAnswerAction} className="text-right">
                    <input type="hidden" name="callId" value={call.id} />
                    <input type="hidden" name="projectId" value={answer.projectId} />
                    <Button type="submit" variant="ghost" size="sm">
                      {answer.project.ownerId === userId
                        ? t("replacements.withdrawMine")
                        : t("replacements.detach")}
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {t("videos.title")}
          {nbVideos > 0 && (
            <span className="ml-2 font-mono text-base font-normal text-muted-foreground">
              {nbVideos}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {nbVideos > 0 ? (
            <>
              {t("videos.attached", { count: nbVideos })}{" "}
              <Link href="/direct" className="text-secondary underline-offset-4 hover:underline">
                {t("videos.seeLive")}
              </Link>
              .
            </>
          ) : (
            t("videos.emptyBody")
          )}
        </p>
        {userId ? (
          <div className="mt-5">
            <VideoUploadForm callId={call.id} target={call.target} />
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              {t("login.cta")}
            </Link>{" "}
            {t("videos.loginSuffix")}
          </p>
        )}
      </section>

      <section id="discussion" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {t("discussion.title")}
          {call._count.comments > 0 && (
            <span className="ml-2 font-mono text-base font-normal text-muted-foreground">
              {call._count.comments}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("discussion.body")}</p>

        {call.comments.length > 0 && (
          <ul className="mt-5 space-y-3">
            {[...call.comments].reverse().map((comment) => {
              // L'auteur du commentaire, celui de l'appel, et la modération.
              const peutRetirer =
                comment.userId === userId || isAuthor || admin;
              return (
                <li key={comment.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/u/${comment.user.id}`}
                      className="flex min-w-0 items-center gap-2.5 transition-colors duration-200 hover:text-secondary"
                    >
                      <UserAvatar
                        name={comment.user.name}
                        avatarUrl={comment.user.avatarUrl}
                        className="h-8 w-8"
                      />
                      <span className="truncate text-sm font-semibold">
                        {comment.user.name ?? t("author.fallback")}
                      </span>
                    </Link>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatRelative(comment.createdAt, locale)}
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-1">
                      {userId && comment.userId !== userId && (
                        <ReportButton
                          targetType="CALL_COMMENT"
                          targetId={comment.id}
                          iconOnly
                        />
                      )}
                      {peutRetirer && (
                        <form action={deleteCallCommentAction}>
                          <input type="hidden" name="commentId" value={comment.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            title={t("discussion.removeComment")}
                          >
                            <Trash2 aria-hidden className="h-4 w-4" />
                            <span className="sr-only">{t("discussion.removeComment")}</span>
                          </Button>
                        </form>
                      )}
                    </span>
                  </div>
                  <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {comment.body}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {call._count.comments > call.comments.length && (
          <p className="mt-4 rounded-xl border border-dashed border-white/[0.12] p-3 text-center text-sm text-muted-foreground">
            {t("discussion.shown", {
              shown: call.comments.length,
              total: call._count.comments,
            })}
          </p>
        )}

        <div className="mt-5">
          {userId ? (
            <CallCommentForm callId={call.id} />
          ) : (
            <p className="rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                {t("login.cta")}
              </Link>{" "}
              {t("discussion.loginSuffix")}
            </p>
          )}
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {t("siblings.title", { target: call.target })}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("siblings.body")}</p>
          <ul className="mt-5 space-y-3">
            {siblings.map((sibling) => (
              <li key={sibling.id}>
                <Link
                  href={`/appels/${sibling.slug}`}
                  className="glass flex items-start gap-4 rounded-2xl p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-secondary/25"
                >
                  <span className="flex shrink-0 flex-col items-center rounded-xl border border-secondary/25 bg-secondary/10 px-3 py-2">
                    <span className="font-mono text-sm font-semibold tabular-nums text-secondary">
                      {sibling._count.supports}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {t("siblings.voices")}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm text-foreground/90">
                      {sibling.reason}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t("siblings.by", {
                        name: sibling.author.name ?? t("siblings.anonymous"),
                      })}
                      {sibling._count.answers > 0 &&
                        t("siblings.answers", { count: sibling._count.answers })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {userId && (
        <section className="mt-8">
          <CallAnswerForm
            callId={call.id}
            slug={call.slug}
            target={call.target}
            projects={ownProjects}
          />
        </section>
      )}
    </div>
  );
}
