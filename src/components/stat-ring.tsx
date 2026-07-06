import { cn } from "@/lib/utils";

/**
 * Jauge orbitale du HUD (motif « traînée lumineuse » en circulaire) :
 * anneau SVG en dégradé avec glow, valeur en Space Grotesk au centre,
 * label de données en mono. Composant serveur — id de dégradé dérivé du label.
 */
export function StatRing({
  percent,
  value,
  label,
  sublabel,
  tint = "accent",
  className,
}: {
  /** Progression 0..1 de l'anneau. */
  percent: number;
  value: string;
  label: string;
  sublabel?: string;
  tint?: "accent" | "violet";
  className?: string;
}) {
  const gradientId = `ring-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(1, Math.max(0.02, percent));
  const colors =
    tint === "violet" ? (["#C084FC", "#38BDF8"] as const) : (["#5EEAD4", "#38BDF8"] as const);

  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(241, 245, 249, 0.06)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ filter: `drop-shadow(0 0 6px ${colors[1]}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-semibold">{value}</span>
        </div>
      </div>
      <p className="data-label">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
