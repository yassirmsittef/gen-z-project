import { prisma } from "../src/lib/prisma";

/**
 * Donne (ou retire) le rôle ADMIN à un compte :
 *   npx tsx scripts/promote-admin.ts email@exemple.fr          # promeut
 *   npx tsx scripts/promote-admin.ts email@exemple.fr retirer  # rétrograde
 *
 * En prod : lancer avec DATABASE_URL pointant sur Neon.
 */
async function main() {
  const [email, action] = process.argv.slice(2);
  if (!email) {
    console.error("Usage : npx tsx scripts/promote-admin.ts <email> [retirer]");
    process.exit(1);
  }
  const role = action === "retirer" ? "MEMBER" : "ADMIN";
  const user = await prisma.user.update({ where: { email }, data: { role } });
  console.log(`${user.name} (${email}) → ${role}`);
}

main().finally(() => prisma.$disconnect());
