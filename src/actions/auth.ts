"use server";
import { cookies, headers } from "next/headers";
import { tErr } from "@/lib/action-errors";
import { LANG_COOKIE } from "@/lib/i18n/server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { findCity } from "@/lib/cities";
import { MAX_SIGNUPS_PER_IP_PER_HOUR } from "@/lib/constants";
import { CURRENCY_CODES } from "@/lib/money";
import { signInPayload } from "@/lib/credentials-payload";
import { sendVerificationEmail } from "@/lib/email-verification";
import { hashPassword } from "@/lib/password";
import { assertUnderLimit, ipFromHeaders, ipKey, recordHit } from "@/lib/throttle";
import { prisma } from "@/lib/prisma";
import { requestSchemas } from "@/lib/validation-locale";

export type AuthFormState = { error?: string; needsCode?: boolean } | undefined;

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { registerSchema } = await requestSchemas();
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    preferredLanguage: formData.get("preferredLanguage"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Consentement CGU + confidentialité : la case est `required` côté client,
  // mais un POST forgé sans elle ne doit pas créer de compte.
  if (formData.get("cgu") !== "on") {
    return { error: await tErr("mustAcceptTerms") };
  }

  const { name, email, password, preferredLanguage } = parsed.data;

  // Ville optionnelle : si renseignée, elle doit venir de la liste officielle
  // (position de la VILLE sur le globe Communauté — modifiable au dashboard).
  const cityRaw = String(formData.get("city") ?? "").trim();
  const city = cityRaw ? findCity(cityRaw) : undefined;
  if (cityRaw && !city) {
    return { error: await tErr("cityUnknownOrEmpty") };
  }

  // Devise d'AFFICHAGE (modifiable au profil). Le droit de poster reste
  // compté en dollars (gate 50 $, usdCents figé à chaque paiement) : ce
  // choix ne change que la lecture, jamais la règle.
  const currencyRaw = String(formData.get("preferredCurrency") ?? "eur").toLowerCase();
  const preferredCurrency = CURRENCY_CODES.includes(currencyRaw) ? currencyRaw : "eur";

  // Cadence par adresse : créer des comptes en rafale est le premier geste
  // d'un spam de salons, et sonder « cet email existe-t-il ? » en boucle est
  // le premier geste d'une énumération. Compté AVANT le test d'existence,
  // pour que le sondage coûte autant que l'inscription.
  const cle = ipKey("signup", ipFromHeaders(await headers()));
  try {
    await assertUnderLimit(cle, { max: MAX_SIGNUPS_PER_IP_PER_HOUR, fenetreMinutes: 60 });
  } catch {
    return { error: await tErr("tooManyRequests") };
  }
  await recordHit(cle);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: await tErr("emailTaken") };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      preferredCurrency,
      preferredLanguage,
      ...(city
        ? { city: city.name, country: city.country, latitude: city.lat, longitude: city.lng }
        : {}),
    },
  });

  // L'email de confirmation part tout de suite ; s'il échoue (fournisseur
  // absent, réseau), l'inscription n'en souffre pas — le tableau de bord
  // propose de le renvoyer.
  try {
    await sendVerificationEmail(user.id);
  } catch (error) {
    console.error("[inscription] email de confirmation non envoyé :", error);
  }

  // La langue choisie vaut aussi pour le visiteur redevenu anonyme : le
  // cookie suit la préférence du compte (déconnexion comprise).
  const jar = await cookies();
  jar.set(LANG_COOKIE, preferredLanguage, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  // Lance la session puis redirige (signIn lève un NEXT_REDIRECT).
  await signIn("credentials", { email, password, redirectTo: "/" });
  return undefined;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { loginSchema } = await requestSchemas();
  const code = String(formData.get("code") ?? "").trim();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    code: code || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    // Le code n'est transmis QUE s'il existe (cf. src/lib/credentials-payload.ts).
    await signIn("credentials", { ...signInPayload(parsed.data), redirectTo: "/" });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      // Le code posé par LoginRateLimited (src/auth.ts) arrive soit sur
      // l'erreur elle-même, soit enveloppé dans sa cause selon le chemin.
      const motif =
        (error as { code?: string }).code ??
        ((error.cause as { err?: { code?: string } } | undefined)?.err?.code);
      if (motif === "rate-limited") {
        return {
          error: await tErr("tooManyAttempts"),
        };
      }
      // Mot de passe juste : on ouvre le champ du code au lieu de dire « faux ».
      if (motif === "totp-required") return { needsCode: true };
      if (motif === "totp-invalid") return { needsCode: true, error: await tErr("totpInvalid") };
      return { error: await tErr("badCredentials") };
    }
    throw error; // NEXT_REDIRECT inclus
  }
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
