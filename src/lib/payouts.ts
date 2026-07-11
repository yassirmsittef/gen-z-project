import { prisma } from "@/lib/prisma";
import { getStripe, stripeEnabled } from "@/lib/stripe";

/**
 * Versements réels aux porteurs (Stripe Connect, Phase 2 — mode test).
 *
 * Quand une étape est débloquée par le vote, on tente de reverser son montant
 * (1 token = 1 unité de la devise de la plateforme) vers le compte Express du
 * porteur. Le ledger interne en tokens reste la source de vérité : un échec de
 * transfert (compte non configuré, solde plateforme insuffisant...) ne bloque
 * JAMAIS le déblocage — on pourra rejouer le versement plus tard.
 *
 * ⚠️ Cadre réglementaire avant tout lancement réel en UE : encaisser pour
 * compte de tiers exige un agrément (établissement de paiement) ou un
 * partenaire séquestre type Mangopay / Lemonway / Stripe Connect « destination
 * charges ». Le montage actuel (transfers depuis le solde plateforme) est un
 * prototype de test, pas un montage conforme.
 */

/** État du compte Connect d'un porteur, pour l'affichage dashboard. */
export type ConnectStatus = {
  accountId: string;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
};

export async function getConnectStatus(accountId: string): Promise<ConnectStatus | null> {
  if (!stripeEnabled) return null;
  try {
    const account = await getStripe().accounts.retrieve(accountId);
    return {
      accountId,
      detailsSubmitted: Boolean(account.details_submitted),
      payoutsEnabled: Boolean(account.payouts_enabled),
    };
  } catch (error) {
    console.error(`[connect] lecture du compte ${accountId} impossible :`, error);
    return null;
  }
}

/**
 * Exécute les remboursements dus (contributions fléchées à l'échec d'un
 * projet ou arrivées après clôture). Appelé APRÈS les commits — jamais dans
 * une transaction — et rejoué par le cron : idempotent par clé Stripe, un
 * échec réseau laisse `stripeRefundId` vide pour la prochaine passe. Les
 * contributions sans payment_intent (données de démo) sont ignorées.
 */
export async function executeDueRefunds() {
  if (!stripeEnabled) return;

  const due = await prisma.contribution.findMany({
    where: {
      refunded: true,
      refundDueMinor: { gt: 0 },
      stripeRefundId: null,
      stripePaymentIntentId: { not: null },
    },
    select: { id: true, refundDueMinor: true, stripePaymentIntentId: true },
    take: 50, // le cron quotidien draine le reste si gros volume
  });

  const stripe = getStripe();
  for (const c of due) {
    try {
      const refund = await stripe.refunds.create(
        { payment_intent: c.stripePaymentIntentId!, amount: c.refundDueMinor },
        { idempotencyKey: `refund-${c.id}` }
      );
      await prisma.contribution.update({
        where: { id: c.id },
        data: { stripeRefundId: refund.id },
      });
    } catch (error) {
      console.error(`[refund] échec pour la contribution ${c.id} :`, error);
    }
  }
}

/**
 * Transfert du montant débloqué d'une étape vers le compte Connect du porteur.
 * Idempotent (clé Stripe + stripeTransferId en base) et silencieux en échec.
 */
export async function attemptMilestonePayout(milestoneId: string, amount: number) {
  if (!stripeEnabled || amount <= 0) return;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          currency: true,
          owner: { select: { id: true, stripeAccountId: true } },
        },
      },
    },
  });
  if (!milestone || milestone.status !== "RELEASED" || milestone.stripeTransferId) return;

  const accountId = milestone.project.owner.stripeAccountId;
  if (!accountId) return;

  const stripe = getStripe();
  try {
    const account = await stripe.accounts.retrieve(accountId);
    if (!account.payouts_enabled) return;

    // Le virement part dans la DEVISE DU PROJET, montant déjà en unités
    // mineures — les contributions ont alimenté le solde dans cette devise.
    const transfer = await stripe.transfers.create(
      {
        amount,
        currency: milestone.project.currency,
        destination: accountId,
        description: `Tremplin — étape ${milestone.order} « ${milestone.title} » (${milestone.project.title})`,
        metadata: { milestoneId, projectId: milestone.project.id },
      },
      { idempotencyKey: `milestone-payout-${milestoneId}` }
    );

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { stripeTransferId: transfer.id },
    });
  } catch (error) {
    // Solde de test insuffisant, compte restreint... : le déblocage interne
    // reste acquis, le versement pourra être rejoué manuellement.
    console.error(`[payout] transfert Connect impossible pour l'étape ${milestoneId} :`, error);
  }
}
