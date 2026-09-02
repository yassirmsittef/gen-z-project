import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { DomainError } from "@/lib/project-service";
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

export async function confirmMfaEnrolment(userId: string, code: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, totpSecret: true, totpEnabledAt: true },
  });
  if (!user) throw new DomainError({ key: "notLoggedIn" });
  adminOnly(user.role);
  if (user.totpEnabledAt) throw new DomainError({ key: "totpAlreadyEnabled" });
  if (!user.totpSecret) throw new DomainError({ key: "totpNotStarted" });
  if (!verifyTotp(user.totpSecret, code)) throw new DomainError({ key: "totpInvalid" });

  await prisma.user.update({ where: { id: userId }, data: { totpEnabledAt: new Date() } });
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
    data: { totpSecret: null, totpEnabledAt: null },
  });
}
