import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { stripeLive } from "@/lib/stripe-mode";
import { Atmosphere } from "@/components/atmosphere";
import { I18nProvider } from "@/components/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PointerFx } from "@/components/pointer-fx";
import { PageTransition } from "@/components/page-transition";
import { dirOf, ogLocaleOf } from "@/lib/i18n/locales";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { clientMessages } from "@/messages/client";

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

/**
 * L'arabe : aucune des trois polices latines n'en a les glyphes — sans
 * celle-ci, le navigateur retombe sur une police système au hasard, et les
 * `data-label` en JetBrains Mono n'affichaient rien de tenu.
 * IBM Plex Sans Arabic est un grotesque géométrique qui s'accorde à Space
 * Grotesk et Inter. `preload: false` : les six autres langues ne la
 * téléchargent jamais.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

/** URL canonique du site (aperçus de partage, sitemap, robots). */
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = [await getRequestLocale(), await getT("meta")];
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("titleDefault"),
      // Le nom de marque ne se traduit pas — le gabarit non plus.
      template: "%s · GeniGain",
    },
    description: t("description"),
    openGraph: {
      siteName: "GeniGain",
      locale: ogLocaleOf(locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

// Barre d'UI du navigateur accordée au fond nuit.
export const viewport: Viewport = { themeColor: "#0B0E14" };

// Toutes les pages lisent la base : pas de prérendu statique en Phase 1.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, t] = [await getRequestLocale(), await getT("nav")];
  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable} ${plexArabic.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <I18nProvider locale={locale} messages={clientMessages(locale)}>
          <a
            href="#main"
            className="skip-link rounded-xl border border-primary/40 bg-card px-4 py-2 text-sm font-semibold text-primary shadow-glow"
          >
            {t("skipToContent")}
          </a>
          <Atmosphere />
          <Navbar />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            <PageTransition>{children}</PageTransition>
          </main>
          <footer className="border-t border-white/[0.08] py-6">
            <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
              <nav
                aria-label={t("legalLinks")}
                className="flex flex-wrap justify-center gap-x-5 gap-y-1"
              >
                <Link href="/cgu" className="transition-colors duration-200 hover:text-foreground">
                  {t("terms")}
                </Link>
                <Link
                  href="/confidentialite"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  {t("privacy")}
                </Link>
                <Link
                  href="/mentions-legales"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  {t("legalNotice")}
                </Link>
              </nav>
              <p>{stripeLive ? t("footerLive") : t("footerTest")}</p>
              <LanguageSwitcher current={locale} />
            </div>
          </footer>
          <ScrollReveal />
          <PointerFx />
        </I18nProvider>
      </body>
    </html>
  );
}
