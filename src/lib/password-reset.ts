import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "@/lib/password";
import { ERASED_EMAIL_DOMAIN } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { dirOf, isLocale } from "@/lib/i18n/locales";
import { makeT } from "@/lib/i18n/t";
import { MESSAGES } from "@/messages";
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

type ResetSender = (input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) => Promise<{ sent: boolean }>;

/**
 * Demande de réinitialisation : silencieuse si l'email est inconnu.
 * L'utilisateur n'est PAS connecté — la langue vient de SON COMPTE, jamais
 * de la requête. `sender` injectable pour les tests (aucun réseau).
 */
export async function requestPasswordReset(
  email: string,
  sender: ResetSender = sendEmail
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, name: true, preferredLanguage: true },
  });
  if (!user) return; // même réponse qu'en cas de succès — pas d'énumération

  const locale = isLocale(user.preferredLanguage) ? user.preferredLanguage : "fr";
  const t = makeT(MESSAGES[locale].email, locale);
  const dir = dirOf(locale);
  const token = await createResetToken(user.id);
  const link = `${appUrl()}/reinitialiser/${token}`;
  const hello = user.name ? t("hello", { name: user.name }) : "";

  await sender({
    to: user.email,
    subject: t("reset.subject"),
    text: `${hello}${t("reset.intro")}\n\n${t("reset.validity")}\n${link}\n\n${t("reset.ignore")}\n\n— ${t("signature")}`,
    html: `<!doctype html><html dir="${dir}"><body style="margin:0;padding:0;background-color:#0B0E14;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B0E14;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#131826;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
<tr><td dir="${dir}" style="padding:32px;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#94A3B8;font-family:'SF Mono',Menlo,Consolas,monospace;">GeniGain</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#F1F5F9;">${escapeHtmlReset(t("reset.heading"))}</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#94A3B8;">${escapeHtmlReset(`${hello}${t("reset.intro")} ${t("reset.validity")}`)}</p>
<p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;padding:12px 24px;background:linear-gradient(120deg,#5EEAD4,#38BDF8);color:#0B0E14;font-weight:600;font-size:14px;text-decoration:none;border-radius:12px;">${escapeHtmlReset(t("reset.cta"))}</a></p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#64748B;">${escapeHtmlReset(t("reset.ignore"))}</p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:11px;color:#64748B;">${escapeHtmlReset(t("signature"))}</p>
</td></tr></table></body></html>`,
  });
}

/** Échappement local (le nom du membre traverse le gabarit — toujours APRÈS interpolation). */
function escapeHtmlReset(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

  // Défense en profondeur : `eraseAccount` purge désormais les jetons, mais
  // un jeton émis pendant la suppression ne doit jamais pouvoir reposer un
  // mot de passe sur une ligne anonymisée — ce serait ressusciter le compte.
  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { email: true },
  });
  if (!user || user.email.endsWith(ERASED_EMAIL_DOMAIN)) {
    throw new DomainError("Ce lien est invalide ou a expiré — refais une demande.");
  }

  await prisma.$transaction([
    // Réinitialiser, c'est souvent reprendre un compte à quelqu'un d'autre :
    // la version de session monte, et les sessions de l'intrus tombent.
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(newPassword), sessionVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
