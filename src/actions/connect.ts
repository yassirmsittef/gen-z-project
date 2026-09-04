"use server";
import { tErr } from "@/lib/action-errors";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appUrl, getStripe, stripeEnabled } from "@/lib/stripe";

export type ConnectFormState = { error?: string; onboardingUrl?: string } | undefined;

/**
 * Onboarding Stripe Connect Express du porteur : crée le compte au premier
 * appel, puis renvoie un lien d'onboarding (URL EXTERNE → navigation côté
 * client, `redirect()` ne fonctionne pas hors de l'app depuis une action).
 */
export async function connectOnboardingAction(
  _prev: ConnectFormState,
  _formData: FormData
): Promise<ConnectFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!stripeEnabled) {
    return { error: await tErr("stripeNotConfigured") };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, stripeAccountId: true },
  });
  if (!user) redirect("/login");

  const stripe = getStripe();

  try {
    let accountId = user.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email ?? undefined,
        capabilities: { transfers: { requested: true } },
        // Séquestre CHEZ LE PORTEUR : l'argent des contributions arrive sur ce
        // compte dès l'encaissement, mais ne part vers SA banque que quand la
        // plateforme libère une étape validée (payout manuel). Sans « manual »,
        // Stripe virerait tout automatiquement — plus de séquestre.
        settings: { payouts: { schedule: { interval: "manual" } } },
        metadata: { userId: user.id },
      });
      accountId = account.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl()}/dashboard?connect=refresh`,
      return_url: `${appUrl()}/dashboard?connect=done`,
      type: "account_onboarding",
    });

    return { onboardingUrl: link.url };
  } catch (error) {
    console.error("[connect] onboarding impossible :", error);
    // Cas fréquent en phase de mise en place : le produit Connect n'est pas
    // encore activé sur le compte Stripe de la plateforme (action une seule
    // fois, côté dashboard Stripe).
    if (error instanceof Error && error.message.includes("signed up for Connect")) {
      return {
        error:
          "Les versements ne sont pas encore ouverts — la plateforme finalise son intégration Stripe. Reviens bientôt !",
      };
    }
    return { error: await tErr("stripeConnectFailed") };
  }
}
