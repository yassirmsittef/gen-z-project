import type { Messages } from "../types";

export const nav = {
  skipToContent: "Ir al contenido",
  projects: "Proyectos",
  calls: "Llamadas",
  live: "Directo",
  community: "Comunidad",
  communityTitle: "Comunidad — la red sobre el globo",
  rankings: "Clasificaciones",
  launchProject: "Lanzar un proyecto",
  dashboard: "Panel",
  chat: "Chat",
  chatTitle: "Chat — ayuda entre creadores",
  adminCockpit: "Cabina admin",
  adminOpenReports: {
    one: "{count} denuncia abierta",
    other: "{count} denuncias abiertas",
  },
  profileTitle: "Tu perfil público",
  signOut: "Cerrar sesión",
  signIn: "Iniciar sesión",
  signUp: "Registrarse",
  legalLinks: "Enlaces legales",
  terms: "Condiciones de uso",
  privacy: "Privacidad",
  legalNotice: "Aviso legal",
  footerLive:
    "GeniGain · 0 % de comisión, solo se aplican las tarifas bancarias · pagos protegidos por Stripe.",
  footerTest:
    "GeniGain · Fase 1 — pagos Stripe en modo de prueba, sin cargos reales · 0 % de comisión, solo tarifas bancarias.",
  notFoundLabel: "Error 404",
  notFoundHeading: "Esta página se perdió en órbita",
  notFoundBody:
    "Puede que el enlace haya caducado — o que el proyecto fuera retirado por quien lo llevaba. Nada se pierde: la comunidad sigue construyendo aquí al lado.",
  notFoundDiscover: "Descubrir proyectos",
  notFoundHome: "Inicio",
} satisfies Messages["nav"];
