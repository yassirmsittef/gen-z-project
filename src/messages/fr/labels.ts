import type {
  PartnershipCompensation,
  PartnershipStatus,
  NotificationType,
  ProjectCategory,
  ProjectStatus,
} from "@prisma/client";
import type { Dict } from "@/lib/i18n/t";

/**
 * Libellés des énumérations du domaine — LA source de vérité : les exports
 * historiques de constants.ts (CATEGORY_LABELS…) en dérivent désormais.
 * Les intersections `Record<…>` du satisfies garantissent qu'aucune valeur
 * d'enum Prisma n'est oubliée — ici et donc dans les 6 autres langues.
 */
export const labels = {
  "category.TECH": "Tech",
  "category.ECOMMERCE": "E-commerce",
  "category.SERVICES": "Services",
  "category.CREATIF": "Créatif",
  "category.MUSIQUE": "Musique",
  "category.MODE": "Mode",
  "category.GAMING": "Gaming",
  "category.FOOD": "Food",
  "category.EDUCATION": "Éducation",
  "category.SANTE": "Santé & bien-être",
  "category.FINANCE": "Finance",
  "category.IMPACT": "Impact",
  "category.SPORT": "Sport",
  "category.MEDIA": "Médias",
  "category.ARTISANAT": "Artisanat",
  "category.IMMOBILIER": "Immobilier",
  "category.AUTRE": "Autre",

  "categoryDesc.TECH": "Apps, SaaS, hardware, IA, outils pour développeurs et no-code.",
  "categoryDesc.ECOMMERCE": "Boutiques en ligne, marques D2C, marketplaces et drops.",
  "categoryDesc.SERVICES": "Agences, freelancing, conciergerie, services de proximité.",
  "categoryDesc.CREATIF": "Illustration, BD/webtoon, photo, vidéo, design et écriture.",
  "categoryDesc.MUSIQUE": "EP, albums, clips, labels indés, matériel de production.",
  "categoryDesc.MODE": "Marques de vêtements, upcycling, accessoires, sneakers.",
  "categoryDesc.GAMING": "Jeux vidéo, studios indés, esport, streaming et communautés.",
  "categoryDesc.FOOD": "Street-food, restaurants, produits alimentaires, food-trucks.",
  "categoryDesc.EDUCATION": "Cours en ligne, tutorat, contenus pédagogiques, bootcamps.",
  "categoryDesc.SANTE": "Bien-être, fitness, santé mentale, nutrition, self-care.",
  "categoryDesc.FINANCE": "Fintech, éducation financière, outils de gestion et d'épargne.",
  "categoryDesc.IMPACT": "Écologie, solidarité, associations, économie circulaire.",
  "categoryDesc.SPORT": "Clubs, équipements, événements sportifs, coaching.",
  "categoryDesc.MEDIA": "Podcasts, chaînes vidéo, newsletters, magazines, journalisme.",
  "categoryDesc.ARTISANAT": "Fait-main, céramique, bois, bijoux, petites séries locales.",
  "categoryDesc.IMMOBILIER": "Coliving, tiers-lieux, rénovation, projets d'espaces.",
  "categoryDesc.AUTRE": "Tout ce qui ne rentre pas (encore) dans une case.",

  "status.ACTIVE": "En campagne",
  "status.FUNDED": "Financé",
  "status.COMPLETED": "Réalisé",
  "status.FAILED": "Non abouti",

  "compensation.MONEY": "Rémunération en argent",
  "compensation.PRODUCT": "Produits / dotation",
  "compensation.VISIBILITY": "Visibilité uniquement",
  "compensation.MIXED": "Argent + produits",

  "partnershipStatus.PENDING": "En attente",
  "partnershipStatus.ACCEPTED": "Acceptée",
  "partnershipStatus.DECLINED": "Refusée",

  "notifType.CONTRIBUTION": "Contribution reçue sur mes projets",
  "notifType.CONTRIBUTION_CONFIRMED": "Confirmation de mes contributions",
  "notifType.PROJECT_FUNDED": "Objectif atteint",
  "notifType.PROJECT_FAILED": "Campagne non aboutie",
  "notifType.REFUND": "Remboursements",
  "notifType.PROOF_TO_VOTE": "Preuve à examiner (vote)",
  "notifType.MILESTONE_RELEASED": "Étape validée, fonds débloqués",
  "notifType.PROOF_REJECTED": "Preuve refusée",
  "notifType.MESSAGE": "Nouveaux messages privés",
  "notifType.GROUP_MESSAGE": "Nouveaux messages dans mes groupes",
  "notifType.PARTNERSHIP": "Demandes de partenariat",
  "notifType.COMMENT": "Commentaires sur mes projets",
  "notifType.PROJECT_UPDATE": "Actus des projets que je soutiens ou suis",
  "notifType.BOYCOTT_ANSWERED": "Un remplaçant se lance sur un appel que je soutiens",
  "notifType.BOYCOTT_REMOVED": "Retrait d'un de mes appels par la modération",
  "notifType.CALL_COMMENT": "Réponses sous mes appels",
  "notifType.CALL_VIDEO": "Témoignages vidéo sous mes appels",
  "notifType.STORAGE_ALERT": "Alerte de stockage hébergé (équipe)",
} as const satisfies Dict &
  Record<`category.${ProjectCategory}`, string> &
  Record<`categoryDesc.${ProjectCategory}`, string> &
  Record<`status.${ProjectStatus}`, string> &
  Record<`compensation.${PartnershipCompensation}`, string> &
  Record<`partnershipStatus.${PartnershipStatus}`, string> &
  Record<`notifType.${NotificationType}`, string>;
