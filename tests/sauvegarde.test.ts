import { describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/prisma";
import { MODEL_NAMES, RESTORE_ORDER, decryptDump, dumpDatabase, encryptDump } from "../src/lib/backup";

/**
 * La sauvegarde chiffrée : rien d'oublié, rien de lisible sans la clé, rien
 * d'accepté si le fichier a bougé.
 */
describe("sauvegarde chiffrée", () => {
  it("l'ordre de restauration couvre EXACTEMENT les modèles du schéma (un modèle ajouté sans ordre casse ici)", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    const dansLeSchema = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
    expect([...RESTORE_ORDER].sort()).toEqual([...dansLeSchema].sort());
    expect([...MODEL_NAMES].sort()).toEqual([...dansLeSchema].sort());
    expect(new Set(RESTORE_ORDER).size).toBe(RESTORE_ORDER.length);
  });

  it("le dump prend toutes les tables, et fait l'aller-retour chiffré", async () => {
    const dump = await dumpDatabase(prisma);
    expect(Object.keys(dump.tables).sort()).toEqual([...MODEL_NAMES].sort());
    expect(dump.tables.User.length).toBe(await prisma.user.count());

    const key = randomBytes(32);
    const fichier = encryptDump(dump, key);
    expect(fichier.subarray(0, 4).toString()).toBe("GGB1");
    // Illisible sans la clé : ni la structure JSON, ni un email du dump en clair
    // (un octet isolé comme « @ » peut apparaître par hasard dans du chiffré ;
    // on cherche des séquences, pas des caractères).
    expect(fichier.includes(Buffer.from('"takenAt"'))).toBe(false);
    const premierEmail = (dump.tables.User[0] as { email?: string } | undefined)?.email;
    if (premierEmail) expect(fichier.includes(Buffer.from(premierEmail))).toBe(false);

    const relu = decryptDump(fichier, key);
    expect(relu.takenAt).toBe(dump.takenAt);
    expect(relu.tables.User.length).toBe(dump.tables.User.length);

    // Mauvaise clé, ou un seul octet modifié : refus (tag d'authentification).
    expect(() => decryptDump(fichier, randomBytes(32))).toThrow();
    const abime = Buffer.from(fichier);
    abime[abime.length - 1] ^= 0x01;
    expect(() => decryptDump(abime, key)).toThrow();
    expect(() => decryptDump(Buffer.from("pas une sauvegarde"), key)).toThrow();
  });
});
