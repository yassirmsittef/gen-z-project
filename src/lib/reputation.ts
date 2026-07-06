import { Crown, Hammer, HeartHandshake, Sprout, type LucideIcon } from "lucide-react";

export type ReputationLevel = {
  label: string;
  Icon: LucideIcon;
  className: string;
  /** Épaisseur de l'anneau orbital (motif réputation de la DA néo-futuriste). */
  ring: number;
};

/** Niveaux de réputation affichés sur les profils et cartes projet. */
export function reputationLevel(reputation: number): ReputationLevel {
  if (reputation >= 150) {
    return {
      label: "Légende",
      Icon: Crown,
      className: "border-secondary/40 bg-secondary/20 text-secondary",
      ring: 4.5,
    };
  }
  if (reputation >= 50) {
    return {
      label: "Bâtisseur·se",
      Icon: Hammer,
      className: "border-secondary/30 bg-secondary/15 text-secondary",
      ring: 3.5,
    };
  }
  if (reputation >= 10) {
    return {
      label: "Contributeur·rice",
      Icon: HeartHandshake,
      className: "border-secondary/25 bg-secondary/10 text-secondary",
      ring: 2.5,
    };
  }
  return {
    label: "Rookie",
    Icon: Sprout,
    className: "border-white/[0.12] bg-card/60 text-muted-foreground",
    ring: 1.5,
  };
}

/** Prochain palier de réputation et progression vers lui (null si Légende). */
export function nextReputationTarget(
  reputation: number
): { nextLabel: string; target: number; progress: number } | null {
  const thresholds: Array<[number, string]> = [
    [10, "Contributeur·rice"],
    [50, "Bâtisseur·se"],
    [150, "Légende"],
  ];
  for (const [target, nextLabel] of thresholds) {
    if (reputation < target) {
      return { nextLabel, target, progress: Math.max(0, reputation) / target };
    }
  }
  return null;
}
