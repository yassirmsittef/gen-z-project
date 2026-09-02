import type { Messages } from "../types";

/** Pagine di autenticazione: accesso, registrazione, password dimenticata, reimpostazione. */
export const authPages = {
  "meta.loginTitle": "Accesso",
  "meta.registerTitle": "Registrazione",
  "meta.forgotTitle": "Password dimenticata",
  "meta.resetTitle": "Nuova password",
  "login.title": "Bentornato·a",
  "login.description": "Accedi per contribuire e seguire i tuoi progetti.",
  "register.title": "Entra nella community",
  "register.description":
    "Contribuisci ai progetti della tua generazione con carta, nella loro valuta — e lancia il tuo da 20 $ di contributi cumulati.",
  "register.howItWorks": "Come funziona?",
  "forgot.title": "Password dimenticata",
  "forgot.description":
    "Indica l'email del tuo account: ti mandiamo un link valido 1 ora per sceglierne una nuova.",
  "verify.title": "Indirizzo confermato",
  "verify.success": "Grazie — il tuo indirizzo è confermato. Tutto GeniGain è aperto per te.",
  "verify.invalid": "Questo link non è valido o è scaduto. Richiedi una nuova email dal tuo pannello.",
  "verify.cta": "Vai al pannello",
  "reset.title": "Scegli la tua nuova password",
  "reset.description": "Il link funziona una sola volta — appena è salvata, è morto.",
} satisfies Messages["authPages"];
