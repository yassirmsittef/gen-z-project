import type { Dict } from "@/lib/i18n/t";

/**
 * Namespace `project` — création/édition de projet, contribution, étapes de
 * déblocage (timeline + preuves), cockpit de campagne, boutons d'arrêt et de
 * retrait, commentaires, actus, suivi, carte projet.
 * (Les libellés partagés CATEGORY_LABELS / STATUS_LABELS restent dans leurs
 * constantes — voir lot dédié.)
 */
export const project = {
  // ——— CreateProjectForm ———
  "createProjectForm.answersCallLabel": "Tu réponds à un appel",
  "createProjectForm.replaceTarget": "Remplacer {target}",
  "createProjectForm.quotedWanted": "« {wanted} »",
  "createProjectForm.answersCallHelp":
    "C'est le cahier des charges écrit par la personne qui a lancé l'appel. Ton projet sera déclaré remplaçant dès sa création, et tous ses soutiens seront prévenus.",
  "createProjectForm.projectSection": "Ton projet",
  "createProjectForm.titleLabel": "Titre",
  "createProjectForm.titlePlaceholder": "Ex : EP 5 titres — LUNE NOIRE",
  "createProjectForm.pitchLabel": "Pitch (140 caractères max)",
  "createProjectForm.pitchPlaceholder": "Une phrase qui donne envie de te financer.",
  "createProjectForm.descriptionLabel": "Description",
  "createProjectForm.descriptionPlaceholder":
    "Raconte : c'est quoi, pour qui, pourquoi toi, et à quoi servira l'argent (50 caractères min).",
  "createProjectForm.categoryLabel": "Catégorie",
  "createProjectForm.categoryPlaceholder": "Choisir…",
  "createProjectForm.currencyLabel": "Devise du projet",
  "createProjectForm.goalLabel": "Objectif ({currency})",
  "createProjectForm.durationLabel": "Durée de campagne ({min}–{max} jours)",
  "createProjectForm.skillsLabel": "Compétences recherchées (optionnel)",
  "createProjectForm.skillsPlaceholder": "ex : montage, mix, photo — séparées par des virgules",
  "createProjectForm.skillsHelp": "On oriente vers ton projet les membres qui ont ces compétences.",
  "createProjectForm.coverLabel": "Visuel de couverture (URL, optionnel)",
  "createProjectForm.milestonesSection": "Étapes de déblocage",
  "createProjectForm.milestonesHelp":
    "Chaque étape débloque un montant en {currency}, sur preuve validée par le vote pondéré de tes contributeurs. La somme doit égaler ton objectif. Une fois financé, tu as {days} jours pour tout réaliser et faire valider — au-delà, le reste du séquestre est remboursé aux contributeurs.",
  "createProjectForm.milestonesHelpStrong": "0 % de commission GeniGain",
  "createProjectForm.milestonesHelpAfterStrong":
    "— seuls les frais bancaires sont déduits des versements.",
  "createProjectForm.milestoneNumber": "Étape {number}",
  "createProjectForm.removeMilestoneTitle": "Supprimer cette étape",
  "createProjectForm.milestoneTitleLabel": "Titre",
  "createProjectForm.milestoneTitlePlaceholder": "Ex : Maquette terminée",
  "createProjectForm.milestoneAmountLabel": "Montant ({currency})",
  "createProjectForm.milestoneDeliverableLabel": "Ce que tu livreras",
  "createProjectForm.milestoneDeliverablePlaceholder":
    "Ce que les contributeurs pourront vérifier à cette étape.",
  "createProjectForm.addMilestone": "Ajouter une étape",
  "createProjectForm.submitPending": "Création…",
  "createProjectForm.submit": "Lancer mon projet",

  // ——— EditProjectForm ———
  "editProjectForm.titleLabel": "Titre",
  "editProjectForm.titleHelp":
    "L'adresse de la page ne change pas : les liens déjà partagés continuent de marcher.",
  "editProjectForm.pitchLabel": "Pitch (140 caractères max)",
  "editProjectForm.descriptionLabel": "Description",
  "editProjectForm.categoryLabel": "Catégorie",
  "editProjectForm.coverLabel": "Visuel de couverture (URL, optionnel)",
  "editProjectForm.skillsLabel": "Compétences recherchées (optionnel)",
  "editProjectForm.skillsPlaceholder": "ex : montage, mix, photo — séparées par des virgules",
  "editProjectForm.submitPending": "Enregistrement…",
  "editProjectForm.submit": "Enregistrer les modifications",

  // ——— ContributeForm ———
  "contributeForm.freeAmountLabel": "Montant libre ({currency})",
  "contributeForm.anonymousStrong": "Contribuer anonymement",
  "contributeForm.anonymousRest":
    "— ton nom n'apparaîtra ni sur le projet, ni au porteur, ni dans le fil d'activité.",
  "contributeForm.redirecting": "Redirection vers le paiement…",
  "contributeForm.submit": "Contribuer {amount}",
  "contributeForm.feeStrong": "0 % de commission GeniGain",
  "contributeForm.feeRest":
    "— seuls les frais de carte (fixés par Stripe, ni vus ni touchés par GeniGain) s'appliquent.",
  "contributeForm.escrowIntro":
    "Paiement sécurisé Stripe. Fonds sous séquestre, débloqués étape par étape par le vote des contributeurs. Si la campagne n'aboutit pas, tu es remboursé",
  "contributeForm.escrowStrong": "net des frais de carte",
  "contributeForm.escrowAfterStrong":
    ": Stripe ne les restitue pas, GeniGain n'en garde aucun.",
  "contributeForm.feesLink": "Détail des frais",

  // ——— MilestoneTimeline ———
  "milestoneTimeline.statusLocked": "Verrouillée",
  "milestoneTimeline.statusAwaitingProof": "Preuve attendue",
  "milestoneTimeline.statusUnderReview": "Vote en cours",
  "milestoneTimeline.statusReleased": "Fonds débloqués",
  "milestoneTimeline.proofCounter": "Preuve {index}/{max}",
  "milestoneTimeline.proofRejected": "Refusée",
  "milestoneTimeline.proofApproved": "Validée",
  "milestoneTimeline.proofPending": "Vote en cours",
  "milestoneTimeline.proofImageAlt": "Preuve d'avancement",
  "milestoneTimeline.majorityAt": "majorité à {amount}",
  "milestoneTimeline.alreadyVoted": "Tu as voté",
  "milestoneTimeline.approve": "Valider",
  "milestoneTimeline.reject": "Refuser",
  "milestoneTimeline.awaitingOwnerProof":
    "En attente de la preuve d'avancement du porteur...",

  // ——— ProofForm ———
  "proofForm.heading": "Soumets ta preuve d'avancement",
  "proofForm.lastAttempt": "Dernière tentative — sois convaincant·e !",
  "proofForm.contentLabel": "Ce que tu as réalisé",
  "proofForm.contentPlaceholder":
    "Décris concrètement ce qui a été fait pour cette étape (20 caractères min)…",
  "proofForm.linksLabel": "Liens (un par ligne, optionnel)",
  "proofForm.linksPlaceholder": "https://demo.exemple.fr\nhttps://github.com/…",
  "proofForm.imagesLabel": "Images (une URL par ligne, optionnel)",
  "proofForm.imagesPlaceholder": "https://.../photo-atelier.jpg",
  "proofForm.submitPending": "Envoi…",
  "proofForm.submit": "Envoyer la preuve au vote",

  // ——— CampaignCockpit ———
  "campaignCockpit.heading": "Pilotage — visible par toi seul·e",
  "campaignCockpit.dailyCollection": "Collecte par jour",
  "campaignCockpit.emptyState":
    "Pas encore de contribution — partage ton lien, le compteur démarre ici.",
  "campaignCockpit.sparklineAria": {
    one: "Collecte par jour depuis le lancement : {amount} en {count} jour.",
    other: "Collecte par jour depuis le lancement : {amount} en {count} jours.",
  },
  "campaignCockpit.todayPoint": "{amount} aujourd'hui",
  "campaignCockpit.paceLabel": "Rythme pour y arriver",
  "campaignCockpit.perDay": "{amount}/j",
  "campaignCockpit.goalReached": "Objectif atteint",
  "campaignCockpit.milestonesValidated": "Étapes validées",
  "campaignCockpit.contributorsLabel": "Contributeur·rices",
  "campaignCockpit.followersLabel": "Suiveur·ses",
  "campaignCockpit.convertedShare": "dont {percent} % ont contribué",
  "campaignCockpit.realizeBefore": "À réaliser avant",
  "campaignCockpit.daysToDeadline": "J-{days}",

  // ——— CancelProjectButton ———
  // UNE phrase, pas six fragments : l'ordre des mots appartient à chaque
  // langue (l'allemand et l'arabe ne suivent pas la syntaxe française).
  "cancelProjectButton.confirmBody":
    "En confirmant, le projet passe définitivement « non abouti » et jusqu'à {amount} repart vers {contributors} (net des frais de carte, quelques jours selon leur banque). Il n'y a pas de retour en arrière.",
  "cancelProjectButton.contributorCount": {
    one: "{count} contributeur",
    other: "{count} contributeurs",
  },
  "cancelProjectButton.contributorsGeneric": "les contributeurs",
  "cancelProjectButton.confirmPending": "Arrêt en cours…",
  "cancelProjectButton.confirmSubmit": "Oui, arrêter et rembourser",
  "cancelProjectButton.cancel": "Annuler",
  "cancelProjectButton.arm": "Arrêter le projet",

  // ——— DeleteProjectButton ———
  "deleteProjectButton.confirmPending": "Retrait…",
  "deleteProjectButton.confirmSubmit": "Oui, retirer définitivement",
  "deleteProjectButton.cancel": "Annuler",
  "deleteProjectButton.arm": "Retirer le projet",

  // ——— CommentForm ———
  "commentForm.placeholder": "Encourage, pose une question, propose un coup de main…",
  "commentForm.ariaLabel": "Ton commentaire",
  "commentForm.submitPending": "Envoi…",
  "commentForm.submit": "Commenter",

  // ——— ProjectUpdateForm ———
  "projectUpdateForm.titleLabel": "Titre de l'actu",
  "projectUpdateForm.titlePlaceholder": "ex : Le matériel est arrivé !",
  "projectUpdateForm.bodyLabel": "Quoi de neuf ?",
  "projectUpdateForm.bodyPlaceholder":
    "Avancées, coulisses, remerciements... tes contributeurs seront notifiés.",
  "projectUpdateForm.success": "Actu publiée — contributeurs notifiés.",
  "projectUpdateForm.submitPending": "Publication…",
  "projectUpdateForm.submit": "Publier l'actu",

  // ——— FollowButton ———
  "followButton.unfollowTitle": "Ne plus suivre ce projet",
  "followButton.followTitle": "Suivre ce projet",
  "followButton.following": "Suivi",
  "followButton.follow": "Suivre",

  // ——— ProjectCard ———
  "projectCard.replaces": "Remplace {targets}",
  "projectCard.contributions": {
    one: "{count} contribution",
    other: "{count} contributions",
  },
  "projectCard.daysLeft": "{count} j restants",
} as const satisfies Dict;
