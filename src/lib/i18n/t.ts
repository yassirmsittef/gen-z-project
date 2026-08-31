import { localeTag, type Locale } from "@/lib/i18n/locales";

/**
 * Le moteur de traduction maison — isomorphe (serveur ET client), zéro
 * dépendance. Deux formes de message :
 *   - une chaîne, interpolée par `{placeholder}` (précédent : `{nom}` des
 *     salons de langue) ;
 *   - un objet pluriel dont la forme est choisie par `Intl.PluralRules` sur
 *     `vars.count` — c'est lui qui connaît les 6 formes de l'arabe, pas nous.
 * `other` est la seule forme obligatoire : toute langue retombe dessus.
 */
export type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export type Message = string | Plural;

export type Dict = Record<string, Message>;

export type Vars = Record<string, string | number | null | undefined>;

export type Translator<D extends Dict = Dict> = (key: keyof D & string, vars?: Vars) => string;

export function makeT<D extends Dict>(dict: D, locale: Locale): Translator<D> {
  const plural = new Intl.PluralRules(localeTag(locale));
  return (key, vars = {}) => {
    let message = dict[key] as Message | undefined;
    if (message === undefined) return key; // clé absente : la clé s'affiche, le bug se voit
    if (typeof message !== "string") {
      const count = typeof vars.count === "number" ? vars.count : 0;
      message = message[plural.select(count)] ?? message.other;
    }
    return message.replace(/\{(\w+)\}/g, (_, name: string) => {
      const value = vars[name];
      return value === null || value === undefined ? `{${name}}` : String(value);
    });
  };
}
