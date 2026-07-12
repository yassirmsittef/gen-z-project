"use client";

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

type LaunchPhase = "idle" | "launching" | "fading";

/**
 * Lien à transition « lancement » (teal → cyan, le rêve — boutons du hero) :
 * la scène 3D de l'accueil plonge dans le masque (événement `genigain:launch`)
 * sous un voile de lumière.
 *
 * (La variante « portail violet » de Connexion / S'inscrire a été retirée le
 * 2026-07-11 à la demande de l'utilisateur — navigation directe désormais.)
 *
 * Le composant peut vivre dans un layout qui ne se démonte PAS à la
 * navigation : le voile est retiré explicitement en fondu dès que le pathname
 * change (+ filet de sécurité temporel). Reduced motion → navigation
 * immédiate. Clic modifié (cmd/ctrl/shift, molette) → comportement natif.
 */
export function LaunchLink({
  href,
  variant = "outline",
  size = "lg",
  className,
  children,
}: {
  href: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const originRef = useRef<string | null>(null);

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
    window.dispatchEvent(new CustomEvent("genigain:launch"));
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
      {/* Portal vers body : un ancêtre avec backdrop-filter piégerait sinon
          le position:fixed dans son containing block. */}
      {phase !== "idle" &&
        createPortal(
          <div
            className={cn("launch-overlay", phase === "fading" && "launch-overlay--out")}
            aria-hidden
          />,
          document.body
        )}
    </>
  );
}
