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

  await prisma.$transaction(async (tx) => {
    // Projets jamais soutenus : suppression pure (les enfants cascadent).
    await tx.project.deleteMany({
      where: { ownerId: userId, contributions: { none: {} } },
    });

    // Données personnelles satellites.
    await tx.notification.deleteMany({ where: { userId } });
    await tx.follow.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });

    // Solde annulé AVEC trace au ledger : l'invariant « somme des mouvements
    // = solde » reste vrai.
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { credits: true },
    });
    if (user.credits !== 0) {
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -user.credits,
          type: "BONUS",
          label: "Compte supprimé — solde annulé",
        },
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        name: "Membre retiré",
        email: `retire-${userId}@compte-supprime.tremplin.invalid`,
        passwordHash: null,
        avatarUrl: null,
        bio: null,
        city: null,
        country: null,
        latitude: null,
        longitude: null,
        skills: [],
        mutedNotifications: [],
        stripeAccountId: null,
        credits: 0,
      },
    });
  });
}
