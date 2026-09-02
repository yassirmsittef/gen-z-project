import bcrypt from "bcryptjs";

/**
 * Un seul endroit pour hacher un mot de passe — inscription, changement,
 * réinitialisation lisent le même coût. Passé de 10 à 12 (×4 de travail par
 * essai pour qui volerait la base) ; les hachages existants restent
 * vérifiables et sont RÉÉCRITS au coût courant à la connexion suivante
 * (`needsRehash`), sans rien demander à personne.
 */
export const BCRYPT_COST = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

/** Un hachage produit à un coût inférieur au coût courant ? */
export function needsRehash(hash: string): boolean {
  try {
    return bcrypt.getRounds(hash) < BCRYPT_COST;
  } catch {
    return false;
  }
}
