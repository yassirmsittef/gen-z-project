import type { Messages } from "../types";

/**
 * Namespace `memberPages` — le pagine dello spazio membro (lotto 7):
 * dashboard, notifiche, chat (conversazioni private, gruppi, membri),
 * profilo pubblico, partnership (posta, dettaglio, monitoraggio brand).
 */
export const memberPages = {
  // <title> delle pagine
  "meta.dashboardTitle": "Dashboard",
  "meta.notificationsTitle": "Notifiche",
  "meta.chatTitle": "Chat",
  "meta.groupsTitle": "Gruppi",
  "meta.groupTitle": "Gruppo",
  "meta.groupMembersTitle": "Membri del gruppo",
  "meta.profileNotFound": "Profilo non trovato",
  "meta.profileFallback": "Profilo",
  "meta.profileDescription": "{name} su GeniGain: reputazione, progetti e competenze.",
  "meta.profileDescriptionCity":
    "{name} su GeniGain — {city}: reputazione, progetti e competenze.",
  "meta.partnershipsTitle": "Partnership",
  "meta.partnershipRequestTitle": "Richiesta di partnership",
  "meta.trackingTitle": "Monitoraggio della vostra richiesta",

  // dashboard/page.tsx
  "dashboard.connectDoneLive":
    "Configurazione trasmessa a Stripe — i tuoi versamenti si attivano appena convalidata.",
  "dashboard.connectDoneTest":
    "Configurazione trasmessa a Stripe — i tuoi versamenti si attivano appena convalidata (spesso immediato in modalità test).",
  "dashboard.connectRefresh":
    "La sessione Stripe è scaduta — riavvia la configurazione dei versamenti quando vuoi.",
  "dashboard.greeting": "Ciao {name}",
  "dashboard.tagline": "QG personale · sistemi operativi",
  "dashboard.editProfile": "Modifica il mio profilo",
  "dashboard.adminCockpit": "Cabina admin",
  "dashboard.reportsToHandle": {
    one: "{count} segnalazione da trattare",
    other: "{count} segnalazioni da trattare",
  },
  "dashboard.nothingToModerate": "niente da moderare",
  "dashboard.failedTitle": "Un progetto non è andato in porto — e adesso?",
  "dashboard.failedBody":
    "Il fallimento non è un'uscita. Scopri altre opportunità e riparti più forte.",
  "dashboard.seeOpportunities": "Vedi le opportunità →",
  "dashboard.statReputation": "Reputazione",
  "dashboard.nextLevelAt": "{label} a {target}",
  "dashboard.maxLevel": "Livello massimo raggiunto",
  "dashboard.statTowardProject": "Verso il tuo progetto",
  "dashboard.gateExempt": "Fondatore — pubblichi senza soglia",
  "dashboard.gateReached": "Soglia sbloccata — puoi pubblicare",
  "dashboard.gateRemaining": "{amount} prima di poter pubblicare",
  "dashboard.statSupports": "Sostegni",
  "dashboard.communityPillar": "Pilastro della community",
  "dashboard.supportGoal": "Obiettivo: 10 progetti sostenuti",
  "dashboard.trajectoryTitle": "La tua traiettoria",
  "dashboard.pendingPartnerships": {
    one: "{count} richiesta di partnership aspetta la tua risposta —",
    other: "{count} richieste di partnership aspettano la tua risposta —",
  },
  "dashboard.seeWithCopilot": "vedi con il copilota IA →",
  "dashboard.myProjects": "I miei progetti",
  "dashboard.partnershipsLink": "Partnership",
  "dashboard.partnershipsLinkCount": "Partnership ({count})",
  "dashboard.launchProject": "Lancia un progetto",
  "dashboard.noProjects":
    "Ancora nessun progetto. Contribuisci a un progetto per sbloccare la creazione del tuo.",
  "dashboard.myCalls": "I miei appelli",
  "dashboard.publishCall": "Pubblica un appello",
  "dashboard.replaceTarget": "Sostituire {target}",
  "dashboard.callVoices": "{count} voci",
  "dashboard.callAnswerers": {
    one: "{count} sostituto",
    other: "{count} sostituti",
  },
  "dashboard.callNoAnswerers": "ancora nessun sostituto",
  "dashboard.followedProjects": "Progetti seguiti",
  "dashboard.myContributions": "I miei contributi",
  "dashboard.noContributions": "Ancora nessun contributo.",
  "dashboard.findProject": "Trova un progetto da sostenere →",
  "dashboard.refunded": "rimborsato",
  "dashboard.myProfile": "Il mio profilo",
  "dashboard.mySkills": "Le mie competenze",
  "dashboard.myPayouts": "I miei versamenti",
  "dashboard.security": "Sicurezza",
  "dashboard.myData": "I miei dati",
  "dashboard.myDataBody":
    "Tutto quello che hai affidato a GeniGain (profilo, progetti, contributi, voti, messaggi inviati…), in un file JSON — diritto alla portabilità.",
  "dashboard.downloadMyData": "Scarica i miei dati",

  // notifications/page.tsx
  "notifications.title": "Notifiche",
  "notifications.newSince": {
    one: "{count} nuova dall'ultima visita",
    other: "{count} nuove dall'ultima visita",
  },
  "notifications.allCaughtUp": "Tutto aggiornato",
  "notifications.empty":
    "Niente per ora. Contributi ricevuti, prove da votare, tappe sbloccate, messaggi, commenti, novità e richieste di partnership arriveranno qui.",

  // chat/page.tsx + chat/[userId]/page.tsx — intestazione comune
  "chatHeader.title": "Chat",
  "chatHeader.tagline": "Aiuto tra creatori · collab · una mano",

  // chat/page.tsx
  "chatIndex.pickConversation":
    "Scegli una conversazione — o entra in un gruppo della tua categoria per parlare in tanti.",
  "chatIndex.exploreGroups": "Esplora i gruppi",

  // chat/[userId]/page.tsx
  "chatThread.allConversations": "Tutte le mie conversazioni",
  "chatThread.olderMessages": "Messaggi più vecchi",
  "chatThread.startConversation":
    "Inizia la conversazione — proponi una mano, una collab, uno scambio di competenze.",
  "chatThread.backToLatest": "Torna agli ultimi messaggi",

  // chat/groupes/page.tsx
  "groupsDir.title": "Gruppi",
  "groupsDir.tagline": "Una stanza per ogni voglia · ordinate nelle categorie dei progetti",
  "groupsDir.searchPlaceholder": "Cerca una stanza (nome, argomento…)",
  "groupsDir.searchLabel": "Cerca una stanza",
  "groupsDir.search": "Cerca",
  "groupsDir.categoriesLabel": "Categorie di gruppi",
  "groupsDir.allCategories": "Tutte le categorie",
  "groupsDir.noRoomForQuery": "Nessuna stanza parla di «{query}».",
  "groupsDir.noRoomForQueryInCategory": "Nessuna stanza parla di «{query}» in {category}.",
  "groupsDir.noGroupInCategory": "Nessun gruppo in {category} per ora.",
  "groupsDir.noGroup": "Nessun gruppo per ora.",
  "groupsDir.tryAnotherWord": "Prova un'altra parola, o apri la stanza che manca.",
  "groupsDir.openFirst": "Apri la prima — spesso è quella che riunisce.",
  "groupsDir.officialRoomCategory": "Stanza di benvenuto · {category}",
  "groupsDir.openThread": "Apri la conversazione",

  // chat/groupes/[slug]/page.tsx
  // Rendus dans la langue du LECTEUR (et non du salon) : un mot
  // d'accueil figé dans une langue qu'on ne lit pas n'accueille personne.
  "groupThread.systemJoined": "{name} entra nella stanza. Diamo il benvenuto!",
  "groupThread.emptyThread": "Ancora niente. Apri la conversazione: presentati e di' cosa cerchi.",
  "groupThread.allGroups": "Tutti i gruppi",
  "groupThread.membersCount": {
    one: "{count} membro",
    other: "{count} membri",
  },
  "groupThread.meta": "{category} · {members}",
  "groupThread.metaOfficial": "Stanza di benvenuto · {category} · {members}",
  "groupThread.animatedBy": "Animato da",
  "groupThread.openedOn": "· aperto il {date}",
  "groupThread.seeMembers": "Vedi i {count} membri",
  "groupThread.membersAria": "{count} membri",
  "groupThread.olderMessages": "Messaggi più vecchi",
  "groupThread.backToLatest": "Torna agli ultimi messaggi",
  "groupThread.membersOnly": "La conversazione è riservata ai membri",
  "groupThread.joinToRead":
    "Entra nel gruppo per leggere gli scambi e scrivere — puoi uscirne quando vuoi.",

  // chat/groupes/[slug]/membres/page.tsx
  "groupMembers.backToThread": "Torna alla conversazione",
  "groupMembers.membersCount": {
    one: "{count} membro",
    other: "{count} membri",
  },
  "groupMembers.bansCount": {
    one: "· {count} escluso",
    other: "· {count} esclusi",
  },
  "groupMembers.owner": "Animatore·rice",
  "groupMembers.manager": "Gerente",
  "groupMembers.since": "dal {date}",
  "groupMembers.thisMember": "questo membro",
  "groupMembers.exclusions": "Esclusioni",
  "groupMembers.noBans":
    "Nessuno è stato escluso da questa stanza. Un'esclusione rimuove la persona e le chiude la porta; i suoi messaggi, invece, restano.",
  "groupMembers.bannedOn": "escluso il {date}",

  // u/[id]/page.tsx
  "profile.seeOnGlobe": "Vedi sul globo Community",
  "profile.memberSince": "Membro dal {date}",
  "profile.editProfile": "Modifica il mio profilo",
  "profile.sendMessage": "Invia un messaggio",
  "profile.reportProfile": "Segnala questo profilo",
  "profile.projectsLaunched": "Progetti lanciati",
  "profile.contributions": "Contributi",
  "profile.investedInCommunity": "Investiti nella community",
  "profile.votesOnProofs": "Voti sulle prove",
  "profile.theirProjects": "I suoi progetti",
  "profile.recentActivity": "Attività recente",
  "profile.repPoints": "{delta} rep.",

  // partnership — comune ai tre schermi (posta, dettaglio, monitoraggio brand)
  "partnership.budgetUsd": "{amount} $",

  // partenariats/page.tsx
  "partnershipsInbox.title": "Partnership",
  "partnershipsInbox.meta": {
    one: "{count} richiesta ricevuta · {pending} in attesa · copilota IA prima di ogni risposta",
    other: "{count} richieste ricevute · {pending} in attesa · copilota IA prima di ogni risposta",
  },
  "partnershipsInbox.emptyBody":
    "Nessuna richiesta per ora. I brand possono proporti una partnership dalla pagina di ciascuno dei tuoi progetti («Partnership brand»).",
  "partnershipsInbox.emptyHint":
    "Quando arriva una richiesta, il copilota IA ti aiuta a verificare che sia affidabile ed equa prima di rispondere.",

  // partenariats/[id]/page.tsx
  "partnershipDetail.allRequests": "Tutte le richieste",
  "partnershipDetail.forQuoteOpen": "Per «",
  "partnershipDetail.forQuoteClose": "» · ricevuta il {date}",
  "partnershipDetail.noWebsite": "Nessun sito web fornito",
  "partnershipDetail.contact": "Contatto",
  "partnershipDetail.notSpecified": "Non specificato",
  "partnershipDetail.compensation": "Compenso",
  "partnershipDetail.proposal": "Proposta",
  "partnershipDetail.deliverables": "Cosa si aspetta il brand",
  "partnershipDetail.replyToBrand": "Rispondi al brand",
  "partnershipDetail.yourReply": "La tua risposta ({status})",
  "partnershipDetail.yourReplyDated": "La tua risposta ({status} il {date})",

  // partenariats/suivi/[token]/page.tsx — pagina pubblica brand (forma di cortesia)
  "tracking.sentBanner":
    "Richiesta inviata! Conservate con cura il link di questa pagina: è qui che apparirà la risposta.",
  "tracking.title": "La vostra richiesta di partnership",
  "tracking.pairing": "× «",
  "tracking.sentOn": "» · inviata il {date}",
  "tracking.compensationProposed": "Compenso proposto: {compensation}",
  "tracking.pendingTitle": "In esame",
  "tracking.pendingBody":
    "{name} sta valutando la vostra proposta. La risposta apparirà su questa pagina — ricordatevi di salvarla tra i preferiti.",
  "tracking.accepted": "Partnership accettata",
  "tracking.declined": "Proposta rifiutata",
  "tracking.footerNote":
    "Rappresentate un altro brand o volete completare la vostra richiesta? Depositate una nuova proposta dalla pagina del progetto.",
} satisfies Messages["memberPages"];
