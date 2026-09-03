// Prisma 7 ne lit plus `.env` : Next le fait pour lui-même, mais pas vitest,
// pas tsx, pas les scripts. Charger ici — le seul endroit qui ouvre la
// connexion — couvre tout le monde ; dotenv n'écrase jamais une variable
// déjà posée (Vercel) et ignore un fichier absent.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 : le client parle à Postgres par un adaptateur (pg), et l'URL
 * poolée est donnée ici — plus dans le schéma. Instance unique en dev
 * (rechargement à chaud), sinon chaque rechargement ouvrait un pool de plus.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * `sslmode=require` → `verify-full`, explicitement. Aujourd'hui `pg` traite
 * `require` comme `verify-full` (certificat du serveur VÉRIFIÉ) et le dit
 * dans un avertissement à chaque démarrage ; `pg` 9 adoptera la sémantique
 * libpq, où `require` chiffre SANS vérifier — une mise à jour ordinaire
 * aurait ouvert la porte à un homme-du-milieu sans qu'aucun test ne rougisse.
 * On écrit ce qu'on veut, et on ne dépend plus d'un défaut qui change.
 * Sans `sslmode` (base locale), rien ne bouge.
 */
export function normaliseSslMode(url: string): string {
  return url.replace(/([?&])sslmode=(require|prefer|verify-ca)(?=&|$)/, "$1sslmode=verify-full");
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: normaliseSslMode(process.env.DATABASE_URL ?? "") });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
