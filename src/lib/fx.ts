import { minorPerMajor } from "@/lib/money";

/**
 * Conversion en équivalent USD — UNIQUEMENT pour le gate « 50 $ contribués »
 * et les classements inter-devises. L'équivalent est figé au moment du
 * paiement (Contribution.usdCents) : aucune dérive rétroactive.
 *
 * Taux : open.er-api.com (gratuit, quotidien, base USD), cache mémoire 12 h,
 * et un instantané de secours embarqué (approximatif, assumé — la précision
 * du gate n'est pas critique).
 */

// Unités de devise pour 1 USD (instantané mi-2026, source ECB/er-api).
const FALLBACK_PER_USD: Record<string, number> = {
  usd: 1, eur: 0.93, gbp: 0.79, chf: 0.89, mad: 10.1, tnd: 3.1, xof: 610,
  cad: 1.37, aud: 1.51, jpy: 158, sek: 10.5, nok: 10.7, dkk: 6.9, pln: 4.0,
  czk: 23.2, ron: 4.6, try: 33, aed: 3.67, brl: 5.4, mxn: 18.2, inr: 83.5,
};

let cache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

async function ratesPerUsd(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.rates;
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      const data = (await response.json()) as { rates?: Record<string, number> };
      if (data.rates) {
        const rates = Object.fromEntries(
          Object.entries(data.rates).map(([k, v]) => [k.toLowerCase(), v])
        );
        cache = { rates, fetchedAt: Date.now() };
        return rates;
      }
    }
  } catch {
    // réseau/API en panne : le secours embarqué prend le relais
  }
  return FALLBACK_PER_USD;
}

/**
 * Équivalent en cents US d'un montant en unités mineures d'une devise.
 * `ratePerUsd` injectable (tests) : unités de la devise pour 1 USD.
 */
export async function usdCentsFromMinor(
  amountMinor: number,
  currency: string,
  ratePerUsd?: number
): Promise<number> {
  const c = currency.toLowerCase();
  if (c === "usd") return amountMinor;
  const rate =
    ratePerUsd ?? (await ratesPerUsd())[c] ?? FALLBACK_PER_USD[c];
  if (!rate) return 0; // devise inconnue : ne compte pas vers le gate
  const major = amountMinor / minorPerMajor(c);
  return Math.round((major / rate) * 100);
}

/**
 * Conversion INDICATIVE entre deux devises (via USD, taux du jour) — pour
 * l'AFFICHAGE dans la devise préférée du membre, jamais pour un paiement.
 * Devise inconnue → null (l'appelant garde alors le montant d'origine).
 */
export async function convertMinor(
  amountMinor: number,
  from: string,
  to: string
): Promise<number | null> {
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  if (f === t) return amountMinor;
  const rates = await ratesPerUsd();
  const rateFrom = rates[f] ?? FALLBACK_PER_USD[f];
  const rateTo = rates[t] ?? FALLBACK_PER_USD[t];
  if (!rateFrom || !rateTo) return null;
  const major = amountMinor / minorPerMajor(f);
  return Math.round((major / rateFrom) * rateTo * minorPerMajor(t));
}
