import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { revokeAllSessions } from "../src/lib/account";
import { reconcileClaims } from "../src/lib/session-claims";

/**
 * « Déconnecter partout » : la version de session monte, et tout jeton
 * portant l'ancienne version est chassé à la revalidation.
 */
const EMAIL = `revoke-${Date.now().toString(36)}@fixture.test`;
afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
});

describe("révocation de toutes les sessions", () => {
  it("incrémente la version et invalide les jetons d'avant", async () => {
    const u = await prisma.user.create({ data: { email: EMAIL, name: "R" } });
    expect(u.sessionVersion).toBe(0);
    // Un jeton légitime existant.
    const now = Date.now();
    expect(reconcileClaims({ sub: u.id, sv: 0 }, { sessionVersion: 0, email: EMAIL }, now)).not.toBeNull();

    await revokeAllSessions(u.id);
    const apres = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(apres.sessionVersion).toBe(1);
    // Le même jeton (sv=0) est maintenant chassé face à la base (sv=1).
    expect(reconcileClaims({ sub: u.id, sv: 0 }, { sessionVersion: apres.sessionVersion, email: EMAIL }, now)).toBeNull();
  });
});
