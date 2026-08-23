import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, ExternalLink, ShieldAlert, Trash2, X } from "lucide-react";
import type { Report } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteGroupMessageFormAction } from "@/actions/chat-groups";
import { deleteCallCommentAction } from "@/actions/boycott";
import { handleReportAction } from "@/actions/moderation";
import { deleteCommentAction } from "@/actions/project-feed";
import { isAdmin } from "@/lib/moderation";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";

export const metadata: Metadata = {
  title: "Modération",
  robots: { index: false, follow: false },
};

const TARGET_LABELS = {
  PROJECT: "Projet",
  COMMENT: "Commentaire",
  USER: "Membre",
  CHAT_GROUP: "Groupe",
  GROUP_MESSAGE: "Message de groupe",
  BOYCOTT_CALL: "Appel au remplacement",
  CALL_COMMENT: "Réponse sous un appel",
} as const;

/** Résout la cible de chaque signalement (lien + aperçu) en requêtes groupées. */
async function resolveTargets(reports: Report[]) {
  const ids = (type: Report["targetType"]) =>
    reports.filter((r) => r.targetType === type).map((r) => r.targetId);

  const [projects, comments, users, groups, groupMessages, calls, callComments] =
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
  ]);

  return (
    report: Report
  ): {
    label: string;
    href: string | null;
    commentId?: string;
    groupMessageId?: string;
    callCommentId?: string;
  } => {
    if (report.targetType === "PROJECT") {
      const p = projects.find((x) => x.id === report.targetId);
      return p
        ? { label: `« ${p.title} »`, href: `/projects/${p.slug}` }
        : { label: "Projet supprimé", href: null };
    }
    if (report.targetType === "COMMENT") {
      const c = comments.find((x) => x.id === report.targetId);
      return c
        ? {
            label: `« ${c.body.slice(0, 80)}${c.body.length > 80 ? "…" : ""} » — sur ${c.project.title}`,
            href: `/projects/${c.project.slug}#discussion`,
            commentId: c.id,
          }
        : { label: "Commentaire déjà supprimé", href: null };
    }
    if (report.targetType === "GROUP_MESSAGE") {
      const m = groupMessages.find((x) => x.id === report.targetId);
      return m
        ? {
            label: `« ${m.body.slice(0, 80)}${m.body.length > 80 ? "…" : ""} » — dans ${m.group.name}`,
            href: `/chat/groupes/${m.group.slug}`,
            groupMessageId: m.id,
          }
        : { label: "Message déjà retiré", href: null };
    }
    if (report.targetType === "BOYCOTT_CALL") {
      const c = calls.find((x) => x.id === report.targetId);
      if (!c) return { label: "Appel introuvable", href: null };
      return {
        label: `${c.removedAt ? "[retiré] " : ""}« ${c.target} » — ${c.reason.slice(0, 70)}${c.reason.length > 70 ? "…" : ""}`,
        href: `/appels/${c.slug}`,
      };
    }
    if (report.targetType === "CALL_COMMENT") {
      const c = callComments.find((x) => x.id === report.targetId);
      if (!c) return { label: "Réponse introuvable", href: null };
      // Le retrait est LOGIQUE : la ligne survit. Sans marqueur, la file
      // présentait une réponse déjà retirée exactement comme une réponse en
      // ligne, et offrait un bouton « Retirer » devenu sans effet — un
      // modérateur ne pouvait pas distinguer « déjà traité » de « à traiter ».
      return {
        label: `${c.removedAt ? "[retiré] " : ""}« ${c.body.slice(0, 80)}${c.body.length > 80 ? "…" : ""} » — sous l'appel sur ${c.call.target}`,
        href: `/appels/${c.call.slug}#discussion`,
        callCommentId: c.removedAt ? undefined : c.id,
      };
    }
    if (report.targetType === "CHAT_GROUP") {
      const g = groups.find((x) => x.id === report.targetId);
      return g
        ? { label: `« ${g.name} » — ${g.purpose}`, href: `/chat/groupes/${g.slug}` }
        : { label: "Groupe dissous", href: null };
    }
    const u = users.find((x) => x.id === report.targetId);
    return u
      ? { label: u.name ?? "Membre", href: `/u/${u.id}` }
      : { label: "Membre introuvable", href: null };
  };
}

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await isAdmin(session.user.id))) redirect("/");

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
  const target = await resolveTargets([...open, ...handled]);

  return (
    <div className="page-halo">
      <div className="container max-w-3xl space-y-8 py-10">
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
            <ShieldAlert className="h-8 w-8 text-destructive" aria-hidden />
            Modération
          </h1>
          <p className="data-label">
            {open.length > 0
              ? `${open.length} signalement${open.length > 1 ? "s" : ""} à traiter`
              : "File vide — la communauté se tient bien"}
          </p>
        </div>

        {open.length > 0 && (
          <ul className="space-y-4">
            {open.map((report) => {
              const t = target(report);
              return (
                <li key={report.id} className="glass space-y-3 rounded-2xl rounded-tr-sm p-5">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="data-label">{TARGET_LABELS[report.targetType]}</span>
                    <span className="text-sm font-semibold">{report.reason}</span>
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatRelative(report.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/90">
                    {t.href ? (
                      <Link
                        href={t.href}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        {t.label}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{t.label}</span>
                    )}
                  </p>

                  {report.detail && (
                    <p className="rounded-xl border border-white/[0.06] bg-background/40 p-3 text-sm leading-relaxed text-muted-foreground">
                      {report.detail}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Signalé par{" "}
                    <Link href={`/u/${report.reporter.id}`} className="text-primary hover:underline">
                      {report.reporter.name}
                    </Link>
                  </p>

                  <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                    <form action={handleReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="decision" value="RESOLVED" />
                      <Button type="submit" variant="outline" size="sm">
                        <Check aria-hidden />
                        Traité
                      </Button>
                    </form>
                    <form action={handleReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="decision" value="DISMISSED" />
                      <Button type="submit" variant="ghost" size="sm">
                        <X aria-hidden />
                        Rejeter
                      </Button>
                    </form>
                    {t.commentId && (
                      <form action={deleteCommentAction} className="ml-auto">
                        <input type="hidden" name="commentId" value={t.commentId} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden />
                          Supprimer le commentaire
                        </Button>
                      </form>
                    )}
                    {t.callCommentId && (
                      <form action={deleteCallCommentAction} className="ml-auto">
                        <input type="hidden" name="commentId" value={t.callCommentId} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden />
                          Retirer la réponse
                        </Button>
                      </form>
                    )}
                    {t.groupMessageId && (
                      <form action={deleteGroupMessageFormAction} className="ml-auto">
                        <input type="hidden" name="messageId" value={t.groupMessageId} />
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden />
                          Retirer le message
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
            <h2 className="text-xl font-semibold tracking-tight">Derniers traités</h2>
            <ul className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
              {handled.map((report) => {
                const t = target(report);
                return (
                  <li key={report.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 p-3.5 text-sm">
                    <span
                      className={
                        report.status === "RESOLVED"
                          ? "font-mono text-[10px] uppercase tracking-[0.14em] text-success"
                          : "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                      }
                    >
                      {report.status === "RESOLVED" ? "traité" : "rejeté"}
                    </span>
                    <span className="text-muted-foreground">
                      {TARGET_LABELS[report.targetType]} · {report.reason}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground/70">{t.label}</span>
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
