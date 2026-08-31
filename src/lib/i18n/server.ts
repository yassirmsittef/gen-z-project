import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import {
  DEFAULT_LOCALE,
  isLocale,
  negotiateLocale,
  type Locale,
} from "@/lib/i18n/locales";
import { makeT, type Translator } from "@/lib/i18n/t";
import { prisma } from "@/lib/prisma";
import { MESSAGES, type Messages, type Namespace } from "@/messages";

/** Le cookie des visiteurs sans compte ; la préférence des membres vit en base. */
export const LANG_COOKIE = "lang";

/**
 * La langue de LA requête en cours : préférence du compte (connecté) →
 * cookie (anonyme) → Accept-Language (premier contact) → français.
 *
 * `cache()` est indispensable, pas décoratif : layout, page, generateMetadata
 * et actions appellent tous cette fonction dans la même requête — sans lui,
 * autant de findUnique que d'appels.
 */
export const getRequestLocale = cache(async (): Promise<Locale> => {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredLanguage: true },
    });
    if (user && isLocale(user.preferredLanguage)) return user.preferredLanguage;
    // Compte disparu sous un JWT survivant : on retombe sur le visiteur.
  }
  const jar = await cookies();
  const fromCookie = jar.get(LANG_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const acceptLanguage = (await headers()).get("accept-language");
  return negotiateLocale(acceptLanguage) ?? DEFAULT_LOCALE;
});

/** Traducteur d'un namespace, dans la langue de la requête. */
export async function getT<N extends Namespace>(ns: N): Promise<Translator<Messages[N]>> {
  const locale = await getRequestLocale();
  return makeT(MESSAGES[locale][ns], locale);
}

/** Traducteur pour une langue IMPOSÉE (emails : la langue du destinataire, pas du requérant). */
export function tFor<N extends Namespace>(locale: Locale, ns: N): Translator<Messages[N]> {
  return makeT(MESSAGES[locale][ns], locale);
}
