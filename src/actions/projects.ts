"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createProject, deleteProject, DomainError, updateProject } from "@/lib/project-service";
import { createProjectSchema, parseList, updateProjectSchema } from "@/lib/validation";

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
    return { error: "Étapes invalides." };
  }

  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    pitch: formData.get("pitch"),
    description: formData.get("description"),
    category: formData.get("category"),
    goal: formData.get("goal"),
    coverUrl: formData.get("coverUrl"),
    durationDays: formData.get("durationDays"),
    neededSkills: parseList(formData.get("neededSkills")),
    milestones,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  let slug: string;
  try {
    slug = await createProject(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
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

  const parsed = updateProjectSchema.safeParse({
    title: formData.get("title"),
    pitch: formData.get("pitch"),
    description: formData.get("description"),
    category: formData.get("category"),
    coverUrl: formData.get("coverUrl"),
    neededSkills: parseList(formData.get("neededSkills")),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  let slug: string;
  try {
    slug = await updateProject(session.user.id, String(formData.get("projectId")), parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
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
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  redirect("/dashboard");
}
