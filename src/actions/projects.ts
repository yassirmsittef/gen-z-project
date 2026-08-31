"use server";
import { domainErrorMessage, tErr } from "@/lib/action-errors";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { linkNewProjectToCall } from "@/lib/boycott";
import { prisma } from "@/lib/prisma";
import {
  cancelProjectByOwner,
  createProject,
  deleteProject,
  DomainError,
  updateProject,
} from "@/lib/project-service";
import { projectEditFormToInput, projectFormToInput } from "@/lib/validation";
import { requestSchemas } from "@/lib/validation-locale";

export type CreateProjectState = { error?: string } | undefined;

export async function createProjectAction(
  _prev: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let milestones: unknown;
  try {
    milestones = JSON.parse(String(formData.get("milestones") ?? "[]"));
  } catch {
    return { error: await tErr("invalidMilestones") };
  }

  const { createProjectSchema } = await requestSchemas();
  const parsed = createProjectSchema.safeParse(projectFormToInput(formData, milestones));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  let slug: string;
  try {
    slug = await createProject(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  // Le projet a été lancé depuis un appel du fil : on le déclare remplaçant
  // dans la foulée, sans faire revenir le porteur sur la page de l'appel.
  const callSlug = String(formData.get("callSlug") ?? "");
  if (callSlug) {
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (project) await linkNewProjectToCall(session.user.id, project.id, callSlug);
    revalidatePath("/appels", "layout");
    revalidatePath("/");
  }

  redirect(`/projects/${slug}`);
}

export type UpdateProjectState = { error?: string } | undefined;

export async function updateProjectAction(
  _prev: UpdateProjectState,
  formData: FormData
): Promise<UpdateProjectState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { updateProjectSchema } = await requestSchemas();
  const parsed = updateProjectSchema.safeParse(projectEditFormToInput(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  let slug: string;
  try {
    slug = await updateProject(session.user.id, String(formData.get("projectId")), parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  redirect(`/projects/${slug}`);
}

export type DeleteProjectState = { error?: string } | undefined;

export async function deleteProjectAction(
  _prev: DeleteProjectState,
  formData: FormData
): Promise<DeleteProjectState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    await deleteProject(session.user.id, String(formData.get("projectId")));
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  redirect("/dashboard");
}

export type CancelProjectState = { error?: string } | undefined;

/**
 * Arrêt volontaire d'un projet en cours par son porteur : les contributeurs
 * sont remboursés du séquestre restant (le projet passe « non abouti »).
 */
export async function cancelProjectAction(
  _prev: CancelProjectState,
  formData: FormData
): Promise<CancelProjectState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const slug = String(formData.get("slug") ?? "");
  try {
    await cancelProjectByOwner(session.user.id, String(formData.get("projectId")));
  } catch (error) {
    if (error instanceof DomainError) return { error: await domainErrorMessage(error) };
    throw error;
  }

  redirect(slug ? `/projects/${slug}` : "/dashboard");
}
