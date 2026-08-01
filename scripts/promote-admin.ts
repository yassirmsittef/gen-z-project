import { prisma } from "../src/lib/prisma";

/**
 * Qui est administrateur, et le devenir :
 *   npx tsx scripts/promote-admin.ts --lister                   # qui est ADMIN ?
 *   npx tsx scripts/promote-admin.ts email@exemple.fr           # promeut
 *   npx tsx scripts/promote-admin.ts email@exemple.fr retirer   # rétrograde
 *
 * En prod : lancer avec DATABASE_URL pointant sur Neon —
 *   DATABASE_URL="postgresql://…" npx tsx scripts/promote-admin.ts --lister
 * (l'URL se copie depuis le dashboard Neon ou les variables Vercel ; elle
 * reste sur ta machine, ne la colle nulle part ailleurs.)
 *
 * `--lister` n'affiche QUE les comptes ADMIN : de quoi retrouver le sien sans
 * étaler l'annuaire des membres.
 */
async function main() {
  const [email, action] = process.argv.slice(2);
  if (!email) {
    console.error("Usage : npx tsx scripts/promote-admin.ts <email|--lister> [retirer]");
    process.exit(1);
  }

  if (email === "--lister" || email === "--list") {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { email: true, name: true, createdAt: true },
    });
    if (admins.length === 0) {
      console.log("Aucun compte ADMIN dans cette base.");
      console.log("Pour en désigner un : npx tsx scripts/promote-admin.ts ton@email.fr");
      return;
    }
    console.log(`${admins.length} compte(s) ADMIN :`);
    for (const admin of admins) {
      console.log(
        `   ${admin.email.padEnd(32)} ${admin.name ?? "(sans nom)"} — inscrit le ${admin.createdAt.toISOString().slice(0, 10)}`
      );
    }
    return;
  }

  const role = action === "retirer" ? "MEMBER" : "ADMIN";
  const user = await prisma.user.update({ where: { email }, data: { role } });
  console.log(`${user.name} (${email}) → ${role}`);
}

main().finally(() => prisma.$disconnect());
