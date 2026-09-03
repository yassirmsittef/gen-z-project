import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { createCall, getCall, listCalls, siblingCalls } from "../src/lib/boycott";

/**
 * Anonymat des appels — le test qui compte : le nom, l'avatar et surtout
 * l'`authorId` (qui mènerait à /u/<id>) ne doivent sortir par AUCUNE porte
 * publique. On le prouve en sérialisant la charge et en y cherchant l'identité.
 * L'auteur, lui, garde la main sur sa propre page.
 */
const R = `anon-${Date.now().toString(36)}`;
const mk = (n: string) => prisma.user.create({ data: { email: `${R}-${n}@fixture.test`, name: `IDENTITÉ-${n}`, avatarUrl: `https://x/${n}.png` } });

afterAll(async () => {
  await prisma.boycottCall.deleteMany({ where: { slug: { contains: R } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: R } } });
  await prisma.$disconnect();
});

describe("un appel anonyme ne laisse pas fuiter son auteur", () => {
  it("masque nom, avatar ET authorId partout — sauf pour l'auteur lui-même", async () => {
    const auteur = await mk("auteur");
    const autre = await mk("autre");

    const slugAnon = await createCall(auteur.id, {
      target: `MarqueAnon-${R}`, category: "FOOD", reason: "r".repeat(60),
      wanted: "ce qu'on veut à la place", sources: [], anonymous: true,
    });
    // Un second appel NON anonyme sur la même marque → devient un "sibling".
    const slugPublic = await createCall(autre.id, {
      target: `MarqueAnon-${R}`, category: "FOOD", reason: "p".repeat(60),
      wanted: "autre remplaçant", sources: [], anonymous: false,
    });

    const nomAuteur = `IDENTITÉ-auteur`;
    const nePasFuiter = (charge: unknown, contexte: string) => {
      const s = JSON.stringify(charge);
      expect(s.includes(nomAuteur), `${contexte} fuite le NOM`).toBe(false);
      expect(s.includes(auteur.id), `${contexte} fuite l'authorId`).toBe(false);
      expect(s.includes("auteur.png"), `${contexte} fuite l'avatar`).toBe(false);
    };

    // 1. Le fil (listCalls) : aucun viewerId → anonyme masqué.
    const fil = await listCalls({ sort: "recents" });
    const carte = fil.find((c) => c.slug === slugAnon)!;
    expect(carte.anonymous).toBe(true);
    expect(carte.author.name).toBeNull();
    expect(carte.author.id).toBe("");
    expect(carte.authorId).toBe("");
    nePasFuiter(carte, "listCalls");

    // 2. La page détaillée vue par UN AUTRE : masquée.
    const vuAutre = await getCall(slugAnon, autre.id);
    expect(vuAutre!.author.name).toBeNull();
    expect(vuAutre!.authorId).toBe("");
    nePasFuiter(vuAutre, "getCall (autre)");

    // 3. La page détaillée vue par L'AUTEUR : il garde ses droits (authorId réel).
    const vuAuteur = await getCall(slugAnon, auteur.id);
    expect(vuAuteur!.authorId).toBe(auteur.id);

    // 4. Un visiteur non connecté (aucun viewerId) : masqué.
    const vuAnon = await getCall(slugAnon);
    expect(vuAnon!.authorId).toBe("");
    nePasFuiter(vuAnon, "getCall (anonyme)");

    // 5. Les appels voisins (siblings) affichés sous l'appel public : le
    //    voisin anonyme n'y montre pas de nom.
    const callPublic = await getCall(slugPublic, autre.id);
    const voisins = await siblingCalls(callPublic!.id, callPublic!.targetKey);
    const voisinAnon = voisins.find((v) => v.slug === slugAnon)!;
    expect(voisinAnon.author.name).toBeNull();
    nePasFuiter(voisins, "siblingCalls");

    // 6. Contrôle : l'appel NON anonyme, lui, montre bien son auteur.
    const cartePublique = fil.find((c) => c.slug === slugPublic)!;
    expect(cartePublique.author.name).toBe("IDENTITÉ-autre");
    expect(cartePublique.authorId).toBe(autre.id);
  });
});
