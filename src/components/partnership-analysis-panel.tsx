import { Sparkles } from "lucide-react";
import { StatRing } from "@/components/stat-ring";
import { getT } from "@/lib/i18n/server";
import type { PartnershipAnalysis } from "@/lib/partnership-ai";
import { cn } from "@/lib/utils";

/**
 * Panneau « Copilote IA » : verdict, jauges fiabilité/équité, signaux et
 * questions à poser — le porteur décide, le copilote éclaire.
 */

const VERDICT_TONES: Record<PartnershipAnalysis["verdict"], string> = {
  favorable: "border-success/40 bg-success/10 text-success",
  prudence: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  deconseille: "border-destructive/40 bg-destructive/10 text-destructive",
};

const VERDICT_KEYS = {
  favorable: "partnershipAnalysisPanel.verdictFavorable",
  prudence: "partnershipAnalysisPanel.verdictPrudence",
  deconseille: "partnershipAnalysisPanel.verdictDeconseille",
} as const;

const SIGNAL_DOTS: Record<PartnershipAnalysis["signaux"][number]["niveau"], string> = {
  danger: "bg-destructive",
  attention: "bg-amber-400",
  info: "bg-primary",
};

const SIGNAL_KEYS = {
  danger: "partnershipAnalysisPanel.signalDanger",
  attention: "partnershipAnalysisPanel.signalAttention",
  info: "partnershipAnalysisPanel.signalInfo",
} as const;

export async function PartnershipAnalysisPanel({ analysis }: { analysis: PartnershipAnalysis }) {
  const t = await getT("calls");

  return (
    <section data-spotlight className="glass space-y-6 rounded-2xl rounded-se-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          {t("partnershipAnalysisPanel.heading")}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {analysis.moteur === "claude"
            ? t("partnershipAnalysisPanel.engineDeep")
            : t("partnershipAnalysisPanel.engineQuick")}
        </p>
      </div>

      <p
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
          VERDICT_TONES[analysis.verdict]
        )}
      >
        {t(VERDICT_KEYS[analysis.verdict])}
      </p>

      <div className="grid gap-6 sm:grid-cols-[auto_auto_1fr] sm:items-center">
        <StatRing
          value={String(analysis.fiabilite)}
          percent={analysis.fiabilite / 100}
          label={t("partnershipAnalysisPanel.reliabilityLabel")}
          sublabel={t("partnershipAnalysisPanel.reliabilitySub")}
        />
        <StatRing
          tint="violet"
          value={String(analysis.equite)}
          percent={analysis.equite / 100}
          label={t("partnershipAnalysisPanel.fairnessLabel")}
          sublabel={t("partnershipAnalysisPanel.fairnessSub")}
        />
        <p className="text-sm leading-relaxed text-foreground/90">{analysis.resume}</p>
      </div>

      {analysis.signaux.length > 0 && (
        <div className="space-y-2">
          <h3 className="data-label">{t("partnershipAnalysisPanel.signalsHeading")}</h3>
          <ul className="space-y-2">
            {analysis.signaux.map((signal, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm">
                <span
                  className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SIGNAL_DOTS[signal.niveau])}
                  aria-hidden
                />
                <span>
                  <span className="me-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t(SIGNAL_KEYS[signal.niveau])}
                  </span>
                  {signal.texte}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.questions.length > 0 && (
        <div className="space-y-2">
          <h3 className="data-label">{t("partnershipAnalysisPanel.questionsHeading")}</h3>
          <ol className="list-inside list-decimal space-y-1.5 text-sm text-foreground/90">
            {analysis.questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
