import type { Dict } from "@/lib/i18n/t";

/**
 * Gabarits des notifications, rendus À LA LECTURE dans la langue du lecteur
 * (renderNotification). Les valeurs fr sont celles qui s'écrivaient en base
 * avant la refonte, au caractère près. Les guillemets typographiques vivent
 * ICI, jamais dans le code. `{actor}` est déjà résolu (« Quelqu'un » si
 * anonyme), `{money}` déjà formaté dans la locale du lecteur.
 */
export const notif = {
  "contribution.received.title": "{actor} a soutenu « {projectTitle} » ({money})",

  "contribution.confirmed.title": "Ta contribution de {money} à « {projectTitle} » est confirmée",
  "contribution.confirmed.body":
    "Les fonds rejoignent le séquestre du projet : ils seront débloqués étape par étape, sous le contrôle du vote des contributeurs — dont le tien. Si le projet n'aboutit pas, la part non débloquée revient automatiquement sur ta carte.",

  "refund.lateClose.title": "Ta contribution à « {projectTitle} » arrive après la clôture",
  "refund.lateClose.body":
    "La campagne s'est terminée entre-temps : ta contribution repart vers ta carte, nette des frais de carte que la banque ne restitue pas (GeniGain n'en garde aucun).",

  "refund.projectFailed.title": "Remboursement de {money} — « {projectTitle} »",
  "refund.projectFailed.body":
    "La campagne n'a pas abouti : ta part du séquestre restant repart vers ta carte (quelques jours selon ta banque), nette des frais de carte que la banque ne restitue pas — GeniGain n'en garde aucun.",

  "projectFunded.owner.title": "Objectif atteint pour « {projectTitle} » !",
  "projectFunded.owner.body":
    "La collecte est terminée — soumets la preuve de l'étape 1 pour débloquer les premiers fonds.",

  "projectFunded.supporter.title": "« {projectTitle} » est financé !",
  "projectFunded.supporter.body":
    "Les fonds seront débloqués étape par étape, sous le contrôle des contributeurs.",

  "proofToVote.title": "Preuve à examiner — « {projectTitle} »",
  "proofToVote.body": "Étape {order} : {milestoneTitle}. Ton vote débloque (ou non) les fonds.",

  "milestoneReleased.next.title": "Étape {order} validée — {money} débloqués",
  "milestoneReleased.next.body":
    "La communauté a validé ta preuve pour « {projectTitle} ». Prochaine étape : « {nextTitle} ». Le virement part sur ton compte Stripe.",

  "milestoneReleased.final.title": "Étape {order} validée — {money} débloqués",
  "milestoneReleased.final.body":
    "« {projectTitle} » est entièrement réalisé. Bravo ! Le virement final part sur ton compte Stripe.",

  "proofRejected.title": "Preuve refusée — « {projectTitle} »",
  "proofRejected.body": {
    one: "Étape {order} : la communauté n'a pas validé. Il te reste {count} tentative — renforce ta preuve (photos, liens publics).",
    other:
      "Étape {order} : la communauté n'a pas validé. Il te reste {count} tentatives — renforce ta preuve (photos, liens publics).",
  },

  "projectFailed.owner.title": "« {projectTitle} » n'a pas abouti",
  "projectFailed.owner.body":
    "{reason} L'échec n'est pas une sortie : des opportunités t'attendent sur le parcours rebond.",

  "failReason.stoppedByOwner": "Projet arrêté par son porteur.",
  "failReason.goalNotReached": "Objectif non atteint avant la fin de la campagne.",
  "failReason.proofsRefused": "Les preuves d'avancement ont été refusées par la communauté.",
  "failReason.milestonesNotRealized":
    "Étapes non réalisées dans les {days} jours suivant le financement.",

  "boycottAnswered.title": "Un remplaçant pour {target}",
  "boycottAnswered.body": "« {projectTitle} » se lance pour remplacer {target}.",

  "boycottRemoved.title": "Ton appel a été retiré",
  "boycottRemoved.body": "« {target} » — {reason}.",
  "boycottRemoved.defaultReason": "non conforme à la charte des appels",

  "callComment.title": "{actor} a répondu à ton appel sur {target}",
  "callComment.body": "{excerpt}",

  "callVideo.new.title": "{actor} a filmé un témoignage sur {target}",
  "callVideo.new.body": "{excerpt}",

  "callVideo.removed.title": "Ton témoignage filmé a été retiré",
  "callVideo.removed.body": "{excerpt}",

  "storageAlert.warn.title": "Stockage hébergé à {warnPct} % ({usedMo} Mo sur {capMo} Mo)",
  "storageAlert.warn.body":
    "Le magasin (témoignages du direct ET photos de profil) approche de son plafond. Le cockpit en donne la répartition. Faire le tri, ou relever le plafond côté hébergement avant qu'il ne refuse les dépôts.",

  "storageAlert.full.title":
    "Stockage hébergé saturé ({usedMo} Mo sur {capMo} Mo) — les dépôts sont refusés",
  "storageAlert.full.body":
    "Le prochain témoignage risquerait de dépasser le plafond : la délivrance de jetons d'upload est suspendue jusqu'à ce que de la place se libère.",

  "groupMessage.title": "{actor} a écrit dans {groupName}",

  "comment.title": "{actor} a commenté « {projectTitle} »",
  "comment.body": "{excerpt}",

  "projectUpdate.title": "Actu de « {projectTitle} » : {updateTitle}",

  "message.new.title": "Nouveau message de {actor}",

  "partnership.request.title": "Demande de partenariat de {brandName}",
  "partnership.request.body": "Pour « {projectTitle} ». Le copilote IA a préparé son analyse.",

  "partnership.requestBudget.title": "Demande de partenariat de {brandName}",
  "partnership.requestBudget.body":
    "Pour « {projectTitle} » · {budgetUsd} $ proposés. Le copilote IA a préparé son analyse.",

  "tombstone.CALL_VIDEO": "Ce témoignage a été retiré.",
  "tombstone.CALL_COMMENT": "Cette réponse a été retirée.",
  "tombstone.COMMENT": "Ce commentaire a été retiré.",
} as const satisfies Dict;
