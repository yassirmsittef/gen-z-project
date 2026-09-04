import { prisma } from "@/lib/prisma";

/**
 * Soutien à la plateforme (page /soutenir) : un don à GeniGain, sans projet,
 * sans étapes, sans séquestre. L'argent est celui de la plateforme : il reste
 * sur son compte Stripe et part vers sa banque au rythme normal. Rien à voir
 * avec les contributions aux projets (séquestre chez le porteur).
 */
import { SUPPORT_CURRENCY } from "@/lib/constants";
export { MIN_SUPPORT_MAJOR, SUPPORT_CURRENCY } from "@/lib/constants";

/** Enregistre un soutien PAYÉ (webhook). Idempotent par session Stripe. */
export async function recordPlatformSupport(input: {
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  userId: string | null;
  amountMinor: number;
  currency: string;
  /** Équivalent USD figé au paiement : compte dans le seuil qui débloque le
   *  droit de lancer un projet (contributedUsdCents), comme une contribution. */
  usdCents: number;
}): Promise<boolean> {
  const existing = await prisma.platformSupport.findUnique({
    where: { stripeSessionId: input.stripeSessionId },
    select: { id: true },
  });
  if (existing) return false;
  await prisma.$transaction(async (tx) => {
    await tx.platformSupport.create({
      data: {
        stripeSessionId: input.stripeSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId,
        userId: input.userId,
        amountMinor: input.amountMinor,
        currency: input.currency,
      },
    });
    // Soutenir la plateforme débloque le ticket « lancer mon projet ».
    if (input.userId && input.usdCents > 0) {
      await tx.user.update({
        where: { id: input.userId },
        data: { contributedUsdCents: { increment: input.usdCents } },
      });
    }
  });
  return true;
}

/** Total reçu, en centimes de la devise de soutien. */
export async function platformSupportTotal(): Promise<number> {
  const agg = await prisma.platformSupport.aggregate({
    where: { currency: SUPPORT_CURRENCY },
    _sum: { amountMinor: true },
  });
  return agg._sum.amountMinor ?? 0;
}
