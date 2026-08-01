import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { getConversations, getThread } from "../src/lib/chat";

/**
 * Fil privé un-à-un. Régression principale : `getThread` prenait les 100
 * PREMIERS messages — passé le centième, une conversation restait figée
 * dans son passé et les nouveaux messages n'apparaissaient jamais.
 */

const RUN = `p${Date.now().toString(36)}`;
let seq = 0;

function mkUser() {
  seq += 1;
  return prisma.user.create({
    data: { email: `p${seq}-${RUN}@fixture.test`, name: `Bavard ${seq}` },
  });
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.$disconnect();
});

describe("fil privé", () => {
  it("montre les DERNIERS messages, pas les cent premiers", async () => {
    const moi = await mkUser();
    const toi = await mkUser();

    const base = Date.now() - 105 * 60_000;
    await prisma.message.createMany({
      data: Array.from({ length: 105 }, (_, i) => ({
        senderId: i % 2 === 0 ? moi.id : toi.id,
        recipientId: i % 2 === 0 ? toi.id : moi.id,
        body: `Message ${i + 1}`,
        createdAt: new Date(base + i * 60_000),
      })),
    });

    const fil = await getThread(moi.id, toi.id);
    expect(fil.messages).toHaveLength(100);
    expect(fil.messages.at(-1)?.body).toBe("Message 105");
    expect(fil.messages[0].body).toBe("Message 6");
    expect(fil.hasOlder).toBe(true);
    expect(fil.isHistory).toBe(false);

    // Et le passé reste atteignable.
    const avant = await getThread(moi.id, toi.id, fil.messages[0].id);
    expect(avant.messages.at(-1)?.body).toBe("Message 5");
    expect(avant.messages).toHaveLength(5);
    expect(avant.isHistory).toBe(true);
    expect(avant.hasOlder).toBe(false);
  });

  it("ignore une borne prise dans une autre conversation", async () => {
    const moi = await mkUser();
    const toi = await mkUser();
    const tiers = await mkUser();

    await prisma.message.create({
      data: { senderId: moi.id, recipientId: toi.id, body: "Entre nous." },
    });
    const ailleurs = await prisma.message.create({
      data: { senderId: moi.id, recipientId: tiers.id, body: "Avec quelqu'un d'autre." },
    });

    const fil = await getThread(moi.id, toi.id, ailleurs.id);
    expect(fil.isHistory).toBe(false);
    expect(fil.messages.at(-1)?.body).toBe("Entre nous.");
  });

  it("ne mélange pas les conversations dans la liste", async () => {
    const moi = await mkUser();
    const toi = await mkUser();
    const tiers = await mkUser();

    await prisma.message.create({
      data: { senderId: moi.id, recipientId: toi.id, body: "Salut toi." },
    });
    await prisma.message.create({
      data: { senderId: tiers.id, recipientId: moi.id, body: "Salut, c'est moi." },
    });

    const conversations = await getConversations(moi.id);
    const partenaires = conversations.map((c) => c.partner.id);
    expect(partenaires).toContain(toi.id);
    expect(partenaires).toContain(tiers.id);
    expect(partenaires).not.toContain(moi.id);
  });
});
