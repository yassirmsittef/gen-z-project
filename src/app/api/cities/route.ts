import { NextResponse } from "next/server";
import { cityLabel, countryLabel, searchCities } from "@/lib/cities";
import { getRequestLocale } from "@/lib/i18n/server";

/**
 * Suggestions de villes (toutes les villes du monde > 5 000 hab., GeoNames),
 * cherchées côté serveur : le jeu de ~3 Mo ne descend jamais au navigateur.
 * Public, sans donnée personnelle, mis en cache par requête.
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ cities: [] });
  const locale = await getRequestLocale();
  const cities = searchCities(q, 8).map((c) => ({
    value: cityLabel(c, locale),
    name: c.name,
    country: countryLabel(c.country, locale),
  }));
  return NextResponse.json(
    { cities },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}
