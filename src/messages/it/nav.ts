import type { Messages } from "../types";

export const nav = {
  skipToContent: "Vai al contenuto",
  projects: "Progetti",
  calls: "Appelli",
  live: "Diretta",
  community: "Community",
  communityTitle: "Community — la rete sul globo",
  rankings: "Classifiche",
  launchProject: "Lancia un progetto",
  dashboard: "Dashboard",
  chat: "Chat",
  chatTitle: "Chat — aiuto tra creatori",
  adminCockpit: "Cabina admin",
  adminOpenReports: {
    one: "{count} segnalazione aperta",
    other: "{count} segnalazioni aperte",
  },
  profileTitle: "Il tuo profilo pubblico",
  signOut: "Esci",
  signIn: "Accedi",
  signUp: "Registrati",
  legalLinks: "Link legali",
  terms: "Condizioni d'uso",
  privacy: "Privacy",
  legalNotice: "Note legali",
  footerLive:
    "GeniGain · 0% di commissione, si applicano solo le spese bancarie · pagamenti protetti da Stripe.",
  footerTest:
    "GeniGain · Fase 1 — pagamenti Stripe in modalità test, nessun addebito reale · 0% di commissione, solo spese bancarie.",
  notFoundLabel: "Errore 404",
  notFoundHeading: "Questa pagina si è persa in orbita",
  notFoundBody:
    "Forse il link è scaduto — o il progetto è stato ritirato da chi lo portava avanti. Nulla è perduto: la community continua a costruire qui accanto.",
  notFoundDiscover: "Scopri i progetti",
  notFoundHome: "Home",
} satisfies Messages["nav"];
