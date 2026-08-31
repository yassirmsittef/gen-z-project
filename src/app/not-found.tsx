import Link from "next/link";
import type { Metadata } from "next";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("notFoundTitle"),
    robots: { index: false, follow: false },
  };
}

/** 404 globale : servie pour les routes inconnues et les notFound() (projet
 * retiré, profil inexistant…). Sobre — aucun élément animé. */
export default async function NotFound() {
  const t = await getT("nav");
  return (
    <div className="page-halo">
      <div className="container flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 py-16 text-center">
        {/* Le sigil en filigrane, statique. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mask-sigil.svg" alt="" aria-hidden className="h-16 w-16 opacity-35" />
        <p className="data-label">{t("notFoundLabel")}</p>
        <h1 className="text-4xl font-semibold tracking-tight">{t("notFoundHeading")}</h1>
        <p className="leading-relaxed text-muted-foreground">{t("notFoundBody")}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/projects">
              <Compass aria-hidden />
              {t("notFoundDiscover")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home aria-hidden />
              {t("notFoundHome")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
