"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NotificationType } from "@prisma/client";
import { auth } from "@/auth";
import { isUnmutable } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type PrefsFormState = { error?: string; success?: boolean } | undefined;

/**
 * Préférences de notifications : le formulaire envoie les types COCHÉS
 * (= que l'utilisateur veut recevoir) ; tout le reste est coupé.
 */
export async function updateNotificationPrefsAction(
  _prev: PrefsFormState,
  formData: FormData
): Promise<PrefsFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const allTypes = Object.values(NotificationType);
  const enabled = new Set(
    formData.getAll("enabled").map(String).filter((t): t is NotificationType =>
      (allTypes as string[]).includes(t)
    )
  );
  // Un type non masquable ne part jamais en base, même si la case est décochée
  // (formulaire trafiqué, ou case retirée après coup de l'interface).
  const muted = allTypes.filter((type) => !enabled.has(type) && !isUnmutable(type));

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mutedNotifications: muted },
  });

  revalidatePath("/notifications");
  return { success: true };
}
