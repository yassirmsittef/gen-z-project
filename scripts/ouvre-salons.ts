import { openLanguageRooms } from "../src/lib/chat-groups";
import { prisma } from "../src/lib/prisma";

/**
 * Ouvre les salons de langue manquants par la voie du domaine — la même que
 * la bannière de l'annuaire. Idempotent : relancer n'ouvre que ce qui manque.
 *
 * En prod : DATABASE_URL="postgresql://…" npx tsx scripts/ouvre-salons.ts
 */
async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });
  if (!admin) {
    console.error("Aucun compte ADMIN dans cette base — rien ne peut ouvrir les salons.");
    process.exit(1);
  }

  const opened = await openLanguageRooms(admin.id);
  console.log(`${opened} salon(s) ouvert(s) (animés par ${admin.email}).`);

  const rooms = await prisma.chatGroup.findMany({
    where: { official: true },
    orderBy: { name: "asc" },
    select: { name: true, slug: true, _count: { select: { members: true } } },
  });
  console.log(`${rooms.length} salon(s) officiel(s) en base :`);
  for (const room of rooms) {
    console.log(`   ${room.name.padEnd(12)} ${room.slug.padEnd(18)} ${room._count.members} membre(s)`);
  }
}

main().finally(() => prisma.$disconnect());
