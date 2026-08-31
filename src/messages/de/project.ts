import type { Messages } from "../types";

/**
 * Namespace `project` — Projekt erstellen/bearbeiten, Beitrag, Freigabe-
 * Etappen (Timeline + Nachweise), Kampagnen-Cockpit, Stopp- und Rückzugs-
 * Buttons, Kommentare, Updates, Folgen, Projektkarte.
 * (Die geteilten Labels CATEGORY_LABELS / STATUS_LABELS bleiben in ihren
 * Konstanten — siehe eigenes Los.)
 */
export const project = {
  // ——— CreateProjectForm ———
  "createProjectForm.answersCallLabel": "Du antwortest auf einen Aufruf",
  "createProjectForm.replaceTarget": "{target} ersetzen",
  "createProjectForm.quotedWanted": "„{wanted}“",
  "createProjectForm.answersCallHelp":
    "Das ist das Briefing der Person, die den Aufruf gestartet hat. Dein Projekt wird schon bei der Erstellung zum Ersatz erklärt, und alle seine Unterstützer werden benachrichtigt.",
  "createProjectForm.projectSection": "Dein Projekt",
  "createProjectForm.titleLabel": "Titel",
  "createProjectForm.titlePlaceholder": "z. B. EP mit 5 Tracks — LUNE NOIRE",
  "createProjectForm.pitchLabel": "Pitch (max. 140 Zeichen)",
  "createProjectForm.pitchPlaceholder": "Ein Satz, der Lust macht, dich zu finanzieren.",
  "createProjectForm.descriptionLabel": "Beschreibung",
  "createProjectForm.descriptionPlaceholder":
    "Erzähl: Was ist es, für wen, warum du, und wofür wird das Geld gebraucht (mind. 50 Zeichen).",
  "createProjectForm.categoryLabel": "Kategorie",
  "createProjectForm.categoryPlaceholder": "Auswählen…",
  "createProjectForm.currencyLabel": "Währung des Projekts",
  "createProjectForm.goalLabel": "Ziel ({currency})",
  "createProjectForm.durationLabel": "Kampagnendauer ({min}–{max} Tage)",
  "createProjectForm.skillsLabel": "Gesuchte Skills (optional)",
  "createProjectForm.skillsPlaceholder": "z. B. Schnitt, Mix, Foto — durch Kommas getrennt",
  "createProjectForm.skillsHelp": "Wir lotsen Mitglieder mit diesen Skills zu deinem Projekt.",
  "createProjectForm.coverLabel": "Titelbild (URL, optional)",
  "createProjectForm.milestonesSection": "Freigabe-Etappen",
  "createProjectForm.milestonesHelp":
    "Jede Etappe gibt einen Betrag in {currency} frei — gegen Nachweis, bestätigt durch die gewichtete Abstimmung deiner Unterstützer. Die Summe muss exakt deinem Ziel entsprechen. Einmal finanziert, hast du {days} Tage, um alles umzusetzen und bestätigen zu lassen — danach geht der Rest des Treuhandkontos zurück an die Unterstützer.",
  "createProjectForm.milestonesHelpStrong": "0 % GeniGain-Provision",
  "createProjectForm.milestonesHelpAfterStrong":
    "— nur die Bankgebühren werden von den Auszahlungen abgezogen.",
  "createProjectForm.milestoneNumber": "Etappe {number}",
  "createProjectForm.removeMilestoneTitle": "Diese Etappe löschen",
  "createProjectForm.milestoneTitleLabel": "Titel",
  "createProjectForm.milestoneTitlePlaceholder": "z. B. Demo fertig",
  "createProjectForm.milestoneAmountLabel": "Betrag ({currency})",
  "createProjectForm.milestoneDeliverableLabel": "Was du liefern wirst",
  "createProjectForm.milestoneDeliverablePlaceholder":
    "Was die Unterstützer bei dieser Etappe überprüfen können.",
  "createProjectForm.addMilestone": "Etappe hinzufügen",
  "createProjectForm.submitPending": "Wird erstellt…",
  "createProjectForm.submit": "Mein Projekt starten",

  // ——— EditProjectForm ———
  "editProjectForm.titleLabel": "Titel",
  "editProjectForm.titleHelp":
    "Die Adresse der Seite ändert sich nicht: Bereits geteilte Links funktionieren weiter.",
  "editProjectForm.pitchLabel": "Pitch (max. 140 Zeichen)",
  "editProjectForm.descriptionLabel": "Beschreibung",
  "editProjectForm.categoryLabel": "Kategorie",
  "editProjectForm.coverLabel": "Titelbild (URL, optional)",
  "editProjectForm.skillsLabel": "Gesuchte Skills (optional)",
  "editProjectForm.skillsPlaceholder": "z. B. Schnitt, Mix, Foto — durch Kommas getrennt",
  "editProjectForm.submitPending": "Wird gespeichert…",
  "editProjectForm.submit": "Änderungen speichern",

  // ——— ContributeForm ———
  "contributeForm.freeAmountLabel": "Freier Betrag ({currency})",
  "contributeForm.anonymousStrong": "Anonym beitragen",
  "contributeForm.anonymousRest":
    "— dein Name erscheint weder auf dem Projekt noch für den Projektträger noch im Aktivitäts-Feed.",
  "contributeForm.redirecting": "Weiterleitung zur Zahlung…",
  "contributeForm.submit": "{amount} beitragen",
  "contributeForm.feeStrong": "0 % GeniGain-Provision",
  "contributeForm.feeRest":
    "— nur die Kartengebühren (von Stripe festgelegt, von GeniGain weder gesehen noch angefasst) fallen an.",
  "contributeForm.escrowIntro":
    "Sichere Zahlung über Stripe. Die Gelder liegen auf dem Treuhandkonto und werden Etappe für Etappe durch die Abstimmung der Unterstützer freigegeben. Scheitert die Kampagne, bekommst du dein Geld zurück",
  "contributeForm.escrowStrong": "abzüglich der Kartengebühren",
  "contributeForm.escrowAfterStrong":
    ": Stripe erstattet sie nicht, GeniGain behält keinen Cent davon.",
  "contributeForm.feesLink": "Gebühren im Detail",

  // ——— MilestoneTimeline ———
  "milestoneTimeline.statusLocked": "Gesperrt",
  "milestoneTimeline.statusAwaitingProof": "Nachweis ausstehend",
  "milestoneTimeline.statusUnderReview": "Abstimmung läuft",
  "milestoneTimeline.statusReleased": "Gelder freigegeben",
  "milestoneTimeline.proofCounter": "Nachweis {index}/{max}",
  "milestoneTimeline.proofRejected": "Abgelehnt",
  "milestoneTimeline.proofApproved": "Bestätigt",
  "milestoneTimeline.proofPending": "Abstimmung läuft",
  "milestoneTimeline.proofImageAlt": "Fortschrittsnachweis",
  "milestoneTimeline.majorityAt": "Mehrheit bei {amount}",
  "milestoneTimeline.alreadyVoted": "Du hast abgestimmt",
  "milestoneTimeline.approve": "Bestätigen",
  "milestoneTimeline.reject": "Ablehnen",
  "milestoneTimeline.awaitingOwnerProof":
    "Warten auf den Fortschrittsnachweis des Projektträgers...",

  // ——— ProofForm ———
  "proofForm.heading": "Reiche deinen Fortschrittsnachweis ein",
  "proofForm.lastAttempt": "Letzter Versuch — sei überzeugend!",
  "proofForm.contentLabel": "Was du umgesetzt hast",
  "proofForm.contentPlaceholder":
    "Beschreibe konkret, was für diese Etappe gemacht wurde (mind. 20 Zeichen)…",
  "proofForm.linksLabel": "Links (einer pro Zeile, optional)",
  "proofForm.linksPlaceholder": "https://demo.beispiel.de\nhttps://github.com/…",
  "proofForm.imagesLabel": "Bilder (eine URL pro Zeile, optional)",
  "proofForm.imagesPlaceholder": "https://.../foto-werkstatt.jpg",
  "proofForm.submitPending": "Wird gesendet…",
  "proofForm.submit": "Nachweis zur Abstimmung senden",

  // ——— CampaignCockpit ———
  "campaignCockpit.heading": "Steuerung — nur für dich sichtbar",
  "campaignCockpit.dailyCollection": "Einnahmen pro Tag",
  "campaignCockpit.emptyState":
    "Noch kein Beitrag — teile deinen Link, der Zähler startet hier.",
  "campaignCockpit.sparklineAria": {
    one: "Einnahmen pro Tag seit dem Start: {amount} an einem Tag.",
    other: "Einnahmen pro Tag seit dem Start: {amount} in {count} Tagen.",
  },
  "campaignCockpit.todayPoint": "{amount} heute",
  "campaignCockpit.paceLabel": "Tempo, um es zu schaffen",
  "campaignCockpit.perDay": "{amount}/Tag",
  "campaignCockpit.goalReached": "Ziel erreicht",
  "campaignCockpit.milestonesValidated": "Bestätigte Etappen",
  "campaignCockpit.contributorsLabel": "Unterstützer·innen",
  "campaignCockpit.followersLabel": "Follower",
  "campaignCockpit.convertedShare": "davon haben {percent} % beigetragen",
  "campaignCockpit.realizeBefore": "Umsetzen bis",
  // {days} pilote pas le pluriel (seul `count` le fait) → forme invariante.
  "campaignCockpit.daysToDeadline": "Noch {days} Tag(e)",

  // ——— CancelProjectButton ———
  // EIN Satz, nicht sechs Fragmente: Die Wortstellung gehört jeder Sprache
  // selbst (Deutsch und Arabisch folgen nicht der französischen Syntax).
  "cancelProjectButton.confirmBody":
    "Wenn du bestätigst, gilt das Projekt endgültig als „nicht erreicht“, und bis zu {amount} gehen zurück an {contributors} (abzüglich der Kartengebühren, je nach Bank ein paar Tage). Es gibt kein Zurück.",
  "cancelProjectButton.contributorCount": {
    one: "{count} Unterstützer",
    other: "{count} Unterstützer",
  },
  "cancelProjectButton.contributorsGeneric": "die Unterstützer",
  "cancelProjectButton.confirmPending": "Wird gestoppt…",
  "cancelProjectButton.confirmSubmit": "Ja, stoppen und zurückerstatten",
  "cancelProjectButton.cancel": "Abbrechen",
  "cancelProjectButton.arm": "Projekt stoppen",

  // ——— DeleteProjectButton ———
  "deleteProjectButton.confirmPending": "Wird zurückgezogen…",
  "deleteProjectButton.confirmSubmit": "Ja, endgültig zurückziehen",
  "deleteProjectButton.cancel": "Abbrechen",
  "deleteProjectButton.arm": "Projekt zurückziehen",

  // ——— CommentForm ———
  "commentForm.placeholder": "Mach Mut, stell eine Frage, biete deine Hilfe an…",
  "commentForm.ariaLabel": "Dein Kommentar",
  "commentForm.submitPending": "Wird gesendet…",
  "commentForm.submit": "Kommentieren",

  // ——— ProjectUpdateForm ———
  "projectUpdateForm.titleLabel": "Titel des Updates",
  "projectUpdateForm.titlePlaceholder": "z. B. Das Equipment ist da!",
  "projectUpdateForm.bodyLabel": "Was gibt's Neues?",
  "projectUpdateForm.bodyPlaceholder":
    "Fortschritte, Behind the Scenes, Dankeschöns... deine Unterstützer werden benachrichtigt.",
  "projectUpdateForm.success": "Update veröffentlicht — Unterstützer benachrichtigt.",
  "projectUpdateForm.submitPending": "Wird veröffentlicht…",
  "projectUpdateForm.submit": "Update veröffentlichen",

  // ——— FollowButton ———
  "followButton.unfollowTitle": "Diesem Projekt nicht mehr folgen",
  "followButton.followTitle": "Diesem Projekt folgen",
  "followButton.following": "Folge ich",
  "followButton.follow": "Folgen",

  // ——— ProjectCard ———
  "projectCard.replaces": "Ersetzt {targets}",
  "projectCard.contributions": {
    one: "{count} Beitrag",
    other: "{count} Beiträge",
  },
  "projectCard.daysLeft": {
    one: "Noch {count} Tag",
    other: "Noch {count} Tage",
  },
} satisfies Messages["project"];
