import type { Messages } from "../types";

export const notif = {
  "contribution.received.title": "{actor} hat „{projectTitle}“ unterstützt ({money})",

  "support.thanks.title": "Danke! Deine Unterstützung von {money} für GeniGain ist angekommen",
  "support.thanks.body": "Es ist eine Spende an die Plattform, ohne Etappen oder Treuhand: sie finanziert die Entwicklung und die Begleitungsorte, jeder Überschuss fließt in die Projekte der Mitglieder. Sie zählt auch als Beitrag: du kannst jetzt dein eigenes Projekt starten.",
  "support.received.title": "{actor} hat GeniGain unterstützt ({money})",

  "contribution.confirmed.title": "Dein Beitrag von {money} zu „{projectTitle}“ ist bestätigt",
  "contribution.confirmed.body":
    "Die Gelder wandern ins Treuhandkonto des Projekts: Sie werden Etappe für Etappe freigegeben, unter Kontrolle der Abstimmung der Unterstützer — deiner eingeschlossen. Scheitert das Projekt, geht der nicht freigegebene Anteil automatisch zurück auf deine Karte.",

  "refund.lateClose.title": "Dein Beitrag zu „{projectTitle}“ kam nach dem Abschluss",
  "refund.lateClose.body":
    "Die Kampagne ist inzwischen beendet: Dein Beitrag geht zurück auf deine Karte, abzüglich der Kartengebühren, die die Bank nicht erstattet (GeniGain behält nichts).",

  "refund.projectFailed.title": "Rückerstattung von {money} — „{projectTitle}“",
  "refund.projectFailed.body":
    "Die Kampagne hat es nicht geschafft: Dein Anteil am verbleibenden Treuhandkonto geht zurück auf deine Karte (je nach Bank ein paar Tage), abzüglich der Kartengebühren, die die Bank nicht erstattet — GeniGain behält nichts.",

  "projectFunded.owner.title": "Ziel erreicht für „{projectTitle}“!",
  "projectFunded.owner.body":
    "Die Sammlung ist abgeschlossen — reiche den Nachweis für Etappe 1 ein, um die ersten Gelder freizuschalten.",

  "projectFunded.supporter.title": "„{projectTitle}“ ist finanziert!",
  "projectFunded.supporter.body":
    "Die Gelder werden Etappe für Etappe freigegeben, unter Kontrolle der Unterstützer.",

  "proofToVote.title": "Nachweis zu prüfen — „{projectTitle}“",
  "proofToVote.body": "Etappe {order}: {milestoneTitle}. Deine Stimme gibt die Gelder frei (oder nicht).",

  "milestoneReleased.next.title": "Etappe {order} bestätigt — {money} freigegeben",
  "milestoneReleased.next.body":
    "Die Community hat deinen Nachweis für „{projectTitle}“ bestätigt. Nächste Etappe: „{nextTitle}“. Die Überweisung geht auf dein Stripe-Konto.",

  "milestoneReleased.final.title": "Etappe {order} bestätigt — {money} freigegeben",
  "milestoneReleased.final.body":
    "„{projectTitle}“ ist vollständig umgesetzt. Glückwunsch! Die letzte Überweisung geht auf dein Stripe-Konto.",

  "proofRejected.title": "Nachweis abgelehnt — „{projectTitle}“",
  "proofRejected.body": {
    one: "Etappe {order}: Die Community hat nicht bestätigt. Dir bleibt {count} Versuch — stärke deinen Nachweis (Fotos, öffentliche Links).",
    other:
      "Etappe {order}: Die Community hat nicht bestätigt. Dir bleiben {count} Versuche — stärke deinen Nachweis (Fotos, öffentliche Links).",
  },

  "projectFailed.owner.title": "„{projectTitle}“ hat es nicht geschafft",
  "projectFailed.owner.body":
    "{reason} Scheitern ist kein Ausgang: Auf dem Rebound-Pfad warten Chancen auf dich.",

  "failReason.stoppedByOwner": "Projekt von seinem Träger gestoppt.",
  "failReason.goalNotReached": "Ziel vor Kampagnenende nicht erreicht.",
  "failReason.proofsRefused": "Die Fortschrittsnachweise wurden von der Community abgelehnt.",
  "failReason.milestonesNotRealized":
    "Etappen nicht innerhalb von {days} Tagen nach der Finanzierung umgesetzt.",

  "boycottAnswered.title": "Ein Ersatz für {target}",
  "boycottAnswered.body": "„{projectTitle}“ startet, um {target} zu ersetzen.",

  "boycottRemoved.title": "Dein Aufruf wurde entfernt",
  "boycottRemoved.body": "„{target}“ — {reason}.",
  "boycottRemoved.defaultReason": "nicht konform mit der Aufruf-Charta",

  "callComment.title": "{actor} hat auf deinen Aufruf zu {target} geantwortet",
  "callComment.body": "{excerpt}",

  "callVideo.new.title": "{actor} hat einen Erfahrungsbericht zu {target} gefilmt",
  "callVideo.new.body": "{excerpt}",

  "callVideo.removed.title": "Dein gefilmter Erfahrungsbericht wurde entfernt",
  "callVideo.removed.body": "{excerpt}",

  "storageAlert.warn.title": "Gehosteter Speicher bei {warnPct} % ({usedMo} MB von {capMo} MB)",
  "storageAlert.warn.body":
    "Der Speicher (Live-Berichte UND Profilfotos) nähert sich seiner Obergrenze. Das Cockpit zeigt die Aufteilung. Aufräumen — oder die Hosting-Grenze anheben, bevor Uploads abgelehnt werden.",

  "storageAlert.full.title":
    "Gehosteter Speicher voll ({usedMo} MB von {capMo} MB) — Uploads werden abgelehnt",
  "storageAlert.full.body":
    "Der nächste Bericht könnte die Grenze sprengen: Die Ausgabe von Upload-Tokens ist ausgesetzt, bis Platz frei wird.",

  "securityAlert.loginBurst.title": "Welle fehlgeschlagener Anmeldungen: {count} in {minutes} Min.",
  "securityAlert.loginBurst.body": "Jemand probiert Passwörter in großem Stil aus. Die Sperren pro Konto und pro Adresse greifen; hält es an, die Vercel-Firewall aktivieren und das Protokoll prüfen.",
  "securityAlert.dispute.title": "Bankstreitfall eröffnet ({reason}) — {count} Beitrag/Beiträge eingefroren",
  "securityAlert.dispute.body": "Ein Beitragender ficht seine Zahlung bei seiner Bank an. Sein Beitrag zählt nicht mehr bei Abstimmungen und kann nicht mehr ausgezahlt werden. Im Stripe-Dashboard auf den Streitfall antworten.",
  "securityAlert.translationSaturated.title": "Automatische Übersetzung für diesen Monat ausgeschöpft",
  "securityAlert.translationSaturated.body": "Die Zeichengrenze ist erreicht: „Übersetzen“ antwortet bis nächsten Monat mit „ausgelastet“. Eine ungewöhnliche Spitze kann Missbrauch sein — die Tabelle TranslationUsage zeigt es.",

  "groupMessage.title": "{actor} hat in {groupName} geschrieben",

  "comment.title": "{actor} hat „{projectTitle}“ kommentiert",
  "comment.body": "{excerpt}",

  "projectUpdate.title": "Update von „{projectTitle}“: {updateTitle}",

  "message.new.title": "Neue Nachricht von {actor}",

  "partnership.request.title": "Partnerschaftsanfrage von {brandName}",
  "partnership.request.body": "Für „{projectTitle}“. Der KI-Copilot hat seine Analyse vorbereitet.",

  "partnership.requestBudget.title": "Partnerschaftsanfrage von {brandName}",
  "partnership.requestBudget.body":
    "Für „{projectTitle}“ · {budgetUsd} $ angeboten. Der KI-Copilot hat seine Analyse vorbereitet.",

  "tombstone.CALL_VIDEO": "Dieser Erfahrungsbericht wurde entfernt.",
  "tombstone.CALL_COMMENT": "Diese Antwort wurde entfernt.",
  "tombstone.COMMENT": "Dieser Kommentar wurde entfernt.",
} satisfies Messages["notif"];
