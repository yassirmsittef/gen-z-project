import { describe, expect, it } from "vitest";
import {
  base32Decode,
  base32Encode,
  generateTotpSecret,
  hotp,
  otpauthUri,
  totpCode,
  verifyTotp,
} from "../src/lib/totp";

/**
 * Le TOTP maison contre les vecteurs OFFICIELS (RFC 6238 annexe B, SHA-1,
 * secret ASCII « 12345678901234567890 ») — on ne prouve pas un algorithme
 * de sécurité en le relisant.
 */
const SECRET = Buffer.from("12345678901234567890", "ascii");
const SECRET_B32 = base32Encode(SECRET);

describe("TOTP RFC 6238", () => {
  it("reproduit les vecteurs de la RFC (6 derniers chiffres des codes à 8)", () => {
    // T (secondes) → code à 8 chiffres de l'annexe B, SHA-1.
    const vecteurs: [number, string][] = [
      [59, "94287082"],
      [1111111109, "07081804"],
      [1111111111, "14050471"],
      [1234567890, "89005924"],
      [2000000000, "69279037"],
      [20000000000, "65353130"],
    ];
    for (const [t, code8] of vecteurs) {
      expect(totpCode(SECRET_B32, t * 1000)).toBe(code8.slice(-6));
      expect(hotp(SECRET, BigInt(Math.floor(t / 30)), 8)).toBe(code8);
    }
  });

  it("accepte le pas courant et ses voisins, refuse au-delà et refuse le mal formé", () => {
    const t = 1111111109 * 1000;
    const code = totpCode(SECRET_B32, t);
    expect(verifyTotp(SECRET_B32, code, t)).toBe(true);
    expect(verifyTotp(SECRET_B32, code, t + 30_000)).toBe(true);
    expect(verifyTotp(SECRET_B32, code, t - 30_000)).toBe(true);
    // Fenêtre élargie à ±2 pas : un téléphone décalé de ~1 minute est toléré.
    expect(verifyTotp(SECRET_B32, code, t + 60_000)).toBe(true);
    expect(verifyTotp(SECRET_B32, code, t - 60_000)).toBe(true);
    // Au-delà, refusé : la fenêtre reste étroite.
    expect(verifyTotp(SECRET_B32, code, t + 120_000)).toBe(false);
    expect(verifyTotp(SECRET_B32, "000000", t)).toBe(code === "000000");
    expect(verifyTotp(SECRET_B32, "12345", t)).toBe(false);
    expect(verifyTotp(SECRET_B32, "abcdef", t)).toBe(false);
    // Les espaces d'une saisie « 081 804 » sont tolérés.
    expect(verifyTotp(SECRET_B32, code.slice(0, 3) + " " + code.slice(3), t)).toBe(true);
  });

  it("base32 fait l'aller-retour et refuse l'invalide", () => {
    for (const n of [1, 5, 10, 19, 20, 33]) {
      const bytes = Uint8Array.from({ length: n }, (_, i) => (i * 37 + 11) & 255);
      expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
    }
    expect(() => base32Decode("ABC1")).toThrow();
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(base32Decode(secret).length).toBe(20);
  });

  it("l'URI otpauth porte l'émetteur, le compte et les paramètres", () => {
    const uri = otpauthUri("JBSWY3DPEHPK3PXP", "yassir@exemple.fr");
    expect(uri.startsWith("otpauth://totp/GeniGain%3Ayassir%40exemple.fr?")).toBe(true);
    expect(uri).toContain("secret=JBSWY3DPEHPK3PXP");
    expect(uri).toContain("issuer=GeniGain");
    expect(uri).toContain("digits=6");
    expect(uri).toContain("period=30");
  });
});
