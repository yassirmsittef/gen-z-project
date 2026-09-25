import * as THREE from "three";
import { hasWebGL } from "@/lib/webgl-support";

/**
 * Un rendu three.js, ou `null` quand le navigateur ne peut pas en fournir.
 *
 * Deux filets : la sonde (aucun chargement inutile, aucune erreur en console)
 * puis le constructeur lui-même, qui peut encore échouer quand le navigateur a
 * atteint son plafond de contextes. Dans les deux cas la scène appelante doit
 * afficher son rendu de secours au lieu de laisser l'erreur remonter.
 */
export function createWebGLRenderer(
  parameters: THREE.WebGLRendererParameters
): THREE.WebGLRenderer | null {
  if (!hasWebGL()) return null;
  try {
    return new THREE.WebGLRenderer(parameters);
  } catch {
    return null;
  }
}
