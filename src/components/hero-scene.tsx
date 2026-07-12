"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildSigilEnvironment, createMaskSigil } from "@/lib/mask-sigil";

/**
 * Scène 3D du hero — l'« audace unique » de la page d'accueil (DA néo-futurisme).
 *
 * Séquence d'ouverture (2,6 s) :
 *  Acte 1 — le sigil naît en géant plein écran et se pose à sa place en
 *           rétrécissant, avec une légère rotation d'arrivée ;
 *  Acte 2 — les particules jaillissent de lui (traversant les yeux percés)
 *           et spiralent vers leurs orbites, un anneau après l'autre ;
 *  Acte 3 — la poussière d'étoiles se dépose, puis les textes se révèlent
 *           en cascade (CSS `hero-reveal`, voir page.tsx).
 *
 * Garde-fous (skill ui-ux-pro-max / threejs) : Points + BufferGeometry,
 * ~600 particules, zéro ombre, DPR plafonné à 2, pause hors écran,
 * prefers-reduced-motion → une seule frame statique (état final), dispose complet.
 */

const TEAL = new THREE.Color("#5EEAD4");
const CYAN = new THREE.Color("#38BDF8");
const VIOLET = new THREE.Color("#C084FC");

/** Durée de la séquence d'ouverture (secondes) — lente et majestueuse. */
const INTRO_DURATION = 4.2;

/** Durée de la plongée « lancement d'un rêve » (secondes). */
const LAUNCH_DURATION = 1.5;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Sortie quintique : encore plus de douceur en fin de course (majestueux). */
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/** Léger dépassement (~4%) puis retour : l'arrivée « spring » des anneaux. */
function easeOutBack(t: number): number {
  const c1 = 1.10158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

type Ring = {
  /** Groupe incliné : son échelle anime l'émergence depuis le masque. */
  shell: THREE.Group;
  points: THREE.Points;
  material: THREE.PointsMaterial;
  speed: number;
};

function buildRing(
  radius: number,
  count: number,
  colorA: THREE.Color,
  colorB: THREE.Color,
  tiltX: number,
  tiltZ: number,
  speed: number
): { ring: Ring; dispose: () => void } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    // Léger bruit pour un anneau vivant, pas un cercle parfait.
    const r = radius + (Math.random() - 0.5) * 0.12;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = Math.sin(angle) * r;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.08;

    // Dégradé le long de l'anneau (aller-retour pour éviter la couture).
    const t = 1 - Math.abs(i / count - 0.5) * 2;
    color.lerpColors(colorA, colorB, t);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  const shell = new THREE.Group();
  shell.rotation.set(tiltX, 0, tiltZ);
  shell.add(points);

  return {
    ring: { shell, points, material, speed },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

/** Sprite additif : le halo lumineux (bloom-like) derrière le sigil. */
function buildGlowSprite(): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(120,240,220,0.9)");
  g.addColorStop(0.4, "rgba(56,189,248,0.32)");
  g.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0,
  });
  return new THREE.Sprite(mat);
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Mobile : sigil moins imposant et moins lumineux (scène réduite + bloom/halo atténués).
    const mobile = container.clientWidth < 640;
    const disposers: Array<() => void> = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.5, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Environnement teinté aurora : le sigil reflète la DA (teal / cyan / violet).
    const envTexture = buildSigilEnvironment(renderer);
    scene.environment = envTexture;
    disposers.push(() => envTexture.dispose());

    // Bloom : la lumière des zones brillantes (arêtes du sigil, particules
    // additives, émissif à la naissance / plongée) déborde en halo. Même
    // contexte WebGL que le renderer (pas de contexte supplémentaire) ; le tone
    // mapping ACES est appliqué en fin de chaîne par l'OutputPass.
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(container.clientWidth, container.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      mobile ? 0.55 : 0.95,
      0.6,
      mobile ? 0.72 : 0.6
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    disposers.push(() => {
      bloomPass.dispose();
      composer.dispose();
    });

    const world = new THREE.Group();
    // L'élan : l'ensemble légèrement incliné, jamais parfaitement axial.
    world.rotation.z = -0.08;
    // Sur petit écran, on réduit l'ensemble (sigil + anneaux) pour qu'il ne
    // dévore pas le hero derrière le texte.
    world.scale.setScalar(mobile ? 0.72 : 1);
    scene.add(world);

    // Noyau : le sigil — monolithe d'obsidienne aux arêtes lumineuses.
    const sigil = createMaskSigil();
    world.add(sigil.group);
    disposers.push(sigil.dispose);

    // Halo lumineux (bloom-like) derrière le sigil — additif, suit sa naissance.
    const glow = buildGlowSprite();
    glow.position.z = -0.45;
    world.add(glow);
    disposers.push(() => {
      const mat = glow.material as THREE.SpriteMaterial;
      mat.map?.dispose();
      mat.dispose();
    });

    // Éclairage du monolithe : lueur cyan d'un côté, violette de l'autre.
    const ambient = new THREE.AmbientLight(CYAN, 0.5);
    const keyLight = new THREE.PointLight(TEAL, 60, 20);
    keyLight.position.set(3.2, 2.2, 4);
    const rimLight = new THREE.PointLight(VIOLET, 45, 20);
    rimLight.position.set(-3.2, -1.6, 3);
    scene.add(ambient, keyLight, rimLight);
    disposers.push(() => {
      ambient.dispose();
      keyLight.dispose();
      rimLight.dispose();
    });

    // Trois anneaux orbitaux de particules (la communauté autour du projet).
    const rings: Ring[] = [];
    const ringConfigs: Array<Parameters<typeof buildRing>> = [
      [2.1, 110, TEAL, CYAN, 0.55, 0.12, 0.14],
      [2.85, 150, CYAN, VIOLET, -0.38, 0.42, -0.09],
      [3.6, 190, VIOLET, CYAN, 0.18, -0.52, 0.06],
    ];
    for (const config of ringConfigs) {
      const { ring, dispose } = buildRing(...config);
      world.add(ring.shell);
      rings.push(ring);
      disposers.push(dispose);
    }

    // Poussière d'étoiles très discrète en fond.
    const starCount = 180;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 6 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi) - 4;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#94A3B8"),
      size: 0.02,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeometry, starMaterial));
    disposers.push(() => {
      starGeometry.dispose();
      starMaterial.dispose();
    });

    // Parallaxe souris (désactivée si reduced motion).
    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 0.9;
      targetY = (event.clientY / window.innerHeight - 0.5) * 0.5;
    };
    if (!reducedMotion) window.addEventListener("pointermove", onPointerMove);

    // Parallaxe de scroll (désactivée si reduced motion).
    let scrollT = 0;
    const onScroll = () => {
      scrollT = Math.min(1, window.scrollY / 620);
    };
    if (!reducedMotion) window.addEventListener("scroll", onScroll, { passive: true });

    const timer = new THREE.Timer();
    let frame = 0;
    let visible = true;
    let elapsed = 0;
    // Reduced motion : on saute la séquence d'ouverture, état final direct.
    let introElapsed = reducedMotion ? INTRO_DURATION : 0;

    // Lancement d'un rêve : déclenché par le bouton « Lancer le mien ».
    let launchElapsed = -1;
    const onLaunch = () => {
      if (launchElapsed < 0) launchElapsed = 0;
    };
    window.addEventListener("genigain:launch", onLaunch);

    const renderFrame = () => {
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.05);
      elapsed += delta;
      introElapsed = Math.min(introElapsed + delta, INTRO_DURATION);
      const introT = introElapsed / INTRO_DURATION;

      // Acte 1 — le masque naît en géant, chargé d'énergie, et se pose avec
      // une extrême douceur (quintique, terminé à 88% de l'intro), puis
      // reprend son oscillation d'amulette.
      const settle = easeOutQuint(Math.min(1, introT / 0.88));
      const sigilScale = 0.62 * (2.6 - 1.6 * settle);
      sigil.group.scale.setScalar(sigilScale);
      sigil.group.rotation.y =
        (1 - settle) * -0.65 +
        Math.sin(elapsed * 0.4) * 0.55 * settle +
        targetX * 0.18 * settle;
      sigil.group.rotation.x = -targetY * 0.22 * settle;
      sigil.group.position.y = Math.sin(elapsed * 0.5) * 0.08 * settle;
      // Naissance énergétique : le monolithe irradie puis s'apaise,
      // ses arêtes brûlent plus fort à l'allumage.
      sigil.bodyMaterial.emissive.copy(CYAN);
      sigil.bodyMaterial.emissiveIntensity = (1 - settle) * 0.4;
      sigil.edgeMaterial.opacity = 0.9 + (1 - settle) * 0.1;

      // Plongée « lancement d'un rêve » : accélération progressive.
      if (launchElapsed >= 0) launchElapsed += delta;
      const dive =
        launchElapsed >= 0 ? Math.pow(Math.min(1, launchElapsed / LAUNCH_DURATION), 2.2) : 0;

      // Le masque s'embrase quand on plonge vers lui.
      if (dive > 0) {
        sigil.bodyMaterial.emissiveIntensity = dive * 1.3;
        sigil.edgeMaterial.opacity = Math.min(1, 0.9 + dive * 0.3);
      }

      // Halo : respire au repos, s'embrase à la naissance et à la plongée.
      const glowMat = glow.material as THREE.SpriteMaterial;
      glowMat.opacity =
        (0.3 + (1 - settle) * 0.5 + dive * 0.6 + Math.sin(elapsed * 0.8) * 0.04) *
        (mobile ? 0.6 : 1);
      glow.scale.setScalar(sigilScale * 6 + dive * 3);

      // Acte 2 — les particules jaillissent du masque (à travers les yeux)
      // et spiralent vers leurs orbites avec un léger dépassement « spring »,
      // un anneau après l'autre. Au lancement, elles sont aspirées.
      rings.forEach((ring, index) => {
        const local = Math.min(1, Math.max(0, (introT - 0.16 - index * 0.09) / 0.55));
        const emergence = easeOutBack(local);
        ring.shell.scale.setScalar((0.04 + 0.96 * emergence) * (1 - dive * 0.45));
        ring.material.opacity = 0.85 * Math.min(1, local * 1.8);
        // Plus rapides à la naissance, et emportées par la plongée.
        ring.points.rotation.z +=
          ring.speed * delta * (1 + Math.max(0, 1 - local) * 3.5 + dive * 6);
      });

      // Acte 3 — la poussière d'étoiles se dépose en dernier.
      starMaterial.opacity = 0.35 * Math.min(1, Math.max(0, (introT - 0.6) / 0.35));

      // Parallaxe de scroll : le sigil s'élève et s'incline en douceur.
      world.position.y = scrollT * 1.1;
      world.rotation.x = scrollT * 0.14;

      // Travelling avant (intro), puis plongée dans le masque (lancement).
      const dolly = 7 + (1 - easeOutCubic(introT)) * 1.9;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (0.5 - targetY - camera.position.y) * 0.04;
      camera.position.z = dolly - dive * 5.2;
      camera.lookAt(0, 0, 0);

      composer.render();
      if (!reducedMotion && visible) frame = requestAnimationFrame(renderFrame);
    };
    renderFrame(); // au moins une frame, même en reduced motion

    // Pause quand le hero sort de l'écran (le rAF s'arrête aussi onglet caché).
    const observer = new IntersectionObserver(([entry]) => {
      const nowVisible = entry.isIntersecting;
      if (nowVisible && !visible && !reducedMotion) {
        visible = true;
        timer.update(); // purge le temps écoulé hors écran
        frame = requestAnimationFrame(renderFrame);
      } else if (!nowVisible) {
        visible = false;
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(container);

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
      if (reducedMotion) composer.render();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("genigain:launch", onLaunch);
      for (const dispose of disposers) dispose();
      renderer.dispose();
      // Libère le contexte WebGL immédiatement (le pool du navigateur est
      // limité ; un contexte qui traîne finit par en évincer un autre).
      renderer.forceContextLoss();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 opacity-80"
      aria-hidden
    />
  );
}
