import { prisma } from "@/lib/prisma";
import { getStripe, stripeEnabled } from "@/lib/stripe";

/**
 * Versements réels aux porteurs (Stripe Connect, mode test).
 *
 * Quand une étape est débloquée par le vote, son montant est réparti en
 * parts (`MilestonePayout`) adossées aux charges Stripe des contributions du
 * projet, figées en transaction. Chaque part devient un transfer
 * `source_transaction` vers le compte Express du porteur : aucun solde
 * plateforme n'est requis (le compte règle en CHF, les projets sont dans
 * leur propre devise — un transfer standalone échouerait toujours) et la
 * devise du projet est gardée de bout en bout. Un échec (compte non
 * configuré, onboarding incomplet…) ne bloque JAMAIS le déblocage : la part
 * reste due et le cron quotidien la rejoue.
 *
 * ⚠️ Cadre réglementaire avant tout lancement réel en UE : encaisser pour
 * compte de tiers exige un agrément (établissement de paiement) ou un
 * partenaire séquestre type Mangopay / Lemonway. Le montage actuel est un
 * prototype de test, pas un montage conforme (voir docs/sequestre-ue.md).
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
 * Exécute les parts de versement dues (étapes débloquées pas encore
 * transférées). Appelé APRÈS les commits — jamais dans une transaction — et
 * rejoué par le cron : idempotent par clé Stripe, un échec laisse
 * `stripeTransferId` vide pour la prochaine passe. Les parts sans
 * payment_intent n'existent pas (filtrées à la répartition).
 */
export async function executeDuePayouts() {
  if (!stripeEnabled) return;

  const due = await prisma.milestonePayout.findMany({
    where: { stripeTransferId: null },
    include: {
      contribution: {
        select: { id: true, stripePaymentIntentId: true, stripeChargeId: true },
      },
      milestone: {
        select: {
          id: true,
          order: true,
          title: true,
          project: {
            select: {
              title: true,
              currency: true,
              owner: { select: { stripeAccountId: true } },
            },
          },
        },
      },
    },
    take: 50, // le cron quotidien draine le reste si gros volume
  });
  if (due.length === 0) return;

  const stripe = getStripe();
  // Un même porteur revient sur plusieurs parts : chaque compte Connect
  // n'est vérifié qu'une fois par passe.
  const accountReady = new Map<string, boolean>();

  for (const part of due) {
    // Le porteur n'a pas (fini de) configurer ses versements : la part
    // reste due, le cron la rejouera après son onboarding.
    const accountId = part.milestone.project.owner.stripeAccountId;
    if (!accountId) continue;

    try {
      let ready = accountReady.get(accountId);
      if (ready === undefined) {
        const account = await stripe.accounts.retrieve(accountId);
        ready = Boolean(account.payouts_enabled);
        accountReady.set(accountId, ready);
      }
      if (!ready) continue;

      // La charge à adosser : cachée sur la contribution, sinon résolue une
      // fois pour toutes depuis le payment_intent.
      let chargeId = part.contribution.stripeChargeId;
      if (!chargeId) {
        if (!part.contribution.stripePaymentIntentId) continue;
        const pi = await stripe.paymentIntents.retrieve(
          part.contribution.stripePaymentIntentId
        );
        chargeId =
          typeof pi.latest_charge === "string"
            ? pi.latest_charge
            : (pi.latest_charge?.id ?? null);
        if (!chargeId) continue;
        await prisma.contribution.update({
          where: { id: part.contribution.id },
          data: { stripeChargeId: chargeId },
        });
      }

      // Un transfer adossé part dans la devise de RÈGLEMENT de la charge
      // (sa balance transaction — ex. CHF pour un compte suisse), pas dans
      // la devise de présentation du projet. La part est convertie au taux
      // de règlement EXACT de sa charge (ratio réglé/payé, arrondi bas :
      // le résidu d'arrondi reste sur le solde plateforme).
      const charge = await stripe.charges.retrieve(chargeId, {
        expand: ["balance_transaction"],
      });
      const settled =
        typeof charge.balance_transaction === "object" ? charge.balance_transaction : null;
      if (!settled) continue;
      const amount =
        settled.currency === charge.currency
          ? part.amountMinor
          : Math.floor((part.amountMinor * settled.amount) / charge.amount);
      if (amount <= 0) continue;

      const transfer = await stripe.transfers.create(
        {
          amount,
          currency: settled.currency,
          destination: accountId,
          source_transaction: chargeId,
          description: `GeniGain — étape ${part.milestone.order} « ${part.milestone.title} » (${part.milestone.project.title})`,
          metadata: { milestoneId: part.milestone.id, contributionId: part.contribution.id },
        },
        // v2 : le montant/devise de règlement ont changé après la première
        // itération — une clé v1 échouée reste réservée 24 h chez Stripe.
        { idempotencyKey: `milestone-payout-v2-${part.id}` }
      );

      await prisma.milestonePayout.update({
        where: { id: part.id },
        data: { stripeTransferId: transfer.id },
      });
    } catch (error) {
      // Compte restreint, charge remboursée entre-temps… : le déblocage
      // interne reste acquis, la part sera rejouée à la prochaine passe.
      console.error(`[payout] transfert impossible pour la part ${part.id} :`, error);
    }
  }
}
