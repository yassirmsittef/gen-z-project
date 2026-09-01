import type { Messages } from "../types";

/** Páginas de autenticação: sessão, registo, palavra-passe esquecida, reposição. */
export const authPages = {
  "meta.loginTitle": "Iniciar sessão",
  "meta.registerTitle": "Registo",
  "meta.forgotTitle": "Palavra-passe esquecida",
  "meta.resetTitle": "Nova palavra-passe",
  "login.title": "Que bom ter-te de volta",
  "login.description": "Inicia sessão para contribuíres e acompanhares os teus projetos.",
  "register.title": "Junta-te à comunidade",
  "register.description":
    "Contribui para os projetos da tua geração por cartão, na moeda deles — e lança o teu a partir de 20 $ de contribuições acumuladas.",
  "register.howItWorks": "Como funciona?",
  "forgot.title": "Palavra-passe esquecida",
  "forgot.description":
    "Indica o email da tua conta: enviamos-te um link válido durante 1 hora para escolheres uma nova.",
  "reset.title": "Escolhe a tua nova palavra-passe",
  "reset.description": "O link só serve uma vez — assim que ficar guardada, morre.",
} satisfies Messages["authPages"];
