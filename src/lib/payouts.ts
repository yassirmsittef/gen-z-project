import { prisma } from "@/lib/prisma";
import { getStripe, stripeEnabled } from "@/lib/stripe";

/**
 * Versements réels aux porteurs (Stripe Connect).
 *
 * SÉQUESTRE CHEZ LE PORTEUR (décision fondateur 2026-09-05). Dès qu'une
 * contribution est encaissée, le NET de sa charge part sur le compte Connect
 * du porteur (transfer adossé `source_transaction`) : le solde de la
 * plateforme revient à zéro en quelques secondes. Le compte du porteur est en
 * payouts MANUELS : l'argent y attend, sans partir vers sa banque, jusqu'à ce
 * que la plateforme libère une étape validée (payout). Si le projet échoue,
 * la part non libérée est d'abord rapatriée (reversal du transfer), puis
 * remboursée au contributeur. Résultat : rien n'est concentré chez la
 * plateforme — un accès volé ne trouve rien à vider, un gel ne bloque pas
 * des millions, et la plateforme redevient un orchestrateur, pas un
 * dépositaire (cf docs/sequestre-ue.md). Les contributions d'AVANT (sans
 * `stripeEscrowTransferId`) suivent l'ancien chemin, conservé plus bas.
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
 * Un compte Connect prêt à RECEVOIR le séquestre : onboarding fini et
 * versements activés. Vérifié avant chaque contribution (assertCanContribute)
 * — sinon le transfer adossé échouerait et l'argent resterait chez la
 * plateforme, l'exact contraire du modèle.
 */
export async function ownerAccountReady(accountId: string | null): Promise<boolean> {
  if (!accountId || !stripeEnabled) return false;
  const status = await getConnectStatus(accountId);
  return Boolean(status?.payoutsEnabled);
}

/**
 * Impose les payouts MANUELS sur un compte Connect. Posé à la création
 * (connect.ts) ; rejoué ici pour les comptes créés avant ce modèle — sans
 * « manual », Stripe virerait tout automatiquement et il n'y aurait plus de
 * séquestre. Mémorisé par processus pour ne pas relire cent fois le même compte.
 */
const manualEnsured = new Set<string>();
export async function ensureManualPayouts(accountId: string): Promise<void> {
  if (manualEnsured.has(accountId)) return;
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);
  if (account.settings?.payouts?.schedule?.interval !== "manual") {
    await stripe.accounts.update(accountId, {
      settings: { payouts: { schedule: { interval: "manual" } } },
    });
  }
  manualEnsured.add(accountId);
}

/** La charge d'une contribution avec son règlement (net des frais Stripe). */
async function settledCharge(contribution: {
  id: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
}) {
  const stripe = getStripe();
  let chargeId = contribution.stripeChargeId;
  if (!chargeId) {
    if (!contribution.stripePaymentIntentId) return null;
    const pi = await stripe.paymentIntents.retrieve(contribution.stripePaymentIntentId);
    chargeId =
      typeof pi.latest_charge === "string" ? pi.latest_charge : (pi.latest_charge?.id ?? null);
    if (!chargeId) return null;
    await prisma.contribution.update({
      where: { id: contribution.id },
      data: { stripeChargeId: chargeId },
    });
  }
  const charge = await stripe.charges.retrieve(chargeId, { expand: ["balance_transaction"] });
  const settled =
    typeof charge.balance_transaction === "object" ? charge.balance_transaction : null;
  if (!settled || settled.amount <= 0) return null;
  return { chargeId, charge, settled };
}

/**
 * Date de bascule du modèle : une contribution plus ancienne sans séquestre
 * chez le porteur suit l'ancien chemin (transfer à la libération) — elle a été
 * encaissée sous l'ancien régime et son argent est sur le solde plateforme.
 */
export const ESCROW_MODEL_SINCE = new Date("2026-09-05T00:00:00Z");

/**
 * Met une contribution sous séquestre CHEZ LE PORTEUR : le net de sa charge
 * part sur son compte Connect, adossé à la charge (aucun solde plateforme
 * requis). Idempotent par clé Stripe ; un échec (compte pas prêt, règlement
 * pas encore connu) laisse `stripeEscrowTransferId` vide et le cron rejoue.
 * Retourne true quand le séquestre est en place.
 */
export async function escrowContribution(contributionId: string): Promise<boolean> {
  if (!stripeEnabled) return false;
  const c = await prisma.contribution.findUnique({
    where: { id: contributionId },
    select: {
      id: true,
      refunded: true,
      stripeEscrowTransferId: true,
      stripePaymentIntentId: true,
      stripeChargeId: true,
      project: { select: { title: true, owner: { select: { stripeAccountId: true } } } },
    },
  });
  if (!c) return false;
  if (c.stripeEscrowTransferId) return true;
  if (c.refunded) return false;
  const accountId = c.project.owner.stripeAccountId;
  if (!accountId) return false;
  try {
    if (!(await ownerAccountReady(accountId))) return false;
    await ensureManualPayouts(accountId);
    const s = await settledCharge(c);
    if (!s) return false;
    const transfer = await getStripe().transfers.create(
      {
        amount: s.settled.net,
        currency: s.settled.currency,
        destination: accountId,
        source_transaction: s.chargeId,
        description: `GeniGain — séquestre « ${c.project.title} »`,
        metadata: { contributionId: c.id, kind: "escrow" },
      },
      { idempotencyKey: `escrow-v1-${c.id}` }
    );
    await prisma.contribution.update({
      where: { id: c.id },
      data: { stripeEscrowTransferId: transfer.id },
    });
    return true;
  } catch (error) {
    console.error(`[séquestre] mise sous séquestre impossible pour ${c.id} :`, error);
    return false;
  }
}

/** Rejoue les mises sous séquestre manquées (webhook tombé, compte pas prêt). */
export async function executeDueEscrowTransfers() {
  if (!stripeEnabled) return;
  const due = await prisma.contribution.findMany({
    where: {
      stripeEscrowTransferId: null,
      refunded: false,
      stripePaymentIntentId: { not: null },
      // Seules les contributions nées SOUS ce modèle : les anciennes gardent
      // l'ancien chemin, on ne les migre pas.
      createdAt: { gte: ESCROW_MODEL_SINCE },
    },
    select: { id: true },
    take: 50,
  });
  for (const c of due) await escrowContribution(c.id);
}

/**
 * Exécute les remboursements dus (contributions fléchées à l'échec d'un
 * projet ou arrivées après clôture). Appelé APRÈS les commits — jamais dans
 * une transaction — et rejoué par le cron : idempotent par clé Stripe, un
 * échec réseau laisse `stripeRefundId` vide pour la prochaine passe. Les
 * contributions sans payment_intent (données de démo) sont ignorées.
 *
 * Décision fondateur 2026-07-12 (« ne pas absorber un centime, remboursements
 * inclus ») : le remboursement est NET des frais Stripe, comme les versements.
 * Stripe ne rend JAMAIS la commission de traitement d'origine sur un
 * remboursement — la rembourser en brut ferait perdre cette commission à la
 * plateforme. On applique donc le ratio net/brut EXACT de la charge (sa
 * balance transaction) au montant dû : le contributeur récupère ce qui avait
 * réellement été encaissé, la plateforme finit à zéro. Divulgué avant paiement
 * (formulaire de contribution + CGU). Reste inévitablement absorbé : les frais
 * de LITIGE (chargeback), que Stripe facture sans contrepartie récupérable.
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
    select: {
      id: true,
      refundDueMinor: true,
      stripePaymentIntentId: true,
      stripeChargeId: true,
      stripeEscrowTransferId: true,
      stripeEscrowReversalId: true,
    },
    take: 50, // le cron quotidien draine le reste si gros volume
  });

  const stripe = getStripe();
  for (const c of due) {
    try {
      const s = await settledCharge(c);
      if (!s) continue;
      // Ratio net/brut EXACT de la charge (frais Stripe déduits) appliqué au
      // montant dû, dans la devise de la charge (arrondi bas). Si le règlement
      // n'est pas encore connu, le cron rejouera.
      const netRefund = Math.floor((c.refundDueMinor * s.settled.net) / s.settled.amount);
      if (netRefund <= 0) continue;

      // Séquestre chez le porteur : l'argent est sur SON compte. On le
      // rapatrie d'abord (reversal du transfer adossé — ses payouts sont
      // manuels, la part non libérée y est encore), PUIS on rembourse.
      // Idempotent : un reversal déjà fait n'est pas rejoué.
      if (c.stripeEscrowTransferId && !c.stripeEscrowReversalId) {
        const reversal = await stripe.transfers.createReversal(
          c.stripeEscrowTransferId,
          { amount: netRefund, metadata: { contributionId: c.id, kind: "escrow-reversal" } },
          { idempotencyKey: `escrow-reversal-v1-${c.id}` }
        );
        await prisma.contribution.update({
          where: { id: c.id },
          data: { stripeEscrowReversalId: reversal.id },
        });
      }

      const refund = await stripe.refunds.create(
        { payment_intent: c.stripePaymentIntentId!, amount: netRefund },
        // v2 : le montant est passé au NET des frais Stripe — une clé v1
        // (montant brut) échouée reste réservée 24 h chez Stripe.
        { idempotencyKey: `refund-v2-${c.id}` }
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
  await executeDueEscrowPayouts();

  const due = await prisma.milestonePayout.findMany({
    // Ancien chemin seulement : les parts dont la contribution est sous
    // séquestre chez le porteur sont libérées par executeDueEscrowPayouts.
    where: {
      stripeTransferId: null,
      stripePayoutId: null,
      contribution: { stripeEscrowTransferId: null },
    },
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
      // la devise de présentation du projet. La part est convertie au ratio
      // NET/payé de sa charge (net = réglé moins frais Stripe, arrondi bas :
      // le résidu d'arrondi reste sur le solde plateforme).
      // Décision fondateur 2026-07-12 (« à l'équilibre des deux côtés ») :
      // 0 % de commission ET la plateforme n'absorbe pas les frais bancaires
      // — ils sont déduits des versements ET des remboursements (cf
      // executeDueRefunds) ; le contributeur paie pile son montant. Seul reste
      // inévitablement absorbé : les frais de litige (chargeback).
      const charge = await stripe.charges.retrieve(chargeId, {
        expand: ["balance_transaction"],
      });
      const settled =
        typeof charge.balance_transaction === "object" ? charge.balance_transaction : null;
      if (!settled) continue;
      const amount = Math.floor((part.amountMinor * settled.net) / charge.amount);
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
        // v3 : le montant est passé au NET des frais Stripe (v2 = brut réglé,
        // v1 = devise projet) — une clé échouée reste réservée 24 h chez Stripe.
        { idempotencyKey: `milestone-payout-v3-${part.id}` }
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

/**
 * Libération d'une étape sous le NOUVEAU modèle : les parts dues dont la
 * contribution est sous séquestre chez le porteur sont converties au net de
 * leur charge, AGRÉGÉES par étape (même porteur, même devise de règlement) et
 * versées en UN payout depuis le compte Connect du porteur vers sa banque.
 * Un payout par étape plutôt qu'un par contribution : moins de frais
 * bancaires, et aucune part sous le minimum de payout de Stripe. Tout ou
 * rien par étape : un échec ne marque aucune part, le cron rejoue.
 */
export async function executeDueEscrowPayouts() {
  if (!stripeEnabled) return;
  const due = await prisma.milestonePayout.findMany({
    where: {
      stripeTransferId: null,
      stripePayoutId: null,
      contribution: { stripeEscrowTransferId: { not: null } },
    },
    include: {
      contribution: { select: { id: true, stripePaymentIntentId: true, stripeChargeId: true } },
      milestone: {
        select: {
          id: true,
          order: true,
          title: true,
          project: {
            select: { title: true, owner: { select: { stripeAccountId: true } } },
          },
        },
      },
    },
    take: 200,
  });
  if (due.length === 0) return;
  const stripe = getStripe();

  // Regroupement (étape, devise de règlement) → parts + montant net cumulé.
  type Groupe = {
    accountId: string;
    currency: string;
    parts: string[];
    amount: number;
    milestone: (typeof due)[number]["milestone"];
  };
  const groupes = new Map<string, Groupe>();
  for (const part of due) {
    const accountId = part.milestone.project.owner.stripeAccountId;
    if (!accountId) continue;
    try {
      const s = await settledCharge(part.contribution);
      if (!s) continue;
      const net = Math.floor((part.amountMinor * s.settled.net) / s.charge.amount);
      if (net <= 0) continue;
      const cle = `${part.milestone.id}:${s.settled.currency}`;
      const g = groupes.get(cle) ?? {
        accountId,
        currency: s.settled.currency,
        parts: [],
        amount: 0,
        milestone: part.milestone,
      };
      g.parts.push(part.id);
      g.amount += net;
      groupes.set(cle, g);
    } catch (error) {
      console.error(`[libération] part ${part.id} illisible :`, error);
    }
  }

  for (const g of groupes.values()) {
    try {
      if (!(await ownerAccountReady(g.accountId))) continue;
      await ensureManualPayouts(g.accountId);
      const payout = await stripe.payouts.create(
        {
          amount: g.amount,
          currency: g.currency,
          description: `GeniGain — étape ${g.milestone.order} « ${g.milestone.title} » (${g.milestone.project.title})`,
          metadata: { milestoneId: g.milestone.id, parts: String(g.parts.length) },
        },
        // Le montant fait partie de la clé : si l'ensemble des parts dues
        // changeait entre deux passes, Stripe refuserait une clé réutilisée
        // avec d'autres paramètres.
        {
          stripeAccount: g.accountId,
          idempotencyKey: `escrow-payout-v1-${g.milestone.id}-${g.currency}-${g.amount}`,
        }
      );
      await prisma.milestonePayout.updateMany({
        where: { id: { in: g.parts } },
        data: { stripePayoutId: payout.id },
      });
    } catch (error) {
      // Solde insuffisant (règlement en cours), compte restreint… : la
      // libération interne reste acquise, l'étape sera rejouée.
      console.error(`[libération] payout impossible pour l'étape ${g.milestone.id} :`, error);
    }
  }
}
