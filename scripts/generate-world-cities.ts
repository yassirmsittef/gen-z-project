/**
 * Génère src/lib/world-cities.json : toutes les villes du monde de plus de
 * 5 000 habitants (GeoNames « cities5000 », licence CC BY 4.0).
 *
 * Source : https://download.geonames.org/export/dump/cities5000.zip
 *   curl -sL -o /tmp/cities5000.zip https://download.geonames.org/export/dump/cities5000.zip
 *   unzip -o /tmp/cities5000.zip -d /tmp
 *   npx tsx scripts/generate-world-cities.ts /tmp/cities5000.txt
 *
 * Sortie compacte, tableau de tableaux : [nom, nomAscii, codePays, lat, lng, population, alternatifs?]
 * (nomAscii omis = "" quand identique au nom ; alternatifs seulement ≥ 100 000 hab.). Le pays est un code ISO 3166-1 :
 * son nom s'affiche dans la langue du lecteur via Intl.DisplayNames.
 * Ce JSON ne doit JAMAIS être importé côté client (~3 Mo) : recherche serveur.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src) throw new Error("chemin de cities5000.txt attendu");
const rows = readFileSync(src, "utf8").split("\n").filter(Boolean);
type Row = [string, string, string, number, number, number, string[]?];
const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s\-–—']+/g, " ").trim();
const out: Row[] = [];
for (const line of rows) {
  const c = line.split("\t");
  // GeoNames : 1 name, 2 asciiname, 3 alternatenames, 4 lat, 5 lng, 8 country code, 14 population
  const name = c[1], ascii = c[2], lat = Number(c[4]), lng = Number(c[5]), cc = c[8], pop = Number(c[14]) || 0;
  if (!name || !cc || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  const row: Row = [name, ascii === name ? "" : ascii, cc, Math.round(lat * 100) / 100, Math.round(lng * 100) / 100, pop];
  // GeoNames nomme les grandes villes en anglais (« Geneva », « Brussels »,
  // « Rome ») : pour les villes ≥ 100 000 hab., on garde les noms alternatifs
  // en écriture latine ou arabe (« Genève », « Bruxelles », « Roma », « لندن »)
  // pour que chacun trouve sa ville dans sa langue. Les petites villes se
  // tapent comme les locaux les écrivent.
  if (pop >= 100_000 && c[3]) {
    const vus = new Set([norm(name), norm(ascii)]);
    const alts: string[] = [];
    for (const alt of c[3].split(",")) {
      const a = alt.trim();
      if (a.length < 3 || a.length > 40) continue;
      if (!/^[\p{Script=Latin}\p{M}\s'\-.]+$/u.test(a) && !/^[\p{Script=Arabic}\s]+$/u.test(a)) continue;
      const k = norm(a);
      if (!k || vus.has(k)) continue;
      vus.add(k);
      alts.push(a);
    }
    if (alts.length) row.push(alts);
  }
  out.push(row);
}
// Les plus peuplées d'abord : « Paris » sans précision = Paris (France), pas Paris (Texas).
out.sort((a, b) => b[5] - a[5]);
const dest = path.join(process.cwd(), "src/lib/world-cities.json");
writeFileSync(dest, JSON.stringify(out));
console.log(`✅ ${out.length} villes → ${dest} (${(JSON.stringify(out).length / 1024 / 1024).toFixed(2)} Mo)`);
