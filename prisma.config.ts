import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 : la CLI (migrate, generate, seed) se configure ici, plus dans le
 * schéma ni dans package.json. Les migrations passent par la connexion
 * DIRECTE (Neon : pas le pooler) ; le runtime, lui, prend l'URL poolée dans
 * src/lib/prisma.ts. `dotenv/config` charge .env : Prisma 7 ne le fait plus.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
