import { describe, expect, it } from "vitest";
import { cityLabel, countryLabel, findCity, searchCities, WORLD_CITY_COUNT } from "../src/lib/cities";

/**
 * Toutes les villes du monde (> 5 000 hab.) : n'importe qui, où qu'il vive,
 * doit pouvoir poser sa ville — et le pays s'écrit dans SA langue.
 */
describe("villes du monde", () => {
  it("connaît bien plus que 156 villes", () => {
    expect(WORLD_CITY_COUNT).toBeGreaterThan(60_000);
  });

  it("retrouve des villes hors de France, avec leurs coordonnées", () => {
    expect(findCity("Dakar")).toMatchObject({ country: "SN" });
    expect(findCity("Montréal")).toMatchObject({ country: "CA" });
    expect(findCity("lagos")).toMatchObject({ country: "NG" });
    expect(findCity("Genève")?.lat).toBeCloseTo(46.2, 0);
    expect(findCity("Casablanca")).toMatchObject({ country: "MA" });
  });

  it("reconnaît les noms dans la langue du membre, pas seulement l'anglais de GeoNames", () => {
    expect(findCity("Bruxelles")).toMatchObject({ name: "Brussels", country: "BE" });
    expect(findCity("Roma")).toMatchObject({ name: "Rome", country: "IT" });
    expect(findCity("München")).toMatchObject({ name: "Munich", country: "DE" });
    expect(findCity("Londres")).toMatchObject({ name: "London", country: "GB" });
    expect(findCity("القاهرة")).toMatchObject({ name: "Cairo", country: "EG" });
  });

  it("sans pays, la plus peuplée gagne ; avec pays (code ou nom, toute langue), elle est désambiguïsée", () => {
    expect(findCity("Paris")).toMatchObject({ country: "FR" });
    expect(findCity("Paris — France")).toMatchObject({ country: "FR" });
    expect(findCity("Paris, Frankreich")).toMatchObject({ country: "FR" }); // allemand
    expect(findCity("Paris (US)")).toMatchObject({ country: "US" });
    expect(findCity("Paris — United States")).toMatchObject({ country: "US" });
  });

  it("propose des suggestions par préfixe, les plus grandes d'abord", () => {
    const s = searchCities("dak");
    expect(s.length).toBeGreaterThan(0);
    expect(s[0].name).toBe("Dakar");
    expect(searchCities("x")).toEqual([]); // trop court
  });

  it("écrit le pays dans la langue du lecteur, et laisse un nom hérité tel quel", () => {
    expect(countryLabel("SN", "fr")).toBe("Sénégal");
    expect(countryLabel("SN", "en")).toBe("Senegal");
    expect(countryLabel("DE", "ar")).toBe("ألمانيا");
    expect(countryLabel("France", "en")).toBe("France"); // valeur d'avant la bascule
    expect(cityLabel(findCity("Dakar")!, "es")).toBe("Dakar — Senegal");
  });
});
