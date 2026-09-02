/**
 * Une requête POST vient-elle de NOTRE site ?
 *
 * Défense en profondeur pour les routes API qui changent un état. Les
 * cookies en SameSite=Lax empêchent déjà un site tiers d'envoyer la session
 * d'un membre avec un POST ; ceci ferme le reste : on lit ce que le
 * navigateur affirme (`Sec-Fetch-Site`, puis `Origin`) et on refuse tout ce
 * qui vient d'ailleurs.
 *
 * Sans `Origin` ni `Sec-Fetch-Site`, on laisse passer : un client hors
 * navigateur (curl, le rappel serveur de Vercel Blob) n'en envoie pas, et il
 * n'a pas non plus de cookie de victime à porter — le CSRF est un problème de
 * navigateur.
 */
export function isSameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
