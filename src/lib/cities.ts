import "server-only";
import WORLD from "@/lib/world-cities.json";
import { DEFAULT_LOCALE, LOCALE_CODES, localeTag, type Locale } from "@/lib/i18n/locales";

/**
 * Villes pour la localisation des membres (globe Communauté, profil).
 *
 * Toutes les villes du monde de plus de 5 000 habitants — GeoNames
 * « cities5000 », 69 696 entrées, 245 pays (scripts/generate-world-cities.ts).
 * La version d'origine n'en connaissait que 156, presque toutes en France :
 * quelqu'un à Dakar, Montréal ou Lagos ne pouvait pas poser sa ville.
 *
 * La position d'un membre est TOUJOURS celle de sa ville (jamais une position
 * précise) : un choix déclaratif, modifiable et optionnel.
 *
 * Le pays est stocké en code ISO 3166-1 (« SN ») et s'affiche dans la langue
 * du lecteur (Intl.DisplayNames). Les comptes d'avant ont un nom en français
 * (« France ») : `countryLabel` le laisse tel quel.
 *
 * `server-only` : le jeu pèse ~3 Mo, il ne doit JAMAIS partir au navigateur —
 * les suggestions passent par /api/cities.
 */
export type City = {
  name: string;
  /** Code ISO 3166-1 alpha-2. */
  country: string;
  lat: number;
  lng: number;
  population: number;
};

type Row = [string, string, string, number, number, number, string[]?];
const ROWS = WORLD as unknown as Row[];

/** Minuscules, sans accents, espaces/tirets normalisés — pour comparer des saisies. */
export function normalizeCityName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s\-–—']+/g, " ")
    .trim();
}

const toCity = (r: Row): City => ({ name: r[0], country: r[2], lat: r[3], lng: r[4], population: r[5] });

// Index exact : nom normalisé (et nom ASCII) → villes, les plus peuplées d'abord
// (les lignes sont triées par population à la génération).
const EXACT = new Map<string, City[]>();
// Index de recherche : [clé normalisée, ville, alternatif ?] pour les suggestions
// par préfixe. Les noms officiels passent avant les alternatifs : « dak » doit
// proposer Dakar, pas une mégapole dont un alias exotique commence pareil.
const KEYS: { key: string; city: City; alt: boolean }[] = [];
for (const r of ROWS) {
  const city = toCity(r);
  const k1 = normalizeCityName(r[0]);
  const k2 = r[1] ? normalizeCityName(r[1]) : "";
  // Noms alternatifs (grandes villes) : « Genève », « Bruxelles », « Roma »,
  // « München », « لندن » — GeoNames nomme en anglais, nos membres non.
  const alts = (r[6] ?? []).map(normalizeCityName);
  const officiels = new Set([k1, k2].filter(Boolean));
  for (const k of new Set([...officiels, ...alts].filter(Boolean))) {
    const list = EXACT.get(k);
    if (list) list.push(city);
    else EXACT.set(k, [city]);
    KEYS.push({ key: k, city, alt: !officiels.has(k) });
  }
}

const displayNames = new Map<string, Intl.DisplayNames>();
function regionNames(locale: Locale): Intl.DisplayNames {
  let d = displayNames.get(locale);
  if (!d) {
    d = new Intl.DisplayNames([localeTag(locale)], { type: "region", fallback: "code" });
    displayNames.set(locale, d);
  }
  return d;
}

/**
 * Libellés que GeniGain choisit d'écrire autrement que le standard CLDR.
 * Décision fondateur (06/09/2026) : « Palestine », pas « Territoires
 * palestiniens ». Un choix éditorial de la plateforme, assumé, dans les 7 langues.
 */
const COUNTRY_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  PS: { fr: "Palestine", en: "Palestine", es: "Palestina", de: "Palästina", it: "Palestina", pt: "Palestina", ar: "فلسطين" },
};

/** Nom du pays dans la langue du lecteur ; une valeur héritée (« France ») est rendue telle quelle. */
export function countryLabel(codeOrName: string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!codeOrName) return "";
  if (!/^[A-Z]{2}$/.test(codeOrName)) return codeOrName;
  const surcharge = COUNTRY_OVERRIDES[codeOrName]?.[locale];
  if (surcharge) return surcharge;
  try {
    return regionNames(locale).of(codeOrName) ?? codeOrName;
  } catch {
    return codeOrName;
  }
}

/** « Ville — Pays », dans la langue du lecteur. */
export function cityLabel(city: City, locale: Locale = DEFAULT_LOCALE): string {
  return `${city.name} — ${countryLabel(city.country, locale)}`;
}

/** Le pays saisi (code, ou nom dans n'importe laquelle des 7 langues) correspond-il à ce code ? */
function countryMatches(saisie: string, code: string): boolean {
  const s = normalizeCityName(saisie);
  if (s === code.toLowerCase()) return true;
  for (const locale of LOCALE_CODES) {
    if (normalizeCityName(countryLabel(code, locale)) === s) return true;
  }
  return false;
}

/**
 * Retrouve une ville à partir d'une saisie libre : « Dakar », « marseille »,
 * « Paris — France », « Paris, France », « Paris (FR) ». Sans pays, la plus
 * peuplée gagne (Paris = Paris, France ; pas Paris, Texas).
 */
export function findCity(raw: string): City | undefined {
  const m = raw.trim().match(/^(.+?)\s*(?:—|–|,|\()\s*([^)]+?)\)?\s*$/);
  const nom = normalizeCityName(m ? m[1] : raw);
  const pays = m ? m[2] : null;
  const candidats = EXACT.get(nom);
  if (!candidats) return undefined;
  if (!pays) return candidats[0];
  return candidats.find((c) => countryMatches(pays, c.country)) ?? undefined;
}

/** Suggestions par préfixe (nom ou nom ASCII), les plus peuplées d'abord, sans doublon. */
export function searchCities(query: string, limit = 8): City[] {
  const q = normalizeCityName(query);
  if (q.length < 2) return [];
  const vus = new Set<string>();
  const officiels: City[] = [];
  const alternatifs: City[] = [];
  for (const { key, city, alt } of KEYS) {
    if (!key.startsWith(q)) continue;
    const id = `${city.name}|${city.country}|${city.lat}|${city.lng}`;
    if (vus.has(id)) continue;
    vus.add(id);
    (alt ? alternatifs : officiels).push(city);
    if (officiels.length >= limit) break;
  }
  // KEYS suit l'ordre des lignes (population décroissante) : chaque liste est
  // déjà triée ; les noms officiels d'abord, les alias ensuite.
  return [...officiels, ...alternatifs].slice(0, limit);
}

export const WORLD_CITY_COUNT = ROWS.length;
