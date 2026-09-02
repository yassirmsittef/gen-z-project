import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/project-service";

/**
 * Cadence des gestes ouverts à tout le monde — ceux qu'un script peut répéter
 * sans compte : s'inscrire, demander une réinitialisation, envoyer une
 * demande de partenariat. Adossé à la base (la seule mémoire partagée en
 * serverless), comme l'anti brute-force du login.
 *
 * La clé porte l'adresse IP HACHÉE ET SALÉE, jamais en clair : ce compteur ne
 * doit pas devenir un journal de qui fait quoi. Le sel vient d'AUTH_SECRET ;
 * sans lui, un hachage d'IP se casse à coups de dictionnaire.
 */

export type Limite = { max: number; fenetreMinutes: number };

export function hashIp(ip: string | null): string {
  const sel = process.env.AUTH_SECRET ?? "";
  return createHash("sha256").update(`${sel}:${(ip ?? "inconnue").trim()}`).digest("hex");
}

/** `signup:ip:<sha256>` — un préfixe par geste, pour que les plafonds ne se
 *  marchent pas dessus. */
export const ipKey = (geste: string, ip: string | null) => `${geste}:ip:${hashIp(ip)}`;

/** L'adresse du client derrière Vercel : premier maillon de x-forwarded-for. */
export function ipFromHeaders(h: { get(name: string): string | null }): string | null {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

export async function throttleHits(key: string, fenetreMinutes: number): Promise<number> {
  return prisma.actionThrottle.count({
    where: { key, createdAt: { gt: new Date(Date.now() - fenetreMinutes * 60_000) } },
  });
}

/** Refuse (DomainError traduisible) au-delà de la limite, sinon laisse passer. */
export async function assertUnderLimit(key: string, limite: Limite): Promise<void> {
  if ((await throttleHits(key, limite.fenetreMinutes)) >= limite.max) {
    throw new DomainError({ key: "tooManyRequests" });
  }
}

export async function recordHit(key: string): Promise<void> {
  await prisma.actionThrottle.create({ data: { key } });
}

/** Ménage du cron : la plus large fenêtre est d'une heure, on garde un jour. */
export async function purgeStaleThrottleHits(): Promise<void> {
  await prisma.actionThrottle.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } },
  });
}
