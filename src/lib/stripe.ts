import Stripe from "stripe";

/**
 * Client Stripe (paiements réels : contributions, remboursements, versements).
 * Si les clés ne sont pas configurées, les paiements sont désactivés
 * (`stripeEnabled`) et les surfaces concernées l'affichent honnêtement.
 */

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquant : Stripe n'est pas configuré.");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** URL absolue de l'app (redirections Checkout). */
export function appUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  // Sur Vercel, l'URL est fournie automatiquement — pas besoin de la câbler à la main.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
