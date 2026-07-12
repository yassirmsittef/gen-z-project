/**
 * Argent réel multi-devises : chaque projet vit dans UNE devise (code ISO
 * minuscule accepté par Stripe), tous ses montants en unités MINEURES.
 * L'affichage passe par Intl.NumberFormat — jamais de format maison.
 */

/** Devises proposées à la création de projet (extensible). */
export const CURRENCIES = [
  { code: "eur", label: "Euro (€)" },
  { code: "usd", label: "Dollar US ($)" },
  { code: "gbp", label: "Livre sterling (£)" },
  { code: "chf", label: "Franc suisse (CHF)" },
  { code: "mad", label: "Dirham marocain (MAD)" },
  { code: "tnd", label: "Dinar tunisien (TND)" },
  { code: "xof", label: "Franc CFA (XOF)" },
  { code: "cad", label: "Dollar canadien (CA$)" },
  { code: "aud", label: "Dollar australien (AU$)" },
  { code: "jpy", label: "Yen (¥)" },
  { code: "sek", label: "Couronne suédoise (SEK)" },
  { code: "nok", label: "Couronne norvégienne (NOK)" },
  { code: "dkk", label: "Couronne danoise (DKK)" },
  { code: "pln", label: "Złoty (PLN)" },
  { code: "czk", label: "Couronne tchèque (CZK)" },
  { code: "ron", label: "Leu roumain (RON)" },
  { code: "try", label: "Livre turque (TRY)" },
  { code: "aed", label: "Dirham émirati (AED)" },
  { code: "brl", label: "Réal brésilien (R$)" },
  { code: "mxn", label: "Peso mexicain (MX$)" },
  { code: "inr", label: "Roupie indienne (₹)" },
] as const;

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as unknown as string[];

// Listes Stripe : devises sans subdivision, et à 3 décimales.
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf",
  "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);
const THREE_DECIMAL = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

export function minorPerMajor(currency: string): number {
  const c = currency.toLowerCase();
  if (ZERO_DECIMAL.has(c)) return 1;
  if (THREE_DECIMAL.has(c)) return 1000;
  return 100;
}

export const toMinor = (major: number, currency: string) =>
  Math.round(major * minorPerMajor(currency));

export const toMajor = (minor: number, currency: string) => minor / minorPerMajor(currency);

/** « 350 CHF », « 210,50 € », « 500 MAD » — entiers sans décimales inutiles. */
export function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    trailingZeroDisplay: "stripIfInteger",
  }).format(toMajor(minor, currency));
}

/**
 * Montant arrondi à l'unité (« 405 $US ») — pour les jauges et espaces
 * étroits où les centimes n'apportent rien. Jamais pour un paiement.
 */
export function formatMoneyRounded(minor: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(toMajor(minor, currency));
}
