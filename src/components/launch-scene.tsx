"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildSigilEnvironment, createMaskSigil } from "@/lib/mask-sigil";

/**
 * Portail 3D de la transition « identité » (Connexion / S'inscrire) — monté
 * dans le voile de lancement sur n'importe quelle page, en deux actes :
 *
 *  Acte 1 (traversée) — le masque d'obsidienne surgit du fond vers
 *  l'observateur pendant que TOUTE la lumière vire du bleu au violet foncé ;
 *  deux vortex de particules contre-rotatifs sont aspirés avec lui.
 *
 *  Acte 2 (amarrage) — au lieu de disparaître, le masque file en toupie vers
 *  le logo de la navbar (ancre `data-sigil-dock`, déprojetée écran → monde)
 *  et s'y range en miniature — où le logo 3D permanent (navbar-sigil.tsx)
 *  prend le relais, en rotation continue. Continuité parfaite.
 *
 * One-shot ~1,5s, canvas transparent au-dessus du voile CSS, dispose complet
 * au démontage (le fondu de sortie du voile parent emporte le canvas).
 */

const DURATION = 1.5;

/** Part de la timeline consacrée à la traversée (le reste : l'amarrage). */
const TRAVEL_PORTION = 0.6;

/** Hauteur du glyphe du masque en unités monde, à l'échelle 1. */
const MASK_GLYPH_HEIGHT = 3.75;

const BLUE = new THREE.Color("#38BDF8");
const TEAL = new THREE.Color("#5EEAD4");
const VIOLET = new THREE.Color("#8B5CF6");
const DEEP_VIOLET = new THREE.Color("#4C1D95");

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Déprojette le centre de l'ancre navbar (coordonnées écran) vers le plan
 * monde `planeZ`, et calcule l'échelle du masque pour tenir dans l'ancre.
 */
function getDockTarget(camera: THREE.PerspectiveCamera, planeZ: number) {
  const anchor = document.querySelector("[data-sigil-dock]");
  const rect = anchor?.getBoundingClientRect();
  const centerX = rect ? rect.left + rect.width / 2 : 44;
  const centerY = rect ? rect.top + rect.height / 2 : 38;
  const sizePx = rect ? rect.height : 40;

  const ndcX = (centerX / window.innerWidth) * 2 - 1;
  const ndcY = -(centerY / window.innerHeight) * 2 + 1;
  const distance = camera.position.z - planeZ;
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
  const halfWidth = halfHeight * camera.aspect;

  return {
    x: ndcX * halfWidth,
    y: ndcY * halfHeight,
    scale: ((sizePx / window.innerHeight) * (halfHeight * 2)) / MASK_GLYPH_HEIGHT,
  };
}

type Vortex = {
  points: THREE.Points;
  direction: number;
};

function buildVortex(
  count: number,
  baseRadius: number,
  turns: number,
  colorA: THREE.Color,
  colorB: THREE.Color,
  direction: number
): { vortex: Vortex; dispose: () => void } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const progress = i / count;
    const angle = progress * Math.PI * 2 * turns;
    const radius = baseRadius * (0.3 + 0.7 * progress) + (Math.random() - 0.5) * 0.18;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = (progress - 0.5) * 2.6 + (Math.random() - 0.5) * 0.3;

    color.lerpColors(colorA, colorB, progress);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  return {
    vortex: { points, direction },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

export default function LaunchScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const disposers: Array<() => void> = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const env = buildSigilEnvironment(renderer);
    scene.environment = env;
    disposers.push(() => env.dispose());

    // Le masque canonique, prêt à traverser l'écran.
    const sigil = createMaskSigil({ scale: 0.85 });
    scene.add(sigil.group);
    disposers.push(sigil.dispose);

    // Éclairage : il vire du bleu au violet foncé pendant la traversée.
    const ambient = new THREE.AmbientLight(BLUE.clone(), 0.6);
    const keyLight = new THREE.PointLight(BLUE.clone(), 70, 30);
    keyLight.position.set(3, 2, 5);
    const rimLight = new THREE.PointLight(TEAL.clone(), 50, 30);
    rimLight.position.set(-3, -2, 4);
    scene.add(ambient, keyLight, rimLight);
    disposers.push(() => {
      ambient.dispose();
      keyLight.dispose();
      rimLight.dispose();
    });

    // Deux vortex contre-rotatifs, aspirés avec le masque.
    const vortices: Vortex[] = [];
    const vortexConfigs: Array<Parameters<typeof buildVortex>> = [
      [320, 2.6, 3, BLUE, VIOLET, 1],
      [240, 3.4, 2, TEAL, DEEP_VIOLET, -1],
    ];
    for (const config of vortexConfigs) {
      const { vortex, dispose } = buildVortex(...config);
      scene.add(vortex.points);
      vortices.push(vortex);
      disposers.push(dispose);
    }

    const timer = new THREE.Timer();
    let elapsed = 0;
    let frame = 0;

    // Plan d'amarrage : là où le masque finit sa traversée.
    const DOCK_PLANE_Z = 2;
    const dockTarget = getDockTarget(camera, DOCK_PLANE_Z);

    const renderFrame = () => {
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.05);
      elapsed += delta;
      const t = Math.min(1, elapsed / DURATION);

      // Acte 1 — traversée : le masque surgit du fond vers l'observateur.
      const travel = easeInOutCubic(Math.min(1, t / TRAVEL_PORTION));
      // Acte 2 — amarrage : il file en toupie se ranger sur le logo navbar.
      const dock = t <= TRAVEL_PORTION
        ? 0
        : easeInOutCubic((t - TRAVEL_PORTION) / (1 - TRAVEL_PORTION));

      sigil.group.position.z = -5 + travel * (DOCK_PLANE_Z + 5);
      sigil.group.position.x = dockTarget.x * dock;
      sigil.group.position.y = dockTarget.y * dock;
      sigil.group.scale.setScalar(THREE.MathUtils.lerp(0.85, dockTarget.scale, dock));

      // La toupie : arrivée en rotation, puis 1,5 tour pendant l'amarrage,
      // et rotation continue une fois rangé (le voile fond dessus).
      sigil.group.rotation.y =
        -0.9 + travel * 1.05 + dock * Math.PI * 3 + (t >= 1 ? (elapsed - DURATION) * 2.2 : 0);
      sigil.group.rotation.z = -0.12 + travel * 0.12;

      // Embrasement en cloche pendant la traversée, apaisé une fois rangé.
      const blaze = Math.sin(t * Math.PI);
      sigil.bodyMaterial.emissive.lerpColors(BLUE, VIOLET, t);
      sigil.bodyMaterial.emissiveIntensity = 0.15 + blaze;
      sigil.edgeMaterial.color.lerpColors(BLUE, VIOLET, t);

      // Toute la lumière vire au violet foncé.
      keyLight.color.lerpColors(BLUE, VIOLET, t);
      rimLight.color.lerpColors(TEAL, DEEP_VIOLET, t);
      ambient.color.lerpColors(BLUE, DEEP_VIOLET, t);

      // Les vortex convergent en accélérant, puis s'estompent à l'amarrage.
      for (const vortex of vortices) {
        vortex.points.rotation.z += vortex.direction * delta * (1.2 + t * 2.4);
        const squeeze = 1 - easeInOutCubic(t) * 0.62;
        vortex.points.scale.set(squeeze, squeeze, 1);
        (vortex.points.material as THREE.PointsMaterial).opacity = 0.9 * (1 - dock * 0.85);
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      for (const dispose of disposers) dispose();
      renderer.dispose();
      // Libère le contexte WebGL immédiatement : sans ça, les portails
      // successifs saturent le pool du navigateur, qui évince alors le plus
      // ancien contexte (le logo navbar).
      renderer.forceContextLoss();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // z-index 1 : au-dessus du calque violet ::after du voile parent.
  return <div ref={containerRef} className="absolute inset-0 z-[1]" aria-hidden />;
}
