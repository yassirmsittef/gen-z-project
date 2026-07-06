import { cn } from "@/lib/utils";
import { reputationLevel } from "@/lib/reputation";

export function ReputationBadge({
  reputation,
  showScore = true,
  className,
}: {
  reputation: number;
  showScore?: boolean;
  className?: string;
}) {
  const level = reputationLevel(reputation);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
        level.className,
        className
      )}
      title={`Réputation : ${reputation}`}
    >
      <level.Icon className="h-3.5 w-3.5" aria-hidden />
      {level.label}
      {showScore && <span className="opacity-70">· {reputation}</span>}
    </span>
  );
}
