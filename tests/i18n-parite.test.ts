import { describe, expect, it } from "vitest";
import { LOCALES, LOCALE_CODES } from "../src/lib/i18n/locales";
import { makeT, type Message } from "../src/lib/i18n/t";
import { NOTIFICATION_KEYS } from "../src/lib/notification-catalog";
import { MESSAGES, type Namespace } from "../src/messages";

/**
 * Parité des 7 langues — le pendant RUNTIME du `satisfies` de compilation.
 *
 * Le typage garantit déjà les CLÉS ; il ne dit rien des PLACEHOLDERS ni des
 * catégories plurielles : une traduction qui oublie {projectTitle} compile
 * très bien et affiche « {projectTitle} » en production. Ces tests peuvent
 * échouer — vérifié en sabotant une traduction — et c'est leur raison d'être.
 */

const NAMESPACES = Object.keys(MESSAGES.fr) as Namespace[];

/** Les {placeholders} d'un message (toutes formes plurielles confondues). */
function placeholdersOf(message: Message): Set<string> {
  const texts = typeof message === "string" ? [message] : Object.values(message);
  const found = new Set<string>();
  for (const text of texts) {
    for (const m of String(text).matchAll(/\{(\w+)\}/g)) found.add(m[1]);
  }
  return found;
}

describe("parité des 7 langues", () => {
  it("chaque langue expose exactement les namespaces et clés du français", () => {
    for (const code of LOCALE_CODES) {
      const langue = MESSAGES[code];
      expect(Object.keys(langue).sort(), `namespaces de ${code}`).toEqual(
        Object.keys(MESSAGES.fr).sort()
      );
      for (const ns of NAMESPACES) {
        expect(Object.keys(langue[ns]).sort(), `clés de ${code}.${ns}`).toEqual(
          Object.keys(MESSAGES.fr[ns]).sort()
        );
      }
    }
  });

  it("chaque traduction porte les placeholders de son gabarit français", () => {
    for (const code of LOCALE_CODES) {
      if (code === "fr") continue;
      for (const ns of NAMESPACES) {
        for (const [key, frMessage] of Object.entries(MESSAGES.fr[ns])) {
          const attendus = placeholdersOf(frMessage as Message);
          if (attendus.size === 0) continue;
          const traduits = placeholdersOf(
            (MESSAGES[code][ns] as Record<string, Message>)[key]
          );
          for (const ph of attendus) {
            // {count} peut légitimement disparaître d'une forme (« une
            // tentative ») — mais pas des autres placeholders.
            if (ph === "count") continue;
            expect(traduits.has(ph), `${code}.${ns}.${key} doit garder {${ph}}`).toBe(true);
          }
        }
      }
    }
  });

  it("plancher : le dictionnaire ne rétrécit jamais en silence", () => {
    // À relever quand le chantier grossit, jamais à baisser — même doctrine
    // que PLANCHER_MAPPINGS (contrat-formulaires).
    const total = NAMESPACES.reduce((n, ns) => n + Object.keys(MESSAGES.fr[ns]).length, 0);
    expect(total).toBeGreaterThanOrEqual(300);
  });

  it("le menu des langues se lit dans chaque langue (noms natifs, jamais traduits)", () => {
    expect(LOCALES.map((l) => l.label)).toEqual([
      "Français", "English", "Español", "Deutsch", "Italiano", "Português", "العربية",
    ]);
  });
});

describe("pluriels arabes (6 formes, choisies par Intl.PluralRules)", () => {
  it("proofRejected décline zero/one/two/few/many/other", () => {
    const t = makeT(MESSAGES.ar.notif, "ar");
    const rendus = [0, 1, 2, 3, 11, 100].map((n) =>
      t("proofRejected.body", { order: 1, count: n })
    );
    // Six catégories distinctes en arabe : six rendus distincts.
    expect(new Set(rendus).size).toBe(6);
    expect(rendus[1]).toContain("واحدة"); // « une seule » tentative
    expect(rendus[3]).toContain("3"); // few : le nombre s'affiche
  });

  it("le moteur retombe sur `other` quand une forme manque", () => {
    const t = makeT({ x: { one: "un", other: "{count} plusieurs" } }, "fr");
    expect(t("x", { count: 1 })).toBe("un");
    expect(t("x", { count: 4 })).toBe("4 plusieurs");
  });
});

describe("catalogue des notifications ↔ gabarits", () => {
  it("chaque clé du catalogue a son titre (et son corps si annoncé) dans les 7 langues", () => {
    for (const code of LOCALE_CODES) {
      const notif = MESSAGES[code].notif as Record<string, Message>;
      for (const [key, meta] of Object.entries(NOTIFICATION_KEYS)) {
        expect(notif[`${key}.title`], `${code} : notif.${key}.title`).toBeDefined();
        if (meta.body) {
          expect(notif[`${key}.body`], `${code} : notif.${key}.body`).toBeDefined();
        }
      }
    }
  });
});
