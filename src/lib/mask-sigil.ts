import * as THREE from "three";

/**
 * LE SIGIL — source canonique du masque « médecin de la peste » dérivé du
 * logo (grand Y évasé + petit M inversé), validé le 2026-07-04.
 *
 * Réutilisation :
 *  - 3D (Three.js) : `createMaskSigil()` → groupe prêt à ajouter à une scène ;
 *  - 2D (THREE.Shape) : `createMaskShape()` pour toute extrusion custom ;
 *  - Assets exportés : `public/brand/mask-sigil.svg` (vectoriel) et
 *    `public/brand/mask-sigil.obj` (modèle 3D) — régénérables via
 *    `npx tsx scripts/export-mask.ts`.
 *
 * Ne pas modifier les coordonnées sans validation : c'est la forme de marque.
 */

// Le grand Y : cornes filant en diagonale sur les côtés (pas de pointe qui
// remonte), dans le même mouvement que le V central. Le petit M inversé :
// corps ramassé, lobes refermés haut, long bec effilé.
export const MASK_OUTLINE: Array<[number, number]> = [
  [-1.52, 1.7],
  [-1.02, 0.55],
  [-0.78, -0.4],
  [-0.5, -0.82],
  [-0.22, -0.72],
  [0, -2.05],
  [0.22, -0.72],
  [0.5, -0.82],
  [0.78, -0.4],
  [1.02, 0.55],
  [1.52, 1.7],
  [0.62, 1.18],
  [0, 0.85],
  [-0.62, 1.18],
];

// Grands yeux triangulaires descendants, inclinés comme les bras du Y —
// les espaces négatifs du logo d'origine.
export const MASK_EYES: Array<Array<[number, number]>> = [
  [
    [-0.88, 0.8],
    [-0.28, -0.1],
    [-0.62, -0.38],
  ],
  [
    [0.88, 0.8],
    [0.62, -0.38],
    [0.28, -0.1],
  ],
];

export const MASK_EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.34,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.04,
  bevelSegments: 2,
};

/** Silhouette 2D (contour + yeux percés), centrée sur l'origine, ~3,75 de haut. */
export function createMaskShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const [firstX, firstY] = MASK_OUTLINE[0];
  shape.moveTo(firstX, firstY);
  for (const [x, y] of MASK_OUTLINE.slice(1)) shape.lineTo(x, y);
  shape.closePath();

  for (const triangle of MASK_EYES) {
    const hole = new THREE.Path();
    hole.moveTo(triangle[0][0], triangle[0][1]);
    hole.lineTo(triangle[1][0], triangle[1][1]);
    hole.lineTo(triangle[2][0], triangle[2][1]);
    hole.closePath();
    shape.holes.push(hole);
  }

  return shape;
}

export type MaskSigilOptions = {
  bodyColor?: THREE.ColorRepresentation;
  edgeColor?: THREE.ColorRepresentation;
  scale?: number;
};

/**
 * Le masque en 3D : monolithe extrudé (obsidienne métallique par défaut)
 * + arêtes lumineuses additives. Nécessite de la lumière dans la scène
 * (le matériau du corps est un MeshPhysicalMaterial : verre iridescent). Les matériaux sont
 * exposés pour permettre d'animer sa naissance (pulse émissif, glow).
 */
export function createMaskSigil(options: MaskSigilOptions = {}): {
  group: THREE.Group;
  bodyMaterial: THREE.MeshPhysicalMaterial;
  edgeMaterial: THREE.LineBasicMaterial;
  dispose: () => void;
} {
  const { bodyColor = "#12161f", edgeColor = "#38BDF8", scale = 0.62 } = options;

  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.6,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
    iridescence: 0.85,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [130, 460],
    envMapIntensity: 1.1,
  });
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: edgeColor,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });

  const geometry = new THREE.ExtrudeGeometry(createMaskShape(), MASK_EXTRUDE);
  geometry.translate(0, 0, -(MASK_EXTRUDE.depth ?? 0.34) / 2);
  group.add(new THREE.Mesh(geometry, bodyMaterial));

  const edges = new THREE.EdgesGeometry(geometry, 20);
  group.add(new THREE.LineSegments(edges, edgeMaterial));

  group.scale.setScalar(scale);

  return {
    group,
    bodyMaterial,
    edgeMaterial,
    dispose: () => {
      geometry.dispose();
      edges.dispose();
      bodyMaterial.dispose();
      edgeMaterial.dispose();
    },
  };
}

/**
 * Environnement studio nocturne teinté aurora (teal / cyan / violet), généré
 * en interne (aucun asset HDR). Donne au verre du sigil ses reflets — à poser
 * en `scene.environment` dans TOUTE scène qui affiche le masque : sans lui, le
 * MeshPhysicalMaterial métallique n'a rien à réfléchir et rend sombre.
 */
export function buildSigilEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, "#0a0d18");
  bg.addColorStop(0.45, "#10233a");
  bg.addColorStop(0.55, "#1a2450");
  bg.addColorStop(1, "#050609");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 256);
  const blob = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
  };
  blob(150, 90, 150, "rgba(94,234,212,0.55)");
  blob(380, 120, 160, "rgba(192,132,252,0.45)");
  blob(280, 60, 120, "rgba(56,189,248,0.5)");
  const equi = new THREE.CanvasTexture(canvas);
  equi.mapping = THREE.EquirectangularReflectionMapping;
  equi.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(equi).texture;
  pmrem.dispose();
  equi.dispose();
  return env;
}
