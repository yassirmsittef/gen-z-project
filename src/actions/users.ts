"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { updateUserSkills } from "@/lib/project-service";
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
