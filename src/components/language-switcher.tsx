"use client";

import { useRef } from "react";
import { Languages } from "lucide-react";
import { setLanguageAction } from "@/actions/language";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

/**
 * Le sélecteur public du pied de page — la porte des visiteurs sans compte.
 * Un <select> natif qui soumet au changement ; sans JavaScript, Entrée sur
 * le formulaire soumet aussi. Chaque langue s'affiche dans sa propre langue.
 */
export function LanguageSwitcher({ current }: { current: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setLanguageAction} className="inline-flex items-center gap-1.5">
      <Languages className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <select
        name="lang"
        // `key` ET `defaultValue` : après la bascule, l'action revalide et
        // React réconcilie — mais il ne touche PAS à la valeur d'un select
        // non contrôlé, qui continuait d'annoncer la langue précédente alors
        // que la page avait déjà changé. Le menu mentait sur l'état réel.
        // Changer la clé le remonte, donc le realigne.
        key={current}
        defaultValue={current}
        aria-label="Langue / Language / اللغة"
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-lg border border-transparent bg-transparent py-0.5 pe-1 ps-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} className="bg-card text-foreground">
            {l.label}
          </option>
        ))}
      </select>
    </form>
  );
}
