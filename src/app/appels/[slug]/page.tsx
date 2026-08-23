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
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, formatRelative } from "@/lib/format";
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
  if (!call || call.removedAt) return { title: "Appel" };
  return {
    title: `Remplacer ${call.target}`,
    description: call.wanted.slice(0, 160),
  };
}

export default async function AppelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const call = await getCall(slug, userId);
  if (!call) notFound();

  // Un appel retiré ne s'efface pas : il laisse une pierre tombale. Un fil où
  // les contenus gênants disparaissent sans trace n'est plus auditable.
  if (call.removedAt) {
    return (
      <div className="container max-w-3xl py-16">
        <div className="glass rounded-2xl rounded-tr-sm p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Cet appel a été retiré</h1>
          <p className="mt-2 text-muted-foreground">
            {call.removedById
              ? `Retiré par la modération — ${call.removalReason ?? "non conforme à la charte des appels"}.`
              : "Retiré par la personne qui l'avait publié."}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/appels">Retour au fil</Link>
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
        Retour au fil
      </Link>

      <article className="glass rounded-2xl rounded-tr-sm p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{CATEGORY_LABELS[call.category]}</Badge>
          {call.answers.length > 0 ? (
            <Badge variant="success">
              {call.answers.length} remplaçant{call.answers.length > 1 ? "s" : ""} déclaré
              {call.answers.length > 1 ? "s" : ""}
            </Badge>
          ) : (
            <Badge variant="outline">Aucun remplaçant pour l&apos;instant</Badge>
          )}
        </div>

        <p className="data-label">Ne veut plus de</p>
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
            <span className="font-semibold text-secondary">{weight.calls} appels</span> visent
            cette marque, portés par{" "}
            <span className="font-mono tabular-nums text-secondary">{weight.voices}</span> voix au
            total.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/u/${call.author.id}`}
            className="flex items-center gap-2.5 text-sm transition-colors duration-200 hover:text-secondary"
          >
            <UserAvatar name={call.author.name} avatarUrl={call.author.avatarUrl} />
            <span>
              <span className="font-semibold">{call.author.name ?? "Membre"}</span>
              <span className="block text-xs text-muted-foreground">
                {formatDate(call.createdAt)}
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
            <h2 className="data-label mb-2">Le motif</h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">{call.reason}</p>
          </section>

          <section className="rounded-xl border border-secondary/20 bg-secondary/[0.06] p-5">
            <h2 className="data-label mb-2 flex items-center gap-1.5">
              <Target aria-hidden className="h-3 w-3" />
              Ce qu&apos;il faudrait à la place
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">{call.wanted}</p>
          </section>

          {call.sources.length > 0 && (
            <section>
              <h2 className="data-label mb-2">Sources avancées par l&apos;auteur</h2>
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
            Appel publié par un membre. GeniGain héberge ce contenu, n&apos;en est pas
            l&apos;auteur et ne l&apos;endosse pas. Une marque mise en cause peut demander un
            retrait à{" "}
            <a href="mailto:bonjour@genigain.com" className="text-primary hover:underline">
              bonjour@genigain.com
            </a>
            .
          </p>
          <div className="flex items-center gap-2">
            {/* Partager : c'est ce qui recrute un porteur. Avant le signalement,
                parce que c'est l'action qu'on veut voir en premier. */}
            <ShareButton
              title={`Remplacer ${call.target}`}
              text={`${call._count.supports} ${call._count.supports > 1 ? "personnes veulent" : "personne veut"} remplacer ${call.target}. À la place : ${call.wanted}`}
            />
            {userId && !isAuthor && <ReportButton targetType="BOYCOTT_CALL" targetId={call.id} />}
            {(isAuthor || admin) && (
              <form action={removeCallAction}>
                <input type="hidden" name="callId" value={call.id} />
                {admin && !isAuthor && (
                  <input
                    type="hidden"
                    name="reason"
                    value="Retiré par la modération après examen"
                  />
                )}
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 aria-hidden />
                  {isAuthor ? "Retirer mon appel" : "Retirer (modération)"}
                </Button>
              </form>
            )}
          </div>
        </footer>
      </article>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {call.answers.length > 0 ? "Les remplaçants" : "Personne ne l'a encore remplacé"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {call.answers.length > 0
            ? "Ces projets se sont déclarés sur cet appel. Les financer, c'est faire exister l'alternative."
            : "Cet appel attend son porteur. Les soutiens ci-dessus sont autant de premiers contributeurs."}
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
                        ? "Retirer ce projet de l'appel"
                        : "Détacher ce projet (il squatte l'appel)"}
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
          Les témoignages filmés
          {nbVideos > 0 && (
            <span className="ml-2 font-mono text-base font-normal text-muted-foreground">
              {nbVideos}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {nbVideos > 0 ? (
            <>
              {nbVideos} témoignage{nbVideos > 1 ? "s" : ""} rattaché{nbVideos > 1 ? "s" : ""} à cet
              appel —{" "}
              <Link href="/direct" className="text-secondary underline-offset-4 hover:underline">
                les voir dans le direct
              </Link>
              .
            </>
          ) : (
            "Une caméra dit en trente secondes ce qu'un paragraphe met à prouver."
          )}
        </p>
        {userId ? (
          <div className="mt-5">
            <VideoUploadForm callId={call.id} target={call.target} />
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Connecte-toi
            </Link>{" "}
            pour filmer ton témoignage.
          </p>
        )}
      </section>

      <section id="discussion" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          La discussion
          {call._count.comments > 0 && (
            <span className="ml-2 font-mono text-base font-normal text-muted-foreground">
              {call._count.comments}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Corroborer, nuancer, contredire. L&apos;entreprise mise en cause peut répondre ici comme
          n&apos;importe qui.
        </p>

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
                        {comment.user.name ?? "Membre"}
                      </span>
                    </Link>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatRelative(comment.createdAt)}
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
                            title="Retirer ce commentaire"
                          >
                            <Trash2 aria-hidden className="h-4 w-4" />
                            <span className="sr-only">Retirer ce commentaire</span>
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
            Les {call.comments.length} réponses les plus récentes sont affichées, sur{" "}
            {call._count.comments}.
          </p>
        )}

        <div className="mt-5">
          {userId ? (
            <CallCommentForm callId={call.id} />
          ) : (
            <p className="rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Connecte-toi
              </Link>{" "}
              pour répondre à cet appel.
            </p>
          )}
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            D&apos;autres appels visent {call.target}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Publiés séparément, par d&apos;autres membres, pour d&apos;autres raisons.
          </p>
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
                      voix
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm text-foreground/90">
                      {sibling.reason}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      par {sibling.author.name ?? "un membre"}
                      {sibling._count.answers > 0 &&
                        ` · ${sibling._count.answers} remplaçant${sibling._count.answers > 1 ? "s" : ""}`}
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
