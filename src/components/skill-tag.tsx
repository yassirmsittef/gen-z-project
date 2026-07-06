import { cn } from "@/lib/utils";

/** Tag de compétence — violet : sémantique communauté de la DA. */
export function SkillTag({ skill, className }: { skill: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-0.5 font-mono text-[11px] text-secondary",
        className
      )}
    >
      {skill}
    </span>
  );
}
