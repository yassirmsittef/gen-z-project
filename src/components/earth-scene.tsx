"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import landDotsRaw from "@/lib/land-dots.json";

/**
 * Le globe de la page Communauté — l'« audace unique » de l'écran.
 *
 * Terre stylisée néo-futuriste : sphère nuit, continents en matrice de points,
 * et un point bleu lumineux par ville où vivent des membres (position de la
 * VILLE uniquement — voir src/lib/cities.ts). Glisser pour explorer, cliquer
 * un point pour filtrer la liste des membres ; le globe pivote alors pour
 * placer la ville face caméra.
 *
 * Garde-fous habituels des scènes du projet : DPR ≤ 2, pause hors écran
 * (IntersectionObserver), prefers-reduced-motion → rendu à la demande sans
 * animation, dispose complet + forceContextLoss au démontage (pool WebGL).
 */

export type CityMarker = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
};

type Props = {
  markers: CityMarker[];
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
};

const GLOBE_RADIUS = 2;
const DEG = Math.PI / 180;

const CYAN = new THREE.Color("#38BDF8");
const TEAL = new THREE.Color("#5EEAD4");

/** [lat, lng] → position sur la sphère (convention classique des globes three.js). */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** Ramène `angle` dans le tour le plus proche de `near` (chemin le plus court). */
function nearestTurn(angle: number, near: number): number {
  while (angle - near > Math.PI) angle -= Math.PI * 2;
  while (angle - near < -Math.PI) angle += Math.PI * 2;
  return angle;
}

/** Halo radial additif — même recette que le hero, teinté cyan. */
function buildHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(125, 211, 252, 0.95)");
  g.addColorStop(0.35, "rgba(56, 189, 248, 0.35)");
  g.addColorStop(1, "rgba(56, 189, 248, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Atmosphère : liseré fresnel cyan sur le limbe, rendu en face arrière. */
function buildAtmosphere(): { mesh: THREE.Mesh; dispose: () => void } {
  const geometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.12, 48, 48);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { glowColor: { value: new THREE.Color("#38BDF8") } },
    vertexShader: /* glsl */ `
      varying float vIntensity;
      void main() {
        vec3 viewNormal = normalize(normalMatrix * normal);
        // Face arrière : le limbe (normale ⟂ caméra) est le plus lumineux.
        vIntensity = pow(0.72 - dot(viewNormal, vec3(0.0, 0.0, -1.0)), 3.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 glowColor;
      varying float vIntensity;
      void main() {
        gl_FragColor = vec4(glowColor, 1.0) * vIntensity * 0.5;
      }
    `,
  });
  return {
    mesh: new THREE.Mesh(geometry, material),
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

type MarkerObject = {
  marker: CityMarker;
  core: THREE.Mesh;
  coreMaterial: THREE.MeshBasicMaterial;
  halo: THREE.Sprite;
  haloMaterial: THREE.SpriteMaterial;
  hit: THREE.Mesh;
  baseHaloScale: number;
  pulsePhase: number;
};

export default function EarthScene({ markers, selectedCity, onSelectCity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Les données ne changent pas pendant la vie de la page ; les callbacks et la
  // sélection passent par des refs pour ne jamais reconstruire la scène.
  const markersRef = useRef(markers);
  const selectedRef = useRef(selectedCity);
  const onSelectRef = useRef(onSelectCity);
  const apiRef = useRef<{ select: (city: string | null) => void } | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelectCity;
  }, [onSelectCity]);

  useEffect(() => {
    selectedRef.current = selectedCity;
    apiRef.current?.select(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const disposers: Array<() => void> = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    const mobile = container.clientWidth < 640;
    camera.position.set(0, 0, mobile ? 7.4 : 6.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    // Rotation horizontale au doigt, défilement vertical préservé sur mobile.
    renderer.domElement.style.touchAction = "pan-y";
    container.appendChild(renderer.domElement);

    // Inclinaison (X) puis rotation (Y) : deux groupes imbriqués pour piloter
    // les deux axes indépendamment, marqueurs embarqués avec les continents.
    const tilt = new THREE.Group();
    const globe = new THREE.Group();
    tilt.add(globe);
    scene.add(tilt);

    // Sphère de base : nuit bleutée, à peine plus claire que le fond.
    const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#101828"),
      emissive: new THREE.Color("#060a12"),
      specular: new THREE.Color("#1e3a5f"),
      shininess: 12,
    });
    globe.add(new THREE.Mesh(sphereGeometry, sphereMaterial));
    disposers.push(() => {
      sphereGeometry.dispose();
      sphereMaterial.dispose();
    });

    // Continents : matrice de points générée depuis world-atlas
    // (scripts/generate-land-dots.ts) — [lat0, lng0, lat1, lng1, ...].
    const landDots = landDotsRaw as number[];
    const landCount = landDots.length / 2;
    const landPositions = new Float32Array(landCount * 3);
    for (let i = 0; i < landCount; i++) {
      const position = latLngToVector3(landDots[i * 2], landDots[i * 2 + 1], GLOBE_RADIUS * 1.004);
      landPositions[i * 3] = position.x;
      landPositions[i * 3 + 1] = position.y;
      landPositions[i * 3 + 2] = position.z;
    }
    const landGeometry = new THREE.BufferGeometry();
    landGeometry.setAttribute("position", new THREE.BufferAttribute(landPositions, 3));
    const landMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#6ea8cf"),
      size: 0.021,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    globe.add(new THREE.Points(landGeometry, landMaterial));
    disposers.push(() => {
      landGeometry.dispose();
      landMaterial.dispose();
    });

    // Atmosphère (fresnel) — symétrique, inutile de la faire tourner.
    const atmosphere = buildAtmosphere();
    scene.add(atmosphere.mesh);
    disposers.push(atmosphere.dispose);

    // Éclairage : jour cyan côté caméra, nuit slate en contre.
    const ambient = new THREE.AmbientLight(new THREE.Color("#34445e"), 1.6);
    const key = new THREE.DirectionalLight(CYAN, 1.1);
    key.position.set(2.5, 1.8, 4);
    const rim = new THREE.DirectionalLight(new THREE.Color("#7c6bd4"), 0.35);
    rim.position.set(-3.5, -1, -2);
    scene.add(ambient, key, rim);
    disposers.push(() => {
      ambient.dispose();
      key.dispose();
      rim.dispose();
    });

    // Poussière d'étoiles discrète en fond (recette du hero).
    const starCount = 220;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 9 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi) - 6;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#94A3B8"),
      size: 0.02,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeometry, starMaterial));
    disposers.push(() => {
      starGeometry.dispose();
      starMaterial.dispose();
    });

    // Marqueurs : un point bleu lumineux par ville habitée.
    const haloTexture = buildHaloTexture();
    disposers.push(() => haloTexture.dispose());
    const markerGroup = new THREE.Group();
    globe.add(markerGroup);

    const coreGeometry = new THREE.SphereGeometry(1, 12, 12);
    const hitGeometry = new THREE.SphereGeometry(1, 8, 8);
    disposers.push(() => {
      coreGeometry.dispose();
      hitGeometry.dispose();
    });

    const markerObjects: MarkerObject[] = [];
    for (const marker of markersRef.current) {
      const position = latLngToVector3(marker.lat, marker.lng, GLOBE_RADIUS * 1.01);
      // Plus la ville héberge de membres, plus le point rayonne (borné).
      const weight = Math.min(1, (marker.count - 1) / 5);
      const coreRadius = 0.03 + weight * 0.022;
      const baseHaloScale = 0.26 + weight * 0.2;

      const coreMaterial = new THREE.MeshBasicMaterial({ color: CYAN.clone() });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.scale.setScalar(coreRadius);
      core.position.copy(position);

      const haloMaterial = new THREE.SpriteMaterial({
        map: haloTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.7,
      });
      const halo = new THREE.Sprite(haloMaterial);
      halo.scale.setScalar(baseHaloScale);
      halo.position.copy(position);

      // Cible de raycast invisible, plus large que le point (confort tactile).
      const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const hit = new THREE.Mesh(hitGeometry, hitMaterial);
      hit.scale.setScalar(0.12);
      hit.position.copy(position);
      hit.userData.city = marker.city;

      markerGroup.add(core, halo, hit);
      markerObjects.push({
        marker,
        core,
        coreMaterial,
        halo,
        haloMaterial,
        hit,
        baseHaloScale,
        pulsePhase: Math.random() * Math.PI * 2,
      });
      disposers.push(() => {
        coreMaterial.dispose();
        haloMaterial.dispose();
        hitMaterial.dispose();
      });
    }

    // ---- État d'orientation ----
    // Départ : l'Europe face caméra (le cœur de la communauté).
    let rotY = -1.55;
    let tiltX = 0.42;
    let rotVelocity = 0;
    let autoRotate = !reducedMotion;
    let lastInteraction = 0;
    let elapsed = 0;
    // Cible de « focus » quand une ville est sélectionnée.
    let focusY: number | null = null;
    let focusTilt: number | null = null;

    const applySelectionStyles = () => {
      for (const object of markerObjects) {
        const selected = object.marker.city === selectedRef.current;
        object.coreMaterial.color.copy(selected ? TEAL : CYAN);
        object.core.scale.setScalar(
          (0.03 + Math.min(1, (object.marker.count - 1) / 5) * 0.022) * (selected ? 1.45 : 1)
        );
        object.haloMaterial.opacity = selected ? 0.95 : 0.7;
      }
    };

    const focusOnCity = (cityName: string | null, immediate: boolean) => {
      if (!cityName) {
        focusY = null;
        focusTilt = null;
        return;
      }
      const target = markerObjects.find((o) => o.marker.city === cityName);
      if (!target) return;
      const p = target.core.position;
      focusY = nearestTurn(-Math.atan2(p.x, p.z), rotY);
      focusTilt = THREE.MathUtils.clamp(target.marker.lat * DEG, -0.75, 0.75);
      autoRotate = false;
      if (immediate) {
        rotY = focusY;
        tiltX = focusTilt;
        focusY = null;
        focusTilt = null;
      }
    };

    // ---- Interactions pointeur ----
    // Tactile : un doigt = rotation horizontale (le scroll vertical de la page
    // reste au navigateur, cf. touch-action pan-y) ; DEUX doigts = contrôle
    // libre, inclinaison verticale comprise — le pattern des cartes embarquées.
    // À la souris, un seul pointeur suffit pour tout.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const activePointers = new Map<number, { x: number; y: number }>();
    let dragging = false;
    let twoFinger = false;
    let dragMoved = 0;
    let lastX = 0;
    let lastY = 0;
    let lastMidX = 0;
    let lastMidY = 0;
    let hovered: MarkerObject | null = null;

    const applyDragDelta = (dx: number, dy: number) => {
      rotY += dx * 0.0055;
      rotVelocity = dx * 0.0055;
      tiltX = THREE.MathUtils.clamp(tiltX + dy * 0.0035, -0.9, 0.9);
      // Le drag reprend la main sur le focus et l'auto-rotation.
      focusY = null;
      focusTilt = null;
      lastInteraction = elapsed;
      if (reducedMotion) requestRender();
    };

    const pickMarker = (): MarkerObject | null => {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        markerObjects.map((o) => o.hit),
        false
      );
      for (const hit of hits) {
        const object = markerObjects.find((o) => o.hit === hit.object);
        if (!object) continue;
        // On ignore les villes dans le dos du globe.
        const world = object.core.getWorldPosition(new THREE.Vector3());
        if (world.z > GLOBE_RADIUS * 0.15) return object;
      }
      return null;
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const refreshHover = (event: PointerEvent) => {
      const previous = hovered;
      hovered = pickMarker();
      renderer.domElement.style.cursor = hovered ? "pointer" : dragging ? "grabbing" : "grab";
      if (hovered) {
        const rect = container.getBoundingClientRect();
        const { marker } = hovered;
        tooltip.textContent = `${marker.city} — ${marker.country} · ${marker.count} membre${
          marker.count > 1 ? "s" : ""
        }`;
        tooltip.style.opacity = "1";
        const x = Math.min(event.clientX - rect.left + 14, rect.width - 150);
        const y = Math.max(event.clientY - rect.top - 34, 8);
        tooltip.style.transform = `translate(${x}px, ${y}px)`;
      } else {
        tooltip.style.opacity = "0";
      }
      if (reducedMotion && hovered !== previous) requestRender();
    };

    const onPointerDown = (event: PointerEvent) => {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      lastInteraction = elapsed;
      // Les pointeurs synthétiques (tests) n'existent pas pour le navigateur.
      try {
        renderer.domElement.setPointerCapture(event.pointerId);
      } catch {
        /* pointeur inconnu : sans gravité */
      }
      if (activePointers.size === 1) {
        dragging = true;
        twoFinger = false;
        dragMoved = 0;
        lastX = event.clientX;
        lastY = event.clientY;
      } else if (activePointers.size === 2) {
        // Deuxième doigt : bascule en contrôle libre, ce n'est plus un clic.
        twoFinger = true;
        dragMoved = Number.POSITIVE_INFINITY;
        const [a, b] = [...activePointers.values()];
        lastMidX = (a.x + b.x) / 2;
        lastMidY = (a.y + b.y) / 2;
      }
      renderer.domElement.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event);
      if (activePointers.has(event.pointerId)) {
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }
      if (twoFinger && activePointers.size >= 2) {
        // Milieu des deux doigts : dx → rotation, dy → inclinaison.
        const [a, b] = [...activePointers.values()];
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        applyDragDelta(midX - lastMidX, midY - lastMidY);
        lastMidX = midX;
        lastMidY = midY;
      } else if (dragging && !twoFinger && activePointers.has(event.pointerId)) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        dragMoved += Math.abs(dx) + Math.abs(dy);
        lastX = event.clientX;
        lastY = event.clientY;
        applyDragDelta(dx, dy);
      }
      refreshHover(event);
    };

    const endDrag = (event: PointerEvent) => {
      if (!activePointers.has(event.pointerId)) return;
      activePointers.delete(event.pointerId);
      try {
        if (renderer.domElement.hasPointerCapture(event.pointerId)) {
          renderer.domElement.releasePointerCapture(event.pointerId);
        }
      } catch {
        /* pointeur inconnu : sans gravité */
      }

      if (activePointers.size === 1) {
        // Deux doigts → un : le doigt restant reprend un drag simple.
        twoFinger = false;
        const rest = [...activePointers.values()][0];
        lastX = rest.x;
        lastY = rest.y;
        dragMoved = Number.POSITIVE_INFINITY;
        return;
      }
      if (activePointers.size > 0) return;

      dragging = false;
      twoFinger = false;
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      // Un déplacement quasi nul = un clic : sélection / désélection de ville.
      if (dragMoved < 7) {
        updatePointer(event);
        const picked = pickMarker();
        const next =
          picked && picked.marker.city !== selectedRef.current ? picked.marker.city : null;
        if (picked || selectedRef.current) {
          selectedRef.current = next;
          applySelectionStyles();
          focusOnCity(next, reducedMotion);
          onSelectRef.current(next);
          if (reducedMotion) requestRender();
        }
      }
    };

    // iOS : avec deux doigts posés, on neutralise le pinch-zoom du navigateur
    // pour garder la main sur le geste (le scroll à un doigt reste natif).
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length >= 2) event.preventDefault();
    };

    const onPointerLeave = () => {
      hovered = null;
      tooltip.style.opacity = "0";
      renderer.domElement.style.cursor = "grab";
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", endDrag);
    renderer.domElement.addEventListener("pointercancel", endDrag);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: false });
    renderer.domElement.style.cursor = "grab";

    // ---- Boucle de rendu ----
    const timer = new THREE.Timer();
    let frame = 0;
    let visible = true;

    const renderFrame = () => {
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.05);
      elapsed += delta;

      // Inertie du drag, puis reprise de la rotation ambiante après une pause
      // (sauf ville sélectionnée : on reste face à elle).
      if (!dragging) {
        rotY += rotVelocity;
        rotVelocity *= 0.94;
        if (
          !selectedRef.current &&
          focusY === null &&
          elapsed - lastInteraction > 2.4
        ) {
          autoRotate = true;
        }
        if (autoRotate) rotY += delta * 0.055;
      } else {
        autoRotate = false;
      }

      // Tween de focus vers la ville sélectionnée.
      if (focusY !== null && focusTilt !== null) {
        rotY += (focusY - rotY) * Math.min(1, delta * 4.5);
        tiltX += (focusTilt - tiltX) * Math.min(1, delta * 4.5);
        if (Math.abs(focusY - rotY) < 0.002 && Math.abs(focusTilt - tiltX) < 0.002) {
          focusY = null;
          focusTilt = null;
        }
      }

      globe.rotation.y = rotY;
      tilt.rotation.x = tiltX;

      // Pulsation lente des halos — la respiration du réseau.
      if (!reducedMotion) {
        for (const object of markerObjects) {
          const selected = object.marker.city === selectedRef.current;
          const pulse = 1 + Math.sin(elapsed * 1.8 + object.pulsePhase) * 0.14;
          object.halo.scale.setScalar(object.baseHaloScale * pulse * (selected ? 1.5 : 1));
        }
      }

      renderer.render(scene, camera);
      if (!reducedMotion && visible) frame = requestAnimationFrame(renderFrame);
    };

    // Reduced motion : pas de boucle — rendus ponctuels à la demande.
    let renderQueued = false;
    const requestRender = () => {
      if (!reducedMotion || renderQueued) return;
      renderQueued = true;
      requestAnimationFrame(() => {
        renderQueued = false;
        globe.rotation.y = rotY;
        tilt.rotation.x = tiltX;
        renderer.render(scene, camera);
      });
    };

    // Sélection pilotée par la page (URL) — immédiate en reduced motion.
    apiRef.current = {
      select: (city) => {
        applySelectionStyles();
        focusOnCity(city, reducedMotion);
        if (city) autoRotate = false;
        requestRender();
      },
    };

    applySelectionStyles();
    if (selectedRef.current) focusOnCity(selectedRef.current, true);
    renderFrame(); // au moins une frame, même en reduced motion

    const observer = new IntersectionObserver(([entry]) => {
      const nowVisible = entry.isIntersecting;
      if (nowVisible && !visible && !reducedMotion) {
        visible = true;
        timer.update();
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
      if (reducedMotion) requestRender();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", endDrag);
      renderer.domElement.removeEventListener("pointercancel", endDrag);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      apiRef.current = null;
      for (const dispose of disposers) dispose();
      renderer.dispose();
      // Pool WebGL limité : libérer le contexte tout de suite (piège connu).
      renderer.forceContextLoss();
      container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div
        ref={tooltipRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 rounded-lg border border-white/[0.12] bg-card/85 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground opacity-0 backdrop-blur-md transition-opacity duration-150"
      />
    </div>
  );
}
