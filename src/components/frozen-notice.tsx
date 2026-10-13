"use client";

import Link from "next/link";
import { Hourglass, MessagesSquare } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

/**
 * Ce qui remplace un formulaire fermé avant le lancement (voir lib/launch) :
 * on dit ce qui manque, pourquoi, et ce qu'on peut déjà faire — jamais un
 * bouton grisé sans explication.
 */
export function FrozenNotice() {
  const t = useT("common");
  return (
    <div role="status" className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2">
        <Hourglass className="size-4 text-primary" aria-hidden />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{t("frozen.badge")}</span>
      </div>
      <p className="font-semibold">{t("frozen.title")}</p>
      <p className="text-sm text-muted-foreground">{t("frozen.body")}</p>
      <p className="text-sm text-muted-foreground">{t("frozen.now")}</p>
      <Button asChild size="sm" variant="outline">
        <Link href="/chat">
          <MessagesSquare aria-hidden /> {t("frozen.chat")}
        </Link>
      </Button>
    </div>
  );
}
