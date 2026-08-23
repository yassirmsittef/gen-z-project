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

  const [
    user,
    projects,
    contributions,
    votes,
    comments,
    messagesSent,
    groupMemberships,
    groupMessages,
    follows,
    reports,
    boycottCalls,
    callComments,
    boycottSupports,
    boycottAnswers,
  ] = await Promise.all([
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
      prisma.chatGroupMember.findMany({
        where: { userId },
        orderBy: { joinedAt: "asc" },
        select: {
          joinedAt: true,
          group: { select: { name: true, slug: true, category: true, ownerId: true } },
        },
      }),
      prisma.groupMessage.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "asc" },
        select: { body: true, createdAt: true, group: { select: { name: true, slug: true } } },
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
        // Le fil des appels : trois nouvelles catégories de contenu produites
      // par le membre. La page de confidentialité promet « l'ensemble de tes
      // données » — un export qui les oublierait serait un export incomplet
      // au sens de l'article 20.
      prisma.boycottCall.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "asc" },
        select: {
          target: true,
          slug: true,
          category: true,
          reason: true,
          wanted: true,
          sources: true,
          removedAt: true,
          removalReason: true,
          createdAt: true,
        },
      }),
      prisma.callComment.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          body: true,
          createdAt: true,
          removedAt: true,
          call: { select: { target: true, slug: true } },
        },
      }),
      prisma.boycottSupport.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, call: { select: { target: true, slug: true } } },
      }),
      // « Mon projet remplace cette marque » : un acte public et déclaratif du
      // membre, au même titre qu'un appel ou une réponse. On exporte aussi le
      // DÉTACHEMENT, parce qu'il peut avoir été décidé par un tiers (l'auteur
      // de l'appel ou la modération) : sans lui, le porteur n'a aucun moyen
      // documentaire de constater une décision prise sur son contenu.
      prisma.boycottAnswer.findMany({
        where: { project: { ownerId: userId } },
        orderBy: { createdAt: "asc" },
        select: {
          createdAt: true,
          withdrawnAt: true,
          withdrawnBy: true,
          project: { select: { title: true, slug: true, ownerId: true } },
          call: { select: { target: true, slug: true } },
        },
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
    groupes_rejoints: groupMemberships.map((m) => ({
      groupe: m.group.name,
      slug: m.group.slug,
      categorie: m.group.category,
      anime_par_moi: m.group.ownerId === userId,
      depuis: m.joinedAt,
    })),
    messages_de_groupe_envoyes: groupMessages.map((m) => ({
      groupe: m.group.name,
      texte: m.body,
      date: m.createdAt,
    })),
    projets_suivis: follows.map((f) => ({ projet: f.project.title, depuis: f.createdAt })),
    signalements_envoyes: reports,
    appels_publies: boycottCalls.map((c) => ({
      marque: c.target,
      lien: `/appels/${c.slug}`,
      secteur: c.category,
      motif: c.reason,
      a_la_place: c.wanted,
      sources: c.sources,
      retire_le: c.removedAt,
      motif_du_retrait: c.removalReason,
      date: c.createdAt,
    })),
    discussion_sous_un_appel: callComments.map((c) => ({
      appel: c.call.target,
      lien: `/appels/${c.call.slug}`,
      texte: c.body,
      retire_le: c.removedAt,
      date: c.createdAt,
    })),
    appels_soutenus: boycottSupports.map((s) => ({
      marque: s.call.target,
      lien: `/appels/${s.call.slug}`,
      date: s.createdAt,
    })),
    projets_declares_remplacants: boycottAnswers.map((a) => ({
      projet: a.project.title,
      lien_projet: `/projects/${a.project.slug}`,
      marque: a.call.target,
      lien_appel: `/appels/${a.call.slug}`,
      date: a.createdAt,
      detache_le: a.withdrawnAt,
      // Le RÔLE, jamais l'identifiant d'un tiers : « qui » suffit à
      // comprendre la décision, l'identité d'autrui ne fait pas partie des
      // données du demandeur.
      detache_par: a.withdrawnAt
        ? a.withdrawnBy === a.project.ownerId
          ? "toi"
          : a.withdrawnBy
            ? "l'auteur de l'appel ou la modération"
            : "inconnu"
        : null,
    })),
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
