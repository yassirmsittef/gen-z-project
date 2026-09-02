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

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
