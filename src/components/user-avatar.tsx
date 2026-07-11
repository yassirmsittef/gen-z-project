import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export function UserAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string | null | undefined;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-muted font-display text-xs font-semibold text-foreground",
        className
      )}
    >
      {avatarUrl ? (
        // Domaine libre (l'utilisateur colle une URL) : <img> natif, pas next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
