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
    // Aucun réseau tiers depuis la suite : sans clé, l'envoi d'email et les
    // services externes se taisent. Une alerte de sécurité déclenchée par un
    // test ne doit jamais partir pour de vrai vers l'admin de la base de dev.
    env: { RESEND_API_KEY: "", ANTHROPIC_API_KEY: "", MICROSOFT_TRANSLATOR_KEY: "" },
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
