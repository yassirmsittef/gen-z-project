/**
 * Ce que `loginAction` transmet à `signIn("credentials", …)`.
 *
 * Auth.js sérialise ses options en champs de formulaire : une clé présente
 * mais `undefined` y devient la CHAÎNE « undefined ». Pour le code de double
 * authentification, ça donnait un code non vide et faux — « code incorrect »
 * affiché avant que le membre ait pu en saisir un. La clé n'est donc posée
 * que si un code a été saisi. Isolé pour être testé.
 */
export function signInPayload(parsed: { email: string; password: string; code?: string }) {
  const code = parsed.code?.trim();
  return {
    email: parsed.email,
    password: parsed.password,
    ...(code ? { code } : {}),
  };
}
