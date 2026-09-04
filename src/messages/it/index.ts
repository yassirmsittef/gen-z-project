import { adminPages } from "./adminPages";
import { authPages } from "./authPages";
import { callsPages } from "./callsPages";
import { communityPages } from "./communityPages";
import { home } from "./home";
import { howItWorks } from "./howItWorks";
import { legalPages } from "./legalPages";
import { memberPages } from "./memberPages";
import { projectsPages } from "./projectsPages";
import { rebound } from "./rebound";
import { account } from "./account";
import { calls } from "./calls";
import { chat } from "./chat";
import { project } from "./project";
import { ui } from "./ui";
import type { Messages } from "../types";
import { email } from "./email";
import { err } from "./err";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { notif } from "./notif";
import { v } from "./v";

export const it = {
  email,
  err,
  account,
  adminPages,
  authPages,
  callsPages,
  communityPages,
  home,
  howItWorks,
  legalPages,
  memberPages,
  projectsPages,
  rebound,
  calls,
  chat,
  project,
  ui,
  common: {
    "support.link": "Sostieni GeniGain",
    "support.title": "Sostieni GeniGain",
    "support.lead": "GeniGain è una piattaforma con 0 % di commissione: non trattiene nulla dai progetti. Per vivere e crescere, conta su chi crede nell'idea.",
    "support.what": "Cosa finanzia il tuo sostegno: lo sviluppo e la sicurezza della piattaforma, poi luoghi nelle città per accompagnare chi inizia — un posto per lavorare, formarsi e incontrare i propri sostenitori.",
    "support.surplus": "Impegno: tutto ciò che supera le necessità della piattaforma va a finanziare i progetti degli altri membri.",
    "support.direct": "A differenza dei progetti, questo sostegno non ha tappe né deposito: è una donazione alla piattaforma, ricevuta direttamente sul suo conto.",
    "support.total": "Ricevuto finora: {amount}",
    "support.amountLabel": "Importo (CHF)",
    "support.button": "Sostieni",
    "support.pending": "Reindirizzamento al pagamento…",
    "support.thanks": "Grazie! Il tuo sostegno è arrivato.",
    "support.cancelled": "Pagamento annullato — nulla è stato addebitato.",
    "support.login": "Accedi per sostenere GeniGain.",
    "support.unlock": "E apre una porta: sostenere GeniGain conta come un contributo e sblocca il tuo diritto di lanciare il tuo progetto.",
    someone: "Qualcuno",
    justNow: "proprio ora",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
