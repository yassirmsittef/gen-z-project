/**
 * Exporte le sigil (masque médecin de la peste) en assets réutilisables :
 *   - public/brand/mask-sigil.svg  — silhouette vectorielle 2D (logo, print…)
 *   - public/brand/mask-sigil.obj  — modèle 3D (Blender, Unity, Spline…)
 *
 *   npx tsx scripts/export-mask.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as THREE from "three";
import { createMaskShape, MASK_EXTRUDE, MASK_EYES, MASK_OUTLINE } from "../src/lib/mask-sigil";

const OUT_DIR = resolve(process.cwd(), "public/brand");
mkdirSync(OUT_DIR, { recursive: true });

// ---------- SVG (2D) ----------
// Y inversé : le repère SVG pointe vers le bas.
function toPath(points: Array<[number, number]>): string {
  return (
    points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(3)},${(-y).toFixed(3)}`)
      .join(" ") + " Z"
  );
}

const svgPath = [toPath(MASK_OUTLINE), ...MASK_EYES.map(toPath)].join(" ");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.72 -1.9 3.44 4.15">
  <!-- Sigil Tremplin — masque médecin de la peste (source : src/lib/mask-sigil.ts) -->
  <path d="${svgPath}" fill="#F1F5F9" fill-rule="evenodd"/>
</svg>
`;
writeFileSync(resolve(OUT_DIR, "mask-sigil.svg"), svg);

// ---------- OBJ (3D) ----------
const geometry = new THREE.ExtrudeGeometry(createMaskShape(), MASK_EXTRUDE);
geometry.translate(0, 0, -(MASK_EXTRUDE.depth ?? 0.34) / 2);

const position = geometry.getAttribute("position");
const lines: string[] = [
  "# Sigil Tremplin — masque médecin de la peste",
  "# Source canonique : src/lib/mask-sigil.ts",
  "o mask_sigil",
];
for (let i = 0; i < position.count; i++) {
  lines.push(
    `v ${position.getX(i).toFixed(5)} ${position.getY(i).toFixed(5)} ${position.getZ(i).toFixed(5)}`
  );
}
if (geometry.index) {
  const index = geometry.index;
  for (let i = 0; i < index.count; i += 3) {
    lines.push(`f ${index.getX(i) + 1} ${index.getX(i + 1) + 1} ${index.getX(i + 2) + 1}`);
  }
} else {
  for (let i = 0; i < position.count; i += 3) {
    lines.push(`f ${i + 1} ${i + 2} ${i + 3}`);
  }
}
writeFileSync(resolve(OUT_DIR, "mask-sigil.obj"), lines.join("\n") + "\n");

console.log(`✅ Assets exportés dans public/brand/ :`);
console.log(`   mask-sigil.svg  (${svg.length} octets)`);
console.log(`   mask-sigil.obj  (${position.count} sommets, ${Math.round(lines.length)} lignes)`);
