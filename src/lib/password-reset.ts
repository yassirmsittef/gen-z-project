import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { DomainError } from "@/lib/project-service";
import { appUrl } from "@/lib/stripe";

/**
 * Réinitialisation de mot de passe par email.
 *
 * Sécurité : le token (32 octets aléatoires) ne vit qu'en clair dans l'email —
 * la base ne stocke que son SHA-256. Usage unique, expiration 60 minutes, les
 * tokens ouverts précédents sont invalidés à chaque nouvelle demande. La
 * demande répond TOUJOURS pareil, que l'email existe ou non (anti-énumération
 * des comptes), et est plafonnée à 3 demandes par heure et par compte.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 3;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Crée un token de réinitialisation — exporté pour les tests. */
export async function createResetToken(userId: string): Promise<string> {
  const recent = await prisma.passwordResetToken.count({
    where: { userId, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_REQUESTS_PER_HOUR) {
    throw new DomainError("Trop de demandes — réessaie dans une heure.");
  }

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    // Une seule porte ouverte à la fois : les tokens précédents EXPIRENT
    // (pas de suppression — les lignes restent comptées par le plafond).
    // Daté une seconde DANS LE PASSÉ, pas « maintenant » : la validation lit
    // `expiresAt < new Date()`, donc un token expiré à l'instant T restait
    // acceptable pendant toute la milliseconde T.
    prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { expiresAt: new Date(Date.now() - 1000) },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);
  return token;
}

/** Demande de réinitialisation : silencieuse si l'email est inconnu. */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, name: true },
  });
  if (!user) return; // même réponse qu'en cas de succès — pas d'énumération

  const token = await createResetToken(user.id);
  const link = `${appUrl()}/reinitialiser/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Réinitialise ton mot de passe GeniGain",
    text: `Salut ${user.name ?? ""},\n\nQuelqu'un (toi, normalement) a demandé à réinitialiser ton mot de passe GeniGain.\n\nLe lien est valable 1 heure et ne sert qu'une fois :\n${link}\n\nSi ce n'était pas toi, ignore cet email — ton mot de passe reste inchangé.\n\n— GeniGain, la communauté qui finance ta génération`,
    html: `<!doctype html><html><body style="margin:0;padding:0;background-color:#0B0E14;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B0E14;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#131826;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
<tr><td style="padding:32px;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#94A3B8;font-family:'SF Mono',Menlo,Consolas,monospace;">GeniGain</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#F1F5F9;">Réinitialise ton mot de passe</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#94A3B8;">Salut ${user.name ?? ""} — quelqu'un (toi, normalement) a demandé à réinitialiser ton mot de passe. Le lien est valable <strong style="color:#F1F5F9;">1&nbsp;heure</strong> et ne sert qu'une fois.</p>
<p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;padding:12px 24px;background:linear-gradient(120deg,#5EEAD4,#38BDF8);color:#0B0E14;font-weight:600;font-size:14px;text-decoration:none;border-radius:12px;">Choisir un nouveau mot de passe</a></p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#64748B;">Si ce n'était pas toi, ignore cet email — ton mot de passe reste inchangé.</p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:11px;color:#64748B;">GeniGain — la communauté qui finance ta génération</p>
</td></tr></table></body></html>`,
  });
}

/** Consomme un token valide et pose le nouveau mot de passe. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new DomainError("Ce lien est invalide ou a expiré — refais une demande.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
