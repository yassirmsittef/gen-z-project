import type { Messages } from "../types";

/** /come-funziona: le istruzioni complete — traiettoria, FAQ, CTA. */
export const howItWorks = {
  "meta.title": "Come funziona",
  "meta.description":
    "Contribuisci prima, lancia poi: fondi in deposito, sbloccati tappa dopo tappa dal voto dei contributori, rimborsati se non va in porto.",
  "intro.label": "Le istruzioni per l'uso",
  "intro.title": "Come funziona",
  "intro.lead": "GeniGain si basa su un'idea semplice:",
  "intro.highlight": "i soldi seguono le prove",
  "intro.after":
    ". Si contribuisce prima di pubblicare, i fondi restano in deposito, ed è il voto dei contributori a sbloccarli, tappa dopo tappa.",
  "stages.contributeTitle": "Contribuisci prima",
  "stages.contributeChipMin": "da {min} € / $ / …",
  "stages.contributeChipGate": "{gate} → diritto di pubblicare",
  "stages.contributeBody":
    "Qui nessuno arriva con la sua raccolta già pronta: si comincia sostenendo gli altri. Contribuisci con carta, nella valuta del progetto. Ogni pagamento viene convertito in dollari al tasso del giorno e si aggiunge al tuo contatore — a {gate} cumulati, ottieni il diritto di lanciare il tuo progetto.",
  "stages.launchTitle": "Lancia il tuo progetto",
  "stages.launchChipDuration": "{min}–{max} giorni",
  "stages.launchChipMilestones": "{min}–{max} tappe",
  "stages.launchBody":
    "Obiettivo tra {minGoal} e {maxGoal} nella valuta che scegli, campagna da {minDays} a {maxDays} giorni, e soprattutto: un piano diviso in {minMilestones}–{maxMilestones} tappe con importi la cui somma fa l'obiettivo. È questa divisione a rendere onesto il seguito — non ricevi mai tutto in una volta.",
  "stages.fundTitle": "La community finanzia",
  "stages.fundChipEscrow": "deposito",
  "stages.fundChipRefund": "rimborso se non riesce",
  "stages.fundBody":
    "Durante la campagna i contributi si accumulano in deposito: non li tocca nessuno, tu compreso. Obiettivo raggiunto — la raccolta si ferma e l'avventura comincia. Obiettivo mancato alla scadenza — ogni contributore viene rimborsato automaticamente sulla sua carta, al netto delle commissioni carta che la banca non restituisce (GeniGain non ne trattiene alcuna).",
  "stages.proveTitle": "Dimostra, la community vota",
  "stages.proveChipVote": "voto ponderato",
  "stages.proveChipDays": "{days} giorni per realizzare",
  "stages.proveBody":
    "A ogni tappa pubblichi una prova (link, immagini) e i tuoi contributori votano. Ogni voce pesa quanto l'importo contribuito: decide la maggioranza degli importi. Tappa convalidata = fondi della tappa sbloccati. Una stessa tappa respinta {attempts} volte, o i {days} giorni scaduti, e il progetto si ferma.",
  "stages.cashTitle": "Incassa — o rimbalza",
  "stages.cashChipPayout": "versamento per tappa",
  "stages.cashChipFee": "0% di commissione",
  "stages.cashChipProrata": "rimborso proporzionale",
  "stages.cashBody":
    "Ogni tappa convalidata parte verso il tuo conto di versamento Stripe, al netto delle spese bancarie — GeniGain non trattiene nulla per strada. E se il progetto si ferma a metà? Quello che la community ha convalidato resta tuo, tutto il deposito rimanente torna in proporzione ai contributori — e la community ti aiuta a rimbalzare sul seguito.",
  "faq.heading": "Le domande che ci fate",
  "faq.investmentQ": "È un investimento?",
  "faq.investmentA":
    "No. Un contributo è un sostegno: non dà quote del progetto, né interessi, né rendimento finanziario. Quello che ci guadagni sta altrove: fai nascere progetti che hai scelto perché ti parlano o ti saranno utili — l'app, il prodotto, il luogo o il servizio che vorresti vedere esistere e di cui approfitterai una volta che c'è. Mantieni il diritto di voto sulle loro tappe, costruisci la tua reputazione nella community e sblocchi il diritto di lanciare il tuo.",
  "faq.costQ": "Quanto costa?",
  "faq.costA":
    "0% di commissione GeniGain. Chi contribuisce paga esattamente l'importo che ha scelto; le spese bancarie (Stripe) vengono detratte dai versamenti a chi porta avanti il progetto, come su qualsiasi piattaforma — GeniGain non trattiene nulla per strada. Se un giorno arriverà una commissione, sarà annunciata in anticipo, mostrata prima di ogni pagamento e mai retroattiva.",
  "faq.feesQ": "Chi paga esattamente le commissioni carta?",
  "faq.feesA":
    "Le commissioni di elaborazione sono fissate da Stripe (il fornitore di pagamento) e variano in base alla tua carta e al tuo paese — di solito intorno all'1,5–3%. GeniGain non le fissa, non le vede e non ne aggiunge nessuna. In concreto: quando contribuisci paghi esattamente il tuo importo; le commissioni le trattiene Stripe e vengono detratte da ciò che riceve chi porta avanti il progetto. Se il progetto fallisce e vieni rimborsato, Stripe non restituisce la commissione trattenuta all'inizio — il tuo rimborso è quindi al netto di queste spese, e anche qui GeniGain non ne trattiene alcuna. È l'unico «costo» di un contributo, e non finisce mai nelle tasche della piattaforma.",
  "faq.whoQ": "Chi può partecipare?",
  "faq.whoA":
    "L'iscrizione è aperta dai 15 anni. Per contribuire con carta o lanciare una campagna bisogna essere maggiorenni o avere il consenso di chi esercita la responsabilità genitoriale.",
  "faq.vanishQ": "E se chi porta il progetto sparisce nel nulla?",
  "faq.vanishA":
    "È esattamente ciò che il deposito impedisce: i fondi non sbloccati non sono mai nelle sue mani. Senza una prova convalidata non si muove niente — e dopo {days} giorni tutto quello che non è stato sbloccato da un voto torna automaticamente ai contributori (al netto delle commissioni carta, che la banca non restituisce).",
  "faq.payoutQ": "Come ricevo i fondi se porto avanti un progetto?",
  "faq.payoutA":
    "Tramite Stripe Connect: crei il tuo conto di versamento dalla dashboard e superi la verifica d'identità di Stripe. Ogni tappa convalidata viene poi bonificata automaticamente, nella valuta del tuo progetto. Una tappa convalidata resta dovuta finché il tuo conto non è pronto.",
  "faq.realMoneyQ": "Sono soldi veri?",
  "faq.realMoneyALive":
    "Sì. I pagamenti sono reali e protetti da Stripe: il tuo contributo viene davvero addebitato, messo in deposito e sbloccato tappa dopo tappa a chi porta il progetto, secondo il voto dei contributori. GeniGain non vede né conserva mai il numero della tua carta.",
  "faq.realMoneyATest":
    "La meccanica è reale dall'inizio alla fine, ma la piattaforma è in fase di test: i pagamenti Stripe girano in modalità test, nessuna carta viene davvero addebitata. L'apertura ai pagamenti reali sarà annunciata chiaramente.",
  "legal.before": "La versione giuridica di queste regole vive nelle",
  "legal.link": "condizioni d'uso",
  "legal.after": ".",
  "cta.discover": "Scopri i progetti",
  "cta.register": "Crea il mio account",
} satisfies Messages["howItWorks"];
