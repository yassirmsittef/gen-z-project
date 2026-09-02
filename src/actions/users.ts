"use server";
import { cookies } from "next/headers";
import { domainErrorMessage, tErr } from "@/lib/action-errors";
import { LANG_COOKIE } from "@/lib/i18n/server";

import { revalidatePath } from "next/cache";
import { reportStorageAfterUpload, storageStatus } from "@/lib/call-videos";
import { redirect } from "next/navigation";
import { del, put } from "@vercel/blob";
import { auth } from "@/auth";
import { findCity } from "@/lib/cities";
import { prisma } from "@/lib/prisma";
import { updateUserLocation, updateUserSkills } from "@/lib/project-service";
import bcrypt from "bcryptjs";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { eraseAccount } from "@/lib/account";
import { DomainError } from "@/lib/project-service";
import { parseList } from "@/lib/validation";
import { requestSchemas } from "@/lib/validation-locale";

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
  if (!password) return { error: await tErr("passwordToConfirm") };

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
    return { error: await tErr("passwordIncorrect") };
  }

  try {
    await eraseAccount(session.user.id);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  await signOut({ redirectTo: "/" });
}

export type PasswordFormState = { error?: string; success?: boolean } | undefined;

/**
 * Changement de mot de passe : l'actuel est exigé et vérifié. La version de
 * session est incrémentée dans le même geste : toute session ouverte
 * ailleurs — y compris celle qui a motivé le changement — tombe dans les
 * 5 minutes (cf. src/auth.ts). Celle-ci est aussitôt RÉOUVERTE avec le
 * nouveau mot de passe, qu'on a sous la main et qui vient d'être prouvé :
 * l'appareil qui a fait le changement ne se retrouve pas à la porte.
 * (Un compte à double authentification ne peut pas être réouvert sans code :
 * il se reconnectera à la prochaine revalidation — c'est l'admin.)
 */
export async function changePasswordAction(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { changePasswordSchema } = await requestSchemas();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true, email: true },
  });
  if (!user?.passwordHash) {
    return { error: await tErr("noPasswordToChange") };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: await tErr("currentPasswordIncorrect") };

  if (parsed.data.newPassword === parsed.data.currentPassword) {
    return { error: await tErr("newPasswordSame") };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      sessionVersion: { increment: 1 },
    },
  });

  try {
    await signIn("credentials", {
      email: user.email,
      password: parsed.data.newPassword,
      redirect: false,
    });
  } catch {
    // Double authentification : pas de code sous la main. La session tombera
    // à la prochaine revalidation et le membre se reconnectera — avec code.
  }

  return { success: true };
}

export type ProfileFormState = { error?: string; success?: boolean } | undefined;

/** Un avatar hébergé par NOUS (remplaçable/supprimable), pas un lien externe. */
const isOwnBlob = (url: string | null): url is string =>
  Boolean(url?.includes(".blob.vercel-storage.com/"));

/**
 * Identité publique (pseudo, photo, bio, liens) + devise d'affichage.
 * La photo arrive déjà recadrée/compressée par le client (webp ≤ 512 px) ;
 * on la stocke sur Vercel Blob et on efface l'ancienne si on l'hébergeait.
 */
export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { updateProfileSchema } = await requestSchemas();
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    preferredLanguage: formData.get("preferredLanguage"),
    preferredCurrency: formData.get("preferredCurrency"),
    links: formData
      .getAll("links")
      .map((l) => String(l).trim())
      .filter(Boolean),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const current = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { avatarUrl: true, avatarBytes: true },
  });
  // Relevé AVANT le dépôt : les photos comptent dans la jauge, donc elles
  // peuvent franchir un palier — et le franchissement ne se constate qu'en
  // comparant l'avant et l'après.
  const jaugeAvant = (await storageStatus()).usedBytes;

  // Photo : nouveau fichier > suppression demandée > inchangée.
  let avatarUrl = current.avatarUrl;
  let avatarBytes: number | null = current.avatarBytes;
  const file = formData.get("avatarFile");
  const removeAvatar = formData.get("removeAvatar") === "1";

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return { error: await tErr("photoMustBeImage") };
    }
    if (file.size > 1_500_000) {
      return { error: await tErr("photoTooHeavy") };
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return { error: await tErr("photoStorageNotConfigured") };
    }
    const blob = await put(`avatars/${session.user.id}.webp`, file, {
      access: "public",
      addRandomSuffix: true, // URL nouvelle à chaque photo : jamais de cache périmé
      contentType: file.type,
    });
    avatarUrl = blob.url;
    // Les photos partagent le magasin avec les témoignages : sans cette
    // mesure, la jauge de stockage ne verrait qu'un des deux producteurs et
    // le plafond laisserait le magasin déborder par l'autre bout.
    avatarBytes = file.size;
  } else if (removeAvatar) {
    avatarUrl = null;
    avatarBytes = null;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      avatarUrl,
      avatarBytes,
      bio: parsed.data.bio || null,
      preferredLanguage: parsed.data.preferredLanguage,
      preferredCurrency: parsed.data.preferredCurrency,
      links: parsed.data.links,
    },
  });

  // Le cookie suit la préférence du compte : sans lui, la déconnexion
  // ramènerait le visiteur à la langue négociée — et un sélecteur qui
  // paraît revenir en arrière est un sélecteur cassé.
  const jar = await cookies();
  jar.set(LANG_COOKIE, parsed.data.preferredLanguage, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  // Si cette photo a fait franchir un palier de stockage, l'équipe l'apprend
  // maintenant — sans ça, seule la publication d'un témoignage pouvait le
  // signaler, et le test de franchissement étant à sens unique, une alerte
  // manquée ne repartait jamais.
  await reportStorageAfterUpload(jaugeAvant);

  // L'ancienne photo hébergée chez nous ne sert plus : suppression best effort.
  if (isOwnBlob(current.avatarUrl) && current.avatarUrl !== avatarUrl) {
    try {
      await del(current.avatarUrl);
    } catch (error) {
      console.error("[avatar] suppression de l'ancien blob impossible :", error);
    }
  }

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

  const { userSkillsSchema } = await requestSchemas();
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
    return { error: await tErr("cityUnknownPick") };
  }

  await updateUserLocation(session.user.id, city);
  revalidatePath("/", "layout");
  return { success: true };
}
