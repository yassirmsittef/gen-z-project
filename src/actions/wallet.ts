"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { topUpCredits } from "@/lib/project-service";
import { appUrl, getStripe, stripeEnabled } from "@/lib/stripe";
import { RECHARGE_PRESETS } from "@/lib/constants";

export type RechargeFormState =
  | { error?: string; rechargedAt?: number; checkoutUrl?: string }
  | undefined;

/**
 * Recharge du portefeuille (1 token = 1 $).
 *
 * Stripe configuré → création d'une session Checkout et redirection vers le
 * paiement ; les tokens sont crédités par le webhook `checkout.session.completed`
 * (app/api/webhooks/stripe). Sans clés Stripe (démo locale) → crédit fictif
 * immédiat, tracé BONUS au ledger.
 */
export async function rechargeAction(
  _prev: RechargeFormState,
  formData: FormData
): Promise<RechargeFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const amount = Number(formData.get("amount"));
  if (!RECHARGE_PRESETS.includes(amount as (typeof RECHARGE_PRESETS)[number])) {
    return { error: "Montant de recharge invalide." };
  }

  if (stripeEnabled) {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount * 100, // 1 token = 1 $
            product_data: {
              name: `Recharge Tremplin — ${amount} tokens`,
              description: "1 token = 1 $ · crédités à ton compte après paiement",
            },
          },
        },
      ],
      metadata: { userId: session.user.id, tokens: String(amount) },
      success_url: `${appUrl()}/dashboard?recharge=success`,
      cancel_url: `${appUrl()}/dashboard?recharge=cancel`,
    });
    if (!checkout.url) return { error: "Impossible de créer la session de paiement." };
    // redirect() de Next ne navigue pas de façon fiable vers une URL externe
    // depuis une server action : le client fait la redirection lui-même.
    return { checkoutUrl: checkout.url };
  }

  // Mode démo (pas de clés Stripe) : crédit fictif immédiat.
  await topUpCredits(session.user.id, amount, `Recharge de ${amount} tokens (démo)`);

  revalidatePath("/", "layout");
  return { rechargedAt: Date.now() };
}
