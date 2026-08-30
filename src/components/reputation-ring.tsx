import { useId } from "react";
import { cn } from "@/lib/utils";
import { reputationLevel } from "@/lib/reputation";

/**
 * Anneau orbital de réputation (motif DA néo-futuriste) : cercle SVG en dégradé
 * violet → cyan autour de l'avatar, épaisseur selon le niveau.
 */
export function ReputationRing({
  reputation,
  admin = false,
  children,
  className,
}: {
  reputation: number;
  admin?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const gradientId = useId();
  const level = reputationLevel(reputation, admin);

  return (
    <span className={cn("relative inline-flex p-1.5", className)}>
      <svg
        className="rep-ring absolute inset-0 h-full w-full"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke={`url(#${gradientId})`}
          strokeWidth={level.ring}
          strokeLinecap="round"
          strokeDasharray="105 33"
          opacity="0.9"
        />
      </svg>
      {children}
    </span>
  );
}
