import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Export RGPD (droit à la portabilité, art. 20) : toutes les données que le
 * membre a fournies ou générées, en JSON lisible, téléchargé en un clic
 * depuis la carte Sécurité du dashboard. Périmètre volontairement « ses »
 * données : les messages REÇUS et les contenus des autres membres n'y sont
 * pas — ils appartiennent à leurs auteurs.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }
  const userId = session.user.id;

  const [user, projects, contributions, votes, comments, messagesSent, follows, reports] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          bio: true,
          avatarUrl: true,
          links: true,
          skills: true,
          city: true,
          country: true,
          preferredCurrency: true,
          reputation: true,
          contributedUsdCents: true,
          mutedNotifications: true,
          createdAt: true,
        },
      }),
      prisma.project.findMany({
        where: { ownerId: userId },
        select: {
          title: true,
          slug: true,
          pitch: true,
          description: true,
          category: true,
          currency: true,
          goal: true,
          raised: true,
          released: true,
          status: true,
          deadline: true,
          realizationDeadline: true,
          createdAt: true,
          milestones: {
            orderBy: { order: "asc" },
            select: { order: true, title: true, description: true, amount: true, status: true },
          },
          updates: {
            orderBy: { createdAt: "asc" },
            select: { title: true, body: true, createdAt: true },
          },
        },
      }),
      prisma.contribution.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          amount: true,
          usdCents: true,
          refunded: true,
          refundDueMinor: true,
          createdAt: true,
          project: { select: { title: true, slug: true, currency: true } },
        },
      }),
      prisma.vote.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          decision: true,
          weight: true,
          createdAt: true,
          proof: {
            select: {
              milestone: {
                select: { title: true, project: { select: { title: true, slug: true } } },
              },
            },
          },
        },
      }),
      prisma.comment.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          body: true,
          createdAt: true,
          project: { select: { title: true, slug: true } },
        },
      }),
      prisma.message.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "asc" },
        select: {
          body: true,
          createdAt: true,
          recipient: { select: { name: true } },
        },
      }),
      prisma.follow.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, project: { select: { title: true, slug: true } } },
      }),
      prisma.report.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: "asc" },
        select: { targetType: true, reason: true, detail: true, status: true, createdAt: true },
      }),
    ]);

  const data = {
    exporte_le: new Date().toISOString(),
    plateforme: "GeniGain",
    format: "Export RGPD — droit à la portabilité (art. 20). Montants en unités mineures (cents, centimes…).",
    profil: user,
    projets_portes: projects,
    contributions: contributions.map(({ project, ...c }) => ({
      ...c,
      projet: project.title,
      slug: project.slug,
      devise: project.currency,
    })),
    votes: votes.map((v) => ({
      decision: v.decision,
      poids: v.weight,
      etape: v.proof.milestone.title,
      projet: v.proof.milestone.project.title,
      date: v.createdAt,
    })),
    commentaires: comments.map((c) => ({
      texte: c.body,
      projet: c.project.title,
      date: c.createdAt,
    })),
    messages_envoyes: messagesSent.map((m) => ({
      a: m.recipient.name ?? "Membre retiré",
      texte: m.body,
      date: m.createdAt,
    })),
    projets_suivis: follows.map((f) => ({ projet: f.project.title, depuis: f.createdAt })),
    signalements_envoyes: reports,
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="genigain-export-${stamp}.json"`,
      "cache-control": "no-store",
    },
  });
}
