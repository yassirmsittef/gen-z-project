"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

/**
 * Cloche vivante : part du compte rendu par le serveur, puis se rafraîchit
 * toutes les 60 s et au retour sur l'onglet — sans navigation. Passe à zéro
 * dès qu'on ouvre /notifications (la visite vaut lecture).
 */
export function NavbarBell({
  initialUnread,
  className,
}: {
  initialUnread: number;
  className?: string;
}) {
  const t = useT("ui");
  const [unread, setUnread] = useState(initialUnread);
  const pathname = usePathname();

  // Quand le serveur re-rend la navbar (revalidatePath après une action), on réaligne.
  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  // Ouvrir la page notifications marque tout lu côté serveur.
  useEffect(() => {
    if (pathname === "/notifications") setUnread(0);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const response = await fetch("/api/notifications/count", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { count: number };
        if (!cancelled) setUnread(data.count);
      } catch {
        // hors-ligne / onglet en veille : on retentera au tick suivant
      }
    };

    const interval = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <Button variant="ghost" size="icon" asChild title={t("navbarBell.title")} className={className}>
      <Link href="/notifications">
        <Bell aria-hidden />
        {unread > 0 && (
          <span
            className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground shadow-glow"
            aria-hidden
          >
            {unread > 9 ? t("navbarBell.overflow") : unread}
          </span>
        )}
        <span className="sr-only">
          {unread > 0 ? t("navbarBell.srUnread", { count: unread }) : t("navbarBell.title")}
        </span>
      </Link>
    </Button>
  );
}
