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

export const pt = {
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
    "support.link": "Apoiar a GeniGain",
    "support.title": "Apoiar a GeniGain",
    "support.lead": "A GeniGain é uma plataforma com 0 % de comissão: não fica com nada dos projetos. Para viver e crescer, conta com quem acredita na ideia.",
    "support.what": "O que o teu apoio financia: o desenvolvimento e a segurança da plataforma, e depois espaços nas cidades para acompanhar quem está a começar — um lugar para trabalhar, aprender e conhecer os seus contribuidores.",
    "support.surplus": "Compromisso: tudo o que exceder as necessidades da plataforma vai financiar os projetos dos outros membros.",
    "support.direct": "Ao contrário dos projetos, este apoio não tem etapas nem depósito: é um donativo à plataforma, recebido diretamente na sua conta.",
    "support.total": "Recebido até agora: {amount}",
    "support.amountLabel": "Montante (CHF)",
    "support.button": "Apoiar",
    "support.pending": "A redirecionar para o pagamento…",
    "support.thanks": "Obrigado! O teu apoio chegou.",
    "support.cancelled": "Pagamento cancelado — nada foi cobrado.",
    "support.login": "Inicia sessão para apoiar a GeniGain.",
    "support.unlock": "E abre uma porta: apoiar a GeniGain conta como uma contribuição e desbloqueia o teu direito de lançar o teu próprio projeto.",
    someone: "Alguém",
    justNow: "agora mesmo",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
