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
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Les appels",
  description:
    "Les marques dont la communauté ne veut plus, et les projets qui se lancent pour les remplacer.",
};

const SORT_LABELS: Record<CallSort, string> = {
  orphelins: "Sans remplaçant",
  soutenus: "Les plus soutenus",
  recents: "Les plus récents",
};

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

  // « Sans remplaçant » d'abord : le fil doit ouvrir sur la demande qui
  // attend encore son offre, pas sur un palmarès de colères.
  const sort: CallSort = Object.keys(SORT_LABELS).includes(params.tri ?? "")
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
        <p className="data-label">Le fil</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Ce qu&apos;on ne veut plus — et ce qu&apos;on met à la place
        </h1>
        <p className="text-muted-foreground">
          Chaque appel est publié par un membre, sous son nom. Il nomme une marque dont il ne veut
          plus et décrit ce qu&apos;il achèterait à la place. Un porteur s&apos;en saisit, la
          communauté le finance : c&apos;est comme ça qu&apos;on remplace au lieu de seulement
          refuser.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button asChild>
            <Link href="/appels/nouveau">
              <Megaphone aria-hidden />
              Publier un appel
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            GeniGain héberge ces appels et n&apos;en est pas l&apos;auteur.
          </p>
        </div>
      </header>

      <form action="/appels" method="get" className="mb-6 flex max-w-xl gap-2">
        {sort !== "orphelins" && <input type="hidden" name="tri" value={sort} />}
        {category && <input type="hidden" name="secteur" value={category} />}
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Une marque, un secteur, un mot…"
          aria-label="Rechercher un appel"
          className="flex-1"
        />
        <Button type="submit" size="icon" variant="outline" title="Rechercher">
          <Search aria-hidden />
          <span className="sr-only">Rechercher</span>
        </Button>
      </form>

      <div className="mb-8 space-y-3">
        <ChipRail label="Tri">
          {(Object.keys(SORT_LABELS) as CallSort[]).map((value) => (
            <FilterChip
              key={value}
              href={filterUrl(value, category, query)}
              active={sort === value}
              label={SORT_LABELS[value]}
            />
          ))}
        </ChipRail>
        <ChipRail label="Secteurs">
          <FilterChip
            href={filterUrl(sort, undefined, query)}
            active={!category}
            label="Tous secteurs"
          />
          {[
            ...(category ? [[category, CATEGORY_LABELS[category]] as const] : []),
            ...Object.entries(CATEGORY_LABELS).filter(([value]) => value !== category),
          ].map(([value, label]) => (
            <FilterChip
              key={value}
              href={filterUrl(sort, value, query)}
              active={category === value}
              label={label}
            />
          ))}
        </ChipRail>
        {(query || category) && (
          <p className="data-label">
            {calls.length} appel{calls.length > 1 ? "s" : ""}
            {query && ` pour « ${query} »`}
          </p>
        )}
      </div>

      {calls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] py-20 text-center">
          {/* Trois vides différents, trois messages : un fil désert n'est pas
              un fil dont tous les appels ont trouvé preneur. */}
          <p className="text-lg font-semibold">
            {filActuellementVide
              ? "Le fil n'a pas encore d'appel."
              : sort === "orphelins" && !query && !category
                ? "Tous les appels ont trouvé un remplaçant."
                : "Aucun appel ne correspond."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filActuellementVide
              ? "Sois le premier à nommer une marque dont tu ne veux plus — et à dire ce que tu achèterais à la place."
              : sort === "orphelins" && !query && !category
                ? "C'est bon signe. Ouvre-en un autre si une marque te reste en travers."
                : "Change de filtre — ou publie le tien."}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/appels/nouveau">Publier un appel</Link>
          </Button>
        </div>
      ) : (
        <section aria-labelledby="titre-resultats">
          {/* La grille de cartes porte des h3 : sans ce h2, la hiérarchie
              saute un niveau et la navigation par titres devient bancale. */}
          <h2 id="titre-resultats" className="sr-only">
            {SORT_LABELS[sort]}
            {category ? ` — ${CATEGORY_LABELS[category]}` : ""}
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
