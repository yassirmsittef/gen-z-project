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
    "support.surplus": "A nossa linha de conduta: o que exceder as necessidades da plataforma vai apoiar os projetos dos outros membros — diremos aqui, com números. Não é um compromisso quantificado.",
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
    "frozen.badge": "Em breve",
    "frozen.title": "Esta função abre em breve",
    "frozen.body": "O GeniGain abre primeiro a sua comunidade. Os projetos, os apelos, as contribuições e os repasses vão abrir assim que um advogado validar o nosso enquadramento jurídico: preferimos levar esse tempo para proteger o teu dinheiro e os teus direitos.",
    "frozen.now": "Enquanto isso, podes inscrever-te, completar o teu perfil e conversar nas salas.",
    "frozen.chat": "Ir para as salas",
    "frozen.banner": "Beta aberta: inscreve-te e entra nas salas já. Projetos, apelos e contribuições abrem após a validação jurídica.",
    "frozen.close": "Entendi",
    "frozen.locked": "Fechado até à validação jurídica",
    "frozen.contribute": "Contribuir",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
