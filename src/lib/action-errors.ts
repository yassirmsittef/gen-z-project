import "server-only";
import { getRequestLocale } from "@/lib/i18n/server";
import { makeT, type Vars } from "@/lib/i18n/t";
import { DomainError } from "@/lib/project-service";
import { MESSAGES, type Messages } from "@/messages";

/**
 * « Résolution au bord » : le bord (action, route) est le seul endroit qui
 * connaît la langue du requérant — c'est donc le seul endroit qui rend.
 */

/** Une erreur du namespace `err`, dans la langue de la requête. */
export async function tErr<K extends keyof Messages["err"] & string>(
  key: K,
  vars?: Vars
): Promise<string> {
  const locale = await getRequestLocale();
  return makeT(MESSAGES[locale].err, locale)(key, vars);
}

/**
 * Le message d'une DomainError pour l'utilisateur courant : rendu dans sa
 * langue si l'erreur porte une clé (bi-mode), sinon le message fr historique
 * — les sites non migrés continuent de fonctionner tels quels.
 */
export async function domainErrorMessage(error: DomainError): Promise<string> {
  if (!error.key) return error.message;
  const locale = await getRequestLocale();
  return makeT(MESSAGES[locale].err, locale)(error.key, error.params);
}
