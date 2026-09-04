"use server";

import { tErr } from "@/lib/action-errors";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { usdCentsFromMinor } from "@/lib/fx";
import { toMinor } from "@/lib/money";
import { MIN_SUPPORT_MAJOR, SUPPORT_CURRENCY } from "@/lib/constants";
import { appUrl, getStripe, stripeEnabled } from "@/lib/stripe";

export type SupportState = { error?: string; checkoutUrl?: string } | undefined;

/**
 * Soutenir la plateforme : session Checkout au nom de GeniGain (charge
 * plateforme, pas de transfert — c'est SON argent). L'enregistrement se fait
 * au webhook `checkout.session.completed`, jamais ici.
 */
export async function supportAction(_prev: SupportState, formData: FormData): Promise<SupportState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!stripeEnabled) return { error: await tErr("paymentsNotConfigured") };

  const amount = Number(String(formData.get("amount") ?? "").replace(",", "."));
  if (!Number.isFinite(amount) || amount < MIN_SUPPORT_MAJOR || amount > 100_000) {
    return { error: await tErr("supportAmountInvalid") };
  }
  const amountMinor = toMinor(amount, SUPPORT_CURRENCY);
  // Le soutien DÉBLOQUE le droit de lancer son projet : il compte dans le
  // seuil de contribution, comme une contribution. Figé au taux du jour.
  const usdCents = await usdCentsFromMinor(amountMinor, SUPPORT_CURRENCY);

  const checkout = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: SUPPORT_CURRENCY,
          unit_amount: amountMinor,
          product_data: { name: "Soutien à GeniGain", description: "Don à la plateforme — sans étapes ni séquestre." },
        },
      },
    ],
    metadata: { kind: "support", userId: session.user.id, usdCents: String(usdCents) },
    success_url: `${appUrl()}/soutenir?merci=1`,
    cancel_url: `${appUrl()}/soutenir?annule=1`,
  });
  if (!checkout.url) return { error: await tErr("stripeNoCheckout") };
  return { checkoutUrl: checkout.url };
}
