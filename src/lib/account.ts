import { deleteOwnBlob } from "@/lib/blob";
import { detachVideoFiles } from "@/lib/call-videos";
import { ERASED_EMAIL_DOMAIN } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/project-service";

/**
 * Droit à l'effacement (RGPD) — anonymisation plutôt que destruction.
 *
 * La ligne User reste : contributions, votes, commentaires, messages et
 * ledger gardent leur cohérence (le jeu communautaire et les comptes ne
 * mentent jamais), mais elle ne porte plus aucune donnée personnelle et ne
 * peut plus se connecter (passwordHash null, email neutralisé, comptes OAuth
 * et sessions supprimés). Les JWT déjà émis sur d'autres appareils expirent
 * d'eux-mêmes (limite assumée en Phase 1).
 *
 * Un porteur ne disparaît pas au milieu d'une campagne soutenue : tant qu'un
 * de ses projets ACTIVE ou FUNDED a au moins une contribution, l'effacement
 * est refusé. Ses projets jamais soutenus sont supprimés purement.
 */
export async function eraseAccount(userId: string) {
  const blocking = await prisma.project.count({
    where: {
      ownerId: userId,
      status: { in: ["ACTIVE", "FUNDED"] },
      contributions: { some: {} },
    },
  });
  if (blocking > 0) {
    throw new DomainError(
      "Tes campagnes soutenues par la communauté doivent d'abord finir leur cycle " +
        "(réalisées ou échouées) : un projet financé ne peut pas perdre son porteur."
    );
  }

  // Lu AVANT la transaction : après l'anonymisation, plus personne ne sait
  // quel fichier effacer.
  const avant = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  await prisma.$transaction(async (tx) => {
    // Projets jamais soutenus : suppression pure (les enfants cascadent).
    await tx.project.deleteMany({
      where: { ownerId: userId, contributions: { none: {} } },
    });

    // Groupes de chat animés : la main passe au membre le plus ancien pour
    // que le salon (et les messages des autres) survivent ; sans repreneur,
    // le groupe est dissous.
    const owned = await tx.chatGroup.findMany({ where: { ownerId: userId }, select: { id: true } });
    for (const group of owned) {
      const heir = await tx.chatGroupMember.findFirst({
        where: { groupId: group.id, userId: { not: userId } },
        orderBy: { joinedAt: "asc" },
        select: { userId: true },
      });
      if (heir) {
        await tx.chatGroup.update({ where: { id: group.id }, data: { ownerId: heir.userId } });
      } else {
        await tx.chatGroup.delete({ where: { id: group.id } });
      }
    }

    // Données personnelles satellites.
    await tx.chatGroupMember.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.follow.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    // Sans ça, un lien de réinitialisation émis AVANT la suppression reste
    // valable : il reposerait un passwordHash sur la ligne anonymisée et
    // ressusciterait le compte (l'email neutralisé se déduit de l'id public).
    await tx.passwordResetToken.deleteMany({ where: { userId } });

    // Ce que l'audit a trouvé APRÈS l'anonymisation de la ligne User : le nom
    // réel survivait ailleurs, chez les autres.
    // 1. Les lignes « X a rejoint le salon » (matière rendue à la lecture) :
    //    plus de nom, la phrase devient « Un membre a rejoint ».
    await tx.groupMessage.updateMany({
      where: { senderId: userId, system: true },
      data: { systemParams: { name: null }, body: "Un membre a rejoint le groupe. Bienvenue !" },
    });
    // 2. Les notifications reçues par les AUTRES (« X t'a écrit », « X a
    //    commenté ») portent le nom dans leurs paramètres. On ne sait pas
    //    toutes les retrouver par un identifiant — on prend celles qui
    //    pointent vers la personne (son profil, sa conversation) et celles
    //    dont l'acteur porte exactement son nom.
    const avantNom = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
    const touchees = await tx.notification.findMany({
      where: {
        OR: [
          { href: { contains: `/u/${userId}` } },
          { href: { contains: `/chat/${userId}` } },
          ...(avantNom?.name ? [{ params: { path: ["actorName"], equals: avantNom.name } }] : []),
        ],
      },
      select: { id: true, params: true },
    });
    for (const n of touchees) {
      const params = (n.params ?? {}) as Record<string, unknown>;
      if (!("actorName" in params)) continue;
      await tx.notification.update({
        where: { id: n.id },
        data: { params: { ...params, actorName: "Membre retiré" }, excerpt: null },
      });
    }
    // 3. Le texte libre des signalements qu'elle a écrits : le motif (jeu
    //    fermé) suffit à la modération, la précision libre est à elle.
    await tx.report.updateMany({ where: { reporterId: userId }, data: { detail: null } });

    await tx.user.update({
      where: { id: userId },
      data: {
        name: "Membre retiré",
        email: `retire-${userId}${ERASED_EMAIL_DOMAIN}`,
        passwordHash: null,
        // Les sessions encore ouvertes sur d'autres appareils tombent.
        sessionVersion: { increment: 1 },
        avatarUrl: null,
        bio: null,
        city: null,
        country: null,
        latitude: null,
        longitude: null,
        skills: [],
        // Les liens publics (réseaux, site perso) ré-identifient la personne
        // aussi sûrement qu'un nom : ils partent avec le reste.
        links: [],
        mutedNotifications: [],
        stripeAccountId: null,
      },
    });
  });

  // Après commit : la photo elle-même, pas seulement son URL en base. Sans
  // ça, le fichier reste servi publiquement alors que /confidentialite
  // promet qu'il est effacé.
  await deleteOwnBlob(avant?.avatarUrl);

  // Les témoignages FILMÉS de la personne, pour la même raison — et la raison
  // est plus forte encore : on y voit son visage et on y entend sa voix.
  // Anonymiser la ligne User pendant que la vidéo continue de tourner sur
  // /direct n'efface rien du tout, et le compte étant clos, la personne n'a
  // même plus le moyen de la retirer elle-même.
  await detachVideoFiles(
    { authorId: userId },
    { actorId: userId, reason: "Compte effacé à la demande de son titulaire (RGPD)." }
  );
}
