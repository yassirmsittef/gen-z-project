import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { reputationLevel } from "@/lib/reputation";

export async function ReputationBadge({
  reputation,
  admin = false,
  showScore = true,
  className,
}: {
  reputation: number;
  admin?: boolean;
  showScore?: boolean;
  className?: string;
}) {
  const t = await getT("ui");
  const tLabels = await getT("labels");
  const level = reputationLevel(reputation, admin);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
        level.className,
        className
      )}
      title={t("reputationBadge.title", { reputation })}
    >
      <level.Icon className="h-3.5 w-3.5" aria-hidden />
      {tLabels(level.labelKey)}
      {showScore && <span className="opacity-70">· {reputation}</span>}
    </span>
  );
}
