import { Crown, Hammer, HeartHandshake, ShieldCheck, Sprout, type LucideIcon } from "lucide-react";

export type ReputationLabelKey =
  | "reputation.rookie"
  | "reputation.contributor"
  | "reputation.builder"
  | "reputation.legend"
  | "reputation.admin";

export type ReputationLevel = {
  /** Clé du namespace labels — le rendu appartient à la langue du lecteur. */
  labelKey: ReputationLabelKey;
  Icon: LucideIcon;
  className: string;
  /** Épaisseur de l'anneau orbital (motif réputation de la DA néo-futuriste). */
  ring: number;
};

/**
 * Niveaux de réputation affichés sur les profils et cartes projet.
 * Le rôle passe devant le score : l'équipe s'affiche « Admin » (ShieldCheck,
 * turquoise — le langage du badge Gérant·e), jamais « Rookie » — le grade
 * d'un compte qui modère ne se mesure pas à ses contributions.
 */
export function reputationLevel(reputation: number, admin = false): ReputationLevel {
  if (admin) {
    return {
      labelKey: "reputation.admin",
      Icon: ShieldCheck,
      className: "border-primary/40 bg-primary/15 text-primary",
      ring: 4.5,
    };
  }
  if (reputation >= 150) {
    return {
      labelKey: "reputation.legend",
      Icon: Crown,
      className: "border-secondary/40 bg-secondary/20 text-secondary",
      ring: 4.5,
    };
  }
  if (reputation >= 50) {
    return {
      labelKey: "reputation.builder",
      Icon: Hammer,
      className: "border-secondary/30 bg-secondary/15 text-secondary",
      ring: 3.5,
    };
  }
  if (reputation >= 10) {
    return {
      labelKey: "reputation.contributor",
      Icon: HeartHandshake,
      className: "border-secondary/25 bg-secondary/10 text-secondary",
      ring: 2.5,
    };
  }
  return {
    labelKey: "reputation.rookie",
    Icon: Sprout,
    className: "border-white/[0.12] bg-card/60 text-muted-foreground",
    ring: 1.5,
  };
}

/** Prochain palier de réputation et progression vers lui (null si Légende). */
export function nextReputationTarget(
  reputation: number
): { nextLabelKey: ReputationLabelKey; target: number; progress: number } | null {
  const thresholds: Array<[number, ReputationLabelKey]> = [
    [10, "reputation.contributor"],
    [50, "reputation.builder"],
    [150, "reputation.legend"],
  ];
  for (const [target, nextLabelKey] of thresholds) {
    if (reputation < target) {
      return { nextLabelKey, target, progress: Math.max(0, reputation) / target };
    }
  }
  return null;
}
