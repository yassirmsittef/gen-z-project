/**
 * Sonde WebGL — la question que les scènes 3D doivent poser avant de
 * construire un rendu three.js.
 *
 * Certains navigateurs n'offrent pas WebGL du tout : Safari en mode Isolement
 * (iOS/macOS, « Lockdown Mode »), un GPU mis sur liste noire, une machine
 * virtuelle, un vieil appareil. three.js exige WebGL 2 et lève
 * « Error creating WebGL context » quand il manque ; non rattrapée, l'erreur
 * fait tomber tout l'arbre React et le visiteur voit notre page « 500 » pour
 * une page que le serveur a pourtant servie correctement (vu le 25/09/2026 sur
 * l'iPhone du fondateur, mode Isolement activé).
 *
 * Le verdict est calculé une seule fois par page : la sonde crée un contexte,
 * que l'on rend aussitôt (le navigateur plafonne le nombre de contextes
 * simultanés, et les scènes en consomment déjà).
 */
let verdict: boolean | null = null;

export function hasWebGL(): boolean {
  if (verdict === null) verdict = probe();
  return verdict;
}

function probe(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Oublie le verdict (tests uniquement). */
export function resetWebGLProbe(): void {
  verdict = null;
}
