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

/**
 * Corrections de rattachement décidées par la plateforme (fondateur, 06/09/2026),
 * quand GeoNames code « IL » une localité située en territoire occupé depuis 1967 :
 * - Ariel : colonie de Cisjordanie — GeoNames la place lui-même dans la région
 *   « WE » (West Bank) tout en la codant IL → Palestine (résolution 2334 du
 *   Conseil de sécurité : les colonies n'ont aucune validité juridique).
 * - Katzrin : plateau du Golan, territoire syrien occupé → Syrie (résolution 497).
 * - Jérusalem, entrée globale ET Jérusalem-Ouest → Palestine, décision éditoriale du fondateur.
 * GeoNames code déjà Jérusalem-Est, Gaza et la quasi-totalité des colonies en PS.
 * Clé : nom GeoNames + code d'origine, pour ne toucher que la bonne ligne.
 */
const COUNTRY_REASSIGNMENTS: Record<string, string> = {
  "Ariel|IL": "PS",
  "Katzrin|IL": "SY",
  // Toute Jérusalem, Ouest comprise (décision fondateur, 06/09/2026) — le droit
  // international ne reconnaît la souveraineté d'aucun État sur la ville ;
  // GeniGain écrit ce que sa communauté défend.
  "Jerusalem|IL": "PS",
  "West Jerusalem|IL": "PS",
  // Les localités palestiniennes de 1948 — villes et villages arabes d'Israël
  // (classification du Bureau central des statistiques israélien, liste
  // « Arab localities in Israel », Wikipédia) croisée avec GeoNames : Nazareth,
  // Umm al-Fahm, Rahat, Tamra, Sakhnin, Shefa-'Amr, Tira, les villages
  // bédouins du Néguev, les villages druzes… Les villes MIXTES à majorité juive
  // (Lod, Ramla, Haïfa, Acre, Tel-Aviv-Yafo) n'en font pas partie. Décision
  // fondateur (06/09/2026) : « ces villes-là, mets-les palestiniennes ».
  "Abū Ghaush|IL": "PS",
  "Abū Sinān|IL": "PS",
  "Al-Bi‘na|IL": "PS",
  "Basma|IL": "PS",
  "Basmat Ṭab‘ūn|IL": "PS",
  "Beit Jann|IL": "PS",
  "Bir Hadaj|IL": "PS",
  "Bu'ayna-Nujaydat|IL": "PS",
  "Buqei‘a|IL": "PS",
  "Bāqa el Gharbīya|IL": "PS",
  "Bīr el Maksūr|IL": "PS",
  "Dabbūrīya|IL": "PS",
  "Daliyat al Karmel|IL": "PS",
  "Deir el Asad|IL": "PS",
  "Deir Ḥannā|IL": "PS",
  "Eṭ Ṭaiyiba|IL": "PS",
  "Eṭ Ṭīra|IL": "PS",
  "Furaydis|IL": "PS",
  "H̱ura|IL": "PS",
  "Iksāl|IL": "PS",
  "I‘billīn|IL": "PS",
  "Jaljūlya|IL": "PS",
  "Jatt|IL": "PS",
  "Jisr ez Zarqā|IL": "PS",
  "Judeida Makr|IL": "PS",
  "Jūlis|IL": "PS",
  "Kafr Kannā|IL": "PS",
  "Kafr Mandā|IL": "PS",
  "Kafr Qari‘|IL": "PS",
  "Kafr Qāsim|IL": "PS",
  "Ka‘abiyya-Tabbash-H̱ajajra|IL": "PS",
  "Kfar Yasif|IL": "PS",
  "Kisra - Sume'a|IL": "PS",
  "Kuseifa|IL": "PS",
  "Kābūl|IL": "PS",
  "Laqiyya|IL": "PS",
  "Maale Iron|IL": "PS",
  "Maghār|IL": "PS",
  "Majd el Kurūm|IL": "PS",
  "Nazareth|IL": "PS",
  "Naḥf|IL": "PS",
  "Qalansuwa|IL": "PS",
  "Rahat|IL": "PS",
  "Sakhnīn|IL": "PS",
  "Segev Shalom|IL": "PS",
  "Sha‘ab|IL": "PS",
  "Shefar‘am|IL": "PS",
  "Shibli–Umm al-Ghanam|IL": "PS",
  "Tamra|IL": "PS",
  "Tel Sheva‘|IL": "PS",
  "Tūbā Zangarīya|IL": "PS",
  "Umm el Faḥm|IL": "PS",
  "Yanuh-Jat|IL": "PS",
  "Yirkā|IL": "PS",
  "Yāfā|IL": "PS",
  "Zarzir|IL": "PS",
  "Zemer|IL": "PS",
  "Ḥurfeish|IL": "PS",
  "‘Ara-‘Ar‘ara|IL": "PS",
  "‘Ar‘ara BaNegev|IL": "PS",
  "‘Eilabun|IL": "PS",
  "‘Ein Māhil|IL": "PS",
  "‘Ilūṭ|IL": "PS",
  "‘Isfiyā|IL": "PS",
};

/**
 * Pays retirés du sélecteur (décision fondateur, 06/09/2026 : « Israël sort de
 * la carte »). Appliqué APRÈS les rattachements ci-dessus : les localités
 * palestiniennes de 1948, Jérusalem et le Golan restent — sous Palestine ou
 * Syrie — et tout ce qui demeure codé IL n'est ni cherchable ni sélectionnable.
 * Un membre vivant dans une de ces villes peut s'inscrire et tout utiliser ;
 * il ne peut simplement pas se placer sur le globe. Choix éditorial assumé.
 */
const HIDDEN_COUNTRIES = new Set(["IL"]);

const toCity = (r: Row): City => ({
  name: r[0],
  country: COUNTRY_REASSIGNMENTS[`${r[0]}|${r[2]}`] ?? r[2],
  lat: r[3],
  lng: r[4],
  population: r[5],
});

// Index exact : nom normalisé (et nom ASCII) → villes, les plus peuplées d'abord
// (les lignes sont triées par population à la génération).
// Chaque entrée sait si la clé est un nom OFFICIEL ou un alias : à égalité de
// clé, le nom officiel l'emporte (« East Jerusalem » est la ville qui porte ce
// nom, pas un alias de l'entrée globale « Jerusalem »).
const EXACT = new Map<string, { city: City; alt: boolean }[]>();
// Index de recherche : [clé normalisée, ville, alternatif ?] pour les suggestions
// par préfixe. Les noms officiels passent avant les alternatifs : « dak » doit
// proposer Dakar, pas une mégapole dont un alias exotique commence pareil.
const KEYS: { key: string; city: City; alt: boolean }[] = [];
for (const r of ROWS) {
  const city = toCity(r);
  if (HIDDEN_COUNTRIES.has(city.country)) continue;
  const k1 = normalizeCityName(r[0]);
  const k2 = r[1] ? normalizeCityName(r[1]) : "";
  // Noms alternatifs (grandes villes) : « Genève », « Bruxelles », « Roma »,
  // « München », « لندن » — GeoNames nomme en anglais, nos membres non.
  const alts = (r[6] ?? []).map(normalizeCityName);
  const officiels = new Set([k1, k2].filter(Boolean));
  for (const k of new Set([...officiels, ...alts].filter(Boolean))) {
    const alt = !officiels.has(k);
    const list = EXACT.get(k);
    if (list) list.push({ city, alt });
    else EXACT.set(k, [{ city, alt }]);
    KEYS.push({ key: k, city, alt });
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
  const entrees = EXACT.get(nom);
  if (!entrees) return undefined;
  // Un nom officiel compte plein, un alias au dixième : « East Jerusalem » est la
  // ville qui porte ce nom (pas l'alias de l'entrée globale), « Nazareth » est
  // Nazareth (77 k, officiel) et non Nazrēt en Éthiopie (324 k, alias) — mais
  // « Roma » reste Rome (2,8 M, alias) et non Roma au Lesotho (officiel, minuscule).
  const candidats = [...entrees]
    .sort((x, y) => y.city.population * (y.alt ? 0.1 : 1) - x.city.population * (x.alt ? 0.1 : 1))
    .map((e) => e.city);
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

export const WORLD_CITY_COUNT = ROWS.filter((r) => !HIDDEN_COUNTRIES.has(toCity(r).country)).length;
