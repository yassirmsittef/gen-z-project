import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export function UserAvatar({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border border-white/[0.12] bg-muted font-display text-xs font-semibold text-foreground",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
