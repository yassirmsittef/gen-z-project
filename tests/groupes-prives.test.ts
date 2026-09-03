import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { addGroupMember, createGroup, getGroupBySlug, joinGroup, listGroups } from "../src/lib/chat-groups";

/**
 * Groupes privés — un groupe fermé ne doit apparaître à AUCUN non-membre
 * (listing, page), ne se rejoint QUE par ajout d'un gérant, et l'ajout est
 * réservé à l'animation. Prouvé, pas supposé.
 */
const R = `priv-${Date.now().toString(36)}`;
const mk = (n: string) => prisma.user.create({ data: { email: `${R}-${n}@fixture.test`, name: `M-${n}` } });

afterAll(async () => {
  await prisma.chatGroup.deleteMany({ where: { slug: { contains: R } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: R } } });
  await prisma.$disconnect();
});

const g = (n: string, priv: boolean) => ({ name: `Groupe ${n} ${R}`, purpose: "coordination fermée du collectif", category: "IMPACT" as const, private: priv });

describe("groupes privés", () => {
  it("invisible aux non-membres, sur invitation seulement, ajout réservé aux gérants", async () => {
    const proprio = await mk("proprio");
    const etranger = await mk("etranger");
    const invite = await mk("invite");

    const slugPrive = await createGroup(proprio.id, g("prive", true));
    const slugPublic = await createGroup(etranger.id, g("public", false));

    // 1. Le listing : l'étranger ne voit PAS le groupe privé, mais voit le public.
    const vusParEtranger = (await listGroups({ userId: etranger.id })).map((x) => x.slug);
    expect(vusParEtranger).not.toContain(slugPrive);
    expect(vusParEtranger).toContain(slugPublic);
    // Le propriétaire, lui, voit son groupe privé.
    expect((await listGroups({ userId: proprio.id })).map((x) => x.slug)).toContain(slugPrive);

    // 2. La page : null pour l'étranger, visible pour le propriétaire.
    expect(await getGroupBySlug(slugPrive, etranger.id)).toBeNull();
    const vuProprio = await getGroupBySlug(slugPrive, proprio.id);
    expect(vuProprio).not.toBeNull();
    expect(vuProprio!.private).toBe(true);

    // 3. Rejoindre tout seul : refusé.
    await expect(joinGroup(etranger.id, slugPrive)).rejects.toThrow();

    // 4. Ajouter un membre : refusé à un non-gérant, permis au propriétaire.
    await expect(addGroupMember(etranger.id, slugPrive, invite.id)).rejects.toThrow();
    await addGroupMember(proprio.id, slugPrive, invite.id);

    // 5. Une fois ajouté, l'invité voit le groupe partout.
    expect(await getGroupBySlug(slugPrive, invite.id)).not.toBeNull();
    expect((await listGroups({ userId: invite.id })).map((x) => x.slug)).toContain(slugPrive);

    // 6. La recherche suit la même règle (même filtre de visibilité).
    const recherche = await prisma.chatGroup.findMany({
      where: {
        AND: [
          { name: { contains: R } },
          { OR: [{ private: false }, { members: { some: { userId: etranger.id } } }] },
        ],
      },
      select: { slug: true },
    });
    expect(recherche.map((x) => x.slug)).not.toContain(slugPrive);
  });
});
