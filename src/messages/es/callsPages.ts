import type { Messages } from "../types";

/**
 * Namespace `callsPages` — las páginas de servidor del hilo de las llamadas:
 * /appels, /appels/nouveau, /appels/[slug] y /direct.
 */
export const callsPages = {
  // ---------- /appels (el hilo) ----------
  "meta.listTitle": "Las llamadas",
  "meta.listDescription":
    "Las marcas que la comunidad ya no quiere, y los proyectos que se lanzan para reemplazarlas.",
  "sort.orphelins": "Sin reemplazo",
  "sort.soutenus": "Las más apoyadas",
  "sort.recents": "Las más recientes",
  "hero.label": "El hilo",
  "hero.title": "Lo que ya no queremos — y lo que ponemos en su lugar",
  "hero.body":
    "Cada llamada la publica un miembro, con su nombre. Nombra una marca que ya no quiere y describe lo que compraría en su lugar. Alguien la toma para llevarla, la comunidad la financia: así es como se reemplaza en vez de solo rechazar.",
  "hero.disclaimer": "GeniGain aloja estas llamadas y no es su autor.",
  "cta.publish": "Publicar una llamada",
  "search.placeholder": "Una marca, un sector, una palabra…",
  "search.label": "Buscar una llamada",
  "search.submit": "Buscar",
  "filters.sort": "Orden",
  "filters.sectors": "Sectores",
  "filters.allSectors": "Todos los sectores",
  "results.count": { one: "{count} llamada", other: "{count} llamadas" },
  "results.forQuery": " para «{query}»",
  "empty.noneYetTitle": "El hilo aún no tiene ninguna llamada.",
  "empty.noneYetBody":
    "Sé quien nombre primero una marca que ya no quiere — y quien diga qué compraría en su lugar.",
  "empty.allAnsweredTitle": "Todas las llamadas han encontrado un reemplazo.",
  "empty.allAnsweredBody":
    "Buena señal. Abre otra si alguna marca se te ha quedado atravesada.",
  "empty.noMatchTitle": "Ninguna llamada coincide.",
  "empty.noMatchBody": "Cambia de filtro — o publica la tuya.",

  // ---------- /appels/nouveau ----------
  "meta.newTitle": "Publicar una llamada",
  "back.toFeed": "Volver al hilo",
  "new.label": "Nueva llamada",
  "new.title": "Nombra lo que quieres ver reemplazado",
  "new.body":
    "Una llamada no es un desahogo: es un encargo dirigido a quienes saben construir. Cuanto mejor describas lo que comprarías en su lugar, más posibilidades tienes de que alguien la tome.",

  // ---------- /appels/[slug] ----------
  "meta.detailFallback": "Llamada",
  "meta.detailTitle": "Reemplazar a {target}",
  "removed.title": "Esta llamada fue retirada",
  "removed.byModeration": "Retirada por moderación — {reason}.",
  "removed.defaultReason": "no conforme con la carta de las llamadas",
  "removed.byAuthor": "Retirada por la persona que la había publicado.",
  "badge.answered": { one: "{count} reemplazo declarado", other: "{count} reemplazos declarados" },
  "badge.none": "Ningún reemplazo por ahora",
  "target.label": "Ya no quiere",
  "weight.calls": { one: "{count} llamada", other: "{count} llamadas" },
  "weight.aim": "apuntan a esta marca, con",
  "weight.total": "voces en total.",
  "author.anonymous": "Autor anónimo",
  "author.fallback": "Miembro",
  "motive.title": "El motivo",
  "wanted.title": "Lo que haría falta en su lugar",
  "sources.title": "Fuentes aportadas por quien la publicó",
  "frame.disclaimer":
    "Llamada publicada por un miembro. GeniGain aloja este contenido, no es su autor y no lo hace suyo. Una marca señalada puede solicitar su retirada en",
  "share.title": "Reemplazar a {target}",
  "share.text": {
    one: "{count} persona quiere reemplazar a {target}. En su lugar: {wanted}",
    other: "{count} personas quieren reemplazar a {target}. En su lugar: {wanted}",
  },
  "actions.removeMine": "Retirar mi llamada",
  "actions.removeModeration": "Retirar (moderación)",
  "replacements.title": "Los reemplazos",
  "replacements.body":
    "Estos proyectos se han declarado en esta llamada. Financiarlos es hacer existir la alternativa.",
  "replacements.emptyTitle": "Nadie la ha reemplazado todavía",
  "replacements.emptyBody":
    "Esta llamada espera a quien la lleve. Los apoyos de arriba son otros tantos primeros contribuyentes.",
  "replacements.withdrawMine": "Retirar este proyecto de la llamada",
  "replacements.detach": "Desvincular este proyecto (está ocupando la llamada)",
  "videos.title": "Los testimonios filmados",
  "videos.attached": {
    one: "{count} testimonio vinculado a esta llamada —",
    other: "{count} testimonios vinculados a esta llamada —",
  },
  "videos.seeLive": "verlos en el directo",
  "videos.emptyBody": "Una cámara dice en treinta segundos lo que a un párrafo le cuesta demostrar.",
  "login.cta": "Inicia sesión",
  "videos.loginSuffix": "para filmar tu testimonio.",
  "discussion.title": "La discusión",
  "discussion.body":
    "Corroborar, matizar, contradecir. La empresa señalada puede responder aquí como cualquiera.",
  "discussion.removeComment": "Retirar este comentario",
  "discussion.shown": "Se muestran las {shown} respuestas más recientes, de {total}.",
  "discussion.loginSuffix": "para responder a esta llamada.",
  "siblings.title": "Otras llamadas apuntan a {target}",
  "siblings.body": "Publicadas por separado, por otros miembros, por otras razones.",
  "siblings.voices": "voces",
  "siblings.by": "por {name}",
  "siblings.anonymous": "un miembro",
  "siblings.answers": { one: " · {count} reemplazo", other: " · {count} reemplazos" },

  // ---------- /direct ----------
  "meta.directTitle": "El directo",
  "meta.directDescription":
    "Los testimonios filmados de la comunidad: por qué ya no queremos estas marcas, y qué querríamos en su lugar.",
  "direct.label": "El directo",
  "direct.title": "Lo que ya no queremos, filmado",
  "direct.publish": "Publicar",
} satisfies Messages["callsPages"];
