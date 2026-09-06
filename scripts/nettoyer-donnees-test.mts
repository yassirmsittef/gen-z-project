/**
 * Nettoyage des DONNÉES DE TEST avant l'ouverture officielle (05-06/09/2026).
 *
 * À lancer PAR LE FONDATEUR contre la base de PROD (la clé prod ne passe pas par
 * l'assistant) :
 *   DATABASE_URL="<url prod>" npx tsx scripts/nettoyer-donnees-test.mts --confirmer [email-du-second-compte]
 *
 * Sans --confirmer : n'affiche que ce qui SERAIT supprimé (mode aperçu).
 * Supprime :
 *  1. les projets dont le titre commence par « Test de bout en bout » (avec leurs
 *     contributions, étapes, parts, notifications liées — cascade Prisma) ;
 *  2. les soutiens à la plateforme (PlatformSupport) enregistrés en mode test ;
 *  3. le second compte de test, si son email est fourni en argument ;
 *  4. les notifications de reçu de soutien (support.*) orphelines.
 * Ne touche JAMAIS au compte du fondateur ni aux autres membres.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const confirmer = process.argv.includes("--confirmer");
const emailSecond = process.argv.find((a) => a.includes("@") && !a.startsWith("--"));
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

const projets = await prisma.project.findMany({
  where: { title: { startsWith: "Test de bout en bout" } },
  select: { id: true, title: true, status: true, _count: { select: { contributions: true } } },
});
const soutiens = await prisma.platformSupport.count();
const second = emailSecond
  ? await prisma.user.findUnique({ where: { email: emailSecond }, select: { id: true, email: true, role: true } })
  : null;
const notifsSoutien = await prisma.notification.count({ where: { key: { in: ["support.thanks", "support.received"] } } });

console.log(`Projets de test : ${projets.length}`);
for (const p of projets) console.log(`  - ${p.title} (${p.status}, ${p._count.contributions} contribution(s))`);
console.log(`Soutiens plateforme (test) : ${soutiens}`);
console.log(`Notifications de soutien : ${notifsSoutien}`);
console.log(`Second compte : ${second ? `${second.email} (${second.role})` : emailSecond ? "INTROUVABLE" : "(aucun email fourni)"}`);
if (second?.role === "ADMIN") throw new Error("Refus : le compte indiqué est ADMIN.");

if (!confirmer) {
  console.log("\nAperçu seulement. Relance avec --confirmer pour supprimer.");
} else {
  await prisma.project.deleteMany({ where: { id: { in: projets.map((p) => p.id) } } });
  await prisma.platformSupport.deleteMany({});
  await prisma.notification.deleteMany({ where: { key: { in: ["support.thanks", "support.received"] } } });
  if (second) await prisma.user.delete({ where: { id: second.id } });
  console.log("\n✅ Données de test supprimées. Le fondateur et les autres membres sont intacts.");
}
await prisma.$disconnect();
