import type { ProjectStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const styles: Record<ProjectStatus, string> = {
  ACTIVE: "border-primary/30 bg-primary/15 text-primary",
  FUNDED: "border-secondary/30 bg-secondary/15 text-secondary",
  COMPLETED: "border-success/30 bg-success/15 text-success",
  FAILED: "border-destructive/30 bg-destructive/15 text-destructive",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
        styles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
