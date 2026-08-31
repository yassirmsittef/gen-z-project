import { describe, expect, it } from "vitest";
import { registerSchema } from "../src/lib/validation";

/**
 * La confirmation du mot de passe à l'inscription.
 *
 * Les formulaires « changer » et « réinitialiser » exigeaient déjà de retaper
 * le mot de passe ; l'inscription — le seul endroit où PERSONNE ne connaît
 * encore le mot de passe — était aussi le seul à s'en passer. Une faute de
 * frappe invisible y crée un compte inutilisable dont l'unique issue est le
 * « mot de passe oublié ».
 *
 * La règle vit dans le SCHÉMA (Zod des deux côtés, comme resetPasswordSchema) :
 * le garde-fou de contrat-formulaires force l'action à transmettre le champ,
 * et ces tests prouvent que le schéma refuse vraiment — pas de tautologie,
 * chaque cas peut échouer en retirant le .refine ou le champ.
 */

const valide = {
  name: "Yassir",
  email: "fondateur@exemple.fr",
  password: "correct-horse-8",
  preferredLanguage: "fr",
};

describe("registerSchema — confirmation du mot de passe", () => {
  it("refuse une confirmation différente, en pointant le bon champ", () => {
    const parsed = registerSchema.safeParse({
      ...valide,
      confirmPassword: "correct-horse-9",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.errors[0].message).toBe(
      "La confirmation ne correspond pas au mot de passe."
    );
    expect(parsed.error.errors[0].path).toEqual(["confirmPassword"]);
  });

  it("refuse un envoi SANS confirmation — un POST forgé ne contourne pas la règle", () => {
    const parsed = registerSchema.safeParse({ ...valide });
    expect(parsed.success).toBe(false);
  });

  it("accepte quand les deux saisies concordent", () => {
    const parsed = registerSchema.safeParse({
      ...valide,
      confirmPassword: valide.password,
    });
    expect(parsed.success).toBe(true);
  });
});
