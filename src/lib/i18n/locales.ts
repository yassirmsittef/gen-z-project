/**
 * Les 7 langues de la plateforme — le pendant de CURRENCIES (money.ts).
 * `label` est le nom de la langue DANS cette langue : un menu de langues se
 * lit dans toutes les langues à la fois, jamais dans celle de l'interface.
 */
export const LOCALES = [
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const LOCALE_CODES = LOCALES.map((l) => l.code) as [Locale, ...Locale[]];

export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALE_CODES as string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Étiquette BCP 47 pour Intl (dates, montants). L'arabe force les chiffres
 * latins (`nu-latn`) : public d'abord maghrébin (MAD/TND au catalogue des
 * devises), et JetBrains Mono — la police des data-labels — n'a pas de
 * glyphes arabes-indiens.
 */
export function localeTag(locale: Locale): string {
  return locale === "ar" ? "ar-u-nu-latn" : locale;
}

/** Locale OpenGraph (og:locale) correspondante. */
export function ogLocaleOf(locale: Locale): string {
  const map: Record<Locale, string> = {
    fr: "fr_FR",
    en: "en_US",
    es: "es_ES",
    de: "de_DE",
    it: "it_IT",
    pt: "pt_PT",
    ar: "ar_AR",
  };
  return map[locale];
}

/**
 * Négociation Accept-Language minimale : première langue supportée dans
 * l'ordre de préférence du navigateur (les q-values arrivent déjà triées
 * chez tous les navigateurs courants ; on les respecte si présentes).
 */
export function negotiateLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((c) => c.tag && !Number.isNaN(c.q))
    .sort((a, b) => b.q - a.q);
  for (const { tag } of candidates) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
