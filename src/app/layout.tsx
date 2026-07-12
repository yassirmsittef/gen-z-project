import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { stripeLive } from "@/lib/stripe-mode";
import { Atmosphere } from "@/components/atmosphere";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PointerFx } from "@/components/pointer-fx";
import { PageTransition } from "@/components/page-transition";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/** URL canonique du site (aperçus de partage, sitemap, robots). */
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GeniGain — La communauté qui finance ta génération",
    template: "%s · GeniGain",
  },
  description:
    "Lance ton projet, fais-le financer par la communauté, débloque les fonds étape par étape. Contribue avant de poster — et si ça rate, rebondis.",
  openGraph: {
    siteName: "GeniGain",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Barre d'UI du navigateur accordée au fond nuit.
export const viewport: Viewport = { themeColor: "#0B0E14" };

// Toutes les pages lisent la base : pas de prérendu statique en Phase 1.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a
          href="#main"
          className="skip-link rounded-xl border border-primary/40 bg-card px-4 py-2 text-sm font-semibold text-primary shadow-glow"
        >
          Aller au contenu
        </a>
        <Atmosphere />
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <PageTransition>{children}</PageTransition>
        </main>
        <footer className="border-t border-white/[0.08] py-6">
          <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <nav aria-label="Liens légaux" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
              <Link href="/cgu" className="transition-colors duration-200 hover:text-foreground">
                Conditions d&apos;utilisation
              </Link>
              <Link
                href="/confidentialite"
                className="transition-colors duration-200 hover:text-foreground"
              >
                Confidentialité
              </Link>
              <Link
                href="/mentions-legales"
                className="transition-colors duration-200 hover:text-foreground"
              >
                Mentions légales
              </Link>
            </nav>
            <p>
              {stripeLive
                ? "GeniGain · 0 % de commission, seuls les frais bancaires s'appliquent · paiements sécurisés par Stripe."
                : "GeniGain · Phase 1 — paiements Stripe en mode test, aucun vrai débit · 0 % de commission, seuls les frais bancaires s'appliquent."}
            </p>
          </div>
        </footer>
        <ScrollReveal />
        <PointerFx />
      </body>
    </html>
  );
}
