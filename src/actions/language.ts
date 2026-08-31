"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { isLocale } from "@/lib/i18n/locales";
import { LANG_COOKIE } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

/**
 * Changement de langue depuis le pied de page — la porte des ANONYMES
 * (les membres ont aussi le profil). Cookie toujours ; base en plus quand
 * une session existe, sinon la préférence du compte écraserait le cookie à
 * la requête suivante et le sélecteur paraîtrait revenir en arrière.
 * Valeur inconnue : on ignore sans bruit (un POST forgé ne mérite pas mieux).
 */
export async function setLanguageAction(formData: FormData) {
  const value = formData.get("lang");
  if (!isLocale(value)) return;

  const jar = await cookies();
  jar.set(LANG_COOKIE, value, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  const session = await auth();
  if (session?.user?.id) {
    // updateMany et non update : un JWT survivant à un compte supprimé ne
    // doit pas faire échouer un simple changement de langue.
    await prisma.user.updateMany({
      where: { id: session.user.id },
      data: { preferredLanguage: value },
    });
  }

  revalidatePath("/", "layout");
}
