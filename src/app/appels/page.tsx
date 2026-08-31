import Link from "next/link";
import type { Metadata } from "next";
import { ProjectCategory } from "@prisma/client";
import { Megaphone, Search } from "lucide-react";
import { auth } from "@/auth";
import { CallCard } from "@/components/call-card";
import { ChipRail, FilterChip } from "@/components/filter-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listCalls, type CallSort } from "@/lib/boycott";
import { CATEGORY_LABELS } from "@/lib/constants";
import { categoryLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("callsPages");
  return {
    title: t("meta.listTitle"),
    description: t("meta.listDescription"),
  };
}

/** « Sans remplaçant » en premier : l'ordre des chips suit celui du fil. */
const SORTS = ["orphelins", "soutenus", "recents"] as const satisfies readonly CallSort[];

function filterUrl(sort: CallSort, category?: string, q?: string) {
  const params = new URLSearchParams();
  if (sort !== "orphelins") params.set("tri", sort);
  if (category) params.set("secteur", category);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/appels?${query}` : "/appels";
}

export default async function AppelsPage({
  searchParams,
}: {
  searchParams: Promise<{ tri?: string; secteur?: string; q?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getT("callsPages");
  const locale = await getRequestLocale();

  // « Sans remplaçant » d'abord : le fil doit ouvrir sur la demande qui
  // attend encore son offre, pas sur un palmarès de colères.
  const sort: CallSort = (SORTS as readonly string[]).includes(params.tri ?? "")
    ? (params.tri as CallSort)
    : "orphelins";
  const category = Object.keys(CATEGORY_LABELS).includes(params.secteur ?? "")
    ? (params.secteur as ProjectCategory)
    : undefined;
  const query = (params.q ?? "").trim().slice(0, 80);

  const calls = await listCalls({ sort, category, query: query || undefined });

  // « Aucun appel » et « tous pourvus » ne se disent pas pareil : on ne
  // félicite pas la communauté pour un fil qu'elle n'a pas encore rempli.
  const filActuellementVide =
    calls.length === 0 && (await prisma.boycottCall.count({ where: { removedAt: null } })) === 0;

  // Les appels que CE membre soutient déjà, en une requête au lieu d'une par carte.
  const supported = userId
    ? new Set(
        (
          await prisma.boycottSupport.findMany({
            where: { userId, callId: { in: calls.map((call) => call.id) } },
            select: { callId: true },
          })
        ).map((support) => support.callId)
      )
    : new Set<string>();

  return (
    <div className="container py-10">
      <header className="mb-8 max-w-3xl space-y-3">
        <p className="data-label">{t("hero.label")}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{t("hero.title")}</h1>
        <p className="text-muted-foreground">{t("hero.body")}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button asChild>
            <Link href="/appels/nouveau">
              <Megaphone aria-hidden />
              {t("cta.publish")}
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">{t("hero.disclaimer")}</p>
        </div>
      </header>

      <form action="/appels" method="get" className="mb-6 flex max-w-xl gap-2">
        {sort !== "orphelins" && <input type="hidden" name="tri" value={sort} />}
        {category && <input type="hidden" name="secteur" value={category} />}
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t("search.placeholder")}
          aria-label={t("search.label")}
          className="flex-1"
        />
        <Button type="submit" size="icon" variant="outline" title={t("search.submit")}>
          <Search aria-hidden />
          <span className="sr-only">{t("search.submit")}</span>
        </Button>
      </form>

      <div className="mb-8 space-y-3">
        <ChipRail label={t("filters.sort")}>
          {SORTS.map((value) => (
            <FilterChip
              key={value}
              href={filterUrl(value, category, query)}
              active={sort === value}
              label={t(`sort.${value}`)}
            />
          ))}
        </ChipRail>
        <ChipRail label={t("filters.sectors")}>
          <FilterChip
            href={filterUrl(sort, undefined, query)}
            active={!category}
            label={t("filters.allSectors")}
          />
          {[
            ...(category ? [category] : []),
            ...(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).filter(
              (value) => value !== category
            ),
          ].map((value) => (
            <FilterChip
              key={value}
              href={filterUrl(sort, value, query)}
              active={category === value}
              label={categoryLabel(locale, value)}
            />
          ))}
        </ChipRail>
        {(query || category) && (
          <p className="data-label">
            {t("results.count", { count: calls.length })}
            {query && t("results.forQuery", { query })}
          </p>
        )}
      </div>

      {calls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] py-20 text-center">
          {/* Trois vides différents, trois messages : un fil désert n'est pas
              un fil dont tous les appels ont trouvé preneur. */}
          <p className="text-lg font-semibold">
            {filActuellementVide
              ? t("empty.noneYetTitle")
              : sort === "orphelins" && !query && !category
                ? t("empty.allAnsweredTitle")
                : t("empty.noMatchTitle")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filActuellementVide
              ? t("empty.noneYetBody")
              : sort === "orphelins" && !query && !category
                ? t("empty.allAnsweredBody")
                : t("empty.noMatchBody")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/appels/nouveau">{t("cta.publish")}</Link>
          </Button>
        </div>
      ) : (
        <section aria-labelledby="titre-resultats">
          {/* La grille de cartes porte des h3 : sans ce h2, la hiérarchie
              saute un niveau et la navigation par titres devient bancale. */}
          <h2 id="titre-resultats" className="sr-only">
            {t(`sort.${sort}`)}
            {category ? ` — ${categoryLabel(locale, category)}` : ""}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {calls.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                supporting={supported.has(call.id)}
                authenticated={Boolean(userId)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
