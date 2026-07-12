import { describe, expect, it } from "vitest";
import { splitMilestonePayout, type PayoutSplitContribution } from "../src/lib/payout-split";

/**
 * Répartition pure du versement d'une étape (aucune base requise).
 * L'invariant à protéger : chaque charge ne verse jamais plus que son
 * prorata cumulé (à l'unité près), pour qu'un échec ultérieur du projet
 * puisse toujours rembourser le reste sur la même charge.
 */

const c = (
  id: string,
  amount: number,
  over: Partial<PayoutSplitContribution> = {}
): PayoutSplitContribution => ({
  id,
  amount,
  refunded: false,
  hasCharge: true,
  alreadyPaidMinor: 0,
  ...over,
});

const total = (shares: { amountMinor: number }[]) =>
  shares.reduce((sum, s) => sum + s.amountMinor, 0);

describe("splitMilestonePayout", () => {
  it("répartit au prorata exact quand les montants tombent juste", () => {
    // Le scénario du seed : 500 € collectés, étape 1 de 150 €.
    const shares = splitMilestonePayout({
      release: 15000,
      raised: 50000,
      releasedBefore: 0,
      contributions: [c("léa", 20000), c("max", 15000), c("sam", 10000), c("nina", 5000)],
    });
    expect(shares).toEqual([
      { contributionId: "léa", amountMinor: 6000 },
      { contributionId: "max", amountMinor: 4500 },
      { contributionId: "sam", amountMinor: 3000 },
      { contributionId: "nina", amountMinor: 1500 },
    ]);
  });

  it("complète les arrondis aux plus grands restes — le total fait exactement le release", () => {
    const shares = splitMilestonePayout({
      release: 100,
      raised: 300,
      releasedBefore: 0,
      contributions: [c("a", 100), c("b", 100), c("c", 100)],
    });
    expect(total(shares)).toBe(100);
    // Restes identiques : départage déterministe par id.
    expect(shares.map((s) => s.amountMinor).sort((x, y) => y - x)).toEqual([34, 33, 33]);
  });

  it("ne crée pas de part pour les contributions sans charge, sans gonfler les autres", () => {
    const shares = splitMilestonePayout({
      release: 30,
      raised: 100,
      releasedBefore: 0,
      contributions: [c("réelle", 60), c("démo", 40, { hasCharge: false })],
    });
    // La part de la contribution de démo (12) n'est pas versable : elle
    // n'absorbe PAS le prorata de la charge réelle (18, pas 30).
    expect(shares).toEqual([{ contributionId: "réelle", amountMinor: 18 }]);
  });

  it("exclut les contributions remboursées (arrivées après clôture ou échec)", () => {
    const shares = splitMilestonePayout({
      release: 50,
      raised: 100,
      releasedBefore: 0,
      contributions: [c("ok", 100), c("remboursée", 30, { refunded: true })],
    });
    expect(shares).toEqual([{ contributionId: "ok", amountMinor: 50 }]);
  });

  it("cumule juste sur plusieurs étapes : la dernière vide chaque charge au centime près", () => {
    const contributions = [c("a", 100), c("b", 200)];
    const étape1 = splitMilestonePayout({
      release: 100,
      raised: 300,
      releasedBefore: 0,
      contributions,
    });
    // 33,33 → 33 et 66,67 → 66 +1 (plus grand reste) = 67.
    expect(étape1).toEqual([
      { contributionId: "a", amountMinor: 33 },
      { contributionId: "b", amountMinor: 67 },
    ]);

    const étape2 = splitMilestonePayout({
      release: 200,
      raised: 300,
      releasedBefore: 100,
      contributions: [
        c("a", 100, { alreadyPaidMinor: 33 }),
        c("b", 200, { alreadyPaidMinor: 67 }),
      ],
    });
    expect(étape2).toEqual([
      { contributionId: "a", amountMinor: 67 },
      { contributionId: "b", amountMinor: 133 },
    ]);
    // Cumul = les contributions entières, rien ne reste bloqué.
  });

  it("ne verse jamais plus que le release de l'étape ni que le restant d'une charge", () => {
    // Cas de rattrapage synthétique : le cumul cible dépasse l'étape.
    const shares = splitMilestonePayout({
      release: 50,
      raised: 100,
      releasedBefore: 50,
      contributions: [c("a", 100)],
    });
    expect(shares).toEqual([{ contributionId: "a", amountMinor: 50 }]);

    // Charge presque épuisée : la part est plafonnée à ce qui reste.
    const bornées = splitMilestonePayout({
      release: 50,
      raised: 100,
      releasedBefore: 50,
      contributions: [c("a", 100, { alreadyPaidMinor: 80 })],
    });
    expect(bornées).toEqual([{ contributionId: "a", amountMinor: 20 }]);
  });

  it("écrête d'abord les parts sans charge — jamais un vrai versement à leur place", () => {
    // Étape 2 d'un mix : les quotas dépassent le release (rattrapage), mais
    // l'excédent doit être repris aux parts fantômes, pas aux réelles.
    const shares = splitMilestonePayout({
      release: 70,
      raised: 100,
      releasedBefore: 30,
      contributions: [
        c("a-réelle", 40, { alreadyPaidMinor: 12 }),
        c("b-réelle", 30, { alreadyPaidMinor: 9 }),
        c("c-démo", 20, { hasCharge: false }), // quota passé jamais consommé
        c("d-démo", 10, { hasCharge: false }),
      ],
    });
    expect(shares).toEqual([
      { contributionId: "a-réelle", amountMinor: 28 },
      { contributionId: "b-réelle", amountMinor: 21 },
    ]);
  });

  it("rend une liste vide sans release ou sans collecte", () => {
    expect(
      splitMilestonePayout({ release: 0, raised: 100, releasedBefore: 0, contributions: [c("a", 100)] })
    ).toEqual([]);
    expect(
      splitMilestonePayout({ release: 10, raised: 0, releasedBefore: 0, contributions: [] })
    ).toEqual([]);
  });
});
