import type { ReportStatus, ReportTargetType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { REPORT_REASONS } from "@/lib/constants";
import { DomainError } from "@/lib/project-service";

/**
 * Signalements : n'importe quel membre alerte, seuls les ADMIN tranchent.
 * La suppression effective du contenu passe par les moyens existants
 * (suppression de commentaire, contact du porteur) — le signalement est la
 * file d'attente, pas le marteau.
 */

export async function createReport(
  reporterId: string,
  input: { targetType: ReportTargetType; targetId: string; reason: string; detail?: string }
) {
  if (!(REPORT_REASONS as readonly string[]).includes(input.reason)) {
    throw new DomainError("Choisis un motif dans la liste.");
  }

  // La cible doit exister (et on ne se signale pas soi-même).
  if (input.targetType === "PROJECT") {
    const project = await prisma.project.findUnique({
      where: { id: input.targetId },
      select: { id: true },
    });
    if (!project) throw new DomainError("Projet introuvable.");
  } else if (input.targetType === "COMMENT") {
    const comment = await prisma.comment.findUnique({
      where: { id: input.targetId },
      select: { id: true },
    });
    if (!comment) throw new DomainError("Commentaire introuvable.");
  } else if (input.targetType === "GROUP_MESSAGE") {
    const message = await prisma.groupMessage.findUnique({
      where: { id: input.targetId },
      select: { senderId: true, system: true },
    });
    if (!message || message.system) throw new DomainError("Message introuvable.");
    if (message.senderId === reporterId) {
      throw new DomainError("C'est ton message — tu peux le supprimer toi-même.");
    }
  } else if (input.targetType === "BOYCOTT_CALL") {
    const call = await prisma.boycottCall.findUnique({
      where: { id: input.targetId },
      select: { authorId: true, removedAt: true },
    });
    if (!call || call.removedAt) throw new DomainError("Appel introuvable.");
    if (call.authorId === reporterId) {
      throw new DomainError("C'est ton appel — tu peux le retirer toi-même.");
    }
  } else if (input.targetType === "CALL_COMMENT") {
    const comment = await prisma.callComment.findUnique({
      where: { id: input.targetId },
      select: { userId: true },
    });
    // Un commentaire RETIRÉ reste signalable : le signalement arrive souvent
    // après le retrait, et la modération doit pouvoir trancher sur la pièce.
    if (!comment) throw new DomainError("Réponse introuvable.");
    if (comment.userId === reporterId) {
      throw new DomainError("C'est ta réponse — tu peux la retirer toi-même.");
    }
  } else if (input.targetType === "CALL_VIDEO") {
    const video = await prisma.callVideo.findUnique({
      where: { id: input.targetId },
      select: { authorId: true, removedAt: true },
    });
    if (!video || video.removedAt) throw new DomainError("Témoignage introuvable.");
    if (video.authorId === reporterId) {
      throw new DomainError("C'est ton témoignage — tu peux le retirer toi-même.");
    }
  } else if (input.targetType === "CHAT_GROUP") {
    const group = await prisma.chatGroup.findUnique({
      where: { id: input.targetId },
      select: { ownerId: true },
    });
    if (!group) throw new DomainError("Groupe introuvable.");
    if (group.ownerId === reporterId) {
      throw new DomainError("Tu animes ce groupe — dissous-le plutôt que de le signaler.");
    }
  } else {
    if (input.targetId === reporterId) {
      throw new DomainError("Tu ne peux pas te signaler toi-même.");
    }
    const user = await prisma.user.findUnique({
      where: { id: input.targetId },
      select: { id: true },
    });
    if (!user) throw new DomainError("Membre introuvable.");
  }

  const existing = await prisma.report.findFirst({
    where: {
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      status: "OPEN",
    },
    select: { id: true },
  });
  if (existing) {
    throw new DomainError("Tu as déjà signalé — l'équipe va regarder, merci.");
  }

  await prisma.report.create({
    data: {
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      detail: input.detail?.trim() || null,
    },
  });
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function handleReport(
  adminId: string,
  reportId: string,
  decision: Extract<ReportStatus, "RESOLVED" | "DISMISSED">
) {
  if (!(await isAdmin(adminId))) {
    throw new DomainError("Réservé à l'équipe de modération.");
  }
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { status: true },
  });
  if (!report) throw new DomainError("Signalement introuvable.");
  if (report.status !== "OPEN") throw new DomainError("Ce signalement a déjà été tranché.");

  await prisma.report.update({
    where: { id: reportId },
    data: { status: decision, handledAt: new Date(), handledBy: adminId },
  });
}
