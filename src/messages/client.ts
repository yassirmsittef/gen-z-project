import type { Locale } from "@/lib/i18n/locales";
import { MESSAGES, type Messages } from "@/messages";

/**
 * Les namespaces embarqués côté client (sérialisés une fois dans le
 * provider racine). Chaque `useT("x")` exige que "x" figure ici — l'oubli
 * est une erreur de compilation, pas une clé affichée en prod.
 * N'y mettre QUE ce que des composants "use client" consomment : le reste
 * de l'app se traduit côté serveur et ne pèse rien dans le bundle.
 */
export const CLIENT_NAMESPACES = ["common", "account", "project", "chat", "calls", "ui", "v"] as const;

export type ClientNamespace = (typeof CLIENT_NAMESPACES)[number];

export type ClientMessages = Pick<Messages, ClientNamespace>;

export function clientMessages(locale: Locale): ClientMessages {
  const all = MESSAGES[locale];
  const subset = {} as Record<ClientNamespace, Messages[ClientNamespace]>;
  for (const ns of CLIENT_NAMESPACES) subset[ns] = all[ns];
  return subset as ClientMessages;
}
