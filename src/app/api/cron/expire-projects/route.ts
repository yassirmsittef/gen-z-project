import { NextResponse } from "next/server";
import {
  backfillStorageSizes,
  purgeStaleUploadTickets,
  sweepOrphanVideoBlobs,
} from "@/lib/call-videos";
import { purgeStaleLoginAttempts } from "@/lib/login-rate-limit";
import { sendPendingNotificationEmails } from "@/lib/notification-emails";
import { executeDuePayouts, executeDueRefunds } from "@/lib/payouts";
import { failExpiredProjects, failOverdueRealizations } from "@/lib/project-service";
import { purgeStaleTranslationUsage } from "@/lib/translate-service";

/**
 * Cron Vercel (une fois par jour à 3 h — plan Hobby, voir vercel.json) :
 * expire les campagnes échues (deadline dépassée sans objectif atteint) et
 * rembourse au prorata, puis fait le ménage (emails manqués, tentatives de
 * connexion périmées, fichiers vidéo orphelins).
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
  // Fichiers déposés sur le stockage dont la publication n'est jamais venue :
  // invisibles de la jauge (qui somme des lignes), ils se payaient sans fin.
  await purgeStaleUploadTickets();
  // Compteurs de traduction sortis du mois glissant : ils ne tiennent plus
  // ni la cadence d'un lecteur ni le plafond mensuel du service.
  await purgeStaleTranslationUsage();
  // Mesurer AVANT de balayer : une taille inconnue rendait la jauge aveugle
  // sur tout ce qui précédait les migrations.
  await backfillStorageSizes();
  const balayage = await sweepOrphanVideoBlobs();
  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    blobsOrphelins: balayage.orphelins,
    octetsLibérés: balayage.octetsLibérés,
  });
}
