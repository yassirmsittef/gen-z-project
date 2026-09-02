import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
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
    const { kind, projectId, userId, usdCents, anonymous } = session.metadata ?? {};

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
        anonymous: anonymous === "1",
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

  // Argent qui REVIENT hors de l'application — remboursement fait depuis le
  // tableau de bord Stripe, ou litige ouvert par le contributeur auprès de sa
  // banque. Sans ces deux écoutes, la contribution restait « valide » : elle
  // pesait encore dans les votes (débloquer l'argent des autres avec de
  // l'argent qu'on a récupéré) et restait éligible aux versements. On la
  // marque remboursée — plus de poids, plus de part — et rien n'est dû par la
  // plateforme puisque l'argent est déjà reparti.
  if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
    const objet = event.data.object as Stripe.Charge | Stripe.Dispute;
    const charge = event.type === "charge.refunded" ? (objet as Stripe.Charge) : null;
    const dispute = event.type === "charge.dispute.created" ? (objet as Stripe.Dispute) : null;
    const paymentIntent =
      typeof (charge ?? dispute)?.payment_intent === "string"
        ? ((charge ?? dispute)!.payment_intent as string)
        : null;
    // Un remboursement PARTIEL laisse la contribution en place : c'est le
    // remboursement intégral (ou le litige, qui gèle tout) qui retire le poids.
    const integral = charge ? charge.amount_refunded >= charge.amount : true;
    if (paymentIntent && integral) {
      const { count } = await prisma.contribution.updateMany({
        where: { stripePaymentIntentId: paymentIntent, refunded: false },
        data: { refunded: true, refundDueMinor: 0, stripeChargeId: (charge ?? dispute)?.id ?? null },
      });
      if (dispute) {
        console.error(`[stripe] litige ${dispute.id} (${dispute.reason}) sur ${paymentIntent} — ${count} contribution(s) gelée(s)`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
