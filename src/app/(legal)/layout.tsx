import { LegalNav } from "@/components/legal-nav";
import { getRequestLocale, getT } from "@/lib/i18n/server";

/**
 * Coquille commune des pages légales : colonne de lecture étroite, halo
 * discret, navigation entre les trois documents. Le contenu des pages est
 * du HTML sémantique stylé par `.legal-prose` (globals.css). Les trois
 * documents restent en FRANÇAIS (seule version qui fait foi) — hors locale
 * fr, un bandeau sobre le dit dans la langue de la personne.
 */
export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const t = await getT("legalPages");
  return (
    <div className="page-halo">
      <div className="container max-w-3xl py-12 md:py-16">
        <p className="data-label">{t("layout.frame")}</p>
        <LegalNav />
        {locale !== "fr" && (
          <p className="mt-6 border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">
            {t("frenchPrevails")}
          </p>
        )}
        <article lang="fr" dir="ltr" className="legal-prose mt-8">
          {children}
        </article>
      </div>
    </div>
  );
}
