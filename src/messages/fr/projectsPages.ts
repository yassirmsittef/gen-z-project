import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `projectsPages` — les 5 pages serveur de /projects :
 * liste, création (gate compris), fiche projet, modification, partenariat.
 * Clés préfixées par page : meta.*, hero/search/filters/sort/results/empty
 * (liste), gate/form (création), detail.*, edit.*, partnership.*.
 */
export const projectsPages = {
  // ---------- Métadonnées (une clé par page du namespace) ----------
  "meta.listTitle": "Projets",
  "meta.newTitle": "Lancer un projet",
  "meta.detailNotFound": "Projet introuvable",
  "meta.editTitle": "Modifier le projet",
  "meta.partnershipTitle": "Proposer un partenariat",

  // ---------- /projects — la liste ----------
  "hero.title": "Les projets de la communauté",
  "hero.subtitle": "Chaque contribution compte — et c'est ton ticket pour lancer le tien.",
  "search.placeholder": "Rechercher un projet, une idée, un mot-clé…",
  "search.ariaLabel": "Rechercher un projet",
  "search.submit": "Rechercher",
  "filters.categories": "Catégories",
  "filters.allCategories": "Toutes catégories",
  "filters.statusesAndSort": "Statuts et tri",
  "filters.allStatuses": "Tous statuts",
  "filters.sortLabel": "Tri",
  "sort.recent": "Plus récents",
  "sort.suivis": "Plus suivis",
  "sort.fin": "Bientôt terminés",
  "sort.finances": "Plus financés",
  "results.count": {
    one: "{count} résultat",
    other: "{count} résultats",
  },
  "results.forQuery": " pour « {query} »",
  "empty.title": "Aucun projet ne correspond.",
  "empty.body": "Essaie un autre mot-clé, change de filtre — ou sois le premier à te lancer.",

  // ---------- /projects/new — le gate puis le formulaire ----------
  "gate.title": "D'abord, contribue",
  "gate.body":
    "Ici, tout le monde met la main à la pâte avant de demander : il faut {required} de contributions cumulées (toutes devises confondues, converties au jour du paiement) pour débloquer la création de ton projet.",
  "gate.progressLabel": "Ta progression",
  "gate.percent": "{percent} %",
  "gate.progressAria": "Progression vers le droit de poster : {percent} %",
  // UNE phrase par clé : l'ordre des mots appartient à chaque langue.
  "gate.progress": "{current} sur {required} — {left} restants.",
  "gate.callLabel": "Tu voulais remplacer",
  "gate.callBody": "L'appel t'attend : contribue d'abord, puis reviens le prendre.",
  "gate.callLink": "Revoir l'appel",
  "gate.explore": "Explorer les projets",
  "gate.suggestionsTitle": "Ils attendent ton soutien",
  "form.title": "Lance ton projet",
  "form.titleReplace": "Remplace {target}",
  "form.subtitle":
    "Sois transparent·e sur ton plan : c'est lui que la communauté finance, étape par étape.",
  "form.subtitleReplace":
    "Quelqu'un a décrit ce qu'il achèterait à la place. Montre comment tu comptes le construire, étape par étape.",

  // ---------- /projects/[slug] — la fiche projet ----------
  "detail.failedTitle": "Ce projet n'a pas abouti",
  "detail.failedBody": "Les contributeurs ont été remboursés sur le séquestre restant.",
  "detail.failedRebound": "Rebondir maintenant →",
  "detail.failedViewer":
    "L'échec fait partie du jeu — le créateur est réorienté vers de nouvelles opportunités.",
  "detail.completedTitle": "Projet réalisé",
  "detail.completedBody":
    "Toutes les étapes ont été validées par la communauté et les fonds intégralement débloqués.",
  "detail.replaces": "Se lance pour remplacer",
  "detail.followLoginTitle": "Connecte-toi pour suivre ce projet",
  "detail.follow": "Suivre",
  "detail.followerCount": {
    one: "{count} suivi",
    other: "{count} suivis",
  },
  "detail.contact": "Contacter",
  "detail.brandPartnership": "Partenariat marque",
  "detail.ownerNotReadyOwner": "Pour recevoir des contributions, active d'abord tes versements : l'argent de tes contributeurs arrive directement sur ton compte Stripe, sous séquestre, et il lui faut une adresse.",
  "detail.ownerNotReadyCta": "Activer mes versements",
  "detail.ownerNotReadyVisitor": "Ce porteur n'a pas encore activé la réception des fonds : on ne peut pas contribuer pour l'instant.",
  "detail.edit": "Modifier",
  "detail.coverAlt": "Visuel du projet {title}",
  "detail.aboutTitle": "Le projet",
  "detail.skillsLabel": "Compétences recherchées",
  "detail.milestonesTitle": "Étapes & preuves d'avancement",
  "detail.milestonesHint":
    "Les fonds sont débloqués étape par étape : le créateur soumet une preuve, les contributeurs votent.",
  "detail.realizeBefore": "à réaliser avant le {date} · J-{days}",
  "detail.updatesTitle": "Actus du projet",
  "detail.updatesByYou": "Les nouvelles du terrain, racontées par toi.",
  "detail.updatesBy": "Les nouvelles du terrain, racontées par {name}.",
  "detail.updatesEmpty": "Pas encore d'actu — elles apparaîtront ici au fil du projet.",
  "detail.updateDelete": "Supprimer cette actu",
  "detail.commentsTitle": "Discussion",
  "detail.commentsHint": "Questions, encouragements, coups de main — la communauté du projet.",
  "detail.commentsLogin": "Connecte-toi",
  "detail.commentsLoginSuffix": "pour participer à la discussion.",
  "detail.commentsEmpty": "Personne n'a encore commenté — lance la discussion !",
  "detail.commentReport": "Signaler ce commentaire",
  "detail.commentDelete": "Supprimer ce commentaire",
  "detail.ofGoal": "sur {goal}",
  "detail.contributorCount": {
    one: "{count} contributeur",
    other: "{count} contributeurs",
  },
  "detail.daysLeft": "{count} j restants",
  "detail.campaignEnded": "Campagne terminée le {date}",
  "detail.releasedNote":
    "débloqués sur {raised} — le reste est sous séquestre jusqu'à validation des étapes.",
  "detail.ownerShareHint": "C'est ton projet — partage-le pour atteindre ton objectif.",
  "detail.loginToContribute": "Connecte-toi pour contribuer",
  "detail.contributorsTitle": "Contributeurs",
  "detail.moreContributors": "+ {count} autres",
  "detail.anonymous": "Contributions anonymes",

  // ---------- /projects/[slug]/modifier ----------
  "edit.back": "Retour au projet",
  "edit.title": "Modifier le projet",
  "edit.frozenLabel": "Cadre financier figé",
  "edit.frozenSummary": {
    one: "Objectif {goal} · fin de campagne le {date} · {count} étape ({amounts})",
    other: "Objectif {goal} · fin de campagne le {date} · {count} étapes ({amounts})",
  },
  "edit.frozenHint":
    "Les contributions sont engagées sur ces règles : objectif, étapes et durée ne peuvent plus changer.",
  "edit.frozenClosed":
    "La campagne est terminée : le contenu du projet est figé. Il reste consultable par la communauté, avec ses preuves et son historique.",
  "edit.dangerLabel": "Zone de retrait",
  "edit.deleteHint":
    "Personne n'a encore contribué : tu peux retirer définitivement ce projet. Étapes, commentaires et abonnés partiront avec lui — il n'y a pas de retour en arrière.",
  "edit.cancelMembers": {
    one: "{count} membre a contribué.",
    other: "{count} membres ont contribué.",
  },
  "edit.cancelBodyRefund":
    "Tu ne peux plus le retirer purement, mais tu peux l'arrêter : il passera « non abouti » et {amount} — le séquestre restant — seront remboursés aux contributeurs.",
  "edit.cancelBodyNoRefund":
    "Tu ne peux plus le retirer purement, mais tu peux l'arrêter : il passera « non abouti » et {amount} — le séquestre restant — seraient remboursés aux contributeurs.",
  "edit.cancelReleased":
    "Les {released} déjà débloqués par les votes ne sont pas concernés.",
  "edit.closedHint":
    "Ce projet a terminé son cycle : il reste consultable par la communauté, avec son historique.",

  // ---------- /projects/[slug]/partenariat ----------
  "partnership.back": "Retour au projet",
  "partnership.title": "Proposer un partenariat",
  "partnership.intro":
    "Vous représentez une marque et souhaitez collaborer avec {owner} autour de « {title} » ? Décrivez votre proposition — plus elle est précise et transparente, plus vite vous aurez une réponse.",
} as const satisfies Dict;
