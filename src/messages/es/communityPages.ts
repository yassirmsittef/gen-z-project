import type { Messages } from "../types";

/**
 * Namespace `communityPages` — las páginas de servidor de la red:
 * /communaute (el globo) y /classements.
 */
export const communityPages = {
  // ---------- Contadores compartidos ----------
  "count.members": { one: "{count} miembro", other: "{count} miembros" },
  "count.projects": { one: "{count} proyecto", other: "{count} proyectos" },
  "count.supports": { one: "{count} apoyo", other: "{count} apoyos" },

  // ---------- /communaute ----------
  "meta.communityTitle": "Comunidad",
  "community.title": "Comunidad",
  "stats.cities": { one: "{count} ciudad en el globo", other: "{count} ciudades en el globo" },
  "stats.network": "la red en órbita",
  "globe.clearCity": "Quitar el filtro de ciudad",
  "globe.empty": "El globo espera sus primeras señales — añade tu ciudad desde tu panel",
  "globe.hintDesktop": "Arrastra para explorar · haz clic en un punto",
  "globe.hintMobile": "Un dedo: girar · dos dedos: inclinar",
  "locate.notYet": "Todavía no apareces en el globo.",
  "locate.cta": "Añade tu ciudad desde tu panel →",
  "search.placeholder": "Un nombre, una habilidad (edición, costura...)",
  "search.memberLabel": "Buscar un miembro",
  "search.cityPlaceholder": "Todas las ciudades",
  "search.cityLabel": "Filtrar por ciudad",
  "search.submit": "Buscar",
  "search.reset": "Restablecer",
  "results.inCity": " en {city}",
  "results.forQuery": " para «{query}»",
  "results.empty": "Nadie coincide con esta búsqueda.",
  "results.resetCta": "Restablecer los filtros →",
  "member.offRadar": "Fuera del radar",
  "member.contact": "Contactar con {name}",
  "member.invested": "{amount} invertidos",

  // ---------- /classements ----------
  "meta.rankingsTitle": "Clasificaciones",
  "rankings.title": "Clasificaciones",
  "rankings.subtitle": "Los proyectos que hacen vibrar a la comunidad",
  "rankings.empty": "Nada que clasificar por ahora.",
  "rankings.active": "En campaña",
  "rankings.funded": "Financiados y realizados",
  "brands.title": "Las marcas que queremos reemplazar",
  "brands.body":
    "El peso acumulado de todas las llamadas que apuntan a una misma marca. Publicadas por miembros — GeniGain aloja este hilo y no es su autor.",
  "brands.calls": { one: "{count} llamada", other: "{count} llamadas" },
  "brands.answersOnTheWay": {
    one: " · {count} reemplazo en camino",
    other: " · {count} reemplazos en camino",
  },
  "brands.nobodyYet": " · nadie se ha puesto todavía",
  "brands.upForGrabs": "Por tomar",
  "brands.voices": "voces",
} satisfies Messages["communityPages"];
