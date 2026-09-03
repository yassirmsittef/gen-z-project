import { afterAll, afterEach, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { normaliseSslMode, prisma } from "../src/lib/prisma";
import { eraseAccount } from "../src/lib/account";
import { ERASED_EMAIL_DOMAIN } from "../src/lib/constants";
import { BCRYPT_COST, hashPassword, needsRehash, verifyPassword } from "../src/lib/password";
import { createResetToken, resetPassword } from "../src/lib/password-reset";
import { canonicalBlobUrl, isOwnBlob, isVideoBlob } from "../src/lib/blob";
import { signInPayload } from "../src/lib/credentials-payload";
import { isSameOrigin } from "../src/lib/request-origin";
import { REVALIDATE_MS, needsRevalidation, reconcileClaims } from "../src/lib/session-claims";
import {
  assertUnderLimit,
  hashIp,
  ipFromHeaders,
  ipKey,
  purgeStaleThrottleHits,
  recordHit,
  throttleHits,
} from "../src/lib/throttle";

/**
 * Durcissement du 02/09/2026 — chaque garde est testée en la SABOTANT (un
 * cran au-dessus de la limite, un compte effacé, une origine étrangère) : un
 * test qui ne peut pas échouer ne prouve rien. Base de dev (5433).
 */

const SUFFIXE = `@durcissement-${Date.now().toString(36)}.fixture.test`;
const PREFIXE_CLE = `test-durci-${Date.now().toString(36)}`;

afterEach(async () => {
  await prisma.actionThrottle.deleteMany({ where: { key: { startsWith: PREFIXE_CLE } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: SUFFIXE } } });
  await prisma.user.deleteMany({ where: { email: { contains: "durcissement-" } } });
  await prisma.actionThrottle.deleteMany({ where: { key: { startsWith: PREFIXE_CLE } } });
  await prisma.$disconnect();
});

describe("mots de passe : coût 12 et re-hachage transparent", () => {
  it("hache au coût courant et reconnaît un hachage trop faible", async () => {
    const neuf = await hashPassword("Sonde!2026");
    expect(bcrypt.getRounds(neuf)).toBe(BCRYPT_COST);
    expect(needsRehash(neuf)).toBe(false);
    expect(await verifyPassword("Sonde!2026", neuf)).toBe(true);

    // Un hachage d'avant (coût 10) reste vérifiable, mais réclame d'être refait.
    const ancien = await bcrypt.hash("Sonde!2026", 10);
    expect(await verifyPassword("Sonde!2026", ancien)).toBe(true);
    expect(needsRehash(ancien)).toBe(true);
    // Un hachage illisible ne fait pas planter : il ne réclame rien.
    expect(needsRehash("pas-un-hachage")).toBe(false);
  });
});

describe("révocation des sessions par version", () => {
  it("un jeton dont la version diffère de la base est chassé ; un jeton d'avant est adopté", () => {
    const now = Date.now();
    const compte = { sessionVersion: 3, email: "x@y.z" };
    // Version à jour : gardé, contrôle daté.
    expect(reconcileClaims({ sub: "u", sv: 3, chk: 0 }, compte, now)).toEqual({ sub: "u", sv: 3, chk: now });
    // Mot de passe changé depuis (version 2 dans le jeton, 3 en base) : dehors.
    expect(reconcileClaims({ sub: "u", sv: 2, chk: 0 }, compte, now)).toBeNull();
    // Jeton d'avant cette version : adopté, pas chassé.
    expect(reconcileClaims({ sub: "u" }, compte, now)).toEqual({ sub: "u", sv: 3, chk: now });
    // Compte disparu, ou effacé (RGPD) : plus de sujet.
    expect(reconcileClaims({ sub: "u", sv: 3 }, null, now)).toBeNull();
    expect(reconcileClaims({ sub: "u", sv: 0 }, { sessionVersion: 0, email: `retire-u${ERASED_EMAIL_DOMAIN}` }, now)).toBeNull();
  });

  it("ne relit la base qu'au-delà de 5 minutes, sauf demande explicite", () => {
    const now = Date.now();
    expect(needsRevalidation({ chk: now - REVALIDATE_MS + 1000 }, now)).toBe(false);
    expect(needsRevalidation({ chk: now - REVALIDATE_MS }, now)).toBe(true);
    expect(needsRevalidation({}, now)).toBe(true);
    expect(needsRevalidation({ chk: now }, now, true)).toBe(true);
  });

  it("réinitialiser le mot de passe incrémente la version en base", async () => {
    const user = await prisma.user.create({
      data: { email: `reset${SUFFIXE}`, name: "Sonde", passwordHash: await hashPassword("Avant!2026") },
    });
    const token = await createResetToken(user.id);
    await resetPassword(token, "Apres!2026");
    const apres = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(apres.sessionVersion).toBe(user.sessionVersion + 1);
    expect(await verifyPassword("Apres!2026", apres.passwordHash!)).toBe(true);
  });

  it("effacer le compte incrémente la version en base", async () => {
    const user = await prisma.user.create({
      data: { email: `efface${SUFFIXE}`, name: "Sonde", passwordHash: await hashPassword("X!2026xx") },
    });
    await eraseAccount(user.id);
    const apres = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(apres.sessionVersion).toBe(user.sessionVersion + 1);
    expect(apres.email.endsWith(ERASED_EMAIL_DOMAIN)).toBe(true);
  });
});

describe("cadence des gestes publics", () => {
  it("refuse AU-DELÀ de la limite, jamais en dessous, et par clé", async () => {
    const cle = `${PREFIXE_CLE}:signup:ip:a`;
    const limite = { max: 3, fenetreMinutes: 60 };
    for (let i = 0; i < 3; i++) {
      await assertUnderLimit(cle, limite);
      await recordHit(cle);
    }
    await expect(assertUnderLimit(cle, limite)).rejects.toThrow();
    // Une autre adresse n'est pas prise dans le même filet.
    await expect(assertUnderLimit(`${PREFIXE_CLE}:signup:ip:b`, limite)).resolves.toBeUndefined();
    // Le même geste sous un autre préfixe non plus.
    await expect(assertUnderLimit(`${PREFIXE_CLE}:reset:ip:a`, limite)).resolves.toBeUndefined();
  });

  it("ne compte que la fenêtre, et la purge garde un jour", async () => {
    const cle = `${PREFIXE_CLE}:fen`;
    await recordHit(cle);
    await prisma.actionThrottle.create({
      data: { key: cle, createdAt: new Date(Date.now() - 90 * 60_000) },
    });
    await prisma.actionThrottle.create({
      data: { key: cle, createdAt: new Date(Date.now() - 30 * 60 * 60_000) },
    });
    expect(await throttleHits(cle, 60)).toBe(1);
    await purgeStaleThrottleHits();
    expect(await prisma.actionThrottle.count({ where: { key: cle } })).toBe(2);
  });

  it("l'adresse n'apparaît jamais en clair dans la clé, et la clé est stable", () => {
    const cle = ipKey("signup", "203.0.113.9");
    expect(cle.startsWith("signup:ip:")).toBe(true);
    expect(cle).not.toContain("203.0.113.9");
    expect(ipKey("signup", "203.0.113.9")).toBe(cle);
    expect(hashIp("203.0.113.9")).not.toBe(hashIp("203.0.113.10"));
    expect(hashIp(null)).toBe(hashIp("inconnue"));
  });

  it("lit le premier maillon de x-forwarded-for", () => {
    const h = (v: Record<string, string>) => ({ get: (k: string) => v[k.toLowerCase()] ?? null });
    expect(ipFromHeaders(h({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
    expect(ipFromHeaders(h({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(ipFromHeaders(h({}))).toBeNull();
  });
});

describe("origine des POST d'API", () => {
  const req = (h: Record<string, string>) => new Request("https://genigain.com/api/x", { method: "POST", headers: h });
  it("refuse un site tiers, accepte le nôtre et les clients sans navigateur", () => {
    // `Sec-Fetch-Site` prime sur tout : même avec une origine et un hôte qui
    // concordent, « cross-site » est refusé. (Le cas est construit pour que ce
    // test TOMBE si la ligne qui lit Sec-Fetch-Site disparaît — sans hôte, la
    // branche Origin refusait à sa place et le test ne prouvait rien.)
    expect(isSameOrigin(req({ "sec-fetch-site": "cross-site", origin: "https://genigain.com", host: "genigain.com" }))).toBe(false);
    expect(isSameOrigin(req({ "sec-fetch-site": "same-origin", origin: "https://genigain.com", host: "genigain.com" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://evil.example", host: "genigain.com" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "https://genigain.com", host: "genigain.com" }))).toBe(true);
    // Derrière Vercel, l'hôte d'origine voyage dans x-forwarded-host.
    expect(isSameOrigin(req({ origin: "https://genigain.com", host: "interne", "x-forwarded-host": "genigain.com" }))).toBe(true);
    expect(isSameOrigin(req({ host: "genigain.com" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "pas une url", host: "genigain.com" }))).toBe(false);
  });
});

describe("charge utile de connexion", () => {
  it("n'envoie la clé `code` que si un code a été saisi (sinon Auth.js transmet la chaîne « undefined »)", () => {
    const base = { email: "a@b.c", password: "x" };
    expect(signInPayload(base)).toEqual(base);
    expect("code" in signInPayload({ ...base, code: undefined })).toBe(false);
    expect("code" in signInPayload({ ...base, code: "" })).toBe(false);
    expect("code" in signInPayload({ ...base, code: "   " })).toBe(false);
    expect(signInPayload({ ...base, code: " 123456 " })).toEqual({ ...base, code: "123456" });
  });
});

describe("fichiers « à nous » (Vercel Blob)", () => {
  it("lit l'URL comme le navigateur : hôte exact, https, et rien dans la query ne compte", () => {
    expect(isOwnBlob("https://abc123.public.blob.vercel-storage.com/temoignages/x.mp4")).toBe(true);
    // L'audit : la sous-chaîne dans la query suffisait à passer.
    expect(isOwnBlob("https://evil.example/?x=.blob.vercel-storage.com/")).toBe(false);
    expect(isOwnBlob("https://evil.example/.blob.vercel-storage.com/x")).toBe(false);
    expect(isOwnBlob("https://public.blob.vercel-storage.com.evil.example/x")).toBe(false);
    expect(isOwnBlob("http://abc123.public.blob.vercel-storage.com/x")).toBe(false);
    expect(isOwnBlob("pas une url")).toBe(false);
    expect(isOwnBlob(null)).toBe(false);
    // Une majuscule dans l'hôte : c'est bien notre fichier (le DNS s'en
    // moque) — mais la forme canonique, elle, est unique.
    expect(isOwnBlob("https://ABC123.PUBLIC.BLOB.VERCEL-STORAGE.COM/temoignages/x.mp4")).toBe(true);
    expect(canonicalBlobUrl("https://ABC123.PUBLIC.BLOB.VERCEL-STORAGE.COM/temoignages/x.mp4?v=1#f")).toBe(
      "https://abc123.public.blob.vercel-storage.com/temoignages/x.mp4"
    );
    expect(isVideoBlob("https://abc123.public.blob.vercel-storage.com/avatars/x.webp")).toBe(false);
  });
});

describe("connexion à la base : le certificat est vérifié, explicitement", () => {
  it("promeut sslmode=require en verify-full, et ne touche à rien d'autre", () => {
    expect(normaliseSslMode("postgresql://u:p@h/db?sslmode=require")).toBe("postgresql://u:p@h/db?sslmode=verify-full");
    expect(normaliseSslMode("postgresql://u:p@h/db?schema=public&sslmode=require&channel_binding=require")).toBe(
      "postgresql://u:p@h/db?schema=public&sslmode=verify-full&channel_binding=require"
    );
    expect(normaliseSslMode("postgresql://u:p@h/db?sslmode=verify-full")).toBe("postgresql://u:p@h/db?sslmode=verify-full");
    expect(normaliseSslMode("postgresql://postgres:postgres@localhost:5433/tremplin?schema=public")).toBe(
      "postgresql://postgres:postgres@localhost:5433/tremplin?schema=public"
    );
  });
});
