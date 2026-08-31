import "server-only";
import { getRequestLocale } from "@/lib/i18n/server";
import { makeT } from "@/lib/i18n/t";
import type { Locale } from "@/lib/i18n/locales";
import { makeSchemas } from "@/lib/validation";
import { MESSAGES } from "@/messages";

/**
 * Les schémas Zod dans une langue donnée — mêmes formes que les exports
 * nommés de validation.ts, messages traduits. Mémoïsé : 7 jeux d'instances
 * pour toute la vie du process, pas un par requête.
 */
const built = new Map<Locale, ReturnType<typeof makeSchemas>>();

export function schemasFor(locale: Locale): ReturnType<typeof makeSchemas> {
  let schemas = built.get(locale);
  if (!schemas) {
    schemas = makeSchemas(makeT(MESSAGES[locale].v, locale));
    built.set(locale, schemas);
  }
  return schemas;
}

/** Les schémas dans la langue du requérant — l'entrée normale des actions. */
export async function requestSchemas(): Promise<ReturnType<typeof makeSchemas>> {
  return schemasFor(await getRequestLocale());
}
