import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * SÉQUESTRE CHEZ LE PORTEUR — le circuit de l'argent, prouvé avec un faux
 * Stripe qui enregistre chaque appel : l'encaissement part sur le compte du
 * porteur (net, adossé à la charge), la libération d'une étape est UN payout
 * agrégé depuis SON compte, un échec rapatrie (reversal) AVANT de rembourser,
 * et l'ancien chemin reste intact pour les contributions d'avant.
 */
type Appel = { m: string; args: unknown[] };
const appels: Appel[] = [];
const compte = { payoutsEnabled: true, interval: "manual" as string };
const charge = { amount: 1000, net: 960, currency: "chf" };

vi.mock("@/lib/stripe", () => {
  const rec = (m: string, ret: unknown) => async (...args: unknown[]) => {
    appels.push({ m, args });
    return typeof ret === "function" ? (ret as (...a: unknown[]) => unknown)(...args) : ret;
  };
  const fake = {
    accounts: {
      retrieve: rec("accounts.retrieve", () => ({
        payouts_enabled: compte.payoutsEnabled,
        details_submitted: true,
        settings: { payouts: { schedule: { interval: compte.interval } } },
      })),
      update: rec("accounts.update", { id: "acct" }),
    },
    paymentIntents: { retrieve: rec("paymentIntents.retrieve", { latest_charge: "ch_x" }) },
    charges: {
      retrieve: rec("charges.retrieve", () => ({
        amount: charge.amount,
        balance_transaction: { amount: charge.amount, net: charge.net, currency: charge.currency },
      })),
    },
    transfers: {
      create: rec("transfers.create", (p: { metadata?: { contributionId?: string } }) => ({ id: `tr_${p.metadata?.contributionId ?? "x"}` })),
      createReversal: rec("transfers.createReversal", { id: "trr_1" }),
    },
    payouts: { create: rec("payouts.create", { id: "po_1" }) },
    refunds: { create: rec("refunds.create", { id: "re_1" }) },
  };
  return { stripeEnabled: true, getStripe: () => fake, appUrl: () => "http://test" };
});

import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import {
  escrowContribution,
  executeDueEscrowPayouts,
  executeDuePayouts,
  executeDueRefunds,
  ensureManualPayouts,
} from "../src/lib/payouts";
import { assertCanContribute } from "../src/lib/project-service";

const R = `seq-${Date.now().toString(36)}`;
const des = (m: string) => appels.filter((a) => a.m === m);

afterAll(async () => {
  await prisma.project.deleteMany({ where: { slug: { contains: R } } });
  await prisma.user.deleteMany({ where: { email: { contains: R } } });
  await prisma.$disconnect();
});
beforeEach(() => {
  appels.length = 0;
  compte.payoutsEnabled = true;
  compte.interval = "manual";
});

async function scene() {
  const porteur = await prisma.user.create({
    data: { email: `porteur-${R}-${Math.random().toString(36).slice(2, 6)}@fixture.test`, name: "P", passwordHash: await hashPassword("x"), stripeAccountId: "acct_porteur" },
  });
  const contrib = await prisma.user.create({
    data: { email: `contrib-${R}-${Math.random().toString(36).slice(2, 6)}@fixture.test`, name: "C", passwordHash: await hashPassword("x") },
  });
  const projet = await prisma.project.create({
    data: {
      ownerId: porteur.id, title: "Projet", slug: `p-${R}-${Math.random().toString(36).slice(2, 6)}`, pitch: "p", description: "d",
      category: "TECH", currency: "chf", goal: 1000, raised: 1000, status: "FUNDED", deadline: new Date(Date.now() + 86400000),
      milestones: { create: [{ order: 1, title: "E1", description: "x", amount: 600 }, { order: 2, title: "E2", description: "x", amount: 400 }] },
    },
    include: { milestones: { orderBy: { order: "asc" } } },
  });
  const c1 = await prisma.contribution.create({ data: { userId: contrib.id, projectId: projet.id, amount: 1000, stripeSessionId: `cs_${R}_${Math.random()}`, stripePaymentIntentId: "pi_1", stripeChargeId: "ch_1" } });
  return { porteur, contrib, projet, c1 };
}

describe("séquestre chez le porteur", () => {
  it("l'encaissement part sur le compte du porteur : NET, adossé à la charge, idempotent", async () => {
    const { c1 } = await scene();
    expect(await escrowContribution(c1.id)).toBe(true);
    const t = des("transfers.create");
    expect(t).toHaveLength(1);
    const p = t[0].args[0] as Record<string, unknown>;
    expect(p.amount).toBe(960); // net des frais, pas 1000
    expect(p.currency).toBe("chf");
    expect(p.destination).toBe("acct_porteur");
    expect(p.source_transaction).toBe("ch_1");
    expect((await prisma.contribution.findUniqueOrThrow({ where: { id: c1.id } })).stripeEscrowTransferId).toBe(`tr_${c1.id}`);
    // Rejoué : rien de plus.
    expect(await escrowContribution(c1.id)).toBe(true);
    expect(des("transfers.create")).toHaveLength(1);
  });

  it("aucun séquestre si le porteur n'est pas prêt — et personne ne peut contribuer", async () => {
    const { c1, contrib, projet } = await scene();
    compte.payoutsEnabled = false;
    expect(await escrowContribution(c1.id)).toBe(false);
    expect(des("transfers.create")).toHaveLength(0);
    await prisma.project.update({ where: { id: projet.id }, data: { status: "ACTIVE", raised: 0 } });
    await expect(assertCanContribute(contrib.id, projet.id)).rejects.toThrow(/réception des fonds/);
    compte.payoutsEnabled = true;
    await expect(assertCanContribute(contrib.id, projet.id)).resolves.toBeTruthy();
  });

  it("un compte en payouts automatiques est basculé en manuel, une seule fois", async () => {
    compte.interval = "daily";
    await ensureManualPayouts("acct_auto");
    expect(des("accounts.update")).toHaveLength(1);
    expect((des("accounts.update")[0].args[1] as { settings: { payouts: { schedule: { interval: string } } } }).settings.payouts.schedule.interval).toBe("manual");
    await ensureManualPayouts("acct_auto");
    expect(des("accounts.update")).toHaveLength(1);
  });

  it("libérer une étape = UN payout agrégé depuis le compte du porteur, parts marquées", async () => {
    const { c1, projet, contrib } = await scene();
    await escrowContribution(c1.id);
    const c2 = await prisma.contribution.create({ data: { userId: contrib.id, projectId: projet.id, amount: 500, stripeSessionId: `cs_${R}_b${Math.random()}`, stripePaymentIntentId: "pi_2", stripeChargeId: "ch_2" } });
    await escrowContribution(c2.id);
    const m1 = projet.milestones[0];
    await prisma.milestonePayout.createMany({ data: [
      { milestoneId: m1.id, contributionId: c1.id, amountMinor: 400 },
      { milestoneId: m1.id, contributionId: c2.id, amountMinor: 200 },
    ] });
    appels.length = 0;
    await executeDueEscrowPayouts();
    const po = des("payouts.create");
    expect(po).toHaveLength(1); // agrégé, pas un par part
    const p = po[0].args[0] as Record<string, unknown>;
    // 400 × 960/1000 + 200 × 960/1000 = 384 + 192
    expect(p.amount).toBe(576);
    expect(p.currency).toBe("chf");
    expect((po[0].args[1] as { stripeAccount: string }).stripeAccount).toBe("acct_porteur");
    const parts = await prisma.milestonePayout.findMany({ where: { milestoneId: m1.id } });
    expect(parts.every((x) => x.stripePayoutId === "po_1")).toBe(true);
    expect(des("transfers.create")).toHaveLength(0); // pas l'ancien chemin
  });

  it("projet échoué : rapatrier depuis le porteur (reversal) AVANT de rembourser, une seule fois", async () => {
    const { c1 } = await scene();
    await escrowContribution(c1.id);
    await prisma.contribution.update({ where: { id: c1.id }, data: { refunded: true, refundDueMinor: 1000 } });
    appels.length = 0;
    await executeDueRefunds();
    const ordre = appels.map((a) => a.m).filter((m) => m === "transfers.createReversal" || m === "refunds.create");
    expect(ordre).toEqual(["transfers.createReversal", "refunds.create"]);
    const rev = des("transfers.createReversal")[0];
    expect(rev.args[0]).toBe(`tr_${c1.id}`);
    expect((rev.args[1] as { amount: number }).amount).toBe(960); // net
    expect((des("refunds.create")[0].args[0] as { amount: number }).amount).toBe(960);
    const apres = await prisma.contribution.findUniqueOrThrow({ where: { id: c1.id } });
    expect(apres.stripeEscrowReversalId).toBe("trr_1");
    expect(apres.stripeRefundId).toBe("re_1");
    // Rejoué : plus rien.
    appels.length = 0;
    await executeDueRefunds();
    expect(des("transfers.createReversal")).toHaveLength(0);
  });

  it("l'ancien chemin survit : une contribution d'avant est encore versée par transfer à la libération", async () => {
    const { c1, projet } = await scene(); // sans escrowContribution → ancien régime
    await prisma.milestonePayout.create({ data: { milestoneId: projet.milestones[0].id, contributionId: c1.id, amountMinor: 600 } });
    appels.length = 0;
    await executeDuePayouts();
    expect(des("payouts.create")).toHaveLength(0);
    const t = des("transfers.create");
    expect(t).toHaveLength(1);
    expect((t[0].args[0] as { amount: number; source_transaction: string }).amount).toBe(576); // 600 × 960/1000
    expect((t[0].args[0] as { source_transaction: string }).source_transaction).toBe("ch_1");
  });
});
