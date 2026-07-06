import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
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

export const metadata: Metadata = {
  title: {
    default: "Tremplin — La communauté qui finance ta génération",
    template: "%s · Tremplin",
  },
  description:
    "Lance ton projet, fais-le financer par la communauté, débloque les fonds étape par étape. Contribue avant de poster — et si ça rate, rebondis.",
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
          <p className="container text-center text-sm text-muted-foreground">
            Tremplin · Phase 1 — 1 token = 1 $ · argent 100% fictif, zéro vrai paiement. On teste les mécaniques
            communautaires.
          </p>
        </footer>
        <ScrollReveal />
        <PointerFx />
      </body>
    </html>
  );
}
