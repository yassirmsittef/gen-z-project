import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import * as validation from "../src/lib/validation";

/**
 * Garde-fou contre la dérive schéma ↔ formulaire.
 *
 * Une action (ou un composant) qui recopie à la main la liste des champs d'un
 * formulaire finit par en oublier un quand le schéma évolue : `currency` a
 * ainsi manqué à `createProjectAction` pendant un mois, rendant TOUTE création
 * de projet impossible en production. Le compilateur ne voit rien —
 * `safeParse` accepte n'importe quel objet.
 *
 * Ce test relit les sources et vérifie que chaque `XSchema.safeParse({ … })`
 * écrit en littéral fournit toutes les clés non optionnelles du schéma. Les
 * mappings FACTORISÉS (une fonction partagée, comme `projectFormToInput`) ne
 * sont pas concernés : ils ne peuvent pas diverger — c'est le remède.
 *
 * LIMITE CONNUE, et elle penche du bon côté : le parseur ne reconnaît pas les
 * littéraux d'expression régulière. Un `safeParse({ x: /\}/.test(s) … })`
 * voit son littéral tronqué à l'accolade de la regex, et le test CRIE (des
 * champs paraissent manquants) au lieu de se taire. Un garde-fou qui crie à
 * tort se répare ; un garde-fou qui dort ne se remarque jamais.
 *
 * Deux leçons d'un audit sont câblées ici :
 * 1. le repérage se fait par ÉQUILIBRAGE D'ACCOLADES, pas par expression
 *    régulière — une regex paresseuse avalait le bloc suivant du fichier et
 *    ses clés étrangères masquaient les champs réellement oubliés ;
 * 2. le filet doit pouvoir ÉCHOUER. La version d'avant comparait deux
 *    compteurs incrémentés dans la même itération sans branche divergente :
 *    une tautologie, verte même en sabotant le parseur pour qu'il ne lise
 *    plus rien. Le filet est maintenant un PLANCHER sur les mappings
 *    réellement audités, plus un compteur d'échecs de lecture — les deux
 *    vérifiés en cassant volontairement le code.
 */

// `fileURLToPath` et pas `.pathname` : le dépôt vit dans un dossier dont le
// nom contient une espace, que l'URL encoderait en %20.
const SRC = fileURLToPath(new URL("../src/", import.meta.url));

/**
 * TOUT `src/`, récursivement. La version précédente listait deux dossiers à
 * plat : `src/components/ui/` — pourtant des composants, de l'aveu même du
 * commentaire — passait sous le radar, et un dossier de profondeur suffisait
 * à sortir du champ de vision. Un périmètre défini par énumération finit
 * toujours par oublier un endroit ; celui-ci n'a rien à oublier.
 */
function sourcesAAuditer(): string[] {
  return readdirSync(SRC, { recursive: true, encoding: "utf8" })
    .filter((nom) => nom.endsWith(".ts") || nom.endsWith(".tsx"))
    .map((nom) => join(SRC, nom));
}

type AnySchema = z.ZodTypeAny;

/** Déplie les .refine()/.transform() jusqu'à l'objet Zod sous-jacent. */
function objectSchema(schema: unknown): z.AnyZodObject | null {
  let current = schema as AnySchema;
  for (let depth = 0; depth < 6; depth += 1) {
    const def = (current as { _def?: { typeName?: string; schema?: AnySchema } })?._def;
    if (!def) return null;
    if (def.typeName === "ZodObject") return current as z.AnyZodObject;
    if (!def.schema) return null;
    current = def.schema;
  }
  return null;
}

/**
 * Résultat du repérage. Les deux façons de ne PAS produire de littéral sont
 * distinguées, parce qu'elles n'ont rien à voir :
 * - `factorise` : l'argument n'est pas un littéral (c'est le remède, on passe) ;
 * - `echec` : les accolades ne s'équilibrent pas, le parseur ne sait pas lire
 *   ce code — c'est un ANGLE MORT, et il doit faire rougir la suite.
 * La version précédente confondait les deux en un `null`, ce qui rendait le
 * filet « relatif » incapable d'échouer : les deux compteurs s'incrémentaient
 * dans la même itération, quoi qu'il arrive.
 */
type Repérage =
  | { kind: "litteral"; texte: string }
  | { kind: "factorise" }
  | { kind: "echec" };

function litteralDeSafeParse(source: string, ouvrante: number): Repérage {
  if (source[ouvrante] !== "{") return { kind: "factorise" };
  let profondeur = 0;
  let i = ouvrante;
  let chaine: string | null = null;
  let commentaire: "ligne" | "bloc" | null = null;

  for (; i < source.length; i += 1) {
    const c = source[i];
    const suivant = source[i + 1];

    if (commentaire === "ligne") {
      if (c === "\n") commentaire = null;
      continue;
    }
    if (commentaire === "bloc") {
      if (c === "*" && suivant === "/") {
        commentaire = null;
        i += 1;
      }
      continue;
    }
    if (chaine) {
      if (c === "\\") i += 1;
      else if (c === chaine) chaine = null;
      continue;
    }
    if (c === "/" && suivant === "/") {
      commentaire = "ligne";
      i += 1;
      continue;
    }
    if (c === "/" && suivant === "*") {
      commentaire = "bloc";
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      chaine = c;
      continue;
    }
    if (c === "{") profondeur += 1;
    else if (c === "}") {
      profondeur -= 1;
      if (profondeur === 0) return { kind: "litteral", texte: source.slice(ouvrante, i + 1) };
    }
  }
  // Fin de fichier sans équilibrage : le parseur a perdu le fil.
  return { kind: "echec" };
}

type Mapping = { fichier: string; ligne: number; schema: string; manquantes: string[] };

function auditer(): { mappings: Mapping[]; echecs: number } {
  const mappings: Mapping[] = [];
  // Le seul compteur qui vaille : les appels que le parseur n'a PAS su lire.
  // Tout le reste se déduit de `mappings.length`.
  let echecs = 0;

  const schemas = new Map<string, unknown>(
    Object.entries(validation).filter(([nom]) => nom.endsWith("Schema"))
  );

  for (const chemin of sourcesAAuditer()) {
    const source = readFileSync(chemin, "utf8");
    const fichier = chemin.slice(SRC.length);
    const appels = /(\w+Schema)\.safeParse\(\s*/g;

    let m: RegExpExecArray | null;
    while ((m = appels.exec(source))) {
      const [, nomSchema] = m;
      const objet = objectSchema(schemas.get(nomSchema));
      // Schéma défini localement dans l'action (ex. `reportSchema`) ou schéma
      // qui n'est pas un objet : hors de ce que ce test peut vérifier.
      if (!objet) continue;

      const repérage = litteralDeSafeParse(source, m.index + m[0].length);
      if (repérage.kind === "echec") {
        echecs += 1;
        continue;
      }
      // Mapping factorisé : par construction il ne peut pas diverger — c'est
      // le remède, pas un angle mort.
      if (repérage.kind === "factorise") continue;

      const shape = objet.shape as Record<string, AnySchema>;
      // `clé: valeur` et raccourci `clé,` — les deux passent une clé.
      const corps = repérage.texte.slice(1, -1);
      const fournies = new Set([
        ...[...corps.matchAll(/^\s*(\w+)\s*:/gm)].map((k) => k[1]),
        ...[...corps.matchAll(/^\s*(\w+)\s*,\s*$/gm)].map((k) => k[1]),
      ]);

      mappings.push({
        fichier,
        ligne: source.slice(0, m.index).split("\n").length,
        schema: nomSchema,
        manquantes: Object.keys(shape).filter(
          (cle) => !fournies.has(cle) && !shape[cle].isOptional()
        ),
      });
    }
  }

  return { mappings, echecs };
}

const { mappings, echecs } = auditer();

/** Relevé du 2026-08-23. À relever en ajoutant un mapping, jamais à baisser. */
const PLANCHER_MAPPINGS = 17;

describe("les formulaires fournissent tous les champs que leur schéma exige", () => {
  it("ne rencontre aucun code qu'il ne sait pas lire", () => {
    expect(echecs, "le parseur a perdu le fil sur un safeParse — angle mort").toBe(0);
  });

  it("audite au moins autant de mappings qu'au dernier relevé", () => {
    // PLANCHER, à RELEVER quand on ajoute un mapping littéral, jamais à
    // baisser sans raison écrite. C'est le seul garde-fou qui attrape une
    // panne SILENCIEUSE du repérage : saboter le parseur fait tomber
    // `mappings.length` à zéro, et ce test rougit. La version précédente
    // comparait deux compteurs incrémentés dans la même itération — une
    // tautologie, verte même quand plus rien n'était audité.
    expect(mappings.length).toBeGreaterThanOrEqual(PLANCHER_MAPPINGS);
  });

  it.each(mappings)("$fichier:$ligne — $schema", ({ manquantes, schema }) => {
    expect(
      manquantes,
      `${schema} exige ${manquantes.join(", ")} — le formulaire les envoie, le code ne les lit pas. ` +
        "Factorise le mapping FormData → objet et partage-le entre l'action et le composant."
    ).toEqual([]);
  });
});
