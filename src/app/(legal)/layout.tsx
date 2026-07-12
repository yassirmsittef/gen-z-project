import { LegalNav } from "@/components/legal-nav";

/**
 * Coquille commune des pages légales : colonne de lecture étroite, halo
 * discret, navigation entre les trois documents. Le contenu des pages est
 * du HTML sémantique stylé par `.legal-prose` (globals.css).
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-halo">
      <div className="container max-w-3xl py-12 md:py-16">
        <p className="data-label">Le cadre</p>
        <LegalNav />
        <article className="legal-prose mt-8">{children}</article>
      </div>
    </div>
  );
}
