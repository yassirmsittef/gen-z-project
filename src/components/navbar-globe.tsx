"use client";

import { useEffect, useRef } from "react";
import DOTS from "@/lib/land-dots-mini.json";

/**
 * Terre miniature de la navbar : le globe de points de la page Communauté en
 * 22 px, qui tourne sur lui-même en continu (accélère au survol du lien).
 * Canvas 2D volontairement — pas de contexte WebGL de plus dans la navbar
 * (le sigil en occupe déjà un, cf. piège « éviction de contexte »).
 * ~900 points terrestres sous-échantillonnés (land-dots-mini, ~4 Ko).
 */
export function NavbarGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = canvas.clientWidth || 22;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // lat/lng → position sur la sphère unité (rotation autour de l'axe Y).
    // Format PLAT comme land-dots.json : [lat0, lng0, lat1, lng1, …].
    const flat = DOTS as number[];
    const points: [number, number, number][] = [];
    for (let i = 0; i < flat.length - 1; i += 2) {
      const phi = (flat[i] * Math.PI) / 180;
      const lambda = (flat[i + 1] * Math.PI) / 180;
      points.push([
        Math.cos(phi) * Math.cos(lambda),
        Math.sin(phi),
        Math.cos(phi) * Math.sin(lambda),
      ]);
    }

    const center = (size * dpr) / 2;
    const radius = center - 1.2 * dpr;
    let rotation = 0.8; // départ sur l'Afrique/Europe, comme le grand globe
    let last = performance.now();
    let hovered = false;
    let raf = 0;

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      rotation += dt * (hovered ? 1.6 : 0.35);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(94, 234, 212, 0.35)";
      ctx.lineWidth = dpr;
      ctx.stroke();

      const sin = Math.sin(rotation);
      const cos = Math.cos(rotation);
      const dot = 0.9 * dpr;
      for (const [x0, y, z0] of points) {
        const x = x0 * cos + z0 * sin;
        const z = -x0 * sin + z0 * cos;
        if (z <= 0.05) continue; // hémisphère caché
        // Plus le point fait face, plus il est lumineux (relief de sphère).
        ctx.fillStyle = `rgba(94, 234, 212, ${(0.3 + z * 0.7).toFixed(3)})`;
        ctx.fillRect(center + x * radius - dot / 2, center - y * radius - dot / 2, dot, dot);
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      draw(last); // une frame fixe : la Terre est là, immobile
    } else {
      raf = requestAnimationFrame(draw);
    }

    const link = canvas.closest("a");
    const over = () => (hovered = true);
    const out = () => (hovered = false);
    link?.addEventListener("pointerenter", over);
    link?.addEventListener("pointerleave", out);
    return () => {
      cancelAnimationFrame(raf);
      link?.removeEventListener("pointerenter", over);
      link?.removeEventListener("pointerleave", out);
    };
  }, []);

  return <canvas ref={canvasRef} className={className ?? "h-[22px] w-[22px]"} aria-hidden />;
}
