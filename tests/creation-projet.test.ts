import { describe, expect, it } from "vitest";
import { createProjectSchema, projectFormToInput } from "../src/lib/validation";

/**
 * Le contrat entre le formulaire de création et son schéma.
 *
 * Régression réelle : lors du pivot argent réel (`b321a94`), `currency` a été
 * ajouté au schéma et au formulaire mais PAS à l'action serveur, qui
 * recopiait la liste des champs de son côté. Résultat : toute création de
 * projet échouait sur un « Required » incompréhensible, côté serveur
 * uniquement — la validation client, elle, passait. Ces tests décrivent le
 * formulaire tel qu'il est rendu et exigent qu'il satisfasse le schéma.
 */

/** Exactement les champs que rend `CreateProjectForm`. */
function formulaireComplet(): FormData {
  const formData = new FormData();
  formData.set("title", "Torréfaction Transparente");
  formData.set("pitch", "Café acheté en direct, prix producteur imprimé sur chaque paquet.");
  formData.set(
    "description",
    "On achète en direct auprès de deux coopératives, on torréfie en petit lot, et on imprime sur chaque paquet le prix payé au producteur."
  );
  formData.set("category", "FOOD");
  formData.set("currency", "eur");
  formData.set("goal", "2000");
  formData.set("durationDays", "45");
  formData.set("neededSkills", "");
  formData.set("coverUrl", "");
  return formData;
}

const ETAPES = [
  { title: "Coopératives sourcées", description: "Contrats signés avec deux coopératives.", amount: 900 },
  { title: "Premiers paquets vendus", description: "Cent paquets vendus, prix affiché.", amount: 1100 },
];

describe("le formulaire de création satisfait son schéma", () => {
  it("accepte un formulaire rempli normalement", () => {
    const parsed = createProjectSchema.safeParse(projectFormToInput(formulaireComplet(), ETAPES));
    expect(parsed.success, parsed.success ? "" : parsed.error.errors[0].message).toBe(true);
  });

  it("transporte la devise choisie — le champ oublié qui cassait tout", () => {
    const formData = formulaireComplet();
    formData.set("currency", "chf");

    const input = projectFormToInput(formData, ETAPES);
    expect(input.currency).toBe("chf");

    const parsed = createProjectSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.currency).toBe("chf");
  });

  it("couvre chaque champ requis par le schéma", () => {
    const input = projectFormToInput(formulaireComplet(), ETAPES) as Record<string, unknown>;

    // On part du SCHÉMA, pas de l'objet produit. Itérer sur les clés de
    // l'objet ne pouvait rien détecter : un champ OUBLIÉ n'y figure pas, donc
    // n'était jamais examiné — la boucle passait au vert sur le bug même
    // qu'elle prétendait figer (`currency` absent).
    const shape = createProjectSchema._def.schema.shape as Record<string, { isOptional(): boolean }>;
    const requis = Object.keys(shape).filter((cle) => !shape[cle].isOptional());
    expect(requis.length).toBeGreaterThan(5);

    for (const cle of requis) {
      expect(
        input[cle],
        `le champ « ${cle} » est exigé par le schéma mais absent du mapping`
      ).not.toBeUndefined();
    }
  });

  it("refuse encore ce qui doit l'être", () => {
    const formData = formulaireComplet();
    formData.set("currency", "monnaie-de-singe");
    expect(createProjectSchema.safeParse(projectFormToInput(formData, ETAPES)).success).toBe(false);

    const desequilibre = formulaireComplet();
    desequilibre.set("goal", "3000"); // les étapes totalisent 2000
    expect(
      createProjectSchema.safeParse(projectFormToInput(desequilibre, ETAPES)).success
    ).toBe(false);
  });
});
