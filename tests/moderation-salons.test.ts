import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { deleteGroupMessage, joinGroup, leaveGroup } from "../src/lib/chat-groups";
import { MAX_GROUP_JOINS_PER_DAY } from "../src/lib/constants";

/**
 * Modération des salons — deux trouvailles de l'audit : l'auteur d'un message
 * signalé ne clôt plus lui-même son dossier (la preuve reste), et les lignes
 * « X a rejoint » ne sont plus un jouet (une par jour, retirables par
 * l'animation, adhésions plafonnées).
 */
const RUN = Date.now().toString(36);
const mk = (n: string) => prisma.user.create({ data: { email: `salon-${RUN}-${n}@fixture.test`, name: `S ${n}` } });

afterAll(async () => {
  await prisma.chatGroup.deleteMany({ where: { slug: { startsWith: `salon-${RUN}` } } });
  await prisma.actionThrottle.deleteMany({ where: { key: { startsWith: "join:user:" } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: `salon-${RUN}-` } } });
  await prisma.$disconnect();
});

async function salon(ownerId: string, n: string) {
  return prisma.chatGroup.create({
    data: { name: `Salon ${RUN} ${n}`, slug: `salon-${RUN}-${n}`, purpose: "x", category: "TECH", ownerId, members: { create: [{ userId: ownerId }] } },
  });
}

describe("l'auteur d'un message signalé ne détruit plus la preuve", () => {
  it("retire son message, mais le dossier reste ouvert avec le contenu ; l'animation, elle, clôt", async () => {
    const [anim, mallory, victime] = await Promise.all([mk("anim"), mk("mallory"), mk("victime")]);
    const g = await salon(anim.id, "preuve");
    await prisma.chatGroupMember.createMany({ data: [{ groupId: g.id, userId: mallory.id }, { groupId: g.id, userId: victime.id }] });
    const msg = await prisma.groupMessage.create({ data: { groupId: g.id, senderId: mallory.id, body: "insulte + 06 12 34 56 78" } });
    const dossier = await prisma.report.create({ data: { reporterId: victime.id, targetType: "GROUP_MESSAGE", targetId: msg.id, reason: "inappropriate" } });

    await deleteGroupMessage(mallory.id, msg.id);
    expect(await prisma.groupMessage.findUnique({ where: { id: msg.id } })).toBeNull();
    const apres = await prisma.report.findUniqueOrThrow({ where: { id: dossier.id } });
    expect(apres.status).toBe("OPEN");
    expect(apres.handledBy).toBeNull();
    expect(apres.evidence).toBe("insulte + 06 12 34 56 78");

    // L'animation qui retire le message d'un AUTRE clôt le dossier.
    const msg2 = await prisma.groupMessage.create({ data: { groupId: g.id, senderId: mallory.id, body: "encore" } });
    const dossier2 = await prisma.report.create({ data: { reporterId: victime.id, targetType: "GROUP_MESSAGE", targetId: msg2.id, reason: "spam" } });
    await deleteGroupMessage(anim.id, msg2.id);
    const apres2 = await prisma.report.findUniqueOrThrow({ where: { id: dossier2.id } });
    expect(apres2.status).toBe("RESOLVED");
    expect(apres2.handledBy).toBe(anim.id);
  });
});

describe("les lignes d'arrivée ne sont plus un jouet", () => {
  it("une seule ligne par jour, adhésions plafonnées, retirable par l'animation seulement", async () => {
    const [anim, m] = await Promise.all([mk("anim2"), mk("m")]);
    const g = await salon(anim.id, "arrivees");

    await joinGroup(m.id, g.slug);
    await leaveGroup(m.id, g.slug);
    await joinGroup(m.id, g.slug);
    const lignes = await prisma.groupMessage.findMany({ where: { groupId: g.id, system: true, senderId: m.id } });
    expect(lignes).toHaveLength(1);

    await leaveGroup(m.id, g.slug);
    await joinGroup(m.id, g.slug); // 3e adhésion du jour
    await leaveGroup(m.id, g.slug);
    await expect(joinGroup(m.id, g.slug)).rejects.toThrow(); // au-delà de MAX_GROUP_JOINS_PER_DAY
    expect(MAX_GROUP_JOINS_PER_DAY).toBe(3);

    // L'auteur ne retire pas sa ligne d'arrivée ; l'animation, si.
    await expect(deleteGroupMessage(m.id, lignes[0].id)).rejects.toThrow();
    await deleteGroupMessage(anim.id, lignes[0].id);
    expect(await prisma.groupMessage.findUnique({ where: { id: lignes[0].id } })).toBeNull();
  });
});
