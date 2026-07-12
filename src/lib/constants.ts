import type { NotificationType, ProjectCategory } from "@prisma/client";

// ---------- Économie (argent réel, une devise par projet) ----------
// Décisions fondateur 2026-07-12 : plus de wallet de tokens, plus de bonus
// de bienvenue, pas de commission pour le moment. Paiement carte direct dans
// la devise du projet ; les clés Stripe restent en mode TEST jusqu'à
// l'activation Connect + relecture légale.

/**
 * Gate « contribue d'abord » : cumul de contributions (équivalent USD figé
 * au moment de chaque paiement) requis avant de pouvoir poster son projet.
 * Affiché en jauge de progression. Abaissé 50 → 20 $ le 2026-07-12
 * (décision fondateur : 50 $ trop haut, surtout hors Europe). Le rôle
 * ADMIN est exempté (démarrage à froid).
 */
export const GATE_USD_CENTS = 2000; // 20 $

/** Contribution minimale, en unités MAJEURES de la devise du projet. */
export const MIN_CONTRIBUTION_MAJOR = 5;

// ---------- Règles de campagne ----------

/** Bornes de l'objectif, en unités MAJEURES de la devise du projet. */
export const MIN_GOAL = 50;
export const MAX_GOAL = 100_000;
export const MIN_DURATION_DAYS = 7;
/**
 * Durée maximale de campagne : 90 jours (décision 2026-07-12), alignée sur
 * REALIZATION_DAYS — au-delà, les tokens des contributeurs resteraient
 * bloqués trop longtemps sous séquestre.
 */
export const MAX_DURATION_DAYS = 90;

/**
 * Jours accordés après le financement pour réaliser et faire valider TOUTES
 * les étapes. Au-delà : un vote encore ouvert est tranché à la balance des
 * bulletins posés (le porteur garde ce que la communauté a validé), puis le
 * séquestre restant est remboursé. Décision 2026-07-11 : 90 j, au plafond de
 * rétention Stripe — cf docs/sequestre-ue.md.
 */
export const REALIZATION_DAYS = 90;

/** Compétences : tags libres, bornés pour rester lisibles. */
export const MAX_SKILLS_PER_USER = 8;
export const MAX_SKILLS_PER_PROJECT = 6;

// ---------- Étapes & preuves ----------

export const MIN_MILESTONES = 2;
export const MAX_MILESTONES = 5;

/** Montant minimal d'une étape (en crédits). La somme des étapes = objectif. */
export const MIN_MILESTONE_AMOUNT = 10;

/** Rejets de preuve max par étape avant échec du projet. */
export const MAX_PROOF_ATTEMPTS = 2;

export const MAX_PROOF_LINKS = 5;
export const MAX_PROOF_IMAGES = 6;

// ---------- Vote pondéré ----------
// Le poids d'un vote = total contribué par le votant au projet.
// Une preuve est validée quand le poids POUR dépasse 50% des crédits collectés,
// refusée quand le poids CONTRE dépasse 50%. Si tous les contributeurs ont voté
// sans majorité stricte, la balance des poids tranche (égalité → refus).

// ---------- Réputation ----------

export const REP = {
  CONTRIBUTION: 2,
  VOTE: 1,
  MILESTONE_RELEASED: 10,
  PROJECT_COMPLETED: 25,
  PROJECT_FAILED: -15,
} as const;

// ---------- Libellés ----------

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  TECH: "Tech",
  ECOMMERCE: "E-commerce",
  SERVICES: "Services",
  CREATIF: "Créatif",
  MUSIQUE: "Musique",
  MODE: "Mode",
  GAMING: "Gaming",
  FOOD: "Food",
  EDUCATION: "Éducation",
  SANTE: "Santé & bien-être",
  FINANCE: "Finance",
  IMPACT: "Impact",
  SPORT: "Sport",
  MEDIA: "Médias",
  ARTISANAT: "Artisanat",
  IMMOBILIER: "Immobilier",
  AUTRE: "Autre",
};

/** Ce qu'on trouve dans chaque catégorie — affiché quand elle est filtrée. */
export const CATEGORY_DESCRIPTIONS: Record<ProjectCategory, string> = {
  TECH: "Apps, SaaS, hardware, IA, outils pour développeurs et no-code.",
  ECOMMERCE: "Boutiques en ligne, marques D2C, marketplaces et drops.",
  SERVICES: "Agences, freelancing, conciergerie, services de proximité.",
  CREATIF: "Illustration, BD/webtoon, photo, vidéo, design et écriture.",
  MUSIQUE: "EP, albums, clips, labels indés, matériel de production.",
  MODE: "Marques de vêtements, upcycling, accessoires, sneakers.",
  GAMING: "Jeux vidéo, studios indés, esport, streaming et communautés.",
  FOOD: "Street-food, restaurants, produits alimentaires, food-trucks.",
  EDUCATION: "Cours en ligne, tutorat, contenus pédagogiques, bootcamps.",
  SANTE: "Bien-être, fitness, santé mentale, nutrition, self-care.",
  FINANCE: "Fintech, éducation financière, outils de gestion et d'épargne.",
  IMPACT: "Écologie, solidarité, associations, économie circulaire.",
  SPORT: "Clubs, équipements, événements sportifs, coaching.",
  MEDIA: "Podcasts, chaînes vidéo, newsletters, magazines, journalisme.",
  ARTISANAT: "Fait-main, céramique, bois, bijoux, petites séries locales.",
  IMMOBILIER: "Coliving, tiers-lieux, rénovation, projets d'espaces.",
  AUTRE: "Tout ce qui ne rentre pas (encore) dans une case.",
};

export const STATUS_LABELS = {
  ACTIVE: "En campagne",
  FUNDED: "Financé",
  COMPLETED: "Réalisé",
  FAILED: "Non abouti",
} as const;

export const PARTNERSHIP_COMPENSATION_LABELS = {
  MONEY: "Rémunération en argent",
  PRODUCT: "Produits / dotation",
  VISIBILITY: "Visibilité uniquement",
  MIXED: "Argent + produits",
} as const;

export const PARTNERSHIP_STATUS_LABELS = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  DECLINED: "Refusée",
} as const;

/** Libellés des types de notifications (préférences + affichage). */
/** Motifs de signalement proposés (le service refuse tout autre motif). */
export const REPORT_REASONS = [
  "Arnaque ou contenu trompeur",
  "Contenu inapproprié ou haineux",
  "Spam ou démarchage",
  "Autre",
] as const;

export const NOTIFICATION_TYPE_LABELS = {
  CONTRIBUTION: "Contribution reçue sur mes projets",
  CONTRIBUTION_CONFIRMED: "Confirmation de mes contributions",
  PROJECT_FUNDED: "Objectif atteint",
  PROJECT_FAILED: "Campagne non aboutie",
  REFUND: "Remboursements",
  PROOF_TO_VOTE: "Preuve à examiner (vote)",
  MILESTONE_RELEASED: "Étape validée, fonds débloqués",
  PROOF_REJECTED: "Preuve refusée",
  MESSAGE: "Nouveaux messages privés",
  PARTNERSHIP: "Demandes de partenariat",
  COMMENT: "Commentaires sur mes projets",
  PROJECT_UPDATE: "Actus des projets que je soutiens ou suis",
} as const satisfies Record<NotificationType, string>;
