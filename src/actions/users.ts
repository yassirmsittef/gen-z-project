"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findCity } from "@/lib/cities";
import { prisma } from "@/lib/prisma";
import { updateUserLocation, updateUserSkills } from "@/lib/project-service";
import bcrypt from "bcryptjs";
import { signOut } from "@/auth";
import { eraseAccount } from "@/lib/account";
import { DomainError } from "@/lib/project-service";
import {
  changePasswordSchema,
  parseList,
  updateProfileSchema,
  userSkillsSchema,
} from "@/lib/validation";

export type DeleteAccountState = { error?: string } | undefined;

/**
 * Suppression du compte (anonymisation RGPD, cf src/lib/account.ts).
 * Confirmée par le mot de passe ; déconnecte et renvoie à l'accueil.
 */
export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Mot de passe requis pour confirmer." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return {
      error:
        "Ce compte utilise une connexion externe (Google) : écris-nous pour supprimer ton compte.",
    };
  }
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Mot de passe incorrect." };
  }

  try {
    await eraseAccount(session.user.id);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  await signOut({ redirectTo: "/" });
}

export type PasswordFormState = { error?: string; success?: boolean } | undefined;

/**
 * Changement de mot de passe : l'actuel est exigé et vérifié. Les sessions
 * déjà ouvertes (JWT) restent valides — acceptable en Phase 1.
 */
export async function changePasswordAction(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { error: "Ce compte n'a pas de mot de passe à changer." };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Mot de passe actuel incorrect." };

  if (parsed.data.newPassword === parsed.data.currentPassword) {
    return { error: "Le nouveau mot de passe doit être différent de l'actuel." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });

  return { success: true };
}

export type ProfileFormState = { error?: string; success?: boolean } | undefined;

/** Identité publique : pseudo, avatar (URL), courte bio du profil. */
export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
    bio: formData.get("bio"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      avatarUrl: parsed.data.avatarUrl || null,
      bio: parsed.data.bio || null,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export type SkillsFormState = { error?: string; success?: boolean } | undefined;

export async function updateSkillsAction(
  _prev: SkillsFormState,
  formData: FormData
): Promise<SkillsFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = userSkillsSchema.safeParse(parseList(formData.get("skills")));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await updateUserSkills(session.user.id, parsed.data);

  revalidatePath("/", "layout");
  return { success: true };
}

export type LocationFormState =
  | { error?: string; success?: boolean; removed?: boolean }
  | undefined;

/**
 * Ville du profil (globe Communauté). Champ vide = retrait du globe.
 * La saisie doit correspondre à une ville de la liste officielle : on ne
 * stocke jamais de position libre, uniquement les coordonnées de la ville.
 */
export async function updateLocationAction(
  _prev: LocationFormState,
  formData: FormData
): Promise<LocationFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = String(formData.get("city") ?? "").trim();
  if (!raw) {
    await updateUserLocation(session.user.id, null);
    revalidatePath("/", "layout");
    return { success: true, removed: true };
  }

  const city = findCity(raw);
  if (!city) {
    return { error: "Ville non reconnue — choisis une ville proposée par la liste." };
  }

  await updateUserLocation(session.user.id, city);
  revalidatePath("/", "layout");
  return { success: true };
}
