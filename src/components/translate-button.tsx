"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useLocale, useT } from "@/components/i18n-provider";
import {
  translateText,
  translationAvailable,
  type TranslationOutcome,
} from "@/lib/browser-translate";
import { cn } from "@/lib/utils";

/**
 * « Traduire » sous un texte écrit par un membre.
 *
 * Deux chemins, dans cet ordre (cf. src/lib/browser-translate.ts) : le modèle
 * intégré au navigateur quand il existe — gratuit, et le texte ne bouge pas —
 * puis un service externe, sans quoi la traduction n'existerait que sur
 * quelques ordinateurs et pas sur les téléphones.
 *
 * Le bouton n'apparaît QUE si l'un des deux est possible : proposer une
 * action impossible use la confiance plus vite qu'elle ne rend service. Le
 * test se fait après le montage, sinon le serveur et le client rendraient
 * deux HTML différents.
 *
 * Avant le PREMIER passage par le service, on prévient et on demande : le
 * texte va quitter l'appareil. La réponse est gardée sur cet appareil, pour
 * ne pas reposer la question à chaque message.
 *
 * L'original reste toujours accessible d'un clic : une traduction automatique
 * peut trahir, et le texte d'un membre fait foi.
 */

const CLE_ACCORD = "genigain.traduction.service";

/**
 * L'accord de laisser sortir le texte est LU À CHAQUE CLIC, jamais gardé dans
 * l'état du bouton : la page en affiche des dizaines, chacun monté avant que
 * la réponse existe. Un `useState` posé au montage laissait tous les autres
 * reposer la question — accepté sur un message, redemandé sur le suivant.
 * Le stockage peut refuser (navigation privée) : on redemandera, plutôt que
 * d'envoyer sans avoir demandé.
 */
function accordDonne(): boolean {
  try {
    return localStorage.getItem(CLE_ACCORD) === "oui";
  } catch {
    return false;
  }
}

export function TranslateButton({
  texte,
  className,
}: {
  texte: string;
  className?: string;
}) {
  const t = useT("ui");
  const locale = useLocale();
  const [disponible, setDisponible] = useState(false);
  const [etat, setEtat] = useState<"repos" | "encours">("repos");
  const [progression, setProgression] = useState<number | null>(null);
  const [resultat, setResultat] = useState<TranslationOutcome | null>(null);
  const [affiche, setAffiche] = useState(false);
  const [question, setQuestion] = useState(false);

  useEffect(() => {
    let vivant = true;
    translationAvailable().then((ok) => vivant && setDisponible(ok));
    return () => {
      vivant = false;
    };
  }, []);

  // Rien à traduire, ou aucun chemin de traduction : pas de bouton.
  if (!disponible || texte.trim().length < 2) return null;

  async function traduire(autoriserService: boolean) {
    setEtat("encours");
    setProgression(null);
    setQuestion(false);
    const issue = await translateText(texte, locale, {
      onProgress: (f) => setProgression(f),
      autoriserService,
    });
    setEtat("repos");
    setProgression(null);
    // Le texte n'est pas parti : on demande d'abord, on traduira ensuite.
    if (issue.statut === "consentement-requis") {
      setQuestion(true);
      return;
    }
    setResultat(issue);
    setAffiche(issue.statut === "traduit");
  }

  function lancer() {
    if (resultat?.statut === "traduit") {
      setAffiche((v) => !v);
      return;
    }
    void traduire(accordDonne());
  }

  function accepter() {
    try {
      localStorage.setItem(CLE_ACCORD, "oui");
    } catch {
      // Refus du stockage : l'accord vaut au moins pour ce message.
    }
    void traduire(true);
  }

  const libelle =
    etat === "encours"
      ? progression !== null
        ? t("translate.downloading", { percent: Math.round(progression * 100) })
        : t("translate.working")
      : affiche
        ? t("translate.showOriginal")
        : t("translate.action");

  // Un échec, une langue absente ou un quota atteint s'annonce en clair, à la
  // place du bouton : un bouton qui ne répond plus laisse croire à une panne.
  const message =
    resultat && resultat.statut !== "traduit"
      ? resultat.statut === "deja-dans-ta-langue"
        ? t("translate.sameLanguage")
        : resultat.statut === "langue-indisponible"
          ? t("translate.unavailablePair")
          : resultat.statut === "trop-frequent"
            ? t("translate.tooFast")
            : resultat.statut === "sature"
              ? t("translate.saturated")
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
            {resultat.via === "service" ? t("translate.badgeService") : t("translate.badge")}
          </span>
        </p>
      )}
      {question ? (
        <div className="mt-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("translate.consentBody")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={accepter}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("translate.consentAccept")}
            </button>
            <button
              type="button"
              onClick={() => setQuestion(false)}
              className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("translate.consentDecline")}
            </button>
          </div>
        </div>
      ) : message ? (
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
