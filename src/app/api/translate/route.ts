import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { MAX_TRANSLATION_CHARS } from "@/lib/constants";
import { LOCALE_CODES } from "@/lib/i18n/locales";
import { isSameOrigin } from "@/lib/request-origin";
import {
  serviceTranslate,
  translationServiceConfigured,
  usageKey,
} from "@/lib/translate-service";

/**
 * Traduction de secours, pour les appareils sans modèle embarqué (mobile,
 * Safari, Firefox). Le client tente d'abord SUR L'APPAREIL et n'arrive ici
 * que si ça n'existe pas — cf. src/lib/browser-translate.ts.
 *
 * Ouverte aux visiteurs non connectés, comme les pages qu'elle sert : le fil
 * des appels et les projets se lisent sans compte, et une traduction réservée
 * aux membres ferait de la langue un péage. La cadence est donc tenue par
 * adresse IP hachée à défaut de compte (src/lib/translate-service.ts).
 *
 * Runtime Node : Prisma (compteur de quota) ne tourne pas sur l'edge.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corps = z.object({
  texte: z.string().trim().min(2).max(MAX_TRANSLATION_CHARS),
  cible: z.enum(LOCALE_CODES),
});

/**
 * Le service est-il branché ? Le bouton s'affiche d'après cette réponse :
 * proposer une action impossible use la confiance plus vite qu'elle ne rend
 * service.
 *
 * `no-store`, et ce n'est pas une négligence : avec un cache d'une heure
 * (essayé, puis retiré en le testant), poser la clé sur Vercel laissait les
 * navigateurs répondre « pas de service » pendant une heure, et la retirer
 * laissait un bouton mort aussi longtemps. La réponse tient en trois mots et
 * le client ne la demande qu'une fois par onglet — et seulement s'il n'a pas
 * de modèle embarqué.
 */
export function GET() {
  return NextResponse.json(
    { disponible: translationServiceConfigured() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  // Un site tiers ne dépense pas notre quota avec la session d'un membre.
  if (!isSameOrigin(request)) return NextResponse.json({ statut: "echec" }, { status: 403 });
  const parse = corps.safeParse(await request.json().catch(() => null));
  if (!parse.success) return NextResponse.json({ statut: "echec" }, { status: 400 });

  const session = await auth();
  // `x-forwarded-for` peut chaîner plusieurs relais : le client est en tête.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const issue = await serviceTranslate({
    ...parse.data,
    key: usageKey(session?.user?.id ?? null, ip),
  });

  // Le corps porte toujours le statut : le client lit la réponse quel que
  // soit le code HTTP, qui n'est là que pour les intermédiaires.
  const code = issue.statut === "trop-frequent" ? 429 : issue.statut === "sature" ? 503 : 200;
  return NextResponse.json(issue, { status: code });
}
