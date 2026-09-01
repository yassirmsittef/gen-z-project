"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useLocale, useT } from "@/components/i18n-provider";
import {
  translateText,
  translationSupported,
  type TranslationOutcome,
} from "@/lib/browser-translate";
import { cn } from "@/lib/utils";

/**
 * « Traduire » sous un texte écrit par un membre.
 *
 * La traduction se fait SUR L'APPAREIL (modèle intégré au navigateur) : aucun
 * service tiers, aucune clé, aucun coût — et le texte ne quitte jamais la
 * machine de qui le lit.
 *
 * Le bouton n'apparaît QUE si le navigateur sait traduire : proposer une
 * action impossible use la confiance plus vite qu'elle ne rend service. Le
 * test se fait après le montage, sinon le serveur et le client rendraient
 * deux HTML différents.
 *
 * L'original reste toujours accessible d'un clic : une traduction automatique
 * peut trahir, et le texte d'un membre fait foi.
 */
export function TranslateButton({
  texte,
  className,
}: {
  texte: string;
  className?: string;
}) {
  const t = useT("ui");
  const locale = useLocale();
  const [supporte, setSupporte] = useState(false);
  const [etat, setEtat] = useState<"repos" | "encours">("repos");
  const [progression, setProgression] = useState<number | null>(null);
  const [resultat, setResultat] = useState<TranslationOutcome | null>(null);
  const [affiche, setAffiche] = useState(false);

  useEffect(() => setSupporte(translationSupported()), []);

  // Rien à traduire, ou navigateur sans modèle : pas de bouton.
  if (!supporte || texte.trim().length < 2) return null;

  async function lancer() {
    if (resultat?.statut === "traduit") {
      setAffiche((v) => !v);
      return;
    }
    setEtat("encours");
    setProgression(null);
    const issue = await translateText(texte, locale, (f) => setProgression(f));
    setResultat(issue);
    setAffiche(issue.statut === "traduit");
    setEtat("repos");
    setProgression(null);
  }

  const libelle =
    etat === "encours"
      ? progression !== null
        ? t("translate.downloading", { percent: Math.round(progression * 100) })
        : t("translate.working")
      : affiche
        ? t("translate.showOriginal")
        : t("translate.action");

  // Un échec ou une langue absente s'annonce en clair, à la place du bouton :
  // un bouton qui ne répond plus laisse croire à une panne.
  const message =
    resultat && resultat.statut !== "traduit"
      ? resultat.statut === "deja-dans-ta-langue"
        ? t("translate.sameLanguage")
        : resultat.statut === "langue-indisponible"
          ? t("translate.unavailablePair")
          : t("translate.failed")
      : null;

  return (
    <>
      {affiche && resultat?.statut === "traduit" && (
        <p
          dir="auto"
          className="mt-1.5 rounded-lg border-s-2 border-primary/40 bg-primary/[0.05] px-3 py-2 text-sm leading-relaxed"
        >
          {resultat.texte}
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {t("translate.badge")}
          </span>
        </p>
      )}
      {message ? (
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      ) : (
        <button
          type="button"
          onClick={lancer}
          disabled={etat === "encours"}
          title={t("translate.title")}
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
            className
          )}
        >
          <Languages className="h-3 w-3" aria-hidden />
          {libelle}
        </button>
      )}
    </>
  );
}
