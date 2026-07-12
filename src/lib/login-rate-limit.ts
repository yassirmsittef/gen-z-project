import { prisma } from "@/lib/prisma";

/**
 * Anti brute-force du login (par email, fenêtre glissante, adossé à la base —
 * la seule mémoire partagée en serverless). Le verrou vit dans `authorize`
 * (src/auth.ts) : il couvre le formulaire ET les POST directs à l'API Auth.js.
 * Clé = email en minuscules, y compris pour les adresses sans compte (même
 * coût pour l'attaquant, aucune fuite d'existence).
 */

export const LOGIN_MAX_FAILURES = 10;
export const LOGIN_WINDOW_MINUTES = 15;

const windowStart = () => new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60_000);

const key = (email: string) => email.trim().toLowerCase();

/** Trop d'échecs récents pour cet email ? (à vérifier AVANT bcrypt) */
export async function isLoginLocked(email: string): Promise<boolean> {
  const failures = await prisma.loginAttempt.count({
    where: { email: key(email), createdAt: { gt: windowStart() } },
  });
  return failures >= LOGIN_MAX_FAILURES;
}

export async function recordLoginFailure(email: string) {
  await prisma.loginAttempt.create({ data: { email: key(email) } });
}

/** Un login réussi remet le compteur à zéro. */
export async function clearLoginFailures(email: string) {
  await prisma.loginAttempt.deleteMany({ where: { email: key(email) } });
}

/** Purge des lignes sorties de la fenêtre (cron quotidien). */
export async function purgeStaleLoginAttempts() {
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: windowStart() } } });
}
