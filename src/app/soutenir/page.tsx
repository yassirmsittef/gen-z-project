import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { auth } from "@/auth";
import { SupportForm } from "@/components/support-form";
import { Card, CardContent } from "@/components/ui/card";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import { SUPPORT_CURRENCY } from "@/lib/constants";
import { platformSupportTotal } from "@/lib/platform-support";
import { stripeEnabled } from "@/lib/stripe";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("common");
  return { title: t("support.title"), description: t("support.lead") };
}

/**
 * Soutenir GeniGain — un don à la plateforme, sans étapes ni séquestre.
 * Honnête sur ce que c'est : l'argent va au compte de GeniGain, et l'engagement
 * public est que le surplus finance les projets des autres.
 */
export default async function SoutenirPage({
  searchParams,
}: {
  searchParams: Promise<{ merci?: string; annule?: string }>;
}) {
  const [{ merci, annule }, session, locale, t, total] = await Promise.all([
    searchParams,
    auth(),
    getRequestLocale(),
    getT("common"),
    platformSupportTotal(),
  ]);

  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-8 flex items-center gap-3">
        <HeartHandshake aria-hidden className="h-8 w-8 text-primary" />
        <h1 className="font-display text-4xl font-semibold tracking-tight">{t("support.title")}</h1>
      </div>

      <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
        <p className="text-foreground">{t("support.lead")}</p>
        <p>{t("support.what")}</p>
        <p className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 font-medium text-foreground">
          {t("support.surplus")}
        </p>
        <p className="text-sm">{t("support.direct")}</p>
        <p className="rounded-xl border border-white/[0.08] bg-background/40 px-4 py-3 text-sm text-foreground">
          {t("support.unlock")}
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-5 pt-6">
          <p className="data-label">
            {t("support.total", { amount: formatMoney(total, SUPPORT_CURRENCY, locale) })}
          </p>
          {merci && (
            <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
              {t("support.thanks")}
            </p>
          )}
          {annule && (
            <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              {t("support.cancelled")}
            </p>
          )}
          <SupportForm authenticated={Boolean(session?.user?.id)} enabled={stripeEnabled} />
        </CardContent>
      </Card>
    </div>
  );
}
