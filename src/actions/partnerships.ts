"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deepAnalyze } from "@/lib/partnership-ai";
import { partnershipRequestSchema, partnershipResponseSchema } from "@/lib/validation";

export type PartnershipFormState = { error?: string } | undefined;

/**
 * Dépôt d'une demande de partenariat par une marque — formulaire PUBLIC
 * (aucun compte requis). Anti-bot minimal : champ pot-de-miel invisible.
 * Redirige vers le lien de suivi privé de la marque.
 */
export async function submitPartnershipAction(
  _prev: PartnershipFormState,
  formData: FormData
): Promise<PartnershipFormState> {
  // Pot-de-miel : les humains ne voient pas ce champ, les bots le remplissent.
  if (String(formData.get("companySize") ?? "").length > 0) {
    return { error: "Envoi bloqué." };
  }

  const parsed = partnershipRequestSchema.safeParse({
    projectId: formData.get("projectId"),
    brandName: formData.get("brandName"),
    contactName: formData.get("contactName"),
    brandEmail: formData.get("brandEmail"),
    brandWebsite: formData.get("brandWebsite"),
    compensation: formData.get("compensation"),
    budget: formData.get("budget"),
    message: formData.get("message"),
    deliverables: formData.get("deliverables"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, slug: true },
  });
  if (!project) return { error: "Projet introuvable." };

  // Garde-fou anti-spam : 5 demandes en attente max par email et par projet.
  const pendingFromSender = await prisma.partnershipRequest.count({
    where: {
      projectId: project.id,
      brandEmail: parsed.data.brandEmail.toLowerCase(),
      status: "PENDING",
    },
  });
  if (pendingFromSender >= 5) {
    return { error: "Vous avez déjà plusieurs demandes en attente pour ce projet." };
  }

  const request = await prisma.partnershipRequest.create({
    data: {
      projectId: project.id,
      brandName: parsed.data.brandName,
      contactName: parsed.data.contactName || null,
      brandEmail: parsed.data.brandEmail.toLowerCase(),
      brandWebsite: parsed.data.brandWebsite || null,
      compensation: parsed.data.compensation,
      budget: parsed.data.budget ?? null,
      message: parsed.data.message,
      deliverables: parsed.data.deliverables || null,
    },
    select: { trackToken: true },
  });

  revalidatePath("/partenariats");
  redirect(`/partenariats/suivi/${request.trackToken}?nouveau=1`);
}

/** Charge une demande et vérifie que l'utilisateur connecté est bien le porteur. */
async function requireOwnedRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const request = await prisma.partnershipRequest.findUnique({
    where: { id: requestId },
    include: {
      project: { select: { id: true, title: true, goal: true, ownerId: true, owner: { select: { name: true } } } },
    },
  });
  if (!request || request.project.ownerId !== session.user.id) {
    return null;
  }
  return request;
}

export type PartnershipResponseState = { error?: string; success?: boolean } | undefined;

/** Réponse du porteur : accepter ou refuser, avec le message envoyé à la marque. */
export async function respondPartnershipAction(
  _prev: PartnershipResponseState,
  formData: FormData
): Promise<PartnershipResponseState> {
  const parsed = partnershipResponseSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
    reply: formData.get("reply"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const request = await requireOwnedRequest(parsed.data.requestId);
  if (!request) return { error: "Demande introuvable." };
  if (request.status !== "PENDING") {
    return { error: "Cette demande a déjà reçu une réponse." };
  }

  await prisma.partnershipRequest.update({
    where: { id: request.id },
    data: {
      status: parsed.data.decision,
      ownerReply: parsed.data.reply,
      respondedAt: new Date(),
    },
  });

  revalidatePath("/partenariats");
  revalidatePath(`/partenariats/${request.id}`);
  return { success: true };
}

export type DeepAnalysisState = { error?: string; done?: boolean } | undefined;

/**
 * Analyse approfondie par l'IA (Claude). L'heuristique instantanée reste
 * affichée si l'appel échoue — jamais d'écran bloqué.
 */
export async function deepAnalyzeAction(
  _prev: DeepAnalysisState,
  formData: FormData
): Promise<DeepAnalysisState> {
  const requestId = String(formData.get("requestId") ?? "");
  const request = await requireOwnedRequest(requestId);
  if (!request) return { error: "Demande introuvable." };

  const analysis = await deepAnalyze(request, {
    projectTitle: request.project.title,
    projectGoal: request.project.goal,
    ownerName: request.project.owner.name ?? "Le porteur du projet",
  });
  if (!analysis) {
    return { error: "L'analyse approfondie n'a pas abouti — l'analyse rapide reste affichée." };
  }

  revalidatePath(`/partenariats/${request.id}`);
  return { done: true };
}
