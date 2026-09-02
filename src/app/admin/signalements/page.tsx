import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, ExternalLink, ShieldAlert, Trash2, X } from "lucide-react";
import type { Report } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteGroupMessageFormAction } from "@/actions/chat-groups";
import { deleteCallCommentAction } from "@/actions/boycott";
import { removeVideoAction } from "@/actions/call-videos";
import { handleReportAction } from "@/actions/moderation";
import { deleteCommentAction } from "@/actions/project-feed";
import { isAdmin } from "@/lib/moderation";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import type { Translator } from "@/lib/i18n/t";
import type { Messages } from "@/messages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("adminPages");
  return {
    title: t("meta.moderationTitle"),
    robots: { index: false, follow: false },
  };
}

/** Tronque un contenu utilisateur pour l'aperçu de la file. */
const excerpt = (text: string, max: number) =>
  `${text.slice(0, max)}${text.length > max ? "…" : ""}`;

/** Résout la cible de chaque signalement (lien + aperçu) en requêtes groupées. */
async function resolveTargets(reports: Report[], t: Translator<Messages["adminPages"]>) {
  const ids = (type: Report["targetType"]) =>
    reports.filter((r) => r.targetType === type).map((r) => r.targetId);

  const [projects, comments, users, groups, groupMessages, calls, callComments, callVideos] =
    await Promise.all([
    prisma.project.findMany({
      where: { id: { in: ids("PROJECT") } },
      select: { id: true, title: true, slug: true },
    }),
    prisma.comment.findMany({
      where: { id: { in: ids("COMMENT") } },
      select: { id: true, body: true, project: { select: { slug: true, title: true } } },
    }),
    prisma.user.findMany({
      where: { id: { in: ids("USER") } },
      select: { id: true, name: true },
    }),
    prisma.chatGroup.findMany({
      where: { id: { in: ids("CHAT_GROUP") } },
      select: { id: true, name: true, slug: true, purpose: true },
    }),
    prisma.groupMessage.findMany({
      where: { id: { in: ids("GROUP_MESSAGE") } },
      select: { id: true, body: true, group: { select: { name: true, slug: true } } },
    }),
    prisma.boycottCall.findMany({
      where: { id: { in: ids("BOYCOTT_CALL") } },
      select: { id: true, target: true, slug: true, reason: true, removedAt: true },
    }),
    prisma.callComment.findMany({
      where: { id: { in: ids("CALL_COMMENT") } },
      select: {
        id: true,
        body: true,
        removedAt: true,
        call: { select: { slug: true, target: true } },
      },
    }),
    prisma.callVideo.findMany({
      where: { id: { in: ids("CALL_VIDEO") } },
      select: {
        id: true,
        url: true,
        posterUrl: true,
        caption: true,
        durationMs: true,
        removedAt: true,
        call: { select: { slug: true, target: true } },
      },
    }),
  ]);

  return (
    report: Report
  ): {
    label: string;
    href: string | null;
    commentId?: string;
    groupMessageId?: string;
    callCommentId?: string;
    callVideoId?: string;
    videoUrl?: string | null;
    videoPoster?: string | null;
  } => {
    if (report.targetType === "PROJECT") {
      const p = projects.find((x) => x.id === report.targetId);
      return p
        ? { label: t("resolve.projectQuoted", { title: p.title }), href: `/projects/${p.slug}` }
        : { label: t("resolve.projectDeleted"), href: null };
    }
    if (report.targetType === "COMMENT") {
      const c = comments.find((x) => x.id === report.targetId);
      return c
        ? {
            label: t("resolve.commentOn", {
              excerpt: excerpt(c.body, 80),
              project: c.project.title,
            }),
            href: `/projects/${c.project.slug}#discussion`,
            commentId: c.id,
          }
        : { label: t("resolve.commentDeleted"), href: null };
    }
    if (report.targetType === "GROUP_MESSAGE") {
      const m = groupMessages.find((x) => x.id === report.targetId);
      return m
        ? {
            label: t("resolve.messageIn", {
              excerpt: excerpt(m.body, 80),
              group: m.group.name,
            }),
            href: `/chat/groupes/${m.group.slug}`,
            groupMessageId: m.id,
          }
        : { label: t("resolve.messageDeleted"), href: null };
    }
    if (report.targetType === "BOYCOTT_CALL") {
      const c = calls.find((x) => x.id === report.targetId);
      if (!c) return { label: t("resolve.callMissing"), href: null };
      return {
        label: `${c.removedAt ? t("resolve.removedPrefix") : ""}${t("resolve.callLabel", {
          target: c.target,
          excerpt: excerpt(c.reason, 70),
        })}`,
        href: `/appels/${c.slug}`,
      };
    }
    if (report.targetType === "CALL_COMMENT") {
      const c = callComments.find((x) => x.id === report.targetId);
      if (!c) return { label: t("resolve.replyMissing"), href: null };
      // Le retrait est LOGIQUE : la ligne survit. Sans marqueur, la file
      // présentait une réponse déjà retirée exactement comme une réponse en
      // ligne, et offrait un bouton « Retirer » devenu sans effet — un
      // modérateur ne pouvait pas distinguer « déjà traité » de « à traiter ».
      return {
        label: `${c.removedAt ? t("resolve.removedPrefix") : ""}${t("resolve.replyUnder", {
          excerpt: excerpt(c.body, 80),
          target: c.call.target,
        })}`,
        href: `/appels/${c.call.slug}#discussion`,
        callCommentId: c.removedAt ? undefined : c.id,
      };
    }
    if (report.targetType === "CALL_VIDEO") {
      const v = callVideos.find((x) => x.id === report.targetId);
      if (!v) return { label: t("resolve.videoMissing"), href: null };
      // Une vidéo ne se modère pas en lisant une ligne : le lecteur est posé
      // DANS la file, sinon trancher demande d'ouvrir un autre onglet — et
      // c'est ce qui fait qu'on tranche sans regarder.
      return {
        label: `${v.removedAt ? t("resolve.removedPrefix") : ""}${t("resolve.videoUnder", {
          excerpt: excerpt(v.caption, 70),
          seconds: Math.round(v.durationMs / 1000),
          target: v.call.target,
        })}`,
        href: `/direct?v=${v.id}`,
        callVideoId: v.removedAt ? undefined : v.id,
        videoUrl: v.url,
        videoPoster: v.posterUrl,
      };
    }
    if (report.targetType === "CHAT_GROUP") {
      const g = groups.find((x) => x.id === report.targetId);
      return g
        ? {
            label: t("resolve.groupLabel", { name: g.name, purpose: g.purpose }),
            href: `/chat/groupes/${g.slug}`,
          }
        : { label: t("resolve.groupDissolved"), href: null };
    }
    const u = users.find((x) => x.id === report.targetId);
    return u
      ? { label: u.name ?? t("resolve.memberFallback"), href: `/u/${u.id}` }
      : { label: t("resolve.memberMissing"), href: null };
  };
}

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await isAdmin(session.user.id))) redirect("/");

  const locale = await getRequestLocale();
  const t = await getT("adminPages");

  const [open, handled] = await Promise.all([
    prisma.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
      include: { reporter: { select: { id: true, name: true } } },
    }),
    prisma.report.findMany({
      where: { status: { not: "OPEN" } },
      orderBy: { handledAt: "desc" },
      take: 10,
      include: { reporter: { select: { id: true, name: true } } },
    }),
  ]);
  const target = await resolveTargets([...open, ...handled], t);

  return (
    <div className="page-halo">
      <div className="container max-w-3xl space-y-8 py-10">
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
            <ShieldAlert className="h-8 w-8 text-destructive" aria-hidden />
            {t("moderation.title")}
          </h1>
          <p className="data-label">
            {open.length > 0
              ? t("moderation.openCount", { count: open.length })
              : t("moderation.empty")}
          </p>
        </div>

        {open.length > 0 && (
          <ul className="space-y-4">
            {open.map((report) => {
              const tgt = target(report);
              return (
                <li key={report.id} className="glass space-y-3 rounded-2xl rounded-se-sm p-5">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="data-label">{t(`target.${report.targetType}`)}</span>
                    <span className="text-sm font-semibold">{report.reason}</span>
                    <span className="ms-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatRelative(report.createdAt, locale)}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/90">
                    {tgt.href ? (
                      <Link
                        href={tgt.href}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        {tgt.label}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{tgt.label}</span>
                    )}
                  </p>

                  {report.detail && (
                    <p className="rounded-xl border border-white/[0.06] bg-background/40 p-3 text-sm leading-relaxed text-muted-foreground">
                      {report.detail}
                    </p>
                  )}
                  {report.evidence && (
                    <p className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-sm leading-relaxed">
                      <span className="data-label mb-1 block">{t("resolve.evidence")}</span>
                      {report.evidence}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {t("moderation.reportedBy")}{" "}
                    <Link href={`/u/${report.reporter.id}`} className="text-primary hover:underline">
                      {report.reporter.name}
                    </Link>
                  </p>

                  {tgt.videoUrl && (
                    <video
                      src={tgt.videoUrl}
                      poster={tgt.videoPoster ?? undefined}
                      controls
                      preload="metadata"
                      playsInline
                      className="max-h-72 w-full rounded-xl border border-white/[0.08] bg-black"
                    />
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                    <form action={handleReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="decision" value="RESOLVED" />
                      <Button type="submit" variant="outline" size="sm">
                        <Check aria-hidden />
                        {t("moderation.resolve")}
                      </Button>
                    </form>
                    <form action={handleReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="decision" value="DISMISSED" />
                      <Button type="submit" variant="ghost" size="sm">
                        <X aria-hidden />
                        {t("moderation.dismiss")}
                      </Button>
                    </form>
                    {tgt.commentId && (
                      <form action={deleteCommentAction} className="ms-auto">
                        <input type="hidden" name="commentId" value={tgt.commentId} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden />
                          {t("moderation.deleteComment")}
                        </Button>
                      </form>
                    )}
                    {tgt.callVideoId && (
                      <form action={removeVideoAction} className="ms-auto">
                        <input type="hidden" name="videoId" value={tgt.callVideoId} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden />
                          {t("moderation.removeVideo")}
                        </Button>
                      </form>
                    )}
                    {tgt.callCommentId && (
                      <form action={deleteCallCommentAction} className="ms-auto">
                        <input type="hidden" name="commentId" value={tgt.callCommentId} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden />
                          {t("moderation.removeReply")}
                        </Button>
                      </form>
                    )}
                    {tgt.groupMessageId && (
                      <form action={deleteGroupMessageFormAction} className="ms-auto">
                        <input type="hidden" name="messageId" value={tgt.groupMessageId} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden />
                          {t("moderation.removeMessage")}
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {handled.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{t("moderation.handledTitle")}</h2>
            <ul className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
              {handled.map((report) => {
                const tgt = target(report);
                return (
                  <li key={report.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 p-3.5 text-sm">
                    <span
                      className={
                        report.status === "RESOLVED"
                          ? "font-mono text-[10px] uppercase tracking-[0.14em] text-success"
                          : "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                      }
                    >
                      {report.status === "RESOLVED"
                        ? t("moderation.statusResolved")
                        : t("moderation.statusDismissed")}
                    </span>
                    <span className="text-muted-foreground">
                      {t(`target.${report.targetType}`)} · {report.reason}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground/70">{tgt.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
