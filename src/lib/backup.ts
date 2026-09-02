import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { del, list, put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Sauvegarde logique QUOTIDIENNE de toute la base, chiffrée, sur le stockage
 * qu'on a déjà (Vercel Blob) — sans compte ni carte de plus.
 *
 * Pourquoi : la base Neon du palier gratuit ne garde que 6 heures d'historique.
 * Une suppression malveillante, ou une migration qui tourne mal, repérée le
 * lendemain, n'était plus restaurable. Un dump par jour, gardé 14 jours,
 * borne la perte à une journée.
 *
 * Ce qui part sur le stockage est ILLISIBLE sans BACKUP_KEY : AES-256-GCM,
 * clé de 32 octets tenue hors du magasin (variable d'environnement). Le tag
 * d'authentification refuse tout fichier modifié. Le blob est public par URL
 * (le SDK ne fait pas mieux) : l'URL est aléatoire, et l'URL ne donne rien.
 *
 * Tous les modèles du schéma sont pris — la liste vient du schéma lui-même
 * (DMMF), pas d'une liste tenue à la main qu'on oublierait de compléter.
 * La restauration (scripts/restore-backup.ts) suit un ordre explicite, et un
 * test casse si un modèle apparaît dans le schéma sans y figurer.
 */

export const BACKUP_PREFIX = "backups/";
export const BACKUPS_KEPT = 14;
const MAGIC = Buffer.from("GGB1");

/** Nom de propriété du client Prisma pour un modèle (`User` → `user`). */
const delegate = (model: string) => model.charAt(0).toLowerCase() + model.slice(1);

export const MODEL_NAMES: string[] = Prisma.dmmf.datamodel.models.map((m) => m.name);

/** Ordre de restauration : chaque modèle après ceux qu'il référence. */
export const RESTORE_ORDER: string[] = [
  "User",
  "Account",
  "Session",
  "VerificationToken",
  "PasswordResetToken",
  "EmailVerificationToken",
  "LoginAttempt",
  "ActionThrottle",
  "TranslationUsage",
  "UploadTicket",
  "ReputationEvent",
  "ChatGroup",
  "ChatGroupMember",
  "ChatGroupBan",
  "GroupMessage",
  "Project",
  "PartnershipRequest",
  "Milestone",
  "Proof",
  "Vote",
  "Contribution",
  "MilestonePayout",
  "Follow",
  "ProjectUpdate",
  "Comment",
  "Report",
  "Message",
  "Notification",
  "BoycottCall",
  "BoycottSupport",
  "BoycottAnswer",
  "CallVideo",
  "CallComment",
];

export type Dump = { version: 1; takenAt: string; tables: Record<string, unknown[]> };

export function backupKey(): Buffer | null {
  const hex = process.env.BACKUP_KEY?.trim();
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) return null;
  return Buffer.from(hex, "hex");
}

/** Toute la base, modèle par modèle. */
export async function dumpDatabase(client: typeof prisma = prisma): Promise<Dump> {
  const tables: Record<string, unknown[]> = {};
  for (const model of MODEL_NAMES) {
    const d = (client as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[delegate(model)];
    tables[model] = await d.findMany();
  }
  return { version: 1, takenAt: new Date().toISOString(), tables };
}

export function encryptDump(dump: Dump, key: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const clair = gzipSync(Buffer.from(JSON.stringify(dump), "utf8"));
  const chiffre = Buffer.concat([cipher.update(clair), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), chiffre]);
}

export function decryptDump(fichier: Buffer, key: Buffer): Dump {
  if (!fichier.subarray(0, 4).equals(MAGIC)) throw new Error("Ce fichier n'est pas une sauvegarde GeniGain.");
  const iv = fichier.subarray(4, 16);
  const tag = fichier.subarray(16, 32);
  const chiffre = fichier.subarray(32);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const clair = Buffer.concat([decipher.update(chiffre), decipher.final()]);
  return JSON.parse(gunzipSync(clair).toString("utf8")) as Dump;
}

/**
 * La sauvegarde du jour : dump → chiffrement → dépôt, puis on ne garde que
 * les BACKUPS_KEPT plus récentes. Sans clé, on le dit et on ne fait rien —
 * un dump en clair sur le magasin serait pire que pas de dump.
 */
export async function runDailyBackup(): Promise<{ url: string | null; raison?: string; octets?: number; purgees?: number }> {
  const key = backupKey();
  if (!key) return { url: null, raison: "BACKUP_KEY absente ou invalide (64 caractères hexadécimaux attendus)" };
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { url: null, raison: "stockage non configuré" };

  const dump = await dumpDatabase();
  const fichier = encryptDump(dump, key);
  const nom = `${BACKUP_PREFIX}genigain-${dump.takenAt.replace(/[:.]/g, "-")}.json.gz.enc`;
  const blob = await put(nom, fichier, {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/octet-stream",
  });

  // Rotation : les plus anciennes au-delà du quota partent.
  const existantes: { url: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: BACKUP_PREFIX, cursor, limit: 1000 });
    for (const b of page.blobs) existantes.push({ url: b.url, uploadedAt: new Date(b.uploadedAt) });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  existantes.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  const aPurger = existantes.slice(BACKUPS_KEPT);
  for (const b of aPurger) await del(b.url);

  return { url: blob.url, octets: fichier.length, purgees: aPurger.length };
}
