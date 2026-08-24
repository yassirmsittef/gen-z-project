import { afterAll, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/prisma";
import { createCall } from "../src/lib/boycott";
import {
  getVideo,
  listVideos,
  postVideo,
  removeVideo,
  videoCountForCall,
} from "../src/lib/call-videos";
import { createReport } from "../src/lib/moderation";
import { MAX_VIDEOS_PER_DAY } from "../src/lib/constants";
import { callVideoSchema } from "../src/lib/validation";
import { DomainError } from "../src/lib/project-service";

/**
 * Les témoignages vidéo — tests d'intégration contre la base de dev
 * (port 5433). Aucun fichier n'est réellement envoyé : on écrit des URL de
 * la forme attendue, la suppression de blob étant best-effort et sans réseau
 * en test.
 */

/**
 * La publication mesure le fichier auprès du stockage, et cette mesure vaut
 * preuve d'appartenance : sans elle, la vidéo est refusée. Aucun fichier
 * n'existe ici, donc on répond une taille plausible — sans réseau.
 */
vi.mock("@/lib/blob", async (importOriginal) => {
  const réel = await importOriginal<typeof import("../src/lib/blob")>();
  return {
    ...réel,
    statOwnBlob: async (url: string | null | undefined) => (url ? 4 * 1024 * 1024 : null),
    deleteOwnBlob: async () => {},
  };
});

const RUN = `v${Date.now().toString(36)}`;
let seq = 0;
const BLOB = "https://exemple.public.blob.vercel-storage.com";

function mkUser() {
  seq += 1;
  return prisma.user.create({
    data: { email: `v${seq}-${RUN}@fixture.test`, name: `Membre ${seq}` },
  });
}

function mkCall(authorId: string, target = `Marque ${RUN}-${(seq += 1)}`) {
  return createCall(authorId, {
    target,
    category: "FOOD",
    reason:
      "Je détaille ici ce que j'ai constaté, avec assez de longueur pour passer le minimum imposé par le formulaire.",
    wanted: "Une alternative locale, au même prix, avec une composition lisible.",
    sources: [],
  });
}

async function mkVideo(userId: string, callId: string, caption = "Ce que j'ai filmé en magasin cette semaine.") {
  return postVideo(userId, {
    callId,
    url: `${BLOB}/temoignages/${RUN}-${(seq += 1)}.mp4`,
    posterUrl: `${BLOB}/temoignages/posters/${RUN}-${seq}.webp`,
    caption,
    durationMs: 20_000,
  });
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.$disconnect();
});

describe("publier un témoignage", () => {
  it("le rattache à l'appel et prévient l'auteur de l'appel", async () => {
    const auteur = await mkUser();
    const filmeur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque filmée ${RUN}`);
    const call = await prisma.boycottCall.findUnique({ where: { slug } });

    const id = await mkVideo(filmeur.id, call!.id);

    const video = await getVideo(id);
    expect(video?.call.slug).toBe(slug);
    expect(await videoCountForCall(call!.id)).toBe(1);

    const notif = await prisma.notification.findFirst({
      where: { userId: auteur.id, type: "CALL_VIDEO", sourceId: id },
      select: { href: true },
    });
    expect(notif?.href).toBe(`/direct?v=${id}`);
  });

  it("refuse un appel retiré — une vidéo ne survit pas à son ancrage", async () => {
    const auteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque éteinte ${RUN}`);
    const call = await prisma.boycottCall.findUnique({ where: { slug } });
    await prisma.boycottCall.update({ where: { id: call!.id }, data: { removedAt: new Date() } });

    await expect(mkVideo(auteur.id, call!.id)).rejects.toBeInstanceOf(DomainError);
  });

  it("coupe au-delà du plafond quotidien", async () => {
    const auteur = await mkUser();
    const filmeur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque bavarde ${RUN}`);
    const call = await prisma.boycottCall.findUnique({ where: { slug } });

    for (let i = 0; i < MAX_VIDEOS_PER_DAY; i += 1) await mkVideo(filmeur.id, call!.id);
    await expect(mkVideo(filmeur.id, call!.id)).rejects.toBeInstanceOf(DomainError);
  });
});

describe("le schéma refuse ce qui n'est pas à nous", () => {
  it("rejette une vidéo hébergée ailleurs", () => {
    const base = {
      callId: "abc",
      caption: "Une légende assez longue pour passer le minimum imposé.",
      durationMs: 15_000,
    };
    // Sans cette contrainte, le fil servirait de vitrine à des vidéos hors
    // de portée de la modération et du retrait.
    expect(callVideoSchema.safeParse({ ...base, url: "https://ailleurs.test/v.mp4" }).success).toBe(
      false
    );
    expect(callVideoSchema.safeParse({ ...base, url: `${BLOB}/v.mp4` }).success).toBe(true);
  });

  it("rejette une vidéo trop longue", () => {
    const r = callVideoSchema.safeParse({
      callId: "abc",
      url: `${BLOB}/v.mp4`,
      caption: "Une légende assez longue pour passer le minimum imposé.",
      durationMs: 120_000,
    });
    expect(r.success).toBe(false);
  });
});

describe("retrait d'un témoignage", () => {
  it("efface l'URL, sort du fil, clôt les signalements et neutralise la notification", async () => {
    const auteur = await mkUser();
    const filmeur = await mkUser();
    const témoin = await mkUser();
    const slug = await mkCall(auteur.id, `Marque retirée ${RUN}`);
    const call = await prisma.boycottCall.findUnique({ where: { slug } });
    const id = await mkVideo(filmeur.id, call!.id, "Un propos que l'auteur retirera.");

    await createReport(témoin.id, {
      targetType: "CALL_VIDEO",
      targetId: id,
      reason: "Contenu inapproprié ou haineux",
    });

    await removeVideo(auteur.id, id, { isAdmin: false, reason: "Hors sujet" });

    const ligne = await prisma.callVideo.findUnique({ where: { id } });
    expect(ligne).not.toBeNull(); // retrait LOGIQUE : la trace reste auditable
    expect(ligne!.removedAt).not.toBeNull();
    // L'URL part avec le fichier : plus rien ne pointe vers la vidéo.
    expect(ligne!.url).toBeNull();
    expect(ligne!.posterUrl).toBeNull();

    expect(await getVideo(id)).toBeNull();
    expect(await videoCountForCall(call!.id)).toBe(0);
    expect((await listVideos({ take: 100 })).videos.some((v) => v.id === id)).toBe(false);

    const report = await prisma.report.findFirst({ where: { targetType: "CALL_VIDEO", targetId: id } });
    expect(report?.status).toBe("RESOLVED");

    const notif = await prisma.notification.findFirst({ where: { type: "CALL_VIDEO", sourceId: id } });
    expect(notif?.body).toBe("Ce témoignage a été retiré.");
  });

  it("interdit à un passant de retirer le témoignage d'un autre", async () => {
    const auteur = await mkUser();
    const filmeur = await mkUser();
    const passant = await mkUser();
    const slug = await mkCall(auteur.id, `Marque gardée ${RUN}`);
    const call = await prisma.boycottCall.findUnique({ where: { slug } });
    const id = await mkVideo(filmeur.id, call!.id);

    await expect(removeVideo(passant.id, id, { isAdmin: false })).rejects.toBeInstanceOf(DomainError);
    await removeVideo(passant.id, id, { isAdmin: true }); // la modération, si
    expect(await getVideo(id)).toBeNull();
  });

  it("disparaît du fil quand son appel est retiré", async () => {
    const auteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque coupée ${RUN}`);
    const call = await prisma.boycottCall.findUnique({ where: { slug } });
    const id = await mkVideo(auteur.id, call!.id);
    expect(await getVideo(id)).not.toBeNull();

    await prisma.boycottCall.update({ where: { id: call!.id }, data: { removedAt: new Date() } });

    // Le témoignage n'est pas retiré lui-même, mais son ancrage a disparu :
    // il ne doit plus s'afficher nulle part.
    expect(await getVideo(id)).toBeNull();
    expect((await listVideos({ take: 100 })).videos.some((v) => v.id === id)).toBe(false);
  });
});

describe("le fil", () => {
  it("pagine au curseur, sans doublon ni trou", async () => {
    const auteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque paginée ${RUN}`);
    const call = await prisma.boycottCall.findUnique({ where: { slug } });
    const filmeurs = [await mkUser(), await mkUser()];
    const ids: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      ids.push(await mkVideo(filmeurs[i % 2].id, call!.id, `Témoignage numéro ${i} du fil.`));
    }

    const page1 = await listVideos({ take: 4, callId: call!.id });
    expect(page1.videos).toHaveLength(4);
    expect(page1.cursor).not.toBeNull();

    const page2 = await listVideos({ take: 4, callId: call!.id, cursor: page1.cursor! });
    const vus = [...page1.videos, ...page2.videos].map((v) => v.id);
    expect(new Set(vus).size).toBe(vus.length); // aucun doublon
    expect(vus.sort()).toEqual([...ids].sort()); // aucun trou
    expect(page2.cursor).toBeNull();
  });
});
