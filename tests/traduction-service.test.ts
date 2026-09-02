import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/prisma";
import {
  MAX_TRANSLATION_CHARS,
  MAX_TRANSLATION_CHARS_PER_MONTH,
  MAX_TRANSLATION_CHARS_PER_WINDOW,
} from "../src/lib/constants";
import {
  purgeStaleTranslationUsage,
  serviceTranslate,
  translationServiceConfigured,
  usageKey,
} from "../src/lib/translate-service";

/**
 * Traduction par service (le chemin mobile) — testée contre la base de dev
 * (5433, `npm run db:start`) avec le prestataire remplacé par un faux
 * `fetch`. Ce qu'on vérifie ici n'est pas « le code s'exécute » mais que les
 * gardes REFUSENT vraiment : chaque limite est SABOTÉE (dépassée d'un
 * caractère) et on exige que le prestataire ne soit pas appelé du tout.
 */

const PREFIXE = `test:trad-${Date.now().toString(36)}`;
let n = 0;
const nouvelleCle = () => `${PREFIXE}-${n++}`;

let faux: ReturnType<typeof vi.fn>;

/** Réponse type d'Azure AI Translator. */
const reponseOk = (texte: string, langue: string, score = 1) => ({
  ok: true,
  status: 200,
  json: async () => [
    { detectedLanguage: { language: langue, score }, translations: [{ text: texte, to: "fr" }] },
  ],
});

const reponseErreur = (status: number, code?: number) => ({
  ok: false,
  status,
  json: async () => (code ? { error: { code, message: "non" } } : {}),
});

beforeEach(() => {
  process.env.MICROSOFT_TRANSLATOR_KEY = "cle-de-test";
  faux = vi.fn(async () => reponseOk("Bonjour", "en"));
  vi.stubGlobal("fetch", faux);
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await prisma.translationUsage.deleteMany({ where: { key: { startsWith: PREFIXE } } });
  // La saturation prévient les ADMIN (alerte de sécurité, relayée par email) :
  // ne pas laisser cette alerte en attente dans la base de dev — un autre
  // test compte les emails en attente et n'en attend qu'un.
  await prisma.notification.deleteMany({
    where: { type: "SECURITY_ALERT", key: "securityAlert.translationSaturated" },
  });
});

afterAll(async () => {
  await prisma.translationUsage.deleteMany({ where: { key: { startsWith: PREFIXE } } });
  await prisma.$disconnect();
});

describe("le service de traduction", () => {
  it("traduit, dit la langue d'origine, et compte les caractères", async () => {
    const key = nouvelleCle();
    const issue = await serviceTranslate({ texte: "Hello world", cible: "fr", key });

    expect(issue).toEqual({ statut: "traduit", texte: "Bonjour", langueSource: "en" });
    expect(faux).toHaveBeenCalledTimes(1);
    const [url, init] = faux.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("to=fr");
    expect((init.headers as Record<string, string>)["Ocp-Apim-Subscription-Key"]).toBe("cle-de-test");

    const { _sum } = await prisma.translationUsage.aggregate({ _sum: { chars: true }, where: { key } });
    expect(_sum.chars).toBe("Hello world".length);
  });

  it("sans clé, n'appelle personne et le dit", async () => {
    delete process.env.MICROSOFT_TRANSLATOR_KEY;
    expect(translationServiceConfigured()).toBe(false);

    const issue = await serviceTranslate({ texte: "Hello", cible: "fr", key: nouvelleCle() });

    expect(issue).toEqual({ statut: "non-supporte" });
    expect(faux).not.toHaveBeenCalled();
  });

  it("ne traduit pas un texte déjà dans la langue du lecteur", async () => {
    faux.mockResolvedValue(reponseOk("Bonjour", "fr"));
    const issue = await serviceTranslate({ texte: "Bonjour toi", cible: "fr", key: nouvelleCle() });
    expect(issue).toEqual({ statut: "deja-dans-ta-langue", langueSource: "fr" });
  });

  it("une détection incertaine ne se maquille pas en traduction", async () => {
    // Le prestataire a bien rendu un texte : c'est la CONFIANCE qui manque.
    faux.mockResolvedValue(reponseOk("Bonjour", "en", 0.3));
    const issue = await serviceTranslate({ texte: "ok", cible: "fr", key: nouvelleCle() });
    expect(issue).toEqual({ statut: "langue-indisponible", langueSource: null });
  });

  it("distingue « saturé » (prestataire) de « échec » (le reste)", async () => {
    faux.mockResolvedValue(reponseErreur(429));
    expect(await serviceTranslate({ texte: "Hello", cible: "fr", key: nouvelleCle() })).toEqual({
      statut: "sature",
    });

    faux.mockResolvedValue(reponseErreur(403));
    expect(await serviceTranslate({ texte: "Hello", cible: "fr", key: nouvelleCle() })).toEqual({
      statut: "sature",
    });

    // 400036 = langue cible non prise en charge : ce n'est pas une panne.
    faux.mockResolvedValue(reponseErreur(400, 400036));
    expect(await serviceTranslate({ texte: "Hello", cible: "fr", key: nouvelleCle() })).toEqual({
      statut: "langue-indisponible",
      langueSource: null,
    });

    faux.mockRejectedValue(new Error("réseau coupé"));
    expect(await serviceTranslate({ texte: "Hello", cible: "fr", key: nouvelleCle() })).toEqual({
      statut: "echec",
    });
  });

  it("compte les caractères même quand l'appel échoue (sinon la rafale d'échecs contourne le plafond)", async () => {
    const key = nouvelleCle();
    faux.mockRejectedValue(new Error("réseau coupé"));
    await serviceTranslate({ texte: "Hello", cible: "fr", key });

    const { _sum } = await prisma.translationUsage.aggregate({ _sum: { chars: true }, where: { key } });
    expect(_sum.chars).toBe(5);
  });

  it("refuse au-delà de la cadence d'un lecteur, SANS appeler le prestataire", async () => {
    const key = nouvelleCle();
    // Un caractère de marge : le texte suivant fait déborder la fenêtre.
    await prisma.translationUsage.create({
      data: { key, chars: MAX_TRANSLATION_CHARS_PER_WINDOW - 1 },
    });

    const issue = await serviceTranslate({ texte: "Hello", cible: "fr", key });

    expect(issue).toEqual({ statut: "trop-frequent" });
    expect(faux).not.toHaveBeenCalled();
    // Un refus ne se facture pas.
    const { _sum } = await prisma.translationUsage.aggregate({ _sum: { chars: true }, where: { key } });
    expect(_sum.chars).toBe(MAX_TRANSLATION_CHARS_PER_WINDOW - 1);
  });

  it("la cadence d'un lecteur n'enferme pas les autres", async () => {
    const bavard = nouvelleCle();
    await prisma.translationUsage.create({
      data: { key: bavard, chars: MAX_TRANSLATION_CHARS_PER_WINDOW },
    });

    expect(await serviceTranslate({ texte: "Hello", cible: "fr", key: bavard })).toEqual({
      statut: "trop-frequent",
    });
    const voisin = await serviceTranslate({ texte: "Hello", cible: "fr", key: nouvelleCle() });
    expect(voisin.statut).toBe("traduit");
  });

  it("le plafond MENSUEL de la plateforme passe avant la cadence, et vaut pour tout le monde", async () => {
    const gourmand = nouvelleCle();
    await prisma.translationUsage.create({
      data: { key: gourmand, chars: MAX_TRANSLATION_CHARS_PER_MONTH },
    });

    // Un lecteur qui n'a rien traduit du mois se voit refuser lui aussi : le
    // quota est celui de la plateforme, pas le sien.
    const issue = await serviceTranslate({ texte: "Hello", cible: "fr", key: nouvelleCle() });
    expect(issue).toEqual({ statut: "sature" });
    expect(faux).not.toHaveBeenCalled();
  });

  it("refuse un texte plus long que le plus long champ de la plateforme", async () => {
    const issue = await serviceTranslate({
      texte: "a".repeat(MAX_TRANSLATION_CHARS + 1),
      cible: "fr",
      key: nouvelleCle(),
    });
    expect(issue).toEqual({ statut: "echec" });
    expect(faux).not.toHaveBeenCalled();
  });

  it("la purge garde le mois glissant et jette ce qui est plus vieux", async () => {
    const key = nouvelleCle();
    await prisma.translationUsage.create({ data: { key, chars: 10 } });
    await prisma.translationUsage.create({
      data: { key, chars: 10, createdAt: new Date(Date.now() - 40 * 24 * 60 * 60_000) },
    });

    await purgeStaleTranslationUsage();

    expect(await prisma.translationUsage.count({ where: { key } })).toBe(1);
  });
});

describe("la clé de cadence", () => {
  it("hache l'adresse IP au lieu de la garder en clair", () => {
    const cle = usageKey(null, "203.0.113.7");
    expect(cle.startsWith("ip:")).toBe(true);
    expect(cle).not.toContain("203.0.113.7");
    // Stable, sinon la fenêtre glissante ne retiendrait jamais rien.
    expect(usageKey(null, "203.0.113.7")).toBe(cle);
    expect(usageKey(null, "203.0.113.8")).not.toBe(cle);
  });

  it("un membre connecté est compté sur son compte, pas sur son réseau", () => {
    // Deux personnes derrière la même IP (wifi partagé) ne doivent pas se
    // bloquer l'une l'autre.
    expect(usageKey("u1", "203.0.113.7")).toBe("user:u1");
    expect(usageKey("u2", "203.0.113.7")).toBe("user:u2");
  });
});
