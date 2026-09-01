import type { Messages } from "../types";

/** Páginas de autenticación: inicio de sesión, registro, contraseña olvidada, restablecimiento. */
export const authPages = {
  "meta.loginTitle": "Iniciar sesión",
  "meta.registerTitle": "Registro",
  "meta.forgotTitle": "Contraseña olvidada",
  "meta.resetTitle": "Nueva contraseña",
  "login.title": "Bienvenido·a de vuelta",
  "login.description": "Inicia sesión para contribuir y seguir tus proyectos.",
  "register.title": "Únete a la comunidad",
  "register.description":
    "Contribuye a los proyectos de tu generación con tarjeta, en su divisa — y lanza el tuyo a partir de 20 $ de contribuciones acumuladas.",
  "register.howItWorks": "¿Cómo funciona?",
  "forgot.title": "Contraseña olvidada",
  "forgot.description":
    "Danos el email de tu cuenta: te enviamos un enlace válido durante 1 hora para elegir una nueva.",
  "reset.title": "Elige tu nueva contraseña",
  "reset.description": "El enlace solo sirve una vez — en cuanto se guarda, queda muerto.",
} satisfies Messages["authPages"];
