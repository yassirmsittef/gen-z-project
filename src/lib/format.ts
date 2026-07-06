/** Monnaie de la plateforme : le token — 1 token = 1 $ (fictif en Phase 1). */
export function formatCredits(amount: number): string {
  const formatted = amount.toLocaleString("fr-FR");
  return `${formatted} ${Math.abs(amount) === 1 ? "token" : "tokens"}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Jours restants avant la deadline (0 si dépassée). */
export function daysLeft(deadline: Date): number {
  return Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000));
}

export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

/** Initiales pour l'avatar (ex: "Léa Martin" → "LM"). */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
