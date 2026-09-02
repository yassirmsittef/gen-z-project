import { readFileSync, writeFileSync } from "node:fs";
import { prisma } from "../src/lib/prisma";
import { RESTORE_ORDER, backupKey, decryptDump } from "../src/lib/backup";

/**
 * Restaurer une sauvegarde chiffrée (src/lib/backup.ts) dans une base VIDE.
 *
 *   npx tsx scripts/restore-backup.ts <url-ou-fichier>            # restaure
 *   npx tsx scripts/restore-backup.ts <url-ou-fichier> --lire out.json   # déchiffre seulement
 *   npx tsx scripts/restore-backup.ts <url-ou-fichier> --force    # même si la base n'est pas vide
 *
 * BACKUP_KEY et DATABASE_URL viennent de l'environnement. La base cible doit
 * avoir ses migrations appliquées (`npx prisma migrate deploy`). Le script
 * REFUSE une base qui contient déjà des comptes : restaurer par-dessus du
 * vivant mélange deux mondes. Pour un exercice, viser une branche Neon ou la
 * base de dev locale vidée.
 */
async function main() {
  const [source, ...opts] = process.argv.slice(2);
  if (!source) throw new Error("Usage : restore-backup.ts <url-ou-fichier> [--lire out.json] [--force]");
  const key = backupKey();
  if (!key) throw new Error("BACKUP_KEY absente ou invalide.");

  const fichier = source.startsWith("http")
    ? Buffer.from(await (await fetch(source)).arrayBuffer())
    : readFileSync(source);
  const dump = decryptDump(fichier, key);
  console.log(`Sauvegarde du ${dump.takenAt} — ${Object.keys(dump.tables).length} tables.`);

  const lire = opts.indexOf("--lire");
  if (lire !== -1) {
    writeFileSync(opts[lire + 1] ?? "sauvegarde.json", JSON.stringify(dump, null, 2));
    console.log("Déchiffrée, rien restauré.");
    return;
  }

  const manquants = Object.keys(dump.tables).filter((m) => !RESTORE_ORDER.includes(m));
  if (manquants.length) throw new Error(`Tables sans ordre de restauration : ${manquants.join(", ")}`);

  if (!opts.includes("--force") && (await prisma.user.count()) > 0) {
    throw new Error("La base cible n'est pas vide — refus. (--force pour passer outre, en connaissance de cause.)");
  }

  for (const model of RESTORE_ORDER) {
    const rows = (dump.tables[model] ?? []) as Record<string, unknown>[];
    if (rows.length === 0) continue;
    const d = (prisma as unknown as Record<string, { createMany: (a: { data: unknown[]; skipDuplicates: boolean }) => Promise<{ count: number }> }>)[
      model.charAt(0).toLowerCase() + model.slice(1)
    ];
    const { count } = await d.createMany({ data: rows, skipDuplicates: true });
    console.log(`  ${model.padEnd(24)} ${count} / ${rows.length}`);
  }
  console.log("Restauration terminée.");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
