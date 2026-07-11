"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notify, notifyMany } from "@/lib/notifications";
import { commentSchema, projectUpdateSchema } from "@/lib/validation";

/** Vie du projet : actus du porteur + discussion publique. */

export type FeedFormState = { error?: string; success?: boolean } | undefined;

export async function addCommentAction(
  _prev: FeedFormState,
  formData: FormData
): Promise<FeedFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = commentSchema.safeParse({
    projectId: formData.get("projectId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, slug: true, title: true, ownerId: true },
  });
  if (!project) return { error: "Projet introuvable." };

  await prisma.comment.create({
    data: {
      projectId: project.id,
      userId: session.user.id,
      body: parsed.data.body,
    },
  });

  if (project.ownerId !== session.user.id) {
    await notify({
      userId: project.ownerId,
      type: "COMMENT",
      title: `${session.user.name ?? "Un membre"} a commenté « ${project.title} »`,
      body: parsed.data.body.length > 120 ? `${parsed.data.body.slice(0, 117)}...` : parsed.data.body,
      href: `/projects/${project.slug}#discussion`,
    });
  }

  revalidatePath(`/projects/${project.slug}`);
  return { success: true };
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const commentId = String(formData.get("commentId") ?? "");
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { project: { select: { slug: true, ownerId: true } } },
  });
  if (!comment) return;

  // Modération légère : l'auteur du commentaire OU le porteur du projet.
  const canDelete =
    comment.userId === session.user.id || comment.project.ownerId === session.user.id;
  if (!canDelete) return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/projects/${comment.project.slug}`);
}

export async function postUpdateAction(
  _prev: FeedFormState,
  formData: FormData
): Promise<FeedFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = projectUpdateSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, slug: true, title: true, ownerId: true },
  });
  if (!project) return { error: "Projet introuvable." };
  if (project.ownerId !== session.user.id) {
    return { error: "Seul·e le·la porteur·se du projet peut poster une actu." };
  }

  await prisma.projectUpdate.create({
    data: {
      projectId: project.id,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  // Les contributeurs suivent le projet : chacun est prévenu.
  const contributors = await prisma.contribution.findMany({
    where: { projectId: project.id },
    distinct: ["userId"],
    select: { userId: true },
  });
  await notifyMany(
    contributors.map((c) => ({
      userId: c.userId,
      type: "PROJECT_UPDATE" as const,
      title: `Actu de « ${project.title} » : ${parsed.data.title}`,
      href: `/projects/${project.slug}#actus`,
    }))
  );

  revalidatePath(`/projects/${project.slug}`);
  return { success: true };
}

export async function deleteUpdateAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const updateId = String(formData.get("updateId") ?? "");
  const update = await prisma.projectUpdate.findUnique({
    where: { id: updateId },
    include: { project: { select: { slug: true, ownerId: true } } },
  });
  if (!update || update.project.ownerId !== session.user.id) return;

  await prisma.projectUpdate.delete({ where: { id: updateId } });
  revalidatePath(`/projects/${update.project.slug}`);
}
