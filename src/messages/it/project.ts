import type { Messages } from "../types";

/**
 * Namespace `project` — création/édition de projet, contribution, étapes de
 * déblocage (timeline + preuves), cockpit de campagne, boutons d'arrêt et de
 * retrait, commentaires, actus, suivi, carte projet.
 * (Les libellés partagés CATEGORY_LABELS / STATUS_LABELS restent dans leurs
 * constantes — voir lot dédié.)
 */
export const project = {
  // ——— CreateProjectForm ———
  "createProjectForm.answersCallLabel": "Stai rispondendo a un appello",
  "createProjectForm.replaceTarget": "Sostituire {target}",
  "createProjectForm.quotedWanted": "«{wanted}»",
  "createProjectForm.answersCallHelp":
    "È il capitolato scritto dalla persona che ha lanciato l'appello. Il tuo progetto sarà dichiarato sostituto fin dalla creazione, e tutti i suoi sostenitori saranno avvisati.",
  "createProjectForm.projectSection": "Il tuo progetto",
  "createProjectForm.titleLabel": "Titolo",
  "createProjectForm.titlePlaceholder": "Es.: EP di 5 brani — LUNA NERA",
  "createProjectForm.pitchLabel": "Pitch (140 caratteri max)",
  "createProjectForm.pitchPlaceholder": "Una frase che fa venire voglia di finanziarti.",
  "createProjectForm.descriptionLabel": "Descrizione",
  "createProjectForm.descriptionPlaceholder":
    "Racconta: cos'è, per chi, perché tu, e a cosa serviranno i soldi (min 50 caratteri).",
  "createProjectForm.categoryLabel": "Categoria",
  "createProjectForm.categoryPlaceholder": "Scegli…",
  "createProjectForm.currencyLabel": "Valuta del progetto",
  "createProjectForm.goalLabel": "Obiettivo ({currency})",
  "createProjectForm.durationLabel": "Durata della campagna ({min}–{max} giorni)",
  "createProjectForm.skillsLabel": "Competenze cercate (facoltativo)",
  "createProjectForm.skillsPlaceholder": "es.: montaggio, mix, foto — separate da virgole",
  "createProjectForm.skillsHelp": "Indirizziamo verso il tuo progetto i membri che hanno queste competenze.",
  "createProjectForm.coverLabel": "Immagine di copertina (URL, facoltativa)",
  "createProjectForm.milestonesSection": "Tappe di sblocco",
  "createProjectForm.milestonesHelp":
    "Ogni tappa sblocca un importo in {currency}, su prova convalidata dal voto ponderato dei tuoi contributori. La somma deve essere pari al tuo obiettivo. Una volta finanziato, hai {days} giorni per realizzare tutto e farlo convalidare — oltre, il resto del deposito viene rimborsato ai contributori.",
  "createProjectForm.milestonesHelpStrong": "0% di commissione GeniGain",
  "createProjectForm.milestonesHelpAfterStrong":
    "— dai versamenti vengono detratte solo le spese bancarie.",
  "createProjectForm.milestoneNumber": "Tappa {number}",
  "createProjectForm.removeMilestoneTitle": "Elimina questa tappa",
  "createProjectForm.milestoneTitleLabel": "Titolo",
  "createProjectForm.milestoneTitlePlaceholder": "Es.: Prototipo completato",
  "createProjectForm.milestoneAmountLabel": "Importo ({currency})",
  "createProjectForm.milestoneDeliverableLabel": "Cosa consegnerai",
  "createProjectForm.milestoneDeliverablePlaceholder":
    "Cosa potranno verificare i contributori a questa tappa.",
  "createProjectForm.addMilestone": "Aggiungi una tappa",
  "createProjectForm.submitPending": "Creazione…",
  "createProjectForm.submit": "Lancia il mio progetto",

  // ——— EditProjectForm ———
  "editProjectForm.titleLabel": "Titolo",
  "editProjectForm.titleHelp":
    "L'indirizzo della pagina non cambia: i link già condivisi continuano a funzionare.",
  "editProjectForm.pitchLabel": "Pitch (140 caratteri max)",
  "editProjectForm.descriptionLabel": "Descrizione",
  "editProjectForm.categoryLabel": "Categoria",
  "editProjectForm.coverLabel": "Immagine di copertina (URL, facoltativa)",
  "editProjectForm.skillsLabel": "Competenze cercate (facoltativo)",
  "editProjectForm.skillsPlaceholder": "es.: montaggio, mix, foto — separate da virgole",
  "editProjectForm.submitPending": "Salvataggio…",
  "editProjectForm.submit": "Salva le modifiche",

  // ——— ContributeForm ———
  "contributeForm.freeAmountLabel": "Importo libero ({currency})",
  "contributeForm.anonymousStrong": "Contribuire in anonimo",
  "contributeForm.anonymousRest":
    "— il tuo nome non apparirà né sul progetto, né a chi lo porta avanti, né nel feed di attività.",
  "contributeForm.redirecting": "Reindirizzamento al pagamento…",
  "contributeForm.submit": "Contribuisci con {amount}",
  "contributeForm.feeStrong": "0% di commissione GeniGain",
  "contributeForm.feeRest":
    "— si applicano solo le commissioni carta (fissate da Stripe, mai viste né toccate da GeniGain).",
  "contributeForm.escrowIntro":
    "Pagamento sicuro Stripe. Fondi in deposito, sbloccati tappa dopo tappa dal voto dei contributori. Se la campagna non va in porto, ricevi il rimborso",
  "contributeForm.escrowStrong": "al netto delle commissioni carta",
  "contributeForm.escrowAfterStrong":
    ": Stripe non le restituisce, GeniGain non ne trattiene alcuna.",
  "contributeForm.feesLink": "Dettaglio delle commissioni",

  // ——— MilestoneTimeline ———
  "milestoneTimeline.statusLocked": "Bloccata",
  "milestoneTimeline.statusAwaitingProof": "In attesa della prova",
  "milestoneTimeline.statusUnderReview": "Voto in corso",
  "milestoneTimeline.statusReleased": "Fondi sbloccati",
  "milestoneTimeline.proofCounter": "Prova {index}/{max}",
  "milestoneTimeline.proofRejected": "Respinta",
  "milestoneTimeline.proofApproved": "Convalidata",
  "milestoneTimeline.proofPending": "Voto in corso",
  "milestoneTimeline.proofImageAlt": "Prova di avanzamento",
  "milestoneTimeline.majorityAt": "maggioranza a {amount}",
  "milestoneTimeline.alreadyVoted": "Hai votato",
  "milestoneTimeline.approve": "Convalida",
  "milestoneTimeline.reject": "Respingi",
  "milestoneTimeline.awaitingOwnerProof":
    "In attesa della prova di avanzamento di chi porta il progetto...",

  // ——— ProofForm ———
  "proofForm.heading": "Invia la tua prova di avanzamento",
  "proofForm.lastAttempt": "Ultimo tentativo — sii convincente!",
  "proofForm.contentLabel": "Cosa hai realizzato",
  "proofForm.contentPlaceholder":
    "Descrivi concretamente cosa è stato fatto per questa tappa (min 20 caratteri)…",
  "proofForm.linksLabel": "Link (uno per riga, facoltativo)",
  "proofForm.linksPlaceholder": "https://demo.esempio.it\nhttps://github.com/…",
  "proofForm.imagesLabel": "Immagini (una URL per riga, facoltativo)",
  "proofForm.imagesPlaceholder": "https://.../foto-laboratorio.jpg",
  "proofForm.submitPending": "Invio…",
  "proofForm.submit": "Invia la prova al voto",

  // ——— CampaignCockpit ———
  "campaignCockpit.heading": "Pilotaggio — visibile solo a te",
  "campaignCockpit.dailyCollection": "Raccolta al giorno",
  "campaignCockpit.emptyState":
    "Ancora nessun contributo — condividi il tuo link, il contatore parte da qui.",
  "campaignCockpit.sparklineAria": {
    one: "Raccolta al giorno dal lancio: {amount} in {count} giorno.",
    other: "Raccolta al giorno dal lancio: {amount} in {count} giorni.",
  },
  "campaignCockpit.todayPoint": "{amount} oggi",
  "campaignCockpit.paceLabel": "Ritmo per farcela",
  "campaignCockpit.perDay": "{amount}/g",
  "campaignCockpit.goalReached": "Obiettivo raggiunto",
  "campaignCockpit.milestonesValidated": "Tappe convalidate",
  "campaignCockpit.contributorsLabel": "Chi contribuisce",
  "campaignCockpit.followersLabel": "Chi segue",
  "campaignCockpit.convertedShare": "di cui il {percent}% ha contribuito",
  "campaignCockpit.realizeBefore": "Da realizzare entro",
  "campaignCockpit.daysToDeadline": "-{days} g",

  // ——— CancelProjectButton ———
  // UNE phrase, pas six fragments : l'ordre des mots appartient à chaque
  // langue (l'allemand et l'arabe ne suivent pas la syntaxe française).
  "cancelProjectButton.confirmBody":
    "Confermando, il progetto passa definitivamente a «non raggiunto» e fino a {amount} torna verso {contributors} (al netto delle commissioni carta, qualche giorno a seconda della banca). Non si può tornare indietro.",
  "cancelProjectButton.contributorCount": {
    one: "{count} contributore",
    other: "{count} contributori",
  },
  "cancelProjectButton.contributorsGeneric": "i contributori",
  "cancelProjectButton.confirmPending": "Interruzione in corso…",
  "cancelProjectButton.confirmSubmit": "Sì, ferma e rimborsa",
  "cancelProjectButton.cancel": "Annulla",
  "cancelProjectButton.arm": "Ferma il progetto",

  // ——— DeleteProjectButton ———
  "deleteProjectButton.confirmPending": "Ritiro…",
  "deleteProjectButton.confirmSubmit": "Sì, ritira definitivamente",
  "deleteProjectButton.cancel": "Annulla",
  "deleteProjectButton.arm": "Ritira il progetto",

  // ——— CommentForm ———
  "commentForm.placeholder": "Incoraggia, fai una domanda, offri una mano…",
  "commentForm.ariaLabel": "Il tuo commento",
  "commentForm.submitPending": "Invio…",
  "commentForm.submit": "Commenta",

  // ——— ProjectUpdateForm ———
  "projectUpdateForm.titleLabel": "Titolo della novità",
  "projectUpdateForm.titlePlaceholder": "es.: L'attrezzatura è arrivata!",
  "projectUpdateForm.bodyLabel": "Che c'è di nuovo?",
  "projectUpdateForm.bodyPlaceholder":
    "Progressi, dietro le quinte, ringraziamenti... i tuoi contributori saranno avvisati.",
  "projectUpdateForm.success": "Novità pubblicata — contributori avvisati.",
  "projectUpdateForm.submitPending": "Pubblicazione…",
  "projectUpdateForm.submit": "Pubblica la novità",

  // ——— FollowButton ———
  "followButton.unfollowTitle": "Smetti di seguire questo progetto",
  "followButton.followTitle": "Segui questo progetto",
  "followButton.following": "Seguito",
  "followButton.follow": "Segui",

  // ——— ProjectCard ———
  "projectCard.replaces": "Sostituisce {targets}",
  "projectCard.contributions": {
    one: "{count} contributo",
    other: "{count} contributi",
  },
  "projectCard.daysLeft": {
    one: "{count} g rimanente",
    other: "{count} g rimanenti",
  },
} satisfies Messages["project"];
