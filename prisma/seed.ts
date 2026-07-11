/**
 * Seed de démo : peuple la base en passant par les VRAIS services métier
 * (makeContribution, submitMilestoneProof, castVote, failExpiredProjects...)
 * pour garantir que soldes, séquestre, réputation et ledger restent cohérents.
 *
 * Comptes de démo (mot de passe : demo1234) :
 *   demo@demo.dev  — compte vierge (5 $, aucune contribution → gate actif)
 *   lea@demo.dev, max@demo.dev, zoe@demo.dev, sam@demo.dev, nina@demo.dev
 */
import bcrypt from "bcryptjs";
import type { ProjectCategory } from "@prisma/client";
import { findCity } from "../src/lib/cities";
import { prisma } from "../src/lib/prisma";
import {
  castVote,
  failExpiredProjects,
  grantWelcomeCredits,
  makeContribution,
  submitMilestoneProof,
  topUpCredits,
} from "../src/lib/project-service";

async function reset() {
  await prisma.$transaction([
    prisma.partnershipRequest.deleteMany(),
    prisma.vote.deleteMany(),
    prisma.proof.deleteMany(),
    prisma.milestone.deleteMany(),
    prisma.contribution.deleteMany(),
    prisma.creditTransaction.deleteMany(),
    prisma.reputationEvent.deleteMany(),
    prisma.project.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  skills: string[] = [],
  cityName?: string
) {
  const city = cityName ? findCity(cityName) : undefined;
  if (cityName && !city) throw new Error(`Ville de seed inconnue : ${cityName}`);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      skills,
      ...(city
        ? { city: city.name, country: city.country, latitude: city.lat, longitude: city.lng }
        : {}),
    },
  });
  await grantWelcomeCredits(user.id);
  return user;
}

type MilestoneSeed = { title: string; description: string; amount: number };

async function createProjectRecord(
  ownerId: string,
  data: {
    slug: string;
    title: string;
    pitch: string;
    description: string;
    category: ProjectCategory;
    goal: number;
    days: number;
    neededSkills?: string[];
    milestones: MilestoneSeed[];
  }
) {
  return prisma.project.create({
    data: {
      slug: data.slug,
      title: data.title,
      pitch: data.pitch,
      description: data.description,
      category: data.category,
      goal: data.goal,
      neededSkills: data.neededSkills ?? [],
      deadline: new Date(Date.now() + data.days * 86_400_000),
      ownerId,
      milestones: {
        create: data.milestones.map((m, i) => ({ order: i + 1, ...m })),
      },
    },
  });
}

async function milestoneId(projectId: string, order: number) {
  const milestone = await prisma.milestone.findUniqueOrThrow({
    where: { projectId_order: { projectId, order } },
  });
  return milestone.id;
}

async function pendingProofId(projectId: string, order: number) {
  const proof = await prisma.proof.findFirstOrThrow({
    where: { milestone: { projectId, order }, status: "PENDING" },
  });
  return proof.id;
}

async function main() {
  console.log("🌱 Reset de la base...");
  await reset();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  console.log("👤 Utilisateurs...");
  const lea = await createUser(
    "Léa",
    "lea@demo.dev",
    passwordHash,
    ["podcast", "interview", "com"],
    "Paris"
  );
  const max = await createUser(
    "Max",
    "max@demo.dev",
    passwordHash,
    ["musique", "mix", "cuisine"],
    "Lyon"
  );
  const zoe = await createUser(
    "Zoé",
    "zoe@demo.dev",
    passwordHash,
    ["couture", "upcycling", "photo"],
    "Marseille"
  );
  const sam = await createUser(
    "Sam",
    "sam@demo.dev",
    passwordHash,
    ["gamedev", "pixel-art", "montage"],
    "Montréal"
  );
  const nina = await createUser(
    "Nina",
    "nina@demo.dev",
    passwordHash,
    ["dessin", "webtoon", "scénario"],
    "Casablanca"
  );
  await createUser("Toi (démo)", "demo@demo.dev", passwordHash, ["montage", "photo"], "Paris");

  // Recharges de démo pour que les scénarios ci-dessous soient jouables
  // (le bonus d'inscription n'est que de 5 $).
  await topUpCredits(lea.id, 695, "Recharge démo");
  await topUpCredits(max.id, 495, "Recharge démo");
  await topUpCredits(zoe.id, 445, "Recharge démo");
  await topUpCredits(sam.id, 295, "Recharge démo");
  await topUpCredits(nina.id, 195, "Recharge démo");

  console.log("🚀 Projets...");
  const p1 = await createProjectRecord(lea.id, {
    slug: "studio-podcast-nomade",
    title: "Studio de podcast nomade",
    pitch: "Un kit d'enregistrement mobile pour donner la parole aux jeunes de mon quartier.",
    description:
      "Je fais des interviews depuis 2 ans avec mon téléphone. Objectif : un vrai kit nomade (micros, enregistreur, casques) pour produire une saison de 10 épisodes sur les parcours de jeunes créateurs.\n\nLes crédits financent le matériel (étape 1), la production des 5 premiers épisodes (étape 2), puis la promo et la suite de la saison (étape 3).",
    category: "TECH",
    goal: 400,
    days: 12,
    neededSkills: ["audio", "montage", "com"],
    milestones: [
      { title: "Matériel acheté", description: "Photos du kit complet + factures.", amount: 160 },
      { title: "5 épisodes produits", description: "Liens d'écoute publics des épisodes.", amount: 140 },
      { title: "Saison complète + promo", description: "10 épisodes en ligne et bilan d'audience.", amount: 100 },
    ],
  });

  const p2 = await createProjectRecord(max.id, {
    slug: "ep-lune-noire",
    title: "EP 5 titres — LUNE NOIRE",
    pitch: "Mon premier EP produit en indé : 5 titres, zéro label, 100% communauté.",
    description:
      "Deux ans que je compose dans ma chambre. J'ai les maquettes, il me manque le mix/mastering pro et la distribution.\n\nÉtape 1 : mix de 2 titres (extraits publics). Étape 2 : EP complet sur toutes les plateformes.",
    category: "MUSIQUE",
    goal: 300,
    days: 25,
    neededSkills: ["mix", "clip", "design"],
    milestones: [
      { title: "2 titres mixés", description: "Extraits publiés en écoute libre.", amount: 120 },
      { title: "EP complet distribué", description: "Lien Spotify/Apple Music de l'EP.", amount: 180 },
    ],
  });

  const p3 = await createProjectRecord(zoe.id, {
    slug: "derniere-couche-upcycling",
    title: "DERNIÈRE COUCHE — fringues upcyclées",
    pitch: "Une capsule de 20 pièces uniques à partir de vêtements récupérés.",
    description:
      "Je récupère des vêtements destinés à la benne et je les transforme en pièces uniques. La capsule « Dernière Couche » : 20 pièces, un shooting, une vente en ligne.\n\nÉtape 1 : matières premières et fournitures. Étape 2 : confection des 20 pièces. Étape 3 : shooting + mise en vente.",
    category: "MODE",
    goal: 500,
    days: 20,
    neededSkills: ["couture", "photo", "e-commerce"],
    milestones: [
      { title: "Matières & fournitures", description: "Photos du stock trié et des fournitures.", amount: 150 },
      { title: "20 pièces confectionnées", description: "Lookbook photo des pièces terminées.", amount: 225 },
      { title: "Shooting & vente en ligne", description: "Boutique en ligne ouverte.", amount: 125 },
    ],
  });

  const p4 = await createProjectRecord(sam.id, {
    slug: "jeu-pixel-art-coop",
    title: "Jeu vidéo pixel-art coopératif",
    pitch: "Un petit jeu coop 2 joueurs fait maison, jouable gratuitement dans le navigateur.",
    description:
      "Un puzzle-platformer coop où chaque joueur voit une moitié différente du niveau. Prototype déjà jouable entre potes.\n\nÉtape 1 : démo publique de 3 niveaux. Étape 2 : version complète 15 niveaux + musique originale.",
    category: "GAMING",
    goal: 600,
    days: 30,
    neededSkills: ["musique", "level-design", "beta-test"],
    milestones: [
      { title: "Démo publique 3 niveaux", description: "Lien jouable dans le navigateur.", amount: 180 },
      { title: "Jeu complet 15 niveaux", description: "Version finale en ligne + bande-son.", amount: 420 },
    ],
  });

  const p5 = await createProjectRecord(nina.id, {
    slug: "webtoon-banlieue-cosmique",
    title: "Webtoon « Banlieue Cosmique »",
    pitch: "Un webtoon SF qui se passe dans ma cité — 12 chapitres, publication gratuite.",
    description:
      "De la SF avec des visages et des lieux qu'on ne voit jamais dans la SF. 12 chapitres écrits, il me manque le temps de dessin et une tablette correcte.\n\nÉtape 1 : 4 premiers chapitres publiés. Étape 2 : les 8 restants + version reliée numérique.",
    category: "CREATIF",
    goal: 200,
    days: 15,
    neededSkills: ["lettrage", "traduction"],
    milestones: [
      { title: "Chapitres 1 à 4 publiés", description: "Liens de lecture publics.", amount: 80 },
      { title: "Saison complète (12 chapitres)", description: "Webtoon terminé + PDF relié.", amount: 120 },
    ],
  });

  const p6 = await createProjectRecord(max.id, {
    slug: "food-truck-vegan",
    title: "Food-truck 100% vegan",
    pitch: "Street-food vegan abordable sur le campus, en circuit court.",
    description:
      "Un food-truck vegan sur le campus avec des produits locaux et des prix étudiants. Il me faut l'aménagement de base du camion et le stock de départ.",
    category: "FOOD",
    goal: 800,
    days: 30,
    neededSkills: ["cuisine", "logistique"],
    milestones: [
      { title: "Camion aménagé", description: "Photos de l'aménagement terminé.", amount: 480 },
      { title: "Ouverture sur le campus", description: "Premier service assuré, photos + retour clients.", amount: 320 },
    ],
  });

  const p7 = await createProjectRecord(lea.id, {
    slug: "ateliers-reparation-velo",
    title: "Ateliers réparation vélo du samedi",
    pitch: "Un atelier gratuit d'auto-réparation de vélos, un samedi par mois.",
    description:
      "Outillage complet + pièces de base pour lancer des ateliers mensuels gratuits d'auto-réparation. Étape 1 : outillage. Étape 2 : trois premiers ateliers assurés.",
    category: "IMPACT",
    goal: 250,
    days: 8,
    neededSkills: ["mécanique", "animation"],
    milestones: [
      { title: "Outillage complet", description: "Photos de l'atelier équipé.", amount: 125 },
      { title: "3 ateliers réalisés", description: "Photos + compteur de vélos réparés.", amount: 125 },
    ],
  });

  await createProjectRecord(sam.id, {
    slug: "chaine-vulgarisation-ia",
    title: "Chaîne de vulgarisation IA",
    pitch: "Des vidéos de 5 min qui expliquent l'IA sans bullshit, pour tout le monde.",
    description:
      "Format court, rythmé, sourcé. Il me faut un micro correct, un éclairage et du temps de montage pour lancer les 6 premiers épisodes.",
    category: "TECH",
    goal: 350,
    days: 40,
    neededSkills: ["montage", "motion design", "vulgarisation"],
    milestones: [
      { title: "Setup + 2 pilotes", description: "Deux vidéos pilotes en ligne.", amount: 140 },
      { title: "6 épisodes publiés", description: "La série complète en ligne.", amount: 210 },
    ],
  });

  console.log("💸 Contributions...");
  // P1 — en campagne, 260/400
  await makeContribution(max.id, p1.id, 60);
  await makeContribution(zoe.id, p1.id, 80);
  await makeContribution(sam.id, p1.id, 70);
  await makeContribution(nina.id, p1.id, 50);

  // P2 — en campagne, 45/300
  await makeContribution(zoe.id, p2.id, 25);
  await makeContribution(sam.id, p2.id, 20);

  // P3 — financé (500/500), preuve étape 1 en cours de vote pondéré
  await makeContribution(lea.id, p3.id, 200);
  await makeContribution(max.id, p3.id, 150);
  await makeContribution(sam.id, p3.id, 100);
  await makeContribution(nina.id, p3.id, 50);

  // P4 — financé (600/600), étape 1 débloquée, étape 2 en attente de preuve
  await makeContribution(lea.id, p4.id, 250);
  await makeContribution(max.id, p4.id, 200);
  await makeContribution(zoe.id, p4.id, 150);

  // P5 — réalisé (toutes étapes validées)
  await makeContribution(lea.id, p5.id, 100);
  await makeContribution(zoe.id, p5.id, 100);

  // P6 — échouera (120/800 à la deadline)
  await makeContribution(lea.id, p6.id, 80);
  await makeContribution(nina.id, p6.id, 40);

  // P7 — en campagne, 90/250
  await makeContribution(max.id, p7.id, 50);
  await makeContribution(sam.id, p7.id, 40);

  console.log("📎 Preuves & votes pondérés...");
  // P4 : étape 1 prouvée puis validée (léa 250 + max 200 = 450 > 300 = 50% de 600)
  await submitMilestoneProof(sam.id, {
    milestoneId: await milestoneId(p4.id, 1),
    content:
      "La démo 3 niveaux est en ligne ! Jouable à deux dans le navigateur, lien ci-dessous. Le netcode tient la route, on a fait tester à 40 personnes.",
    links: ["https://example.com/demo-pixel-coop", "https://github.com/sam/pixel-coop"],
  });
  await castVote(lea.id, await pendingProofId(p4.id, 1), "APPROVE");
  await castVote(max.id, await pendingProofId(p4.id, 1), "APPROVE");

  // P5 : deux étapes prouvées et validées → projet réalisé
  await submitMilestoneProof(nina.id, {
    milestoneId: await milestoneId(p5.id, 1),
    content: "Les chapitres 1 à 4 sont publiés et lisibles gratuitement. Déjà 2 400 lectures !",
    links: ["https://example.com/banlieue-cosmique"],
  });
  await castVote(lea.id, await pendingProofId(p5.id, 1), "APPROVE");
  await castVote(zoe.id, await pendingProofId(p5.id, 1), "APPROVE");

  await submitMilestoneProof(nina.id, {
    milestoneId: await milestoneId(p5.id, 2),
    content:
      "Saison complète ! Les 12 chapitres sont en ligne et le PDF relié est dispo en téléchargement libre. Merci à tous !",
    links: ["https://example.com/banlieue-cosmique-s1"],
  });
  await castVote(lea.id, await pendingProofId(p5.id, 2), "APPROVE");
  await castVote(zoe.id, await pendingProofId(p5.id, 2), "APPROVE");

  // P3 : preuve étape 1 soumise avec photos, vote en cours
  // (léa POUR avec 200 cr ≤ 250 = 50% de 500 → pas encore tranchée)
  await submitMilestoneProof(zoe.id, {
    milestoneId: await milestoneId(p3.id, 1),
    content:
      "80 kg de textile récupérés et triés, fournitures achetées (fil, aiguilles, boutons). Photos du stock ci-dessous.",
    links: ["https://example.com/derniere-couche-stock"],
    imageUrls: [
      "https://picsum.photos/seed/upcycling1/800/450",
      "https://picsum.photos/seed/upcycling2/800/450",
      "https://picsum.photos/seed/upcycling3/800/450",
    ],
  });
  await castVote(lea.id, await pendingProofId(p3.id, 1), "APPROVE");

  console.log("💬 Conversations d'entraide...");
  const say = (senderId: string, recipientId: string, body: string, minutesAgo: number) =>
    prisma.message.create({
      data: {
        senderId,
        recipientId,
        body,
        createdAt: new Date(Date.now() - minutesAgo * 60_000),
      },
    });

  // Léa (podcast) × Nina (webtoon) : leurs projets peuvent cohabiter.
  await say(
    lea.id,
    nina.id,
    "Salut Nina ! J'adore Banlieue Cosmique. Ça te dirait de venir en parler dans mon podcast ? Un épisode sur ton process de création, ça collerait parfaitement.",
    180
  );
  await say(
    nina.id,
    lea.id,
    "Trop bien ! Et en échange je peux te dessiner les visuels de tes covers d'épisodes si tu veux.",
    140
  );
  await say(lea.id, nina.id, "Deal. Je t'envoie les dates d'enregistrement cette semaine.", 120);

  // Sam (jeu) × Zoé (mode upcyclée) : collab merch.
  await say(
    sam.id,
    zoe.id,
    "Hello Zoé ! Pour la sortie du jeu on aimerait une petite capsule de t-shirts upcyclés avec le pixel-art des personnages. Partante ?",
    90
  );
  await say(
    zoe.id,
    sam.id,
    "Carrément — envoie-moi les sprites, je fais des essais sur les pièces de la prochaine fournée.",
    45
  );

  console.log("📣 Actus & discussion...");
  await prisma.projectUpdate.createMany({
    data: [
      {
        projectId: p4.id,
        title: "La démo 3 niveaux est en ligne !",
        body: "Grâce à vous, la démo publique est jouable dès maintenant dans le navigateur. 40 testeurs, zéro crash, et déjà plein de retours pour la suite. Le netcode tient — prochaine étape : les 15 niveaux et la bande-son originale.",
        createdAt: new Date(Date.now() - 2 * 86_400_000),
      },
      {
        projectId: p3.id,
        title: "80 kg de textile récupérés",
        body: "Le tri est terminé : 80 kg de matières sauvées de la benne, fournitures achetées. La confection des 20 pièces démarre cette semaine — photos du stock dans la preuve d'étape.",
        createdAt: new Date(Date.now() - 1 * 86_400_000),
      },
    ],
  });
  await prisma.comment.createMany({
    data: [
      {
        projectId: p1.id,
        userId: max.id,
        body: "Le concept est top — si tu as besoin d'un jingle ou d'un habillage sonore pour les épisodes, fais signe !",
        createdAt: new Date(Date.now() - 200 * 60_000),
      },
      {
        projectId: p1.id,
        userId: zoe.id,
        body: "J'ai des chutes de tissu parfaites pour des housses de micro anti-bruit, on en parle ?",
        createdAt: new Date(Date.now() - 90 * 60_000),
      },
      {
        projectId: p4.id,
        userId: lea.id,
        body: "Testé la démo à deux hier soir : le niveau 3 est génial. Vivement la suite !",
        createdAt: new Date(Date.now() - 30 * 60_000),
      },
    ],
  });

  console.log("🤝 Demandes de partenariat (une saine, une louche — démo du copilote IA)...");
  const p1Partnership = await prisma.partnershipRequest.create({
    data: {
      projectId: p1.id,
      brandName: "Micros & Ondes",
      contactName: "Claire Fontaine",
      brandEmail: "claire@microsetondes.fr",
      brandWebsite: "https://www.microsetondes.fr",
      compensation: "MIXED",
      budget: 250,
      message:
        "Bonjour Léa,\n\nNous fabriquons des microphones nomades à Nantes et ton projet de studio itinérant colle parfaitement à notre communauté. Nous proposons 250 $ + le prêt longue durée d'un kit micro complet pour la saison.\n\nCalendrier souple, paiement 50% à la signature, 50% à la diffusion. Brief écrit et contrat fournis, bien sûr.",
      deliverables:
        "2 mentions de 20 secondes en début d'épisode sur la saison + 1 post Instagram avec le kit en situation. Rien d'exclusif.",
    },
  });
  const p1Scam = await prisma.partnershipRequest.create({
    data: {
      projectId: p1.id,
      brandName: "GlobalPromo Agency",
      brandEmail: "promo.global.2024@gmail.com",
      compensation: "VISIBILITY",
      message:
        "OFFRE URGENTE !! Nous adorons votre podcast et voulons le promouvoir à des MILLIONS d'auditeurs via notre réseau international. Pour activer le partenariat il faut simplement régler des frais d'inscription de 49$ (remboursés au premier versement). Places limitées, répondez aujourd'hui seulement. Contactez-nous directement sur WhatsApp pour aller plus vite.",
      deliverables:
        "Promotion exclusive de notre plateforme dans tous vos épisodes et sur tous vos réseaux pendant 12 mois.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: lea.id,
        type: "PARTNERSHIP",
        title: "Demande de partenariat de Micros & Ondes",
        body: "Pour « Studio de podcast nomade » · 250 $ proposés. Le copilote IA a préparé son analyse.",
        href: `/partenariats/${p1Partnership.id}`,
      },
      {
        userId: lea.id,
        type: "PARTNERSHIP",
        title: "Demande de partenariat de GlobalPromo Agency",
        body: "Pour « Studio de podcast nomade ». Le copilote IA a préparé son analyse.",
        href: `/partenariats/${p1Scam.id}`,
      },
    ],
  });

  console.log("💥 Échec du food-truck (deadline dépassée)...");
  await prisma.project.update({
    where: { id: p6.id },
    data: { deadline: new Date(Date.now() - 2 * 86_400_000) },
  });
  await failExpiredProjects();

  console.log("\n✅ Seed terminé. Comptes (mdp : demo1234) :");
  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });
  for (const u of users) {
    console.log(
      `   ${u.email.padEnd(16)} solde ${String(u.credits).padStart(4)} $  réputation ${String(
        u.reputation
      ).padStart(3)}  investi ${u.totalContributed} $`
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
