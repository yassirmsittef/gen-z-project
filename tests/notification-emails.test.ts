import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { EMAILED_TYPES, sendPendingNotificationEmails } from "../src/lib/notification-emails";

/**
 * Relais email des notifications majeures — sender INJECTÉ (aucun réseau).
 * Les fixtures utilisent un domaine « joignable » dédié pour passer les
 * exclusions anti-bounce (.test, .invalid, @demo.dev sont filtrés), et sont
 * purgées par ids en fin de suite.
 */

const RUN = `ne${Date.now().toString(36)}`;
let seq = 0;
const createdUserIds: string[] = [];

async function mkUser(emailDomain = "notif-fixtures.genigain.com") {
  seq += 1;
  const user = await prisma.user.create({
    data: { email: `u${seq}-${RUN}@${emailDomain}`, name: `Notif ${seq}` },
  });
  createdUserIds.push(user.id);
  return user;
}

function mkNotification(
  userId: string,
  over: Partial<{ type: (typeof EMAILED_TYPES)[number] | "MESSAGE"; readAt: Date; emailedAt: Date }> = {}
) {
  return prisma.notification.create({
    data: {
      userId,
      type: over.type ?? "MILESTONE_RELEASED",
      title: `Étape validée — test ${RUN}`,
      body: "Le virement part sur ton compte Stripe.",
      href: "/projects/test",
      readAt: over.readAt,
      emailedAt: over.emailedAt,
    },
  });
}

/** Sender fake : capture les envois, répond selon `ok`. */
function fakeSender(ok = true) {
  const sent: { to: string; subject: string }[] = [];
  const sender = async (input: { to: string; subject: string; html: string; text: string }) => {
    sent.push({ to: input.to, subject: input.subject });
    return { sent: ok };
  };
  return { sent, sender };
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.$disconnect();
});

describe("emails des notifications majeures", () => {
  it("envoie les types majeurs non lus, marque emailedAt, et ignore le reste", async () => {
    const user = await mkUser();
    const majeure = await mkNotification(user.id);
    const mineure = await mkNotification(user.id, { type: "MESSAGE" });
    const lue = await mkNotification(user.id, { readAt: new Date() });
    const déjàPartie = await mkNotification(user.id, { emailedAt: new Date() });

    const { sent, sender } = fakeSender();
    await sendPendingNotificationEmails(sender);

    const mesEnvois = sent.filter((s) => s.to === user.email);
    expect(mesEnvois).toHaveLength(1);
    expect(mesEnvois[0].subject).toContain("Étape validée");

    const après = await prisma.notification.findUniqueOrThrow({ where: { id: majeure.id } });
    expect(après.emailedAt).not.toBeNull();
    for (const id of [mineure.id, lue.id]) {
      const n = await prisma.notification.findUniqueOrThrow({ where: { id } });
      expect(n.emailedAt).toBeNull();
    }
    expect(déjàPartie.emailedAt).not.toBeNull();

    // Idempotence : une seconde passe n'envoie plus rien à cet utilisateur.
    const seconde = fakeSender();
    await sendPendingNotificationEmails(seconde.sender);
    expect(seconde.sent.filter((s) => s.to === user.email)).toHaveLength(0);
  });

  it("un échec d'envoi laisse la notification en attente (retry au cron)", async () => {
    const user = await mkUser();
    const notification = await mkNotification(user.id);

    await sendPendingNotificationEmails(fakeSender(false).sender);

    const après = await prisma.notification.findUniqueOrThrow({
      where: { id: notification.id },
    });
    expect(après.emailedAt).toBeNull();
  });

  it("n'écrit jamais aux boîtes injoignables (démo, fixtures, comptes anonymisés)", async () => {
    const démo = await mkUser("demo.dev");
    const anonymisé = await mkUser("compte-supprime.genigain.invalid");
    await mkNotification(démo.id);
    await mkNotification(anonymisé.id);

    const { sent, sender } = fakeSender();
    await sendPendingNotificationEmails(sender);

    expect(sent.some((s) => s.to === démo.email || s.to === anonymisé.email)).toBe(false);
  });
});
