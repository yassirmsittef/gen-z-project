"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

/** Navigation entre les trois pages du cadre légal (chips, page active en accent). */
export function LegalNav() {
  const t = useT("ui");
  const pathname = usePathname();

  const pages = [
    { href: "/cgu", label: t("legalNav.terms") },
    { href: "/confidentialite", label: t("legalNav.privacy") },
    { href: "/mentions-legales", label: t("legalNav.legalNotice") },
  ] as const;

  return (
    <nav aria-label={t("legalNav.ariaLabel")} className="mt-4 flex flex-wrap gap-2">
      {pages.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-200",
              active
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
