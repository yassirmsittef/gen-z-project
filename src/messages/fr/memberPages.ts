import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `memberPages` — les pages de l'espace membre (lot 7) :
 * dashboard, notifications, chat (fils privés, groupes, membres),
 * profil public, partenariats (boîte, détail, suivi marque).
 */
export const memberPages = {
  // <title> des pages
  "meta.dashboardTitle": "Dashboard",
  "meta.notificationsTitle": "Notifications",
  "meta.chatTitle": "Chat",
  "meta.groupsTitle": "Groupes",
  "meta.groupTitle": "Groupe",
  "meta.groupMembersTitle": "Membres du groupe",
  "meta.profileNotFound": "Profil introuvable",
  "meta.profileFallback": "Profil",
  "meta.profileDescription": "{name} sur GeniGain : réputation, projets et compétences.",
  "meta.profileDescriptionCity":
    "{name} sur GeniGain — {city} : réputation, projets et compétences.",
  "meta.partnershipsTitle": "Partenariats",
  "meta.partnershipRequestTitle": "Demande de partenariat",
  "meta.trackingTitle": "Suivi de votre demande",

  // dashboard/page.tsx
  "dashboard.connectDoneLive":
    "Configuration transmise à Stripe — tes versements s'activent dès validation.",
  "dashboard.connectDoneTest":
    "Configuration transmise à Stripe — tes versements s'activent dès validation (souvent immédiat en mode test).",
  "dashboard.connectRefresh":
    "La session Stripe a expiré — relance la configuration des versements quand tu veux.",
  "dashboard.greeting": "Salut {name}",
  "dashboard.tagline": "QG personnel · systèmes opérationnels",
  "dashboard.editProfile": "Modifier mon profil",
  "dashboard.adminCockpit": "Cockpit admin",
  "dashboard.reportsToHandle": {
    one: "{count} signalement à traiter",
    other: "{count} signalements à traiter",
  },
  "dashboard.nothingToModerate": "rien à modérer",
  "dashboard.failedTitle": "Un projet n'a pas abouti — et maintenant ?",
  "dashboard.failedBody":
    "L'échec n'est pas une sortie. Découvre d'autres opportunités et repars plus fort·e.",
  "dashboard.seeOpportunities": "Voir les opportunités →",
  "dashboard.statReputation": "Réputation",
  "dashboard.nextLevelAt": "{label} à {target}",
  "dashboard.maxLevel": "Niveau maximal atteint",
  "dashboard.statTowardProject": "Vers ton projet",
  "dashboard.gateExempt": "Fondateur — tu postes sans le gate",
  "dashboard.gateReached": "Gate débloqué — tu peux poster",
  "dashboard.gateRemaining": "{amount} avant de pouvoir poster",
  "dashboard.statSupports": "Soutiens",
  "dashboard.communityPillar": "Pilier de la communauté",
  "dashboard.supportGoal": "Objectif : 10 projets soutenus",
  "dashboard.trajectoryTitle": "Ta trajectoire",
  "dashboard.pendingPartnerships": {
    one: "{count} demande de partenariat en attente de ta réponse —",
    other: "{count} demandes de partenariat en attente de ta réponse —",
  },
  "dashboard.seeWithCopilot": "voir avec le copilote IA →",
  "dashboard.myProjects": "Mes projets",
  "dashboard.partnershipsLink": "Partenariats",
  "dashboard.partnershipsLinkCount": "Partenariats ({count})",
  "dashboard.launchProject": "Lancer un projet",
  "dashboard.noProjects":
    "Pas encore de projet. Contribue à un projet pour débloquer la création du tien.",
  "dashboard.myCalls": "Mes appels",
  "dashboard.publishCall": "Publier un appel",
  "dashboard.replaceTarget": "Remplacer {target}",
  "dashboard.callVoices": "{count} voix",
  "dashboard.callAnswerers": {
    one: "{count} remplaçant",
    other: "{count} remplaçants",
  },
  "dashboard.callNoAnswerers": "aucun remplaçant pour l'instant",
  "dashboard.followedProjects": "Projets suivis",
  "dashboard.myContributions": "Mes contributions",
  "dashboard.noContributions": "Aucune contribution pour l'instant.",
  "dashboard.findProject": "Trouve un projet à soutenir →",
  "dashboard.refunded": "remboursée",
  "dashboard.myProfile": "Mon profil",
  "dashboard.mySkills": "Mes compétences",
  "dashboard.myPayouts": "Mes versements",
  "dashboard.security": "Sécurité",
  "dashboard.myData": "Mes données",
  "dashboard.myDataBody":
    "Tout ce que tu as confié à GeniGain (profil, projets, contributions, votes, messages envoyés…), en un fichier JSON — droit à la portabilité.",
  "dashboard.downloadMyData": "Télécharger mes données",

  // notifications/page.tsx
  "notifications.title": "Notifications",
  "notifications.newSince": {
    one: "{count} nouvelle depuis ton dernier passage",
    other: "{count} nouvelles depuis ton dernier passage",
  },
  "notifications.allCaughtUp": "Tout est à jour",
  "notifications.empty":
    "Rien pour l'instant. Contributions reçues, preuves à voter, étapes débloquées, messages, commentaires, actus et demandes de partenariat arriveront ici.",

  // chat/page.tsx + chat/[userId]/page.tsx — en-tête commun
  "chatHeader.title": "Chat",
  "chatHeader.tagline": "Entraide entre porteurs · collabs · coups de main",

  // chat/page.tsx
  "chatIndex.pickConversation":
    "Choisis une conversation — ou rejoins un groupe de ta catégorie pour parler à plusieurs.",
  "chatIndex.exploreGroups": "Explorer les groupes",

  // chat/[userId]/page.tsx
  "chatThread.allConversations": "Toutes mes conversations",
  "chatThread.olderMessages": "Messages plus anciens",
  "chatThread.startConversation":
    "Démarre la conversation — propose un coup de main, une collab, un échange de compétences.",
  "chatThread.backToLatest": "Revenir aux derniers messages",

  // chat/groupes/page.tsx
  "groupsDir.title": "Groupes",
  "groupsDir.tagline": "Un salon par envie · rangés dans les catégories des projets",
  "groupsDir.searchPlaceholder": "Chercher un salon (nom, sujet…)",
  "groupsDir.searchLabel": "Chercher un salon",
  "groupsDir.search": "Chercher",
  "groupsDir.categoriesLabel": "Catégories de groupes",
  "groupsDir.allCategories": "Toutes catégories",
  "groupsDir.noRoomForQuery": "Aucun salon ne parle de « {query} ».",
  "groupsDir.noRoomForQueryInCategory": "Aucun salon ne parle de « {query} » en {category}.",
  "groupsDir.noGroupInCategory": "Aucun groupe en {category} pour l'instant.",
  "groupsDir.noGroup": "Aucun groupe pour l'instant.",
  "groupsDir.tryAnotherWord": "Essaie un autre mot, ou ouvre le salon qui manque.",
  "groupsDir.openFirst": "Ouvre le premier — c'est souvent lui qui rassemble.",
  "groupsDir.officialRoomCategory": "Salon d'accueil · {category}",
  "groupsDir.openThread": "Ouvrir le fil",

  // chat/groupes/[slug]/page.tsx
  "groupThread.allGroups": "Tous les groupes",
  "groupThread.membersCount": {
    one: "{count} membre",
    other: "{count} membres",
  },
  "groupThread.meta": "{category} · {members}",
  "groupThread.metaOfficial": "Salon d'accueil · {category} · {members}",
  "groupThread.animatedBy": "Animé par",
  "groupThread.openedOn": "· ouvert le {date}",
  "groupThread.seeMembers": "Voir les {count} membres",
  "groupThread.membersAria": "{count} membres",
  "groupThread.olderMessages": "Messages plus anciens",
  "groupThread.backToLatest": "Revenir aux derniers messages",
  "groupThread.membersOnly": "Le fil est réservé aux membres",
  "groupThread.joinToRead":
    "Rejoins le groupe pour lire les échanges et écrire — tu peux en repartir quand tu veux.",

  // chat/groupes/[slug]/membres/page.tsx
  "groupMembers.backToThread": "Retour au fil",
  "groupMembers.membersCount": {
    one: "{count} membre",
    other: "{count} membres",
  },
  "groupMembers.bansCount": {
    one: "· {count} exclu",
    other: "· {count} exclus",
  },
  "groupMembers.owner": "Animateur",
  "groupMembers.manager": "Gérant·e",
  "groupMembers.since": "depuis le {date}",
  "groupMembers.thisMember": "ce membre",
  "groupMembers.exclusions": "Exclusions",
  "groupMembers.noBans":
    "Personne n'a été exclu de ce salon. Une exclusion retire la personne et lui ferme la porte ; ses messages, eux, restent.",
  "groupMembers.bannedOn": "exclu le {date}",

  // u/[id]/page.tsx
  "profile.seeOnGlobe": "Voir sur le globe Communauté",
  "profile.memberSince": "Membre depuis {date}",
  "profile.editProfile": "Modifier mon profil",
  "profile.sendMessage": "Envoyer un message",
  "profile.reportProfile": "Signaler ce profil",
  "profile.projectsLaunched": "Projets lancés",
  "profile.contributions": "Contributions",
  "profile.investedInCommunity": "Investis dans la communauté",
  "profile.votesOnProofs": "Votes sur des preuves",
  "profile.theirProjects": "Ses projets",
  "profile.recentActivity": "Activité récente",
  "profile.repPoints": "{delta} rép.",

  // partenariats — commun aux trois écrans (boîte, détail, suivi marque)
  "partnership.budgetUsd": "{amount} $",

  // partenariats/page.tsx
  "partnershipsInbox.title": "Partenariats",
  "partnershipsInbox.meta": {
    one: "{count} demande reçue · {pending} en attente · copilote IA avant chaque réponse",
    other: "{count} demandes reçues · {pending} en attente · copilote IA avant chaque réponse",
  },
  "partnershipsInbox.emptyBody":
    "Aucune demande pour l'instant. Les marques peuvent te proposer un partenariat depuis la page de chacun de tes projets (« Partenariat marque »).",
  "partnershipsInbox.emptyHint":
    "Quand une demande arrive, le copilote IA t'aide à vérifier qu'elle est fiable et équitable avant de répondre.",

  // partenariats/[id]/page.tsx
  "partnershipDetail.allRequests": "Toutes les demandes",
  "partnershipDetail.forQuoteOpen": "Pour «",
  "partnershipDetail.forQuoteClose": "» · reçue le {date}",
  "partnershipDetail.noWebsite": "Aucun site web fourni",
  "partnershipDetail.contact": "Contact",
  "partnershipDetail.notSpecified": "Non précisé",
  "partnershipDetail.compensation": "Contrepartie",
  "partnershipDetail.proposal": "Proposition",
  "partnershipDetail.deliverables": "Ce que la marque attend",
  "partnershipDetail.replyToBrand": "Répondre à la marque",
  "partnershipDetail.yourReply": "Ta réponse ({status})",
  "partnershipDetail.yourReplyDated": "Ta réponse ({status} le {date})",

  // partenariats/suivi/[token]/page.tsx — page publique marque (vouvoiement)
  "tracking.sentBanner":
    "Demande envoyée ! Conservez précieusement le lien de cette page : c'est ici que la réponse s'affichera.",
  "tracking.title": "Votre demande de partenariat",
  "tracking.pairing": "× «",
  "tracking.sentOn": "» · envoyée le {date}",
  "tracking.compensationProposed": "Contrepartie proposée : {compensation}",
  "tracking.pendingTitle": "En cours d'examen",
  "tracking.pendingBody":
    "{name} étudie votre proposition. La réponse s'affichera sur cette page — pensez à la mettre dans vos favoris.",
  "tracking.accepted": "Partenariat accepté",
  "tracking.declined": "Proposition déclinée",
  "tracking.footerNote":
    "Vous représentez une autre marque ou souhaitez compléter votre demande ? Déposez une nouvelle proposition depuis la page du projet.",
} as const satisfies Dict;
