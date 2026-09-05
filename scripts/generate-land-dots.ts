/**
 * Génère src/lib/land-dots.json : les continents en « matrice de points »
 * pour le globe de la page Communauté (earth-scene.tsx).
 *
 * Échantillonne la sphère en lignes de latitude à densité constante
 * (pas angulaire fixe, nombre de colonnes ∝ cos(lat)) et garde les points
 * qui tombent sur la terre ferme (point-in-polygon sur world-atlas 50m).
 *
 * Sortie : tableau plat [lat0, lng0, lat1, lng1, ...] arrondi au dixième.
 * À relancer uniquement si on change la densité : le JSON est commité.
 *
 *   npx tsx scripts/generate-land-dots.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

const require = createRequire(import.meta.url);

type Ring = number[][]; // [lng, lat][]

const topo = JSON.parse(
  readFileSync(require.resolve("world-atlas/land-50m.json"), "utf8")
) as Topology<{ land: GeometryCollection }>;

const land = feature(topo, topo.objects.land);
const geometries = land.features.flatMap((f) => {
  const geom = f.geometry;
  if (geom.type === "Polygon") return [geom.coordinates as Ring[]];
  if (geom.type === "MultiPolygon") return geom.coordinates as Ring[][];
  return [];
});

/** Ray casting classique sur un anneau [lng, lat]. */
function inRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Boîtes englobantes pré-calculées pour éviter le ray casting inutile. */
const polygons = geometries.map((rings) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [lng, lat] of rings[0]) {
    if (lng < minX) minX = lng;
    if (lng > maxX) maxX = lng;
    if (lat < minY) minY = lat;
    if (lat > maxY) maxY = lat;
  }
  return { rings, minX, minY, maxX, maxY };
});

function onLand(lng: number, lat: number): boolean {
  for (const { rings, minX, minY, maxX, maxY } of polygons) {
    if (lng < minX || lng > maxX || lat < minY || lat > maxY) continue;
    if (!inRing(lng, lat, rings[0])) continue;
    // Trous (lacs, mers intérieures) : anneaux suivants.
    let inHole = false;
    for (let h = 1; h < rings.length; h++) {
      if (inRing(lng, lat, rings[h])) {
        inHole = true;
        break;
      }
    }
    if (!inHole) return true;
  }
  return false;
}

// Pas angulaire : densité du maillage. La Terre ENTIÈRE, pôle à pôle : la
// version d'origine coupait sous -60° (Antarctique) « comme les visualisations
// classiques » ; le fondateur veut voir toute la planète (décision 06/09/2026).
const STEP = 1.1;
const DEG = Math.PI / 180;
const dots: number[] = [];

for (let lat = -89; lat <= 89; lat += STEP) {
  const cols = Math.max(1, Math.round((360 / STEP) * Math.cos(lat * DEG)));
  // Décalage d'une demi-colonne une ligne sur deux : casse l'alignement vertical.
  const offset = (Math.round(lat / STEP) % 2) * 0.5;
  for (let i = 0; i < cols; i++) {
    const lng = ((i + offset) / cols) * 360 - 180;
    if (onLand(lng, lat)) {
      dots.push(Math.round(lat * 10) / 10, Math.round(lng * 10) / 10);
    }
  }
}

const outPath = path.join(process.cwd(), "src/lib/land-dots.json");
writeFileSync(outPath, JSON.stringify(dots));
console.log(`✅ ${dots.length / 2} points de terre → ${outPath}`);

// La Terre miniature de la barre (navbar-globe) : 1 point sur 10, même jeu.
const mini: number[] = [];
for (let i = 0; i < dots.length; i += 20) mini.push(dots[i], dots[i + 1]);
const miniPath = path.join(process.cwd(), "src/lib/land-dots-mini.json");
writeFileSync(miniPath, JSON.stringify(mini));
console.log(`✅ ${mini.length / 2} points (mini) → ${miniPath}`);
