"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { findCity } from "@/lib/cities";
import { prisma } from "@/lib/prisma";
import { grantWelcomeCredits } from "@/lib/project-service";
import { loginSchema, registerSchema } from "@/lib/validation";

export type AuthFormState = { error?: string } | undefined;

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { name, email, password } = parsed.data;

  // Ville optionnelle : si renseignée, elle doit venir de la liste officielle
  // (position de la VILLE sur le globe Communauté — modifiable au dashboard).
  const cityRaw = String(formData.get("city") ?? "").trim();
  const city = cityRaw ? findCity(cityRaw) : undefined;
  if (cityRaw && !city) {
    return { error: "Ville non reconnue — choisis-en une dans la liste, ou laisse vide." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Un compte existe déjà avec cet email." };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      ...(city
        ? { city: city.name, country: city.country, latitude: city.lat, longitude: city.lng }
        : {}),
    },
  });
  await grantWelcomeCredits(user.id);

  // Lance la session puis redirige (signIn lève un NEXT_REDIRECT).
  await signIn("credentials", { email, password, redirectTo: "/projects" });
  return undefined;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/projects" });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect." };
    }
    throw error; // NEXT_REDIRECT inclus
  }
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/projects" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
