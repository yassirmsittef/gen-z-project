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

export const es = {
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
    "support.link": "Apoyar a GeniGain",
    "support.title": "Apoyar a GeniGain",
    "support.lead": "GeniGain es una plataforma con 0 % de comisión: no se queda con nada de los proyectos. Para vivir y crecer, cuenta con quienes creen en la idea.",
    "support.what": "Lo que financia tu apoyo: el desarrollo y la seguridad de la plataforma, y luego lugares en las ciudades para acompañar a quienes empiezan — un sitio para trabajar, formarse y conocer a sus contribuyentes.",
    "support.surplus": "Compromiso: todo lo que supere las necesidades de la plataforma se destina a financiar los proyectos de otros miembros.",
    "support.direct": "A diferencia de los proyectos, este apoyo no tiene etapas ni depósito: es una donación a la plataforma, recibida directamente en su cuenta.",
    "support.total": "Recibido hasta ahora: {amount}",
    "support.amountLabel": "Importe (CHF)",
    "support.button": "Apoyar",
    "support.pending": "Redirigiendo al pago…",
    "support.thanks": "¡Gracias! Tu apoyo ha llegado.",
    "support.cancelled": "Pago cancelado — no se cobró nada.",
    "support.login": "Inicia sesión para apoyar a GeniGain.",
    "support.unlock": "Y abre una puerta: apoyar a GeniGain cuenta como una contribución y desbloquea tu derecho a lanzar tu propio proyecto.",
    someone: "Alguien",
    justNow: "ahora mismo",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
