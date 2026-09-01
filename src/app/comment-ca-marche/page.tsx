import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GATE_USD_CENTS,
  MAX_DURATION_DAYS,
  MAX_GOAL,
  MAX_MILESTONES,
  MAX_PROOF_ATTEMPTS,
  MIN_CONTRIBUTION_MAJOR,
  MIN_DURATION_DAYS,
  MIN_GOAL,
  MIN_MILESTONES,
  REALIZATION_DAYS,
} from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { stripeLive } from "@/lib/stripe-mode";
import { localeTag } from "@/lib/i18n/locales";
import { getRequestLocale, getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("howItWorks");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

/**
 * Le mode d'emploi complet, version lisible (le pendant marketing des CGU —
 * les chiffres viennent des constantes pour ne jamais mentir). Trajectoire à
 * nœuds = le motif DA des jalons, appliqué au parcours entier.
 */

export default async function CommentCaMarchePage() {
  const t = await getT("howItWorks");
  const locale = await getRequestLocale();

  const gate = formatMoney(GATE_USD_CENTS, "usd", locale);

  const stages = [
    {
      title: t("stages.contributeTitle"),
      chips: [
        t("stages.contributeChipMin", { min: MIN_CONTRIBUTION_MAJOR }),
        t("stages.contributeChipGate", { gate }),
      ],
      body: t("stages.contributeBody", { gate }),
    },
    {
      title: t("stages.launchTitle"),
      chips: [
        t("stages.launchChipDuration", { min: MIN_DURATION_DAYS, max: MAX_DURATION_DAYS }),
        t("stages.launchChipMilestones", { min: MIN_MILESTONES, max: MAX_MILESTONES }),
      ],
      body: t("stages.launchBody", {
        minGoal: MIN_GOAL,
        maxGoal: MAX_GOAL.toLocaleString(localeTag(locale)),
        minDays: MIN_DURATION_DAYS,
        maxDays: MAX_DURATION_DAYS,
        minMilestones: MIN_MILESTONES,
        maxMilestones: MAX_MILESTONES,
      }),
    },
    {
      title: t("stages.fundTitle"),
      chips: [t("stages.fundChipEscrow"), t("stages.fundChipRefund")],
      body: t("stages.fundBody"),
    },
    {
      title: t("stages.proveTitle"),
      chips: [t("stages.proveChipVote"), t("stages.proveChipDays", { days: REALIZATION_DAYS })],
      body: t("stages.proveBody", { attempts: MAX_PROOF_ATTEMPTS, days: REALIZATION_DAYS }),
    },
    {
      title: t("stages.cashTitle"),
      chips: [t("stages.cashChipPayout"), t("stages.cashChipFee"), t("stages.cashChipProrata")],
      body: t("stages.cashBody"),
    },
  ];

  const faq: { q: string; a: string; anchor?: string }[] = [
    { q: t("faq.investmentQ"), a: t("faq.investmentA") },
    { q: t("faq.costQ"), a: t("faq.costA"), anchor: "frais" },
    { q: t("faq.feesQ"), a: t("faq.feesA") },
    { q: t("faq.whoQ"), a: t("faq.whoA") },
    { q: t("faq.vanishQ"), a: t("faq.vanishA", { days: REALIZATION_DAYS }) },
    { q: t("faq.payoutQ"), a: t("faq.payoutA") },
    { q: t("faq.realMoneyQ"), a: stripeLive ? t("faq.realMoneyALive") : t("faq.realMoneyATest") },
  ];

  return (
    <div className="page-halo">
      <div className="container max-w-3xl py-12 md:py-16">
        <p className="data-label">{t("intro.label")}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("intro.title")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {t("intro.lead")}{" "}
          <strong className="font-medium text-foreground">{t("intro.highlight")}</strong>
          {t("intro.after")}
        </p>

        {/* Trajectoire à nœuds : le parcours entier, du premier soutien au versement. */}
        <ol className="relative mt-12 space-y-10 border-s border-white/10 ps-8 [border-image:linear-gradient(to_bottom,#5EEAD4,#38BDF8,transparent)_1]">
          {stages.map((stage, i) => (
            <li key={stage.title} className="relative">
              <span
                aria-hidden
                className="absolute -start-[45px] flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-card font-mono text-xs font-bold text-primary shadow-glow"
              >
                {i + 1}
              </span>
              <h2 className="font-display text-xl font-semibold tracking-tight">{stage.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
              <p className="mt-3 flex flex-wrap gap-2">
                {stage.chips.map((chip) => (
                  <span key={chip} className="data-label rounded-full border border-white/10 px-2.5 py-1">
                    {chip}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ol>

        <h2 className="mt-16 font-display text-2xl font-semibold tracking-tight">
          {t("faq.heading")}
        </h2>
        <div className="mt-6 space-y-3">
          {faq.map((item) => (
            <details
              key={item.q}
              id={item.anchor}
              className="glass group scroll-mt-24 rounded-2xl rounded-se-sm px-5 py-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
                    aria-hidden
                  />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          {t("legal.before")}{" "}
          <Link href="/cgu" className="font-medium text-primary underline-offset-4 hover:underline">
            {t("legal.link")}
          </Link>
          {t("legal.after")}
        </p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/projects">{t("cta.discover")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">{t("cta.register")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
