"use server";
import { domainErrorMessage, tErr } from "@/lib/action-errors";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { usdCentsFromMinor } from "@/lib/fx";
import { formatMoney, toMinor } from "@/lib/money";
import { assertCanContribute, DomainError } from "@/lib/project-service";
import { appUrl, getStripe, stripeEnabled } from "@/lib/stripe";
import { requestSchemas } from "@/lib/validation-locale";

export type ContributeState = { error?: string; checkoutUrl?: string } | undefined;

/**
 * Contribution en argent réel : gardes AVANT paiement puis session Stripe
 * Checkout dans la devise du projet. L'URL externe est renvoyée au client
 * (redirect() ne sort pas de l'app) ; l'enregistrement se fait au webhook
 * `checkout.session.completed` — jamais ici.
 */
export async function contributeAction(
  _prev: ContributeState,
  formData: FormData
): Promise<ContributeState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { contributeSchema } = await requestSchemas();
  const parsed = contributeSchema.safeParse({
    projectId: formData.get("projectId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  if (!stripeEnabled) {
    return { error: await tErr("paymentsNotConfigured") };
  }

  let project;
  try {
    project = await assertCanContribute(session.user.id, parsed.data.projectId);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  const amountMinor = toMinor(parsed.data.amount, project.currency);
  // L'équivalent USD (gate) est figé MAINTENANT, au taux du jour.
  const usdCents = await usdCentsFromMinor(amountMinor, project.currency);
  // Anonymat d'AFFICHAGE choisi au paiement : voyage dans la metadata de la
  // session Checkout, posé sur la Contribution au webhook.
  const anonymous = formData.get("anonymous") === "on";

  const checkout = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: project.currency,
          unit_amount: amountMinor,
          product_data: {
            name: `Contribution — ${project.title}`,
            description: `Séquestre communautaire GeniGain (${formatMoney(amountMinor, project.currency)})`,
          },
        },
      },
    ],
    metadata: {
      kind: "contribution",
      projectId: project.id,
      userId: session.user.id,
      usdCents: String(usdCents),
      anonymous: anonymous ? "1" : "0",
    },
    success_url: `${appUrl()}/projects/${project.slug}?contribution=merci`,
    cancel_url: `${appUrl()}/projects/${project.slug}?contribution=annulee`,
  });

  if (!checkout.url) return { error: await tErr("stripeNoCheckout") };
  return { checkoutUrl: checkout.url };
}
