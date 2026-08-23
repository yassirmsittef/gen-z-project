import type { NotificationType, ProjectCategory } from "@prisma/client";

/**
 * Domaine sentinelle des comptes anonymisés (RGPD). En `.invalid` (RFC 2606) :
 * aucune adresse n'y est délivrable, donc aucun bounce. Un seul endroit pour
 * l'écrire ET pour le reconnaître — `eraseAccount` le pose, `resetPassword`
 * le refuse (sinon un vieux lien ressusciterait le compte), le relais email
 * l'écarte.
 */
export const ERASED_EMAIL_DOMAIN = "@compte-supprime.genigain.invalid";

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

// ---------- Groupes de chat ----------
// Les groupes sont les places publiques de la plateforme, rangées dans les
// mêmes catégories que les projets. Ouverts à tous les membres connectés :
// aucun gate de contribution (le chat sert justement à trouver de l'aide
// AVANT d'avoir un projet). Les garde-fous sont donc des plafonds.

/** Groupes qu'un même membre peut animer — au-delà, c'est de l'occupation. */
export const MAX_GROUPS_OWNED = 3;

/** Taille maximale d'un groupe : au-delà, un fil unique devient illisible. */
export const MAX_GROUP_MEMBERS = 200;

/** Groupes qu'un membre peut avoir rejoints en même temps. */
export const MAX_GROUPS_JOINED = 20;

/**
 * Salons de langue — les seuls groupes ouverts par la plateforme elle-même.
 * GeniGain est suisse et ouverte à l'international : quelqu'un qui ne parle
 * pas français doit trouver une porte d'entrée dès son inscription, sans
 * attendre qu'un membre ouvre un salon. Rangés dans « Autre » (ils ne
 * dépendent d'aucun métier), épinglés en tête d'annuaire, animés par
 * l'équipe — et hors plafond de groupes animés (`official`).
 * Chaque intention est écrite DANS la langue du salon.
 */
/**
 * `welcome` est la ligne d'accueil postée quand quelqu'un entre ({nom} =
 * son pseudo), `empty` ce qu'on lit dans un fil encore vierge. Tournures
 * volontairement NEUTRES en genre — on ne devine pas celui d'un membre à
 * son pseudo (d'où « Te damos la bienvenida » plutôt que « Bienvenido/a »,
 * « Diamo il benvenuto » plutôt que « è entrato/a »).
 */
export const LANGUAGE_ROOMS = [
  {
    slug: "salon-francais",
    name: "Français",
    purpose: "Le salon francophone : présente-toi, demande un coup de main, trouve des collabs.",
    welcome: "{nom} a rejoint le salon. Bienvenue !",
    empty: "Le fil est vierge. Lance le sujet — présente-toi, dis ce que tu cherches.",
  },
  {
    slug: "salon-english",
    name: "English",
    purpose: "The English-speaking room: say hi, ask for a hand, find people to build with.",
    welcome: "{nom} joined the room. Welcome!",
    empty: "Nothing here yet. Start the conversation — introduce yourself, say what you need.",
  },
  {
    slug: "salon-espanol",
    name: "Español",
    purpose: "La sala en español: preséntate, pide ayuda y encuentra colaboraciones.",
    welcome: "{nom} se ha unido a la sala. ¡Te damos la bienvenida!",
    empty: "Aún no hay nada. Empieza la conversación: preséntate y di qué buscas.",
  },
  {
    slug: "salon-deutsch",
    name: "Deutsch",
    purpose: "Der deutschsprachige Raum: stell dich vor, bitte um Hilfe, finde Mitstreiter.",
    welcome: "{nom} ist dem Raum beigetreten. Willkommen!",
    empty: "Noch nichts hier. Eröffne das Gespräch: stell dich vor und sag, was du suchst.",
  },
  {
    slug: "salon-italiano",
    name: "Italiano",
    purpose: "La stanza italiana: presentati, chiedi una mano, trova collaborazioni.",
    welcome: "{nom} entra nella stanza. Diamo il benvenuto!",
    empty: "Ancora niente. Apri la conversazione: presentati e di' cosa cerchi.",
  },
  {
    slug: "salon-portugues",
    name: "Português",
    purpose: "A sala em português: apresenta-te, pede ajuda e encontra colaborações.",
    welcome: "{nom} juntou-se à sala. Damos-te as boas-vindas!",
    empty: "Ainda não há nada. Começa a conversa: apresenta-te e diz o que procuras.",
  },
  {
    slug: "salon-arabe",
    name: "العربية",
    purpose: "غرفة عربية: عرّف بنفسك، اطلب المساعدة، وابحث عن فرص تعاون.",
    welcome: "مرحبًا بـ {nom} في الغرفة!",
    empty: "لا شيء هنا بعد. ابدأ الحديث: عرّف بنفسك وقل عمّا تبحث.",
  },
] as const;

/** Groupes ordinaires : la langue de la plateforme. */
export const DEFAULT_ROOM_TEXTS = {
  welcome: "{nom} a rejoint le groupe. Bienvenue !",
  empty: "Le fil est vierge. Lance le sujet — présente-toi, dis ce que tu cherches.",
} as const;

/** Textes d'un salon : sa langue s'il en a une, le français sinon. */
export function roomTexts(slug: string): { welcome: string; empty: string } {
  return LANGUAGE_ROOMS.find((room) => room.slug === slug) ?? DEFAULT_ROOM_TEXTS;
}

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

// ---------- Appels au remplacement ----------
// Le fil où les membres nomment eux-mêmes les marques dont ils ne veulent
// plus. GeniGain héberge, n'écrit pas : les garde-fous sont donc des
// plafonds, une charte affichée, et le signalement — pas un filtrage a priori
// du propos, qui ferait de la plateforme l'éditeur de ce qu'elle laisse
// passer.

/** Appels qu'un même membre peut publier par tranche de 24 h (anti-spam). */
export const MAX_CALLS_PER_DAY = 3;

/**
 * Réponses qu'un membre peut poster par heure, tous appels confondus.
 * Les appels sont plafonnés à 3/jour, mais la discussion est la surface la
 * plus volumineuse ET la plus exposée : sur un sujet inflammable, quelqu'un
 * qui inonde vingt fils en dix minutes fait plus de dégâts qu'un appel de
 * trop. Assez haut pour une vraie conversation, assez bas pour couper le
 * pilonnage.
 */
export const MAX_CALL_COMMENTS_PER_HOUR = 15;

/** Réponses d'un même membre sous UN même appel — au-delà, c'est un monologue. */
export const MAX_COMMENTS_PER_CALL = 10;

/**
 * Commentaires rendus d'un coup sous un appel. Le plafond par membre ne borne
 * pas le total : cent personnes à dix réponses font mille lignes, chacune avec
 * ses boutons.
 *
 * On rend les plus RÉCENTES, et la page les réordonne pour se lire dans le
 * sens chronologique. Tronquer par la queue scellerait le fil : dix comptes
 * respectant tous les plafonds suffiraient à occuper les cent places, et la
 * réponse suivante — typiquement le droit de réponse de l'entreprise mise en
 * cause, que la page promet explicitement — serait enregistrée sans jamais
 * s'afficher.
 */
export const MAX_COMMENTS_RENDERED = 100;

// ---------- Témoignages vidéo ----------
// La vidéo circule plus loin qu'un texte et se modère moins vite : on la
// borne serré. Ces plafonds sont posés SUR LE JETON d'upload, côté serveur —
// un navigateur trafiqué ne peut pas les contourner.

/** Durée maximale d'un témoignage. Au-delà, ce n'est plus un témoignage. */
export const MAX_VIDEO_SECONDS = 60;

/**
 * Poids maximal accepté. Vercel Blob ne transcode pas : ce qui est envoyé est
 * ce qui sera servi. 30 Mo tient une minute correcte en 720p et garde la
 * facture de bande passante lisible.
 */
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

/**
 * Formats que TOUS les navigateurs savent lire. Le `.mov` d'iPhone
 * (`video/quicktime`) en est volontairement absent : rien ne transcode ici,
 * donc un `.mov` accepté serait stocké, facturé, et illisible pour la
 * majorité des visiteurs — un refus clair à l'envoi vaut mieux qu'une vidéo
 * fantôme. Restreindre l'attribut `accept` du champ de fichier pousse
 * d'ailleurs iOS à convertir en MP4 au moment de la sélection.
 */
export const VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm"] as const;

/** Témoignages qu'un membre peut publier par tranche de 24 h. */
export const MAX_VIDEOS_PER_DAY = 5;

/**
 * Plafond GLOBAL du stockage vidéo — la limite que les plafonds par membre ne
 * donnent pas : mille membres sages remplissent le disque aussi sûrement
 * qu'un seul qui triche. Le plan Vercel Hobby inclut 1 Go de Blob puis coupe
 * (rien ne se facture, tout s'arrête) ; on s'arrête avant lui, et la marge de
 * 224 Mo absorbe ce que la jauge ne voit pas encore : les jetons délivrés
 * dont la ligne en base n'existe pas, et les fichiers déposés jamais soumis.
 * À relever si le compte passe Pro.
 */
export const MAX_TOTAL_VIDEO_BYTES = 800 * 1024 * 1024;

/** Fraction du plafond global au-delà de laquelle les admins sont alertés. */
export const VIDEO_STORAGE_WARN_RATIO = 0.8;

/** Témoignages rendus d'un coup dans le fil — au-delà, on pagine au curseur. */
export const VIDEOS_PER_PAGE = 8;

export const MIN_VIDEO_CAPTION = 20;
export const MAX_VIDEO_CAPTION = 280;

/** Liens à l'appui d'un appel — au-delà, c'est un dossier, pas un appel. */
export const MAX_CALL_SOURCES = 3;

export const MIN_CALL_REASON = 80;
export const MAX_CALL_REASON = 1200;
export const MIN_CALL_WANTED = 40;
export const MAX_CALL_WANTED = 600;

/**
 * La charte, affichée au-dessus du formulaire et opposable en modération.
 * Écrite à la deuxième personne : c'est un engagement de l'auteur, pas des
 * conditions générales de plus.
 */
export const CALL_CHARTER = [
  "Vise une entreprise ou une marque — jamais une personne, un salarié, une communauté.",
  "Écris ce que tu sais, pas ce que tu supposes : les faits que tu avances, tu dois pouvoir les sourcer.",
  "Distingue le fait de l'opinion. « Ils font X » engage ta responsabilité ; « je ne veux plus leur donner mon argent » est ton droit.",
  "Aucun appel à la violence, au harcèlement, ni aucun propos discriminatoire.",
  "Termine par ce que tu veux à la place : cet appel sert à faire naître un remplaçant, pas à défouler.",
] as const;

/**
 * Ce qu'une préférence ne peut PAS couper. La CGU §12 engage la plateforme à
 * informer du motif l'auteur d'un appel retiré par la modération : un réglage
 * d'interface n'annule pas un engagement contractuel. Sans ça, un retrait
 * pouvait être exécuté sans qu'aucun avis n'existe nulle part — exactement le
 * silence que la pierre tombale était censée éviter.
 */
export const UNMUTABLE_NOTIFICATION_TYPES = [
  "BOYCOTT_REMOVED",
  // Une alerte de plafond de stockage est un signal d'exploitation, pas une
  // notification sociale : un admin qui la coupe découvrirait le direct
  // saturé en même temps que les membres.
  "STORAGE_ALERT",
] as const satisfies readonly NotificationType[];

export function isUnmutable(type: NotificationType): boolean {
  return (UNMUTABLE_NOTIFICATION_TYPES as readonly NotificationType[]).includes(type);
}

/** Libellés des types de notifications (préférences + affichage). */
/** Motifs de signalement proposés (le service refuse tout autre motif). */
export const REPORT_REASONS = [
  "Arnaque ou contenu trompeur",
  "Contenu inapproprié ou haineux",
  "Spam ou démarchage",
  "Accusation fausse ou non sourcée",
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
  GROUP_MESSAGE: "Nouveaux messages dans mes groupes",
  PARTNERSHIP: "Demandes de partenariat",
  COMMENT: "Commentaires sur mes projets",
  PROJECT_UPDATE: "Actus des projets que je soutiens ou suis",
  BOYCOTT_ANSWERED: "Un remplaçant se lance sur un appel que je soutiens",
  BOYCOTT_REMOVED: "Retrait d'un de mes appels par la modération",
  CALL_COMMENT: "Réponses sous mes appels",
  CALL_VIDEO: "Témoignages vidéo sous mes appels",
  // Non masquable, donc jamais listé dans les préférences ; seuls les admins
  // en reçoivent.
  STORAGE_ALERT: "Alerte de stockage vidéo (équipe)",
} as const satisfies Record<NotificationType, string>;
