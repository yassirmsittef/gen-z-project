"use client";

import { useEffect } from "react";
import { useT } from "@/components/i18n-provider";

/**
 * Filet des erreurs de rendu, à l'intérieur du layout racine (les providers
 * sont là : le message se lit dans la langue du visiteur).
 *
 * Il ne montre RIEN de l'erreur : ni message, ni pile, ni chemin. Next les
 * masque déjà en production, mais une page à nous dit ce qu'il faut — ce n'est
 * pas ta faute, réessaie, écris-nous — au lieu d'un cadre générique en
 * anglais. Le détail va dans la console du serveur, où il sert à quelqu'un.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT("ui");
  useEffect(() => {
    console.error("[rendu] erreur non rattrapée", error.digest ?? "", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="data-label">500</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("error.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("error.body")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t("error.retry")}
      </button>
    </main>
  );
}
