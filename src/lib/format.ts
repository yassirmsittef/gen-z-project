// La monnaie s'affiche via formatMoney (src/lib/money.ts) — argent réel,
// une devise par projet, Intl.NumberFormat.

import { localeTag, type Locale } from "@/lib/i18n/locales";

export function formatDate(date: Date, locale: Locale = "fr"): string {
  return date.toLocaleDateString(localeTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Temps relatif court (« il y a 3 min », "3 min ago", «قبل ٣ دقائق» en
 * chiffres latins…). Tout vient d'Intl.RelativeTimeFormat — aucune chaîne
 * maison : c'est lui qui connaît les 7 langues, pas nous. Sous la minute,
 * `numeric:"auto"` donne le « maintenant » idiomatique de chaque langue.
 */
export function formatRelative(date: Date, locale: Locale = "fr"): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const relative = new Intl.RelativeTimeFormat(localeTag(locale), {
    numeric: "auto",
    style: "short",
  });
  if (seconds < 60) return relative.format(0, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return relative.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 7) return relative.format(-days, "day");
  return formatDate(date, locale);
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
