/**
 * Mode Stripe : argent RÉEL (clés live) ou mode test. Source de vérité unique
 * pour toutes les surfaces qui doivent le dire honnêtement (bandeaux, CGU,
 * FAQ, onboarding versements). Le jour de la mise en ligne, il suffit de
 * basculer les clés Stripe en `..._live_...` : tout le texte suit
 * automatiquement, sans chasse aux chaînes en dur.
 *
 * Ce module ne charge PAS le SDK Stripe (contrairement à `stripe.ts`) : il est
 * donc importable aussi bien côté serveur que client. Côté serveur, le mode se
 * lit sur la clé secrète (fiable) ; côté client, sur la clé publiable inlinée
 * au build (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) — les deux doivent être
 * cohérentes (test ou live ensemble).
 */
export const stripeLive = /_live_/.test(
  process.env.STRIPE_SECRET_KEY ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);
