"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { makeT, type Translator } from "@/lib/i18n/t";
import type { ClientMessages, ClientNamespace } from "@/messages/client";
import type { Messages } from "@/messages";

/**
 * Le pont serveur→client : le layout racine sérialise UNE fois la langue et
 * le sous-ensemble de namespaces clients (voir CLIENT_NAMESPACES) ; tous les
 * composants "use client" lisent ici, jamais de traductions en props.
 */
const I18nContext = createContext<{ locale: Locale; messages: ClientMessages } | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: ClientMessages;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT/useLocale exigent <I18nProvider> (layout racine).");
  return ctx;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useT<N extends ClientNamespace>(ns: N): Translator<Messages[N]> {
  const { locale, messages } = useI18n();
  return useMemo(() => makeT(messages[ns], locale), [messages, ns, locale]);
}
