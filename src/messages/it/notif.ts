import type { Messages } from "../types";

export const notif = {
  "contribution.received.title": "{actor} ha sostenuto «{projectTitle}» ({money})",

  "contribution.confirmed.title": "Il tuo contributo di {money} a «{projectTitle}» è confermato",
  "contribution.confirmed.body":
    "I fondi entrano nel deposito del progetto: saranno sbloccati tappa dopo tappa, sotto il controllo del voto dei contributori — compreso il tuo. Se il progetto non va in porto, la parte non sbloccata torna automaticamente sulla tua carta.",

  "refund.lateClose.title": "Il tuo contributo a «{projectTitle}» è arrivato dopo la chiusura",
  "refund.lateClose.body":
    "La campagna si è conclusa nel frattempo: il tuo contributo torna sulla tua carta, al netto delle commissioni carta che la banca non restituisce (GeniGain non ne trattiene alcuna).",

  "refund.projectFailed.title": "Rimborso di {money} — «{projectTitle}»",
  "refund.projectFailed.body":
    "La campagna non è andata in porto: la tua parte del deposito restante torna sulla tua carta (qualche giorno a seconda della banca), al netto delle commissioni carta che la banca non restituisce — GeniGain non ne trattiene alcuna.",

  "projectFunded.owner.title": "Obiettivo raggiunto per «{projectTitle}»!",
  "projectFunded.owner.body":
    "La raccolta è terminata — invia la prova della tappa 1 per sbloccare i primi fondi.",

  "projectFunded.supporter.title": "«{projectTitle}» è finanziato!",
  "projectFunded.supporter.body":
    "I fondi saranno sbloccati tappa dopo tappa, sotto il controllo dei contributori.",

  "proofToVote.title": "Prova da esaminare — «{projectTitle}»",
  "proofToVote.body": "Tappa {order}: {milestoneTitle}. Il tuo voto sblocca (o no) i fondi.",

  "milestoneReleased.next.title": "Tappa {order} convalidata — {money} sbloccati",
  "milestoneReleased.next.body":
    "La community ha convalidato la tua prova per «{projectTitle}». Prossima tappa: «{nextTitle}». Il bonifico parte verso il tuo conto Stripe.",

  "milestoneReleased.final.title": "Tappa {order} convalidata — {money} sbloccati",
  "milestoneReleased.final.body":
    "«{projectTitle}» è interamente realizzato. Complimenti! Il bonifico finale parte verso il tuo conto Stripe.",

  "proofRejected.title": "Prova respinta — «{projectTitle}»",
  "proofRejected.body": {
    one: "Tappa {order}: la community non ha convalidato. Ti resta {count} tentativo — rafforza la tua prova (foto, link pubblici).",
    other:
      "Tappa {order}: la community non ha convalidato. Ti restano {count} tentativi — rafforza la tua prova (foto, link pubblici).",
  },

  "projectFailed.owner.title": "«{projectTitle}» non è andato in porto",
  "projectFailed.owner.body":
    "{reason} Il fallimento non è un'uscita: sul percorso di rimbalzo ti aspettano opportunità.",

  "failReason.stoppedByOwner": "Progetto fermato da chi lo portava avanti.",
  "failReason.goalNotReached": "Obiettivo non raggiunto entro la fine della campagna.",
  "failReason.proofsRefused": "Le prove di avanzamento sono state respinte dalla community.",
  "failReason.milestonesNotRealized":
    "Tappe non realizzate entro {days} giorni dal finanziamento.",

  "boycottAnswered.title": "Un sostituto per {target}",
  "boycottAnswered.body": "«{projectTitle}» si lancia per sostituire {target}.",

  "boycottRemoved.title": "Il tuo appello è stato ritirato",
  "boycottRemoved.body": "«{target}» — {reason}.",
  "boycottRemoved.defaultReason": "non conforme alla carta degli appelli",

  "callComment.title": "{actor} ha risposto al tuo appello su {target}",
  "callComment.body": "{excerpt}",

  "callVideo.new.title": "{actor} ha filmato una testimonianza su {target}",
  "callVideo.new.body": "{excerpt}",

  "callVideo.removed.title": "La tua testimonianza filmata è stata ritirata",
  "callVideo.removed.body": "{excerpt}",

  "storageAlert.warn.title": "Archiviazione ospitata al {warnPct}% ({usedMo} MB su {capMo} MB)",
  "storageAlert.warn.body":
    "Il magazzino (testimonianze della diretta E foto profilo) si avvicina al tetto. La cabina ne mostra la ripartizione. Fai pulizia, o alza il tetto lato hosting prima che rifiuti i caricamenti.",

  "storageAlert.full.title":
    "Archiviazione ospitata satura ({usedMo} MB su {capMo} MB) — i caricamenti sono rifiutati",
  "storageAlert.full.body":
    "La prossima testimonianza rischierebbe di superare il tetto: la consegna dei token di upload è sospesa finché non si libera spazio.",

  "groupMessage.title": "{actor} ha scritto in {groupName}",

  "comment.title": "{actor} ha commentato «{projectTitle}»",
  "comment.body": "{excerpt}",

  "projectUpdate.title": "Novità da «{projectTitle}»: {updateTitle}",

  "message.new.title": "Nuovo messaggio da {actor}",

  "partnership.request.title": "Richiesta di partnership da {brandName}",
  "partnership.request.body": "Per «{projectTitle}». Il copilota IA ha preparato la sua analisi.",

  "partnership.requestBudget.title": "Richiesta di partnership da {brandName}",
  "partnership.requestBudget.body":
    "Per «{projectTitle}» · {budgetUsd} $ proposti. Il copilota IA ha preparato la sua analisi.",

  "tombstone.CALL_VIDEO": "Questa testimonianza è stata ritirata.",
  "tombstone.CALL_COMMENT": "Questa risposta è stata ritirata.",
  "tombstone.COMMENT": "Questo commento è stato ritirato.",
} satisfies Messages["notif"];
