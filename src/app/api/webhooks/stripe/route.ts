import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { topUpCredits } from "@/lib/project-service";
import { getStripe, stripeEnabled } from "@/lib/stripe";

/**
 * Webhook Stripe : crédite les tokens quand un paiement Checkout aboutit.
 * Signature vérifiée (STRIPE_WEBHOOK_SECRET) ; idempotent — l'id de session
 * est stocké en refId de la transaction, une session ne crédite qu'une fois.
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
    const userId = session.metadata?.userId;
    const tokens = Number(session.metadata?.tokens);

    if (session.payment_status === "paid" && userId && Number.isInteger(tokens) && tokens > 0) {
      // Idempotence : cette session a-t-elle déjà crédité ?
      const already = await prisma.creditTransaction.findFirst({
        where: { refId: session.id },
        select: { id: true },
      });
      if (!already) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (user) {
          await topUpCredits(userId, tokens, `Recharge Stripe — ${tokens} tokens`, session.id);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
