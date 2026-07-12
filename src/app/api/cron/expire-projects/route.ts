import { NextResponse } from "next/server";
import { purgeStaleLoginAttempts } from "@/lib/login-rate-limit";
import { sendPendingNotificationEmails } from "@/lib/notification-emails";
import { executeDuePayouts, executeDueRefunds } from "@/lib/payouts";
import { failExpiredProjects, failOverdueRealizations } from "@/lib/project-service";

/**
 * Cron Vercel (toutes les 10 min, voir vercel.json) : expire les campagnes
 * échues (deadline dépassée sans objectif atteint) et rembourse au prorata.
 *
 * Remplace l'évaluation paresseuse qui tournait `await failExpiredProjects()`
 * en tête de CHAQUE page lisant des projets — c'était une cascade séquentielle
 * (mutation avant les reads) + un scan répété à chaque requête. Ici c'est hors
 * du chemin de rendu.
 *
 * Runtime Node (Prisma ne tourne pas sur l'edge). Sécurisé par CRON_SECRET
 * quand il est défini (Vercel envoie `Authorization: Bearer <CRON_SECRET>`).
 */
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await failExpiredProjects();
  await failOverdueRealizations();
  // Rejeu des mouvements Stripe manqués (réseau, compte Connect configuré
  // après coup…) : idempotents, sans effet s'il n'y a rien de dû.
  await executeDueRefunds();
  await executeDuePayouts();
  // Filet des emails de notifications majeures manqués aux points chauds.
  await sendPendingNotificationEmails();
  // Ménage anti brute-force : les échecs sortis de la fenêtre ne servent plus.
  await purgeStaleLoginAttempts();
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
