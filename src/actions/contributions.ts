"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DomainError, makeContribution } from "@/lib/project-service";
import { contributeSchema } from "@/lib/validation";

export type ContributeState = { error?: string; success?: boolean } | undefined;

export async function contributeAction(
  _prev: ContributeState,
  formData: FormData
): Promise<ContributeState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = contributeSchema.safeParse({
    projectId: formData.get("projectId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await makeContribution(session.user.id, parsed.data.projectId, parsed.data.amount);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/", "layout");
  return { success: true };
}
