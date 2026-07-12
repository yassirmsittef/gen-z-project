/**
 * Répartition du versement d'une étape débloquée sur les contributions du
 * projet — fonction PURE (aucun accès base ni réseau), testée isolément.
 *
 * Pourquoi proportionnel : chaque versement est adossé à la charge Stripe
 * d'une contribution (transfer `source_transaction`). Si le projet échoue
 * après une étape versée, le séquestre restant est remboursé au prorata sur
 * ces MÊMES charges — chacune doit donc conserver exactement sa part non
 * débloquée. La répartition proportionnelle le garantit par construction :
 * après l'étape k, la contribution c a versé ≈ c × (released/raised) et il
 * lui reste ≈ c × (1 − released/raised), soit précisément son prorata de
 * remboursement.
 *
 * Les montants sont en unités mineures (entiers). Les quotas sont calculés en
 * CUMULÉ (floor(c × releasedAprès / raised) − déjà figé) pour que les erreurs
 * d'arrondi ne s'accumulent pas d'une étape à l'autre : à la dernière étape,
 * le cumul atteint la contribution entière au centime près.
 */

export type PayoutSplitContribution = {
  id: string;
  /** Montant de la contribution, unités mineures (compte dans `raised`). */
  amount: number;
  /** Contribution remboursée ou fléchée remboursement : jamais de part. */
  refunded: boolean;
  /** Une charge Stripe existe (payment_intent) : la part est versable. */
  hasCharge: boolean;
  /** Somme des parts déjà figées sur cette contribution (étapes passées). */
  alreadyPaidMinor: number;
};

export type PayoutShare = { contributionId: string; amountMinor: number };

export function splitMilestonePayout(params: {
  /** Montant débloqué par CETTE étape, unités mineures. */
  release: number;
  /** Total collecté du projet (base du prorata). */
  raised: number;
  /** Somme des releases des étapes précédentes. */
  releasedBefore: number;
  contributions: PayoutSplitContribution[];
}): PayoutShare[] {
  const { release, raised, releasedBefore, contributions } = params;
  if (release <= 0 || raised <= 0) return [];

  const cumulTarget = releasedBefore + release;
  const eligible = contributions.filter((c) => !c.refunded && c.amount > 0);

  // Quota cumulé cible de chaque contribution, puis part de cette étape =
  // cible − déjà figé, bornée par ce qui reste réellement sur la charge.
  const shares = eligible.map((c) => {
    const exact = (c.amount * cumulTarget) / raised;
    const target = Math.floor(exact);
    const cap = c.amount - c.alreadyPaidMinor;
    const amount = Math.min(Math.max(target - c.alreadyPaidMinor, 0), Math.max(cap, 0));
    return { c, amount, remainder: exact - target };
  });

  // Les floors laissent quelques unités non attribuées : on les distribue aux
  // plus grands restes fractionnaires (ordre déterministe), sans dépasser ni
  // la charge de chacun ni le montant de l'étape.
  let assigned = shares.reduce((sum, s) => sum + s.amount, 0);
  if (assigned < release) {
    const byRemainder = [...shares].sort(
      (a, b) => b.remainder - a.remainder || a.c.id.localeCompare(b.c.id)
    );
    for (const s of byRemainder) {
      if (assigned >= release) break;
      if (s.amount < s.c.amount - s.c.alreadyPaidMinor) {
        s.amount += 1;
        assigned += 1;
      }
    }
  } else if (assigned > release) {
    // On ne verse jamais plus que le montant débloqué par l'étape courante.
    // L'écrêtage frappe D'ABORD les parts sans charge (jamais émises — de
    // simples quotas comptables), pour ne jamais amputer un vrai versement
    // à leur place.
    const trimOrder = [...shares].sort(
      (a, b) =>
        Number(a.c.hasCharge) - Number(b.c.hasCharge) ||
        b.amount - a.amount ||
        a.c.id.localeCompare(b.c.id)
    );
    for (const s of trimOrder) {
      if (assigned <= release) break;
      const trim = Math.min(s.amount, assigned - release);
      s.amount -= trim;
      assigned -= trim;
    }
  }

  // Seules les contributions avec charge Stripe produisent une ligne : les
  // autres (données de démo) n'ont pas d'argent réel à adosser.
  return shares
    .filter((s) => s.c.hasCharge && s.amount > 0)
    .map((s) => ({ contributionId: s.c.id, amountMinor: s.amount }));
}
