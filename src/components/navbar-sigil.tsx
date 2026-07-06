"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildSigilEnvironment, createMaskSigil } from "@/lib/mask-sigil";

/**
 * Le logo 3D permanent de la navbar : le masque canonique en miniature,
 * tournant lentement sur lui-même — et qui s'emballe au toucher (survol ou
 * clic), avec une friction qui le ramène à sa vitesse de croisière.
 *
 * C'est aussi la cible d'atterrissage du portail de lancement (voir
 * launch-scene.tsx, ancre `data-sigil-dock` posée par la navbar).
 *
 * Résilience : étant le plus ancien contexte WebGL de la page, il est le
 * premier évincé quand le navigateur atteint son plafond de contextes
 * (portails de transition successifs, HMR...). Sur `webglcontextlost`, la
 * scène se reconstruit entièrement avec un contexte neuf.
 *
 * Reduced motion : une seule frame statique, pas de rotation.
 */
export default function NavbarSigil() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Incrémenté à chaque perte de contexte WebGL → reconstruction complète.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 40, container.clientHeight || 40);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const env = buildSigilEnvironment(renderer);
    scene.environment = env;

    // Auto-résurrection : contexte évincé par le navigateur → on rebâtit.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setGeneration((current) => current + 1);
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    const sigil = createMaskSigil({ scale: 1.15 });
    scene.add(sigil.group);

    const ambient = new THREE.AmbientLight(new THREE.Color("#38BDF8"), 0.55);
    const keyLight = new THREE.PointLight(new THREE.Color("#5EEAD4"), 30, 20);
    keyLight.position.set(2.5, 2, 4);
    const rimLight = new THREE.PointLight(new THREE.Color("#C084FC"), 24, 20);
    rimLight.position.set(-2.5, -1.5, 3.5);
    scene.add(ambient, keyLight, rimLight);

    // Vitesse bonus au toucher, dissipée par friction.
    let spin = 0;
    const onTouch = () => {
      spin = Math.min(spin + 7, 14);
    };
    const touchTarget = container.parentElement ?? container;
    if (!reducedMotion) {
      touchTarget.addEventListener("pointerenter", onTouch);
      touchTarget.addEventListener("pointerdown", onTouch);
    }

    const timer = new THREE.Timer();
    let frame = 0;

    const renderFrame = () => {
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.05);
      sigil.group.rotation.y += (0.7 + spin) * delta;
      spin = Math.max(0, spin - spin * 2.6 * delta);
      renderer.render(scene, camera);
      if (!reducedMotion) frame = requestAnimationFrame(renderFrame);
    };
    renderFrame(); // au moins une frame, même en reduced motion

    return () => {
      cancelAnimationFrame(frame);
      touchTarget.removeEventListener("pointerenter", onTouch);
      touchTarget.removeEventListener("pointerdown", onTouch);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      sigil.dispose();
      env.dispose();
      ambient.dispose();
      keyLight.dispose();
      rimLight.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      container.removeChild(renderer.domElement);
    };
  }, [generation]);

  return <div ref={containerRef} className="h-full w-full" aria-hidden />;
}
