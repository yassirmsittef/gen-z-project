import type { Messages } from "../types";

export const nav = {
  skipToContent: "Ir para o conteúdo",
  projects: "Projetos",
  calls: "Apelos",
  live: "Direto",
  community: "Comunidade",
  communityTitle: "Comunidade — a rede sobre o globo",
  rankings: "Classificações",
  launchProject: "Lançar um projeto",
  dashboard: "Painel",
  chat: "Chat",
  chatTitle: "Chat — entreajuda entre criadores",
  adminCockpit: "Cockpit admin",
  adminOpenReports: {
    one: "{count} denúncia aberta",
    other: "{count} denúncias abertas",
  },
  profileTitle: "O teu perfil público",
  signOut: "Terminar sessão",
  signIn: "Iniciar sessão",
  signUp: "Registar-se",
  legalLinks: "Ligações legais",
  terms: "Condições de utilização",
  privacy: "Privacidade",
  legalNotice: "Menções legais",
  footerLive:
    "GeniGain · 0 % de comissão, aplicam-se apenas as taxas bancárias · pagamentos protegidos pela Stripe.",
  footerTest:
    "GeniGain · Fase 1 — pagamentos Stripe em modo de teste, sem débito real · 0 % de comissão, apenas taxas bancárias.",
  notFoundLabel: "Erro 404",
  notFoundHeading: "Esta página perdeu-se em órbita",
  notFoundBody:
    "O link pode ter expirado — ou o projeto foi retirado por quem o levava. Nada se perde: a comunidade continua a construir aqui ao lado.",
  notFoundDiscover: "Descobrir projetos",
  notFoundHome: "Início",
} satisfies Messages["nav"];
