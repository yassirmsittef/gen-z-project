import { ERASED_EMAIL_DOMAIN } from "@/lib/constants";

/**
 * Ce que le JWT emporte en plus du sujet : la version de session (`sv`) lue
 * à la connexion, et l'instant du dernier contrôle en base (`chk`).
 * Isolé de src/auth.ts pour être testable sans instancier Auth.js.
 */
export type SessionClaims = { sub?: string; sv?: number; chk?: number };

/** Reconfronter le jeton à la base au plus toutes les 5 minutes. */
export const REVALIDATE_MS = 5 * 60 * 1000;

export type CompteCourant = { sessionVersion: number; email: string } | null;

/** Le jeton doit-il être reconfronté à la base maintenant ? */
export function needsRevalidation(claims: SessionClaims, now: number, force = false): boolean {
  if (force) return true;
  const dernier = typeof claims.chk === "number" ? claims.chk : 0;
  return now - dernier >= REVALIDATE_MS;
}

/**
 * Le verdict après lecture du compte : le jeton mis à jour, ou `null` pour
 * dire à Auth.js d'effacer le cookie.
 *
 * - compte disparu ou effacé (RGPD) : plus de sujet → null ;
 * - version différente : le mot de passe a changé depuis → null ;
 * - jeton d'avant cette version (sans `sv`) : ADOPTÉ, pas chassé — sinon la
 *   mise en production déconnecterait tout le monde d'un coup.
 */
export function reconcileClaims(
  claims: SessionClaims,
  compte: CompteCourant,
  now: number
): SessionClaims | null {
  if (!compte || compte.email.endsWith(ERASED_EMAIL_DOMAIN)) return null;
  if (typeof claims.sv === "number" && claims.sv !== compte.sessionVersion) return null;
  return { ...claims, sv: compte.sessionVersion, chk: now };
}
