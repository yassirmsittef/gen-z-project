import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { dirOf, isLocale } from "@/lib/i18n/locales";
import { makeT } from "@/lib/i18n/t";
import { MESSAGES } from "@/messages";
import { DomainError } from "@/lib/project-service";
import { appUrl } from "@/lib/stripe";

/**
 * Vérification de l'adresse email — même mécanique que la réinitialisation
 * de mot de passe : jeton de 32 octets aléatoires, seul son SHA-256 en base,
 * usage unique, 24 h, un seul jeton actif par compte, 3 envois par heure.
 *
 * Trouvé par l'audit : l'inscription ne vérifiait jamais l'adresse, alors
 * que le rôle ADMIN s'accorde sur la seule chaîne d'email. Une adresse
 * confirmée est un préalable à la promotion (scripts/promote-admin.ts).
 * On ne bloque rien d'autre : payer par carte identifie déjà bien mieux.
 */

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_SENDS_PER_HOUR = 3;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createVerificationToken(userId: string): Promise<string> {
  const recent = await prisma.emailVerificationToken.count({
    where: { userId, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_SENDS_PER_HOUR) throw new DomainError({ key: "tooManyRequests" });

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { expiresAt: new Date(Date.now() - 1000) },
    }),
    prisma.emailVerificationToken.create({
      data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    }),
  ]);
  return token;
}

type Sender = (input: { to: string; subject: string; html: string; text: string }) => Promise<{ sent: boolean }>;

/** Envoie (ou renvoie) l'email de confirmation, dans la langue du compte. */
export async function sendVerificationEmail(userId: string, sender: Sender = sendEmail): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, preferredLanguage: true, emailVerified: true },
  });
  if (!user || user.emailVerified) return;

  const locale = isLocale(user.preferredLanguage) ? user.preferredLanguage : "fr";
  const t = makeT(MESSAGES[locale].email, locale);
  const dir = dirOf(locale);
  const token = await createVerificationToken(userId);
  const link = `${appUrl()}/verifier-email/${token}`;
  const hello = user.name ? t("hello", { name: user.name }) : "";

  await sender({
    to: user.email,
    subject: t("verify.subject"),
    text: `${hello}${t("verify.intro")}\n\n${t("verify.validity")}\n${link}\n\n${t("verify.ignore")}\n\n— ${t("signature")}`,
    html: `<!doctype html><html dir="${dir}"><body style="margin:0;padding:0;background-color:#0B0E14;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B0E14;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#131826;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
<tr><td dir="${dir}" style="padding:32px;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#94A3B8;font-family:'SF Mono',Menlo,Consolas,monospace;">GeniGain</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#F1F5F9;">${escapeHtml(t("verify.heading"))}</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#94A3B8;">${escapeHtml(`${hello}${t("verify.intro")} ${t("verify.validity")}`)}</p>
<p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;padding:12px 24px;background:linear-gradient(120deg,#5EEAD4,#38BDF8);color:#0B0E14;font-weight:600;font-size:14px;text-decoration:none;border-radius:12px;">${escapeHtml(t("verify.cta"))}</a></p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#64748B;">${escapeHtml(t("verify.ignore"))}</p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:11px;color:#64748B;">${escapeHtml(t("signature"))}</p>
</td></tr></table></body></html>`,
  });
}

/** Consomme un jeton : l'adresse est confirmée. Rend `false` si le lien est mort. */
export async function verifyEmailToken(token: string): Promise<boolean> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) return false;
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return true;
}

/** Le nom du membre traverse le gabarit — toujours échappé APRÈS interpolation. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
