import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Ligne de chips défilante : une seule hauteur de ligne quel que soit le
 * nombre de filtres. Fondu aux bords pour suggérer la suite, scrollbar
 * masquée, padding vertical pour laisser vivre le lift des chips.
 * Partagée par l'annuaire des projets et celui des groupes de chat.
 */
export function ChipRail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-2 overflow-x-auto px-4 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)] -mx-4"
    >
      {children}
    </div>
  );
}

export function FilterChip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  /** Compteur discret collé au libellé (nombre de groupes d'une catégorie…). */
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1 text-sm font-medium transition-all duration-200 ease-out",
        active
          ? "border-primary/40 bg-primary/15 text-primary shadow-glow"
          : "border-white/[0.12] bg-card/60 text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-70">{count}</span>
      )}
    </Link>
  );
}
