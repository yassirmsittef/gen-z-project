import { NextResponse } from "next/server";
import { failExpiredProjects } from "@/lib/project-service";

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
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
