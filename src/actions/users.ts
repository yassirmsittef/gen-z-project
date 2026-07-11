"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findCity } from "@/lib/cities";
import { updateUserLocation, updateUserSkills } from "@/lib/project-service";
import { parseList, userSkillsSchema } from "@/lib/validation";

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
