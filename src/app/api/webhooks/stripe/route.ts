import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillContribution } from "@/lib/project-service";
import { sendPendingNotificationEmails } from "@/lib/notification-emails";
import { executeDueRefunds } from "@/lib/payouts";
import { getStripe, stripeEnabled } from "@/lib/stripe";

/**
 * Webhook Stripe : enregistre la contribution quand le paiement Checkout
 * aboutit. Signature vérifiée (STRIPE_WEBHOOK_SECRET) ; idempotent — l'id de
 * session est unique sur Contribution, un paiement ne compte qu'une fois.
 *
 * En local : stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  if (!stripeEnabled || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { kind, projectId, userId, usdCents } = session.metadata ?? {};

    if (
      session.payment_status === "paid" &&
      kind === "contribution" &&
      projectId &&
      userId &&
      typeof session.amount_total === "number"
    ) {
      const { refundNeeded } = await fulfillContribution({
        userId,
        projectId,
        amountMinor: session.amount_total,
        usdCents: Number(usdCents) || 0,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      });
      // Paiement arrivé après la clôture : le remboursement part tout de suite.
      if (refundNeeded) await executeDueRefunds();
      // « Projet financé », « contribution remboursée »… : emails majeurs.
      await sendPendingNotificationEmails();
    }
  }

  return NextResponse.json({ received: true });
}
