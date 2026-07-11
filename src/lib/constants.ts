import type { NotificationType, ProjectCategory } from "@prisma/client";

// ---------- Économie (Phase 1 : tokens fictifs, 1 token = 1 $) ----------

/** Tokens offerts à l'inscription — volontairement modestes. */
export const WELCOME_CREDITS = 5;

/** Montants de recharge proposés (fictifs en Phase 1, Stripe en Phase 2). */
export const RECHARGE_PRESETS = [10, 25, 50, 100] as const;

/** Contribution minimale à un projet. */
export const MIN_CONTRIBUTION = 5;

/** Nombre de contributions requises avant de pouvoir poster un projet. */
export const MIN_CONTRIBUTIONS_TO_CREATE = 1;

// ---------- Règles de campagne ----------

export const MIN_GOAL = 50;
export const MAX_GOAL = 10_000;
export const MIN_DURATION_DAYS = 7;
export const MAX_DURATION_DAYS = 60;

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
export const NOTIFICATION_TYPE_LABELS = {
  CONTRIBUTION: "Contribution reçue sur mes projets",
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
