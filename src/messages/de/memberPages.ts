import type { Messages } from "../types";

/**
 * Namespace `memberPages` — die Seiten des Mitgliederbereichs (Los 7):
 * Dashboard, Benachrichtigungen, Chat (private Threads, Gruppen, Mitglieder),
 * öffentliches Profil, Partnerschaften (Posteingang, Detail, Markenverfolgung).
 */
export const memberPages = {
  // <title> der Seiten
  "meta.dashboardTitle": "Dashboard",
  "meta.notificationsTitle": "Benachrichtigungen",
  "meta.chatTitle": "Chat",
  "meta.groupsTitle": "Gruppen",
  "meta.groupTitle": "Gruppe",
  "meta.groupMembersTitle": "Mitglieder der Gruppe",
  "meta.profileNotFound": "Profil nicht gefunden",
  "meta.profileFallback": "Profil",
  "meta.profileDescription": "{name} auf GeniGain: Reputation, Projekte und Skills.",
  "meta.profileDescriptionCity":
    "{name} auf GeniGain — {city}: Reputation, Projekte und Skills.",
  "meta.partnershipsTitle": "Partnerschaften",
  "meta.partnershipRequestTitle": "Partnerschaftsanfrage",
  "meta.trackingTitle": "Verfolgung Ihrer Anfrage",

  // dashboard/page.tsx
  "dashboard.connectDoneLive":
    "Einrichtung an Stripe übermittelt — deine Auszahlungen starten, sobald sie bestätigt ist.",
  "dashboard.connectDoneTest":
    "Einrichtung an Stripe übermittelt — deine Auszahlungen starten, sobald sie bestätigt ist (im Testmodus meist sofort).",
  "dashboard.connectRefresh":
    "Die Stripe-Sitzung ist abgelaufen — starte die Einrichtung der Auszahlungen neu, wann du willst.",
  "dashboard.greeting": "Hey {name}",
  "dashboard.tagline": "Persönliches HQ · Systeme einsatzbereit",
  "dashboard.editProfile": "Mein Profil bearbeiten",
  "dashboard.adminCockpit": "Admin-Cockpit",
  "dashboard.reportsToHandle": {
    one: "{count} Meldung zu bearbeiten",
    other: "{count} Meldungen zu bearbeiten",
  },
  "dashboard.nothingToModerate": "nichts zu moderieren",
  "dashboard.failedTitle": "Ein Projekt hat es nicht geschafft — und jetzt?",
  "dashboard.failedBody":
    "Scheitern ist kein Ausgang. Entdecke andere Chancen und komm stärker zurück.",
  "dashboard.seeOpportunities": "Chancen ansehen →",
  "dashboard.statReputation": "Reputation",
  "dashboard.nextLevelAt": "{label} ab {target}",
  "dashboard.maxLevel": "Höchste Stufe erreicht",
  "dashboard.statTowardProject": "Auf dein Projekt zu",
  "dashboard.gateExempt": "Gründer — du postest ohne Gate",
  "dashboard.gateReached": "Gate frei — du kannst posten",
  "dashboard.gateRemaining": "{amount} bis du posten kannst",
  "dashboard.statSupports": "Unterstützungen",
  "dashboard.communityPillar": "Säule der Community",
  "dashboard.supportGoal": "Ziel: 10 unterstützte Projekte",
  "dashboard.trajectoryTitle": "Deine Laufbahn",
  "dashboard.pendingPartnerships": {
    one: "{count} Partnerschaftsanfrage wartet auf deine Antwort —",
    other: "{count} Partnerschaftsanfragen warten auf deine Antwort —",
  },
  "dashboard.seeWithCopilot": "mit dem KI-Copilot ansehen →",
  "dashboard.myProjects": "Meine Projekte",
  "dashboard.partnershipsLink": "Partnerschaften",
  "dashboard.partnershipsLinkCount": "Partnerschaften ({count})",
  "dashboard.launchProject": "Projekt starten",
  "dashboard.noProjects":
    "Noch kein Projekt. Trag zu einem Projekt bei, um die Erstellung deines eigenen freizuschalten.",
  "dashboard.myCalls": "Meine Aufrufe",
  "dashboard.publishCall": "Aufruf veröffentlichen",
  "dashboard.replaceTarget": "{target} ersetzen",
  "dashboard.callVoices": "{count} Stimmen",
  "dashboard.callAnswerers": {
    one: "{count} Ersatz",
    other: "{count} Ersatzprojekte",
  },
  "dashboard.callNoAnswerers": "vorerst kein Ersatz",
  "dashboard.followedProjects": "Verfolgte Projekte",
  "dashboard.myContributions": "Meine Beiträge",
  "dashboard.noContributions": "Vorerst kein Beitrag.",
  "dashboard.findProject": "Finde ein Projekt zum Unterstützen →",
  "dashboard.refunded": "zurückerstattet",
  "dashboard.myProfile": "Mein Profil",
  "dashboard.mySkills": "Meine Skills",
  "dashboard.myPayouts": "Meine Auszahlungen",
  "dashboard.security": "Sicherheit",
  "dashboard.myData": "Meine Daten",
  "dashboard.myDataBody":
    "Alles, was du GeniGain anvertraut hast (Profil, Projekte, Beiträge, Stimmen, gesendete Nachrichten…), in einer JSON-Datei — Recht auf Datenübertragbarkeit.",
  "dashboard.downloadMyData": "Meine Daten herunterladen",

  // notifications/page.tsx
  "notifications.title": "Benachrichtigungen",
  "notifications.newSince": {
    one: "{count} neue seit deinem letzten Besuch",
    other: "{count} neue seit deinem letzten Besuch",
  },
  "notifications.allCaughtUp": "Alles auf dem neuesten Stand",
  "notifications.empty":
    "Vorerst nichts. Eingegangene Beiträge, Nachweise zum Abstimmen, freigegebene Etappen, Nachrichten, Kommentare, Updates und Partnerschaftsanfragen landen hier.",

  // chat/page.tsx + chat/[userId]/page.tsx — gemeinsamer Kopf
  "chatHeader.title": "Chat",
  "chatHeader.tagline": "Gründer helfen Gründern · Collabs · helfende Hände",

  // chat/page.tsx
  "chatIndex.pickConversation":
    "Wähl eine Unterhaltung — oder tritt einer Gruppe deiner Kategorie bei, um zu mehreren zu reden.",
  "chatIndex.exploreGroups": "Gruppen entdecken",

  // chat/[userId]/page.tsx
  "chatThread.allConversations": "Alle meine Unterhaltungen",
  "chatThread.olderMessages": "Ältere Nachrichten",
  "chatThread.startConversation":
    "Starte die Unterhaltung — biete eine helfende Hand an, eine Collab, einen Skill-Tausch.",
  "chatThread.backToLatest": "Zurück zu den neuesten Nachrichten",

  // chat/groupes/page.tsx
  "groupsDir.title": "Gruppen",
  "groupsDir.tagline": "Ein Raum pro Lust · einsortiert in die Kategorien der Projekte",
  "groupsDir.searchPlaceholder": "Raum suchen (Name, Thema…)",
  "groupsDir.searchLabel": "Raum suchen",
  "groupsDir.search": "Suchen",
  "groupsDir.categoriesLabel": "Kategorien der Gruppen",
  "groupsDir.allCategories": "Alle Kategorien",
  "groupsDir.noRoomForQuery": "Kein Raum spricht über „{query}“.",
  "groupsDir.noRoomForQueryInCategory": "Kein Raum in {category} spricht über „{query}“.",
  "groupsDir.noGroupInCategory": "Vorerst keine Gruppe in {category}.",
  "groupsDir.noGroup": "Vorerst keine Gruppe.",
  "groupsDir.tryAnotherWord": "Versuch ein anderes Wort, oder eröffne den Raum, der fehlt.",
  "groupsDir.openFirst": "Eröffne den ersten — oft ist er es, der alle zusammenbringt.",
  "groupsDir.officialRoomCategory": "Willkommensraum · {category}",
  "groupsDir.openThread": "Chat öffnen",

  // chat/groupes/[slug]/page.tsx
  // Rendus dans la langue du LECTEUR (et non du salon) : un mot
  // d'accueil figé dans une langue qu'on ne lit pas n'accueille personne.
  "groupThread.systemJoined": "{name} ist dem Raum beigetreten. Willkommen!",
  "groupThread.emptyThread": "Noch nichts hier. Eröffne das Gespräch: stell dich vor und sag, was du suchst.",
  "groupThread.allGroups": "Alle Gruppen",
  "groupThread.membersCount": {
    one: "{count} Mitglied",
    other: "{count} Mitglieder",
  },
  "groupThread.meta": "{category} · {members}",
  "groupThread.metaOfficial": "Willkommensraum · {category} · {members}",
  "groupThread.animatedBy": "Moderiert von",
  "groupThread.openedOn": "· eröffnet am {date}",
  "groupThread.seeMembers": "Die {count} Mitglieder ansehen",
  "groupThread.membersAria": "{count} Mitglieder",
  "groupThread.olderMessages": "Ältere Nachrichten",
  "groupThread.backToLatest": "Zurück zu den neuesten Nachrichten",
  "groupThread.membersOnly": "Der Chat ist Mitgliedern vorbehalten",
  "groupThread.joinToRead":
    "Tritt der Gruppe bei, um mitzulesen und zu schreiben — du kannst jederzeit wieder gehen.",

  // chat/groupes/[slug]/membres/page.tsx
  "groupMembers.backToThread": "Zurück zum Chat",
  "groupMembers.membersCount": {
    one: "{count} Mitglied",
    other: "{count} Mitglieder",
  },
  "groupMembers.bansCount": {
    one: "· {count} ausgeschlossen",
    other: "· {count} ausgeschlossen",
  },
  "groupMembers.owner": "Moderator·in",
  "groupMembers.manager": "Co-Moderator·in",
  "groupMembers.since": "dabei seit {date}",
  "groupMembers.thisMember": "dieses Mitglied",
  "groupMembers.exclusions": "Ausschlüsse",
  "groupMembers.noBans":
    "Aus diesem Raum wurde niemand ausgeschlossen. Ein Ausschluss entfernt die Person und schließt ihr die Tür; ihre Nachrichten bleiben.",
  "groupMembers.bannedOn": "ausgeschlossen am {date}",

  // u/[id]/page.tsx
  "profile.seeOnGlobe": "Auf dem Community-Globus ansehen",
  "profile.memberSince": "Mitglied seit {date}",
  "profile.editProfile": "Mein Profil bearbeiten",
  "profile.sendMessage": "Nachricht senden",
  "profile.reportProfile": "Dieses Profil melden",
  "profile.projectsLaunched": "Gestartete Projekte",
  "profile.contributions": "Beiträge",
  "profile.investedInCommunity": "In die Community investiert",
  "profile.votesOnProofs": "Stimmen zu Nachweisen",
  "profile.theirProjects": "Projekte dieses Mitglieds",
  "profile.recentActivity": "Letzte Aktivität",
  "profile.repPoints": "{delta} Rep.",

  // Partnerschaften — gemeinsam für alle drei Ansichten (Posteingang, Detail, Markenverfolgung)
  "partnership.budgetUsd": "{amount} $",

  // partenariats/page.tsx
  "partnershipsInbox.title": "Partnerschaften",
  "partnershipsInbox.meta": {
    one: "{count} Anfrage erhalten · {pending} ausstehend · KI-Copilot vor jeder Antwort",
    other: "{count} Anfragen erhalten · {pending} ausstehend · KI-Copilot vor jeder Antwort",
  },
  "partnershipsInbox.emptyBody":
    "Vorerst keine Anfrage. Marken können dir von der Seite jedes deiner Projekte aus eine Partnerschaft vorschlagen („Markenpartnerschaft“).",
  "partnershipsInbox.emptyHint":
    "Wenn eine Anfrage eintrifft, hilft dir der KI-Copilot zu prüfen, ob sie seriös und fair ist, bevor du antwortest.",

  // partenariats/[id]/page.tsx
  "partnershipDetail.allRequests": "Alle Anfragen",
  "partnershipDetail.forQuoteOpen": "Für „",
  "partnershipDetail.forQuoteClose": "“ · erhalten am {date}",
  "partnershipDetail.noWebsite": "Keine Website angegeben",
  "partnershipDetail.contact": "Kontakt",
  "partnershipDetail.notSpecified": "Nicht angegeben",
  "partnershipDetail.compensation": "Gegenleistung",
  "partnershipDetail.proposal": "Vorschlag",
  "partnershipDetail.deliverables": "Was die Marke erwartet",
  "partnershipDetail.replyToBrand": "Der Marke antworten",
  "partnershipDetail.yourReply": "Deine Antwort ({status})",
  "partnershipDetail.yourReplyDated": "Deine Antwort ({status} am {date})",

  // partenariats/suivi/[token]/page.tsx — öffentliche Markenseite (Siezen)
  "tracking.sentBanner":
    "Anfrage gesendet! Bewahren Sie den Link dieser Seite gut auf: Hier erscheint die Antwort.",
  "tracking.title": "Ihre Partnerschaftsanfrage",
  "tracking.pairing": "× „",
  "tracking.sentOn": "“ · gesendet am {date}",
  "tracking.compensationProposed": "Vorgeschlagene Gegenleistung: {compensation}",
  "tracking.pendingTitle": "Wird geprüft",
  "tracking.pendingBody":
    "{name} prüft Ihren Vorschlag. Die Antwort erscheint auf dieser Seite — legen Sie sie am besten in Ihren Lesezeichen ab.",
  "tracking.accepted": "Partnerschaft angenommen",
  "tracking.declined": "Vorschlag abgelehnt",
  "tracking.footerNote":
    "Sie vertreten eine andere Marke oder möchten Ihre Anfrage ergänzen? Reichen Sie einen neuen Vorschlag von der Projektseite aus ein.",
} satisfies Messages["memberPages"];
