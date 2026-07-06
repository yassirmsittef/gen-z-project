/**
 * Lance un PostgreSQL embarqué pour le développement (aucune installation
 * de Postgres ni Docker requise). Les données vivent dans ./.dev-db.
 *
 *   npm run db:start
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const DATA_DIR = resolve(process.cwd(), ".dev-db");
const PORT = 5433;
const DB_NAME = "tremplin";

async function main() {
  const fresh = !existsSync(DATA_DIR);

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: "postgres",
    password: "postgres",
    port: PORT,
    persistent: true,
  });

  if (fresh) {
    console.log("Initialisation du cluster PostgreSQL (première fois)...");
    await pg.initialise();
  }

  await pg.start();

  if (fresh) {
    await pg.createDatabase(DB_NAME);
  }

  console.log(`\nPostgreSQL prêt : postgresql://postgres:postgres@localhost:${PORT}/${DB_NAME}`);
  console.log("Laisse ce process tourner. Ctrl+C pour arrêter.\n");

  const stop = async () => {
    console.log("\nArrêt de PostgreSQL...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
