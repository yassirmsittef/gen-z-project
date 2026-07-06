"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Durée de la transition avant navigation (ms). */
const LAUNCH_MS = 1450;

/** Durée du fondu de sortie du voile à l'arrivée (ms). */
const FADE_OUT_MS = 550;

// Portail 3D de la teinte violet — chargé à la demande (et préchargé en
// idle) pour ne pas embarquer Three.js dans le bundle de chaque page.
const LaunchScene = dynamic(() => import("./launch-scene"), { ssr: false });

type LaunchTint = "aurora" | "violet";
type LaunchPhase = "idle" | "launching" | "fading";

/**
 * Lien à transition « lancement ».
 *
 * `aurora` (teal → cyan, le rêve — boutons du hero) : la scène 3D de
 * l'accueil plonge dans le masque (événement `tremplin:launch`) sous un
 * voile de lumière.
 * `violet` (identité — Connexion / S'inscrire, présents sur toutes les
 * pages) : un portail 3D autonome se monte dans le voile — le masque
 * traverse l'écran pendant que la lumière vire du bleu au violet foncé.
 *
 * Le composant peut vivre dans le layout (navbar) qui ne se démonte PAS à la
 * navigation : le voile est retiré explicitement en fondu dès que le pathname
 * change (+ filet de sécurité temporel). Reduced motion → navigation
 * immédiate. Clic modifié (cmd/ctrl/shift, molette) → comportement natif.
 */
export function LaunchLink({
  href,
  tint = "aurora",
  variant = "outline",
  size = "lg",
  className,
  children,
}: {
  href: string;
  tint?: LaunchTint;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const originRef = useRef<string | null>(null);

  // Précharge le chunk du portail 3D pendant les temps morts : le clic
  // démarre alors sans latence réseau.
  useEffect(() => {
    if (tint !== "violet") return;
    const idle =
      "requestIdleCallback" in window
        ? (cb: () => void) => window.requestIdleCallback(cb)
        : (cb: () => void) => window.setTimeout(cb, 1500);
    idle(() => {
      import("./launch-scene");
    });
  }, [tint]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (phase !== "idle") return;
    // Déjà sur la page cible : rien à lancer.
    if (pathname === href) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    originRef.current = pathname;
    setPhase("launching");
    // La plongée du hero ne concerne que la teinte aurora : le portail
    // violet embarque son propre masque 3D.
    if (tint === "aurora") {
      window.dispatchEvent(new CustomEvent("tremplin:launch"));
    }
    window.setTimeout(() => router.push(href), LAUNCH_MS);
  }

  // Arrivée détectée (le pathname a changé) : fondu de sortie du voile.
  useEffect(() => {
    if (phase !== "launching") return;
    if (originRef.current !== null && pathname !== originRef.current) {
      setPhase("fading");
    }
  }, [pathname, phase]);

  // Filet de sécurité : le voile ne survit jamais à une navigation ratée.
  useEffect(() => {
    if (phase !== "launching") return;
    const timer = window.setTimeout(() => setPhase("fading"), LAUNCH_MS + 2000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    const timer = window.setTimeout(() => setPhase("idle"), FADE_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <>
      <Button size={size} variant={variant} asChild className={className}>
        <Link href={href} onClick={handleClick}>
          {children}
        </Link>
      </Button>
      {/* Portal vers body : un ancêtre avec backdrop-filter (navbar en verre)
          piégerait sinon le position:fixed dans son containing block. */}
      {phase !== "idle" &&
        createPortal(
          <div
            className={cn(
              "launch-overlay",
              tint === "violet" && "launch-overlay--violet",
              phase === "fading" && "launch-overlay--out"
            )}
            aria-hidden
          >
            {/* Le portail 3D : le masque traverse l'écran dans la lumière
                violette — c'est lui qui porte la transition partout. */}
            {tint === "violet" && <LaunchScene />}
          </div>,
          document.body
        )}
    </>
  );
}
