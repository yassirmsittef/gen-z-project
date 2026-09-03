import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { DomainError } from "@/lib/project-service";
import { createHash, randomBytes } from "node:crypto";
import { generateTotpSecret, otpauthUri, verifyTotp } from "@/lib/totp";

/**
 * Double authentification (TOTP) — réservée aux ADMIN pour l'instant : c'est
 * le compte qui tranche les signalements, exempte du gate et ouvre les
 * salons. Le voler vaut plus que tous les autres réunis.
 *
 * L'enrôlement se fait en deux temps, et c'est voulu : le secret est posé,
 * mais rien n'est exigé à la connexion tant qu'un PREMIER code n'a pas été
 * vérifié. Sinon un QR mal scanné ferme la porte à son propre propriétaire.
 */

const adminOnly = (role: string) => {
  if (role !== "ADMIN") throw new DomainError({ key: "totpAdminOnly" });
};

/** Le compte exige-t-il un code à la connexion ? */
export const mfaRequired = (u: { totpSecret: string | null; totpEnabledAt: Date | null }) =>
  Boolean(u.totpSecret && u.totpEnabledAt);

export async function startMfaEnrolment(userId: string): Promise<{ secret: string; uri: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true, totpEnabledAt: true },
  });
  if (!user) throw new DomainError({ key: "notLoggedIn" });
  adminOnly(user.role);
  if (user.totpEnabledAt) throw new DomainError({ key: "totpAlreadyEnabled" });

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret } });
  return { secret, uri: otpauthUri(secret, user.email) };
}

export async function confirmMfaEnrolment(userId: string, code: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, totpSecret: true, totpEnabledAt: true },
  });
  if (!user) throw new DomainError({ key: "notLoggedIn" });
  adminOnly(user.role);
  if (user.totpEnabledAt) throw new DomainError({ key: "totpAlreadyEnabled" });
  if (!user.totpSecret) throw new DomainError({ key: "totpNotStarted" });
  if (!verifyTotp(user.totpSecret, code)) throw new DomainError({ key: "totpInvalid" });

  // Codes de secours : générés à l'activation, hachés en base, rendus en clair
  // UNE seule fois pour que le membre les mette à l'abri.
  const { plain, hashes } = generateRecoveryCodes();
  await prisma.user.update({
    where: { id: userId },
    data: { totpEnabledAt: new Date(), totpRecoveryCodes: hashes },
  });
  return plain;
}

const RECOVERY_COUNT = 8;
/** Normalise un code (sans espaces ni tirets, minuscules) puis le hache. */
const hashRecovery = (code: string) =>
  createHash("sha256").update(code.replace(/[\s-]/g, "").toLowerCase()).digest("hex");

export function generateRecoveryCodes(): { plain: string[]; hashes: string[] } {
  const plain = Array.from({ length: RECOVERY_COUNT }, () => {
    const raw = randomBytes(5).toString("hex"); // 10 caractères
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  return { plain, hashes: plain.map(hashRecovery) };
}

/** Un code de secours vaut UNE fois : trouvé, il est retiré de la liste. */
export async function consumeRecoveryCode(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpRecoveryCodes: true },
  });
  if (!user) return false;
  const h = hashRecovery(code);
  if (!user.totpRecoveryCodes.includes(h)) return false;
  await prisma.user.update({
    where: { id: userId },
    data: { totpRecoveryCodes: user.totpRecoveryCodes.filter((x) => x !== h) },
  });
  return true;
}

/** Désactiver exige le mot de passe : un onglet laissé ouvert ne suffit pas. */
export async function disableMfa(userId: string, password: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new DomainError({ key: "passwordIncorrect" });
  }
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: null, totpEnabledAt: null, totpRecoveryCodes: [] },
  });
}
