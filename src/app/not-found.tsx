import Link from "next/link";
import type { Metadata } from "next";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

/** 404 globale : servie pour les routes inconnues et les notFound() (projet
 * retiré, profil inexistant…). Sobre — aucun élément animé. */
export default function NotFound() {
  return (
    <div className="page-halo">
      <div className="container flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 py-16 text-center">
        {/* Le sigil en filigrane, statique. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mask-sigil.svg" alt="" aria-hidden className="h-16 w-16 opacity-35" />
        <p className="data-label">Erreur 404</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Cette page s&apos;est perdue en orbite
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          Le lien est peut-être périmé — ou le projet a été retiré par la personne qui le
          portait. Rien n&apos;est perdu : la communauté continue de construire juste à côté.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/projects">
              <Compass aria-hidden />
              Découvrir les projets
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home aria-hidden />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
