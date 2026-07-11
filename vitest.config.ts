import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Tests des règles du jeu contre la base de dev (embedded-postgres, port
 * 5433 — lancer `npm run db:start` d'abord). Les fixtures sont créées puis
 * nettoyées par suffixe d'email : exécution séquentielle obligatoire.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
