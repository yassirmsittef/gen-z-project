import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { renderNotification } from "../src/lib/notification-render";
import {
  answerCall,
  callsAnsweredBy,
  createCall,
  deleteCallComment,
  featuredCalls,
  getCall,
  linkNewProjectToCall,
  listCalls,
  mostTargetedBrands,
  postCallComment,
  removeCall,
  replacementsByProject,
  siblingCalls,
  targetKeyOf,
  targetWeight,
  toggleSupport,
  visibleAnswerCounts,
  withdrawAnswer,
} from "../src/lib/boycott";
import { createReport } from "../src/lib/moderation";
import {
  MAX_CALLS_PER_DAY,
  MAX_CALL_COMMENTS_PER_HOUR,
  MAX_COMMENTS_PER_CALL,
  MAX_COMMENTS_RENDERED,
  isUnmutable,
} from "../src/lib/constants";
import { notify } from "../src/lib/notifications";
import { DomainError } from "../src/lib/project-service";

/**
 * Le fil des appels au remplacement — tests d'intégration contre la base de
 * dev (port 5433, `npm run db:start` d'abord). Fixtures suffixées
 * `@fixture.test`, purgées à la fin.
 */

const RUN = `a${Date.now().toString(36)}`;
let seq = 0;

function mkUser() {
  seq += 1;
  return prisma.user.create({
    data: { email: `a${seq}-${RUN}@fixture.test`, name: `Membre ${seq}` },
  });
}

function mkCall(authorId: string, target = `Marque ${RUN}-${(seq += 1)}`) {
  return createCall(authorId, {
    target,
    category: "FOOD",
    reason:
      "Je détaille ici ce que j'ai constaté, avec assez de longueur pour passer le minimum imposé par le formulaire de publication.",
    wanted:
      "Une alternative locale, au même prix, avec une composition lisible sur l'emballage.",
    sources: [],
  });
}

async function mkProject(ownerId: string, title = `Projet ${(seq += 1)}`) {
  return prisma.project.create({
    data: {
      ownerId,
      title,
      slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${RUN}`,
      pitch: "Le remplaçant.",
      description: "Description du projet de remplacement.",
      category: "FOOD",
      currency: "eur",
      goal: 100_000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@fixture.test" } } });
  await prisma.$disconnect();
});

describe("publier un appel", () => {
  it("enregistre l'appel sous son auteur et le compte déjà comme soutenu par lui", async () => {
    const membre = await mkUser();
    const slug = await mkCall(membre.id, "Cafés Untel");

    const call = await getCall(slug);
    expect(call).not.toBeNull();
    expect(call!.authorId).toBe(membre.id);
    expect(call!.target).toBe("Cafés Untel");
    // L'auteur soutient son propre appel : un appel ne naît pas à zéro voix.
    expect(call!._count.supports).toBe(1);
    // `supports` est une sonde bornée au lecteur : vue par son auteur, elle
    // contient sa propre ligne ; vue par un anonyme, elle est vide.
    const vuParLAuteur = await getCall(slug, membre.id);
    expect(vuParLAuteur!.supports).toHaveLength(1);
    expect(await getCall(slug).then((c) => c!.supports)).toHaveLength(0);
  });

  it("regroupe sous une même clé les écritures différentes d'une même marque", () => {
    expect(targetKeyOf("Nestlé")).toBe(targetKeyOf("nestle"));
    expect(targetKeyOf("Coca Cola")).toBe(targetKeyOf("coca-cola"));
    expect(targetKeyOf("NESTLE")).toBe(targetKeyOf("nestle"));
  });

  it("ne fusionne JAMAIS deux marques distinctes — toutes écritures confondues", () => {
    // Chacune de ces paires tombait sur une clé commune tant que la
    // normalisation choisissait une branche « latin sinon autre » : le
    // classement publiait alors sous le nom d'une entreprise le poids d'une
    // autre.
    const paires: [string, string][] = [
      ["Сбербанк 24", "Аэрофлот 24"], // un chiffre latin partagé
      ["华为 5G", "中兴 5G"], // un fragment latin partagé
      ["Сбербaнк", "Гaзпром"], // une seule lettre latine égarée
      ["🍫🍫", "★★★"], // aucun caractère alphanumérique
    ];
    for (const [a, b] of paires) {
      expect(targetKeyOf(a), `« ${a} » et « ${b} » ne sont pas la même marque`).not.toBe(
        targetKeyOf(b)
      );
    }
  });

  it("garde une clé stable pour une même graphie sans alphanumérique", () => {
    expect(targetKeyOf("★★★")).toBe(targetKeyOf(" ★★★ "));
  });

  it("refuse au-delà du plafond quotidien", async () => {
    const membre = await mkUser();
    for (let i = 0; i < MAX_CALLS_PER_DAY; i += 1) {
      await mkCall(membre.id, `Marque plafond ${i} ${RUN}`);
    }
    await expect(mkCall(membre.id, `Marque de trop ${RUN}`)).rejects.toBeInstanceOf(DomainError);
  });
});

describe("soutenir un appel", () => {
  it("bascule la voix sans jamais la compter deux fois", async () => {
    const auteur = await mkUser();
    const soutien = await mkUser();
    const slug = await mkCall(auteur.id);
    const call = await getCall(slug);

    expect(await toggleSupport(soutien.id, call!.id)).toBe(true);
    expect(await toggleSupport(soutien.id, call!.id)).toBe(false);
    expect(await toggleSupport(soutien.id, call!.id)).toBe(true);

    const after = await getCall(slug);
    expect(after!._count.supports).toBe(2); // l'auteur + le soutien
  });

  it("refuse de soutenir un appel retiré", async () => {
    const auteur = await mkUser();
    const soutien = await mkUser();
    const slug = await mkCall(auteur.id);
    const call = await getCall(slug);

    await removeCall(auteur.id, call!.id, { isAdmin: false });

    await expect(toggleSupport(soutien.id, call!.id)).rejects.toBeInstanceOf(DomainError);
  });
});

describe("un projet répond à l'appel", () => {
  it("lie le projet, prévient l'auteur et les soutiens, mais pas le porteur", async () => {
    const auteur = await mkUser();
    const soutien = await mkUser();
    const porteur = await mkUser();

    const slug = await mkCall(auteur.id, `Marque répondue ${RUN}`);
    const call = await getCall(slug);
    await toggleSupport(soutien.id, call!.id);
    // Le porteur soutient aussi l'appel : il ne doit pas s'auto-notifier.
    await toggleSupport(porteur.id, call!.id);

    const projet = await mkProject(porteur.id, `Remplacant ${RUN}`);
    await answerCall(porteur.id, call!.id, projet.id);

    const after = await getCall(slug);
    expect(after!.answers).toHaveLength(1);
    expect(after!.answers[0].projectId).toBe(projet.id);

    const notifs = await prisma.notification.findMany({
      where: { type: "BOYCOTT_ANSWERED", userId: { in: [auteur.id, soutien.id, porteur.id] } },
      select: { userId: true, href: true },
    });
    expect(notifs.map((n) => n.userId).sort()).toEqual([auteur.id, soutien.id].sort());
    expect(notifs[0].href).toBe(`/projects/${projet.slug}`);
  });

  it("n'accepte que le porteur du projet, et pas deux fois le même projet", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const intrus = await mkUser();

    const slug = await mkCall(auteur.id, `Marque gardée ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet garde ${RUN}`);

    await expect(answerCall(intrus.id, call!.id, projet.id)).rejects.toBeInstanceOf(DomainError);

    await answerCall(porteur.id, call!.id, projet.id);
    await expect(answerCall(porteur.id, call!.id, projet.id)).rejects.toBeInstanceOf(DomainError);
  });

  it("refuse un projet déjà terminé — échoué comme réalisé", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque tardive ${RUN}`);
    const call = await getCall(slug);

    for (const statut of ["FAILED", "COMPLETED"] as const) {
      const projet = await mkProject(porteur.id, `Projet ${statut} ${RUN}`);
      await prisma.project.update({ where: { id: projet.id }, data: { status: statut } });
      // `liveAnswer` s'appuie explicitement sur cette garantie d'écriture pour
      // justifier de n'exclure que FAILED à la LECTURE : si elle tombe, le
      // raisonnement de tout le décompte des remplaçants tombe avec.
      await expect(answerCall(porteur.id, call!.id, projet.id)).rejects.toBeInstanceOf(DomainError);
    }
  });

  it("expose ce que le projet remplace, et l'oublie quand le porteur se détache", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque affichée ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet affiche ${RUN}`);

    await answerCall(porteur.id, call!.id, projet.id);

    expect((await callsAnsweredBy(projet.id)).map((c) => c.slug)).toEqual([slug]);
    expect((await replacementsByProject([projet.id])).get(projet.id)).toHaveLength(1);

    await withdrawAnswer(porteur.id, call!.id, projet.id);
    expect(await callsAnsweredBy(projet.id)).toEqual([]);
  });

  it("cesse d'annoncer le remplacement des DEUX côtés quand le projet échoue", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque abandonnée ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet qui echoue ${RUN}`);

    await answerCall(porteur.id, call!.id, projet.id);
    await prisma.project.update({ where: { id: projet.id }, data: { status: "FAILED" } });

    // Côté APPEL : plus de remplaçant. C'était déjà vrai.
    expect((await getCall(slug))!.answers).toHaveLength(0);
    // Côté PROJET : la page affichait encore « Se lance pour remplacer X »
    // avec un lien vers un appel où le projet ne figure plus. Le même
    // invariant doit valoir dans les deux sens.
    expect(await callsAnsweredBy(projet.id)).toEqual([]);
    expect((await replacementsByProject([projet.id])).get(projet.id)).toBeUndefined();
  });

  it("cesse d'annoncer le remplacement quand l'appel est retiré", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque retirée ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet orphelin ${RUN}`);

    await answerCall(porteur.id, call!.id, projet.id);
    await removeCall(auteur.id, call!.id, { isAdmin: false });

    expect(await callsAnsweredBy(projet.id)).toEqual([]);
    expect((await replacementsByProject([projet.id])).get(projet.id)).toBeUndefined();
  });
});

describe("le tunnel appel → projet", () => {
  it("déclare le projet remplaçant dès sa création, sans détour", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque tunnel ${RUN}`);
    const projet = await mkProject(porteur.id, `Projet tunnel ${RUN}`);

    await linkNewProjectToCall(porteur.id, projet.id, slug);

    expect((await callsAnsweredBy(projet.id)).map((c) => c.slug)).toEqual([slug]);
  });

  it("ne fait pas échouer la création quand l'appel a disparu entre-temps", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque évaporée ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet rescapé ${RUN}`);

    await removeCall(auteur.id, call!.id, { isAdmin: false });

    // Le projet vient d'être créé : la liaison échoue en silence, elle ne
    // doit surtout pas emporter le projet avec elle.
    await expect(linkNewProjectToCall(porteur.id, projet.id, slug)).resolves.toBeUndefined();
    expect(await callsAnsweredBy(projet.id)).toEqual([]);
  });

  it("ne donne à un slug inconnu aucune prise", async () => {
    const porteur = await mkUser();
    const projet = await mkProject(porteur.id, `Projet sans appel ${RUN}`);
    await expect(
      linkNewProjectToCall(porteur.id, projet.id, "slug-qui-nexiste-pas")
    ).resolves.toBeUndefined();
  });
});

describe("le poids d'une marque", () => {
  it("regroupe les appels visant la même marque malgré casse et accents", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const soutien = await mkUser();

    const premier = await mkCall(a.id, `Zénith ${RUN}`);
    const second = await mkCall(b.id, `zenith ${RUN}`.toUpperCase());
    const callPremier = await getCall(premier);
    const callSecond = await getCall(second);

    // Les deux graphies doivent tomber sur la même clé.
    expect(callPremier!.targetKey).toBe(callSecond!.targetKey);

    await toggleSupport(soutien.id, callSecond!.id);

    const voisins = await siblingCalls(callPremier!.id, callPremier!.targetKey);
    expect(voisins.map((v) => v.slug)).toEqual([second]);

    // 2 appels, 3 voix : chaque auteur soutient le sien + un soutien ajouté.
    expect(await targetWeight(callPremier!.targetKey)).toEqual({ calls: 2, voices: 3 });
  });

  it("ne compte plus un appel retiré dans le poids de la marque", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const premier = await mkCall(a.id, `Oubli ${RUN}`);
    const second = await mkCall(b.id, `Oubli ${RUN}`);
    const callPremier = await getCall(premier);
    const callSecond = await getCall(second);

    await removeCall(b.id, callSecond!.id, { isAdmin: false });

    expect(await siblingCalls(callPremier!.id, callPremier!.targetKey)).toEqual([]);
    expect(await targetWeight(callPremier!.targetKey)).toEqual({ calls: 1, voices: 1 });
  });
});

describe("la discussion sous un appel", () => {
  it("enregistre la réponse et prévient l'auteur de l'appel", async () => {
    const auteur = await mkUser();
    const lecteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque discutée ${RUN}`);
    const call = await getCall(slug);

    await postCallComment(lecteur.id, call!.id, "Je confirme, même expérience de mon côté.");

    const après = await getCall(slug);
    expect(après!.comments).toHaveLength(1);
    expect(après!.comments[0].body).toBe("Je confirme, même expérience de mon côté.");

    const notif = await prisma.notification.findFirst({
      where: { userId: auteur.id, type: "CALL_COMMENT" },
      select: { href: true },
    });
    expect(notif?.href).toBe(`/appels/${slug}#discussion`);
  });

  it("ne notifie pas l'auteur qui répond sous son propre appel", async () => {
    const auteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque monologue ${RUN}`);
    const call = await getCall(slug);

    await postCallComment(auteur.id, call!.id, "Je précise ma pensée après relecture.");

    expect(
      await prisma.notification.count({ where: { userId: auteur.id, type: "CALL_COMMENT" } })
    ).toBe(0);
  });

  it("refuse de commenter un appel retiré", async () => {
    const auteur = await mkUser();
    const lecteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque close ${RUN}`);
    const call = await getCall(slug);
    await removeCall(auteur.id, call!.id, { isAdmin: false });

    await expect(
      postCallComment(lecteur.id, call!.id, "Un mot de trop, trop tard.")
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("laisse retirer sa réponse à son auteur, à l'auteur de l'appel et à la modération", async () => {
    const auteur = await mkUser();
    const lecteur = await mkUser();
    const passant = await mkUser();
    const admin = await mkUser();
    const slug = await mkCall(auteur.id, `Marque nettoyée ${RUN}`);
    const call = await getCall(slug);

    const parLecteur = await postCallComment(lecteur.id, call!.id, "Première réponse au fil.");
    const parAutre = await postCallComment(passant.id, call!.id, "Deuxième réponse au fil.");
    const parTiers = await postCallComment(passant.id, call!.id, "Troisième réponse au fil.");

    // Un passant ne touche pas à la réponse d'un autre.
    await expect(deleteCallComment(lecteur.id, parAutre, false)).rejects.toBeInstanceOf(DomainError);

    // Son auteur, oui.
    await deleteCallComment(lecteur.id, parLecteur, false);
    // L'auteur de l'appel tient son fil.
    await deleteCallComment(auteur.id, parAutre, false);
    // La modération passe partout.
    await deleteCallComment(admin.id, parTiers, true);

    expect((await getCall(slug))!.comments).toHaveLength(0);
  });

  it("laisse signaler la réponse d'un autre, jamais la sienne", async () => {
    const auteur = await mkUser();
    const lecteur = await mkUser();
    const témoin = await mkUser();
    const slug = await mkCall(auteur.id, `Marque signalable ${RUN}`);
    const call = await getCall(slug);
    const commentaire = await postCallComment(lecteur.id, call!.id, "Une réponse contestable.");

    await expect(
      createReport(lecteur.id, {
        targetType: "CALL_COMMENT",
        targetId: commentaire,
        reason: "Spam ou démarchage",
      })
    ).rejects.toBeInstanceOf(DomainError);

    await createReport(témoin.id, {
      targetType: "CALL_COMMENT",
      targetId: commentaire,
      reason: "Contenu inapproprié ou haineux",
    });

    const report = await prisma.report.findFirst({
      where: { targetType: "CALL_COMMENT", targetId: commentaire },
    });
    expect(report?.reporterId).toBe(témoin.id);
  });

  it("coupe le monologue sous un même appel", async () => {
    const auteur = await mkUser();
    const bavard = await mkUser();
    const slug = await mkCall(auteur.id, `Marque monopolisée ${RUN}`);
    const call = await getCall(slug);

    for (let i = 0; i < MAX_COMMENTS_PER_CALL; i += 1) {
      await postCallComment(bavard.id, call!.id, `Réponse numéro ${i} sous ce même appel.`);
    }

    await expect(
      postCallComment(bavard.id, call!.id, "Et une dernière pour la route.")
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("coupe le pilonnage transversal, tous appels confondus", async () => {
    const auteur = await mkUser();
    const pilonneur = await mkUser();

    // Réparti sur assez d'appels pour ne PAS heurter le plafond par appel :
    // c'est bien la limite horaire globale qu'on veut voir mordre.
    const appels: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const s = await mkCall(auteur.id, `Marque pilonnée ${i} ${RUN}`);
      appels.push((await getCall(s))!.id);
    }

    let postées = 0;
    let refus: unknown = null;
    for (let i = 0; i < MAX_CALL_COMMENTS_PER_HOUR + 1; i += 1) {
      try {
        await postCallComment(pilonneur.id, appels[i % appels.length], `Message ${i} du pilonnage.`);
        postées += 1;
      } catch (error) {
        refus = error;
        break;
      }
    }

    expect(postées).toBe(MAX_CALL_COMMENTS_PER_HOUR);
    expect(refus).toBeInstanceOf(DomainError);
  });

  it("emporte la discussion avec l'appel supprimé", async () => {
    const auteur = await mkUser();
    const lecteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque effacée ${RUN}`);
    const call = await getCall(slug);
    await postCallComment(lecteur.id, call!.id, "Une réponse vouée à disparaître.");

    await prisma.boycottCall.delete({ where: { id: call!.id } });

    expect(await prisma.callComment.count({ where: { callId: call!.id } })).toBe(0);
  });
});

describe("le contenu retiré ne survit nulle part", () => {
  it("ne neutralise QUE la réponse retirée, même si une autre a le même texte", async () => {
    const auteur = await mkUser();
    const b = await mkUser();
    const c = await mkUser();
    const slug = await mkCall(auteur.id, `Marque jumelle ${RUN}`);
    const call = await getCall(slug);

    // Cas banal : un « +1 », un copier-coller de communiqué, une phrase courte.
    const memeTexte = "Je confirme, j'ai vu la même chose en magasin la semaine dernière.";
    const deB = await postCallComment(b.id, call!.id, memeTexte);
    const deC = await postCallComment(c.id, call!.id, memeTexte);

    await deleteCallComment(b.id, deB, false);

    const notifs = await prisma.notification.findMany({
      where: { userId: auteur.id, type: "CALL_COMMENT", sourceId: { in: [deB, deC] } },
    });
    const parSource = new Map(notifs.map((n) => [n.sourceId, n]));

    expect(parSource.get(deB)!.excerpt).toBeNull();
    expect(renderNotification("fr", parSource.get(deB)!).body).toBe("Cette réponse a été retirée.");
    // Celle de C est TOUJOURS en ligne : annoncer son retrait serait un
    // mensonge, et son extrait serait perdu sans retour.
    expect(parSource.get(deC)!.excerpt).toBe(memeTexte);
    expect(renderNotification("fr", parSource.get(deC)!).body).toBe(memeTexte);
    const vivante = await prisma.callComment.findUnique({
      where: { id: deC },
      select: { removedAt: true },
    });
    expect(vivante!.removedAt).toBeNull();
  });

  it("neutralise le texte recopié dans la cloche de l'auteur de l'appel", async () => {
    const auteur = await mkUser();
    const lecteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque effacée cloche ${RUN}`);
    const call = await getCall(slug);

    const texte = "Un propos que son auteur regrettera dans trente secondes.";
    const commentaire = await postCallComment(lecteur.id, call!.id, texte);

    const avant = await prisma.notification.findFirstOrThrow({
      where: { userId: auteur.id, type: "CALL_COMMENT" },
    });
    expect(avant.excerpt).toBe(texte);

    await deleteCallComment(lecteur.id, commentaire, false);

    const après = await prisma.notification.findUniqueOrThrow({
      where: { id: avant.id },
    });
    // La ligne survit — l'auteur doit savoir qu'une réponse a existé — mais
    // le texte retiré, lui, ne doit plus être lisible nulle part : NI dans la
    // ligne brute (extrait effacé), NI dans le rendu (pierre tombale).
    expect(JSON.stringify(après)).not.toContain("regrettera");
    expect(après.excerpt).toBeNull();
    expect(renderNotification("fr", après).body).toBe("Cette réponse a été retirée.");
  });
});

describe("la discussion tronquée garde le droit de réponse", () => {
  it("rend les DERNIÈRES réponses, jamais les premières", async () => {
    const auteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque bavarde ${RUN}`);
    const call = await getCall(slug);

    // On dépasse le plafond de rendu en respectant celui par membre.
    const total = MAX_COMMENTS_RENDERED + 5;
    const membres = [];
    for (let i = 0; i < Math.ceil(total / MAX_COMMENTS_PER_CALL); i += 1) {
      membres.push(await mkUser());
    }
    for (let i = 0; i < total; i += 1) {
      await prisma.callComment.create({
        data: {
          callId: call!.id,
          userId: membres[Math.floor(i / MAX_COMMENTS_PER_CALL)].id,
          body: `Réponse numéro ${String(i).padStart(3, "0")} du fil.`,
          createdAt: new Date(Date.now() - (total - i) * 1000),
        },
      });
    }

    const après = await getCall(slug);
    expect(après!.comments).toHaveLength(MAX_COMMENTS_RENDERED);
    expect(après!._count.comments).toBe(total);

    // `getCall` trie du plus récent au plus ancien ; la page réordonne.
    const rendus = [...après!.comments].reverse().map((c) => c.body);
    // La DERNIÈRE réponse — le droit de réponse de l'entreprise arrive en fin
    // de fil — doit être là ; les plus anciennes sont celles qu'on perd.
    expect(rendus.at(-1)).toContain(String(total - 1).padStart(3, "0"));
    expect(rendus[0]).toContain(String(total - MAX_COMMENTS_RENDERED).padStart(3, "0"));
    expect(rendus.some((b) => b.includes("000"))).toBe(false);
  });
});

describe("le classement des marques", () => {
  it("cumule les voix de tous les appels visant une même marque", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const soutien = await mkUser();
    const marque = `Consolidée ${RUN}`;

    const premier = await mkCall(a.id, marque);
    const second = await mkCall(b.id, marque.toUpperCase());
    await toggleSupport(soutien.id, (await getCall(second))!.id);

    const classement = await mostTargetedBrands(100);
    const ligne = classement.find((m) => m.slug === premier || m.slug === second);

    expect(ligne).toBeDefined();
    expect(ligne!.calls).toBe(2);
    expect(ligne!.voices).toBe(3); // un auteur + un auteur + un soutien
    // La graphie retenue est celle de l'appel le plus soutenu.
    expect(ligne!.slug).toBe(second);
  });

  it("signale les marques que personne ne remplace encore", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();

    const orpheline = await mkCall(auteur.id, `Orpheline ${RUN}`);
    const servie = await mkCall(auteur.id, `Servie ${RUN}`);
    const projet = await mkProject(porteur.id, `Projet classement ${RUN}`);
    await answerCall(porteur.id, (await getCall(servie))!.id, projet.id);

    const classement = await mostTargetedBrands(100);
    expect(classement.find((m) => m.slug === orpheline)!.answers).toBe(0);
    expect(classement.find((m) => m.slug === servie)!.answers).toBe(1);
  });

  it("compte des PROJETS distincts, pas des lignes de réponse", async () => {
    const auteur1 = await mkUser();
    const auteur2 = await mkUser();
    const porteur = await mkUser();
    const marque = `Multiappels ${RUN}`;

    // Deux auteurs différents : le garde anti-doublon ne s'applique pas.
    const a = await mkCall(auteur1.id, marque);
    const b = await mkCall(auteur2.id, marque.toUpperCase());

    // UN SEUL projet, déclaré sur les deux appels frères.
    const projet = await mkProject(porteur.id, `Projet unique ${RUN}`);
    await answerCall(porteur.id, (await getCall(a))!.id, projet.id);
    await answerCall(porteur.id, (await getCall(b))!.id, projet.id);

    const ligne = (await mostTargetedBrands(100)).find((m) => m.slug === a || m.slug === b);
    expect(ligne).toBeDefined();
    expect(ligne!.calls).toBe(2);
    // Le classement publie « X remplaçants en route » : un projet reste UN
    // remplaçant, même déclaré sur trois appels visant la même marque.
    expect(ligne!.answers).toBe(1);
  });

  it("ne compte pas les appels retirés", async () => {
    const auteur = await mkUser();
    const slug = await mkCall(auteur.id, `Disparue ${RUN}`);
    await removeCall(auteur.id, (await getCall(slug))!.id, { isAdmin: false });

    expect((await mostTargetedBrands(100)).some((m) => m.slug === slug)).toBe(false);
  });
});

/**
 * Défauts remontés par l'audit adversarial du 2026-08-23 et corrigés. Chaque
 * test décrit le scénario d'abus ou d'incohérence tel qu'il avait été
 * reproduit en base — pas la mécanique du correctif.
 */
describe("ce que l'audit avait trouvé", () => {
  it("ne fusionne plus les marques écrites hors alphabet latin", () => {
    // Toutes retombaient sur la clé partagée « sansnom » : la plateforme
    // affirmait d'elle-même que ces entreprises n'en faisaient qu'une.
    const cles = ["Сбербанк", "华为", "شركة"].map(targetKeyOf);
    expect(new Set(cles).size).toBe(3);
    expect(cles).not.toContain("sansnom");
    // Et le regroupement reste vrai à l'intérieur d'une même écriture.
    expect(targetKeyOf("Сбербанк")).toBe(targetKeyOf(" сбербанк "));
  });

  it("empêche un auteur d'empiler plusieurs appels visibles sur la même marque", async () => {
    const membre = await mkUser();
    const marque = `Empilée ${RUN}`;
    const premier = await mkCall(membre.id, marque);

    await expect(mkCall(membre.id, marque.toUpperCase())).rejects.toBeInstanceOf(DomainError);

    // Une fois le sien retiré, il peut en réouvrir un.
    await removeCall(membre.id, (await getCall(premier))!.id, { isAdmin: false });
    await expect(mkCall(membre.id, marque)).resolves.toBeTruthy();
  });

  it("compte des personnes distinctes, pas des lignes de soutien", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const partout = await mkUser();
    const marque = `Distincte ${RUN}`;

    const premier = await mkCall(a.id, marque);
    const second = await mkCall(b.id, marque);
    // La même personne soutient les DEUX appels visant la même marque.
    await toggleSupport(partout.id, (await getCall(premier))!.id);
    await toggleSupport(partout.id, (await getCall(second))!.id);

    const cle = targetKeyOf(marque);
    // 3 personnes en tout (a, b, partout) — et non 4 lignes de soutien.
    expect(await targetWeight(cle)).toEqual({ calls: 2, voices: 3 });

    const ligne = (await mostTargetedBrands(100)).find((m) => m.slug === premier || m.slug === second);
    expect(ligne!.voices).toBe(3);
  });

  it("rend l'appel à nouveau orphelin quand son unique remplaçant échoue", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque abandonnée ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet mourant ${RUN}`);
    await answerCall(porteur.id, call!.id, projet.id);

    expect((await listCalls({ sort: "orphelins", take: 200 })).map((c) => c.slug)).not.toContain(slug);

    // Le cron passe la campagne en échec : plus personne ne remplace rien.
    await prisma.project.update({ where: { id: projet.id }, data: { status: "FAILED" } });

    expect((await listCalls({ sort: "orphelins", take: 200 })).map((c) => c.slug)).toContain(slug);
    expect((await getCall(slug))!.answers).toHaveLength(0);
    const fil = await listCalls({ sort: "recents", take: 200 });
    expect(fil.find((c) => c.slug === slug)!._count.answers).toBe(0);
  });

  it("ne remet pas les plafonds de discussion à zéro quand on efface ses messages", async () => {
    const auteur = await mkUser();
    const bavard = await mkUser();
    const slug = await mkCall(auteur.id, `Marque saturée ${RUN}`);
    const call = await getCall(slug);

    const ids: string[] = [];
    for (let i = 0; i < MAX_COMMENTS_PER_CALL; i += 1) {
      ids.push(await postCallComment(bavard.id, call!.id, `Réponse ${i} du fil saturé.`));
    }
    // Il efface tout : le plafond ne doit PAS repartir de zéro.
    for (const id of ids) await deleteCallComment(bavard.id, id, false);

    await expect(
      postCallComment(bavard.id, call!.id, "On recommence comme si de rien n'était.")
    ).rejects.toBeInstanceOf(DomainError);

    // Et le fil affiché est bien vide malgré les lignes conservées.
    expect((await getCall(slug))!.comments).toHaveLength(0);
    expect(await prisma.callComment.count({ where: { callId: call!.id } })).toBe(
      MAX_COMMENTS_PER_CALL
    );
  });

  it("laisse signaler une réponse déjà retirée", async () => {
    const auteur = await mkUser();
    const insulteur = await mkUser();
    const témoin = await mkUser();
    const slug = await mkCall(auteur.id, `Marque tardive ${RUN}`);
    const call = await getCall(slug);

    const id = await postCallComment(insulteur.id, call!.id, "Une réponse problématique.");
    await deleteCallComment(insulteur.id, id, false);

    // Le signalement arrive APRÈS le retrait : la modération doit pouvoir
    // trancher sur la pièce, qui n'a pas disparu de la base.
    await expect(
      createReport(témoin.id, {
        targetType: "CALL_COMMENT",
        targetId: id,
        reason: "Contenu inapproprié ou haineux",
      })
    ).resolves.toBeUndefined();
  });

  it("ne rejoue pas la notification quand on déclare et retire en boucle", async () => {
    const auteur = await mkUser();
    const soutien = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque harcelée ${RUN}`);
    const call = await getCall(slug);
    await toggleSupport(soutien.id, call!.id);
    const projet = await mkProject(porteur.id, `Projet yoyo ${RUN}`);

    for (let i = 0; i < 5; i += 1) {
      await answerCall(porteur.id, call!.id, projet.id);
      await withdrawAnswer(porteur.id, call!.id, projet.id);
    }

    const notifs = await prisma.notification.count({
      where: { type: "BOYCOTT_ANSWERED", href: `/projects/${projet.slug}` },
    });
    expect(notifs).toBe(2); // l'auteur + le soutien, une seule fois
  });

  it("laisse l'auteur de l'appel et la modération détacher un projet squatteur", async () => {
    const auteur = await mkUser();
    const squatteur = await mkUser();
    const passant = await mkUser();
    const admin = await mkUser();
    const slug = await mkCall(auteur.id, `Marque squattée ${RUN}`);
    const call = await getCall(slug);

    const projet = await mkProject(squatteur.id, `Projet squatteur ${RUN}`);
    await answerCall(squatteur.id, call!.id, projet.id);

    // Un passant n'a aucun titre à intervenir.
    await expect(
      withdrawAnswer(passant.id, call!.id, projet.id)
    ).rejects.toBeInstanceOf(DomainError);

    // L'auteur de l'appel, si : c'est sa demande qu'on squatte.
    await withdrawAnswer(auteur.id, call!.id, projet.id);
    expect((await getCall(slug))!.answers).toHaveLength(0);

    // Et le retrait TIENT : le squatteur ne se rattache pas d'un clic.
    // (Cette version du test s'appuyait autrefois sur cette réattache pour
    // enchaîner le cas suivant — elle codifiait donc le contournement.)
    await expect(answerCall(squatteur.id, call!.id, projet.id)).rejects.toBeInstanceOf(DomainError);

    // La modération dispose du même levier, sur un autre projet du squatteur.
    const autre = await mkProject(squatteur.id, `Projet squatteur bis ${RUN}`);
    await answerCall(squatteur.id, call!.id, autre.id);
    expect((await getCall(slug))!.answers).toHaveLength(1);

    await withdrawAnswer(admin.id, call!.id, autre.id, true);
    expect((await getCall(slug))!.answers).toHaveLength(0);
    await expect(answerCall(squatteur.id, call!.id, autre.id)).rejects.toBeInstanceOf(DomainError);
  });

  it("prévient l'auteur du retrait même s'il a coupé ce type de notification", async () => {
    const auteur = await mkUser();
    const admin = await mkUser();
    // L'auteur a coupé le type dans ses préférences (ou une ligne héritée
    // existe en base) : l'engagement de la CGU §12 prime.
    await prisma.user.update({
      where: { id: auteur.id },
      data: { mutedNotifications: ["BOYCOTT_REMOVED", "BOYCOTT_ANSWERED"] },
    });

    const slug = await mkCall(auteur.id, `Marque silencieuse ${RUN}`);
    const call = await getCall(slug);
    await removeCall(admin.id, call!.id, { isAdmin: true, reason: "Accusation non sourcée" });

    const notif = await prisma.notification.findFirst({
      where: { userId: auteur.id, type: "BOYCOTT_REMOVED" },
    });
    expect(notif).not.toBeNull();
    expect(isUnmutable("BOYCOTT_REMOVED")).toBe(true);

    // Le reste des préférences continue de fonctionner normalement.
    await notify({
      userId: auteur.id,
      type: "BOYCOTT_ANSWERED",
      title: "Ne doit pas arriver",
      href: "/appels",
    });
    expect(
      await prisma.notification.count({ where: { userId: auteur.id, type: "BOYCOTT_ANSWERED" } })
    ).toBe(0);
  });

  it("ne laisse plus un appel retiré propulser un projet sur l'accueil", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque fantôme ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet propulsé ${RUN}`);
    await answerCall(porteur.id, call!.id, projet.id);

    expect((await visibleAnswerCounts([projet.id])).get(projet.id)).toBe(1);

    await removeCall(auteur.id, call!.id, { isAdmin: false });
    expect((await visibleAnswerCounts([projet.id])).get(projet.id)).toBeUndefined();
  });
});

describe("détacher un squatteur tient dans la durée", () => {
  it("interdit au porteur de se rattacher quand c'est l'auteur de l'appel qui l'a détaché", async () => {
    const auteur = await mkUser();
    const squatteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque squattée ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(squatteur.id, `Projet squat ${RUN}`);

    await answerCall(squatteur.id, call!.id, projet.id);
    await withdrawAnswer(auteur.id, call!.id, projet.id);

    // Sans ce garde-fou, le squatteur se rattachait d'un clic, en silence :
    // le seul geste durable de l'auteur redevenait « retirer son propre appel ».
    await expect(answerCall(squatteur.id, call!.id, projet.id)).rejects.toBeInstanceOf(DomainError);
    expect(await callsAnsweredBy(projet.id)).toEqual([]);
  });

  it("laisse le porteur revenir sur SON propre retrait", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque hésitante ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet hesitant ${RUN}`);

    await answerCall(porteur.id, call!.id, projet.id);
    await withdrawAnswer(porteur.id, call!.id, projet.id);
    await answerCall(porteur.id, call!.id, projet.id);

    expect((await callsAnsweredBy(projet.id)).map((c) => c.slug)).toEqual([slug]);
  });

  it("oublie la promesse partout quand un tiers détache, y compris côté projet", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque nettoyée partout ${RUN}`);
    const call = await getCall(slug);
    const projet = await mkProject(porteur.id, `Projet nettoye ${RUN}`);

    await answerCall(porteur.id, call!.id, projet.id);
    expect(await callsAnsweredBy(projet.id)).toHaveLength(1);

    await withdrawAnswer(auteur.id, call!.id, projet.id);

    // `callsAnsweredBy` est la SEULE source de « ce que ce projet remplace » :
    // la page projet la consomme désormais au lieu de refaire le filtre.
    expect(await callsAnsweredBy(projet.id)).toEqual([]);
    expect((await replacementsByProject([projet.id])).get(projet.id)).toBeUndefined();
  });
});

describe("retrait et modération", () => {
  it("interdit à un tiers de retirer l'appel d'un autre", async () => {
    const auteur = await mkUser();
    const passant = await mkUser();
    const slug = await mkCall(auteur.id);
    const call = await getCall(slug);

    await expect(
      removeCall(passant.id, call!.id, { isAdmin: false })
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("garde la ligne, prévient l'auteur et sort l'appel du fil quand la modération retire", async () => {
    const auteur = await mkUser();
    const admin = await mkUser();
    const slug = await mkCall(auteur.id, `Marque modérée ${RUN}`);
    const call = await getCall(slug);

    await removeCall(admin.id, call!.id, { isAdmin: true, reason: "Accusation non sourcée" });

    const after = await getCall(slug);
    expect(after).not.toBeNull(); // la ligne survit : le fil reste auditable
    expect(after!.removedAt).not.toBeNull();
    expect(after!.removedById).toBe(admin.id);
    expect(after!.removalReason).toBe("Accusation non sourcée");

    const notif = await prisma.notification.findFirst({
      where: { userId: auteur.id, type: "BOYCOTT_REMOVED" },
    });
    expect(notif).not.toBeNull();

    const fil = await listCalls({ sort: "recents" });
    expect(fil.map((c) => c.slug)).not.toContain(slug);
  });

  it("laisse signaler l'appel d'un autre, jamais le sien", async () => {
    const auteur = await mkUser();
    const lecteur = await mkUser();
    const slug = await mkCall(auteur.id, `Marque signalée ${RUN}`);
    const call = await getCall(slug);

    await expect(
      createReport(auteur.id, {
        targetType: "BOYCOTT_CALL",
        targetId: call!.id,
        reason: "Spam ou démarchage",
      })
    ).rejects.toBeInstanceOf(DomainError);

    await createReport(lecteur.id, {
      targetType: "BOYCOTT_CALL",
      targetId: call!.id,
      reason: "Accusation fausse ou non sourcée",
    });

    const report = await prisma.report.findFirst({
      where: { targetType: "BOYCOTT_CALL", targetId: call!.id },
    });
    expect(report?.reporterId).toBe(lecteur.id);
  });
});

describe("le fil", () => {
  it("ne met en avant que les appels sans remplaçant", async () => {
    const auteur = await mkUser();
    const porteur = await mkUser();

    const orphelin = await mkCall(auteur.id, `Marque seule ${RUN}`);
    const servi = await mkCall(auteur.id, `Marque servie ${RUN}`);
    const callServi = await getCall(servi);
    const projet = await mkProject(porteur.id, `Projet servi ${RUN}`);
    await answerCall(porteur.id, callServi!.id, projet.id);

    const orphelins = (await listCalls({ sort: "orphelins", take: 100 })).map((c) => c.slug);
    expect(orphelins).toContain(orphelin);
    expect(orphelins).not.toContain(servi);

    const enAvant = (await featuredCalls(50)).map((c) => c.slug);
    expect(enAvant).not.toContain(servi);
  });

  it("classe par nombre de soutiens", async () => {
    const auteur = await mkUser();
    const a = await mkUser();
    const b = await mkUser();

    const peu = await mkCall(auteur.id, `Marque tiede ${RUN}`);
    const beaucoup = await mkCall(auteur.id, `Marque brulante ${RUN}`);
    const callBeaucoup = await getCall(beaucoup);
    await toggleSupport(a.id, callBeaucoup!.id);
    await toggleSupport(b.id, callBeaucoup!.id);

    const classés = (await listCalls({ sort: "soutenus", take: 100 })).map((c) => c.slug);
    expect(classés.indexOf(beaucoup)).toBeLessThan(classés.indexOf(peu));
  });
});
