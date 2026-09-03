import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Mot de passe à usage unique fondé sur le temps (TOTP, RFC 6238 sur
 * HOTP, RFC 4226) — HMAC-SHA1, 6 chiffres, pas de 30 secondes : ce que
 * lisent Google Authenticator, Aegis, 1Password, Bitwarden…
 *
 * Écrit à la main plutôt qu'importé : quarante lignes, aucune dépendance de
 * plus dans la chaîne d'approvisionnement d'une plateforme qui manipule de
 * l'argent, et des vecteurs de test OFFICIELS (annexe B de la RFC) pour
 * prouver que ces quarante lignes font ce qu'elles disent.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const TOTP_STEP_S = 30;
export const TOTP_DIGITS = 6;

/** Base32 (RFC 4648) sans remplissage — l'encodage que les applis attendent. */
export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let valeur = 0;
  let sortie = "";
  for (const octet of bytes) {
    valeur = (valeur << 8) | octet;
    bits += 8;
    while (bits >= 5) {
      sortie += ALPHABET[(valeur >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) sortie += ALPHABET[(valeur << (5 - bits)) & 31];
  return sortie;
}

export function base32Decode(texte: string): Uint8Array {
  const propre = texte.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let valeur = 0;
  const sortie: number[] = [];
  for (const c of propre) {
    const idx = ALPHABET.indexOf(c);
    if (idx === -1) throw new Error("base32 invalide");
    valeur = (valeur << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      sortie.push((valeur >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Uint8Array.from(sortie);
}

/** 20 octets aléatoires (160 bits, la taille de référence pour SHA-1). */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Le code HOTP d'un compteur (RFC 4226, §5.3 — troncature dynamique). */
export function hotp(secret: Uint8Array, compteur: bigint, digits = TOTP_DIGITS): string {
  const tampon = Buffer.alloc(8);
  tampon.writeBigUInt64BE(compteur);
  const h = createHmac("sha1", Buffer.from(secret)).update(tampon).digest();
  const offset = h[h.length - 1] & 0x0f;
  const binaire =
    ((h[offset] & 0x7f) << 24) |
    ((h[offset + 1] & 0xff) << 16) |
    ((h[offset + 2] & 0xff) << 8) |
    (h[offset + 3] & 0xff);
  return String(binaire % 10 ** digits).padStart(digits, "0");
}

export function totpCode(secretBase32: string, nowMs = Date.now(), stepS = TOTP_STEP_S): string {
  return hotp(base32Decode(secretBase32), BigInt(Math.floor(nowMs / 1000 / stepS)));
}

/**
 * Vérifie un code en tolérant DEUX pas d'horloge de chaque côté (~±75 s) : le
 * téléphone et le serveur ne sont jamais exactement à l'heure, et ±1 seul pas
 * (±30 s) refusait de vrais codes dès qu'un téléphone dérivait un peu — la
 * cause n°1 des « code incorrect ». Cinq codes valides à la fois sur un
 * million, et le verrou de connexion (10 échecs/15 min) cape les essais : la
 * force brute reste sans intérêt. Comparaison en temps constant : le temps de
 * réponse ne dit pas combien de chiffres sont bons.
 */
export function verifyTotp(
  secretBase32: string,
  code: string,
  nowMs = Date.now(),
  fenetre = 2
): boolean {
  const saisi = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(saisi)) return false;
  const secret = base32Decode(secretBase32);
  const pas = BigInt(Math.floor(nowMs / 1000 / TOTP_STEP_S));
  for (let d = -fenetre; d <= fenetre; d++) {
    const attendu = hotp(secret, pas + BigInt(d));
    if (timingSafeEqual(Buffer.from(attendu), Buffer.from(saisi))) return true;
  }
  return false;
}

/** L'URI que lisent les applis d'authentification (via QR ou saisie manuelle). */
export function otpauthUri(secretBase32: string, compte: string, emetteur = "GeniGain"): string {
  const label = encodeURIComponent(`${emetteur}:${compte}`);
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(emetteur)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP_S}`;
}
