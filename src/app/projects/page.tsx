import Link from "next/link";
import type { Metadata } from "next";
import { ProjectCategory, ProjectStatus, type Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import { ChipRail, FilterChip } from "@/components/filter-chips";
import { ProjectCard } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { replacementsByProject } from "@/lib/boycott";
import { categoryDescription, categoryLabel, statusLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("projectsPages");
  return { title: t("meta.listTitle") };
}

const SORT_KEYS = ["recent", "suivis", "fin", "finances"] as const;

type SortKey = (typeof SORT_KEYS)[number];

function filterUrl(category?: string, status?: string, q?: string, sort?: string) {
  const params = new URLSearchParams();
  if (category) params.set("categorie", category);
  if (status) params.set("statut", status);
  if (q) params.set("q", q);
  if (sort && sort !== "recent") params.set("tri", sort);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; statut?: string; q?: string; tri?: string }>;
}) {
  const params = await searchParams;
  const [locale, t] = [await getRequestLocale(), await getT("projectsPages")];

  const category = (Object.values(ProjectCategory) as string[]).includes(params.categorie ?? "")
    ? (params.categorie as ProjectCategory)
    : undefined;
  const status = (Object.values(ProjectStatus) as string[]).includes(params.statut ?? "")
    ? (params.statut as ProjectStatus)
    : undefined;
  const query = (params.q ?? "").trim().slice(0, 80);
  const sort: SortKey = (SORT_KEYS as readonly string[]).includes(params.tri ?? "")
    ? (params.tri as SortKey)
    : "recent";

  const where: Prisma.ProjectWhereInput = {
    ...(category ? { category } : {}),
    // « Bientôt terminés » n'a de sens que pour les campagnes en cours.
    ...(status ? { status } : sort === "fin" ? { status: "ACTIVE" } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { pitch: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProjectOrderByWithRelationInput[] =
    sort === "suivis"
      ? [{ follows: { _count: "desc" } }, { createdAt: "desc" }]
      : sort === "fin"
        ? [{ deadline: "asc" }]
        : sort === "finances"
          ? [{ raised: "desc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }];

  const projects = await prisma.project.findMany({
    where,
    orderBy,
    include: PROJECT_CARD_INCLUDE,
  });

  const replaces = await replacementsByProject(projects.map((project) => project.id));

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">{t("hero.title")}</h1>
        <p className="font-medium text-muted-foreground">{t("hero.subtitle")}</p>
      </div>

      {/* Moteur de recherche (GET : partageable et sans JS requis) */}
      <form action="/projects" method="get" className="mb-6 flex max-w-xl gap-2">
        {category && <input type="hidden" name="categorie" value={category} />}
        {status && <input type="hidden" name="statut" value={status} />}
        {sort !== "recent" && <input type="hidden" name="tri" value={sort} />}
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t("search.placeholder")}
          aria-label={t("search.ariaLabel")}
          className="flex-1"
        />
        <Button type="submit" size="icon" variant="outline" title={t("search.submit")}>
          <Search aria-hidden />
          <span className="sr-only">{t("search.submit")}</span>
        </Button>
      </form>

      <div className="mb-8 space-y-3">
        {/* Rail horizontal : toutes les catégories tiennent sur UNE ligne
            défilante (fondu aux bords) ; la catégorie active est remontée en
            tête pour rester visible sans JS. */}
        <ChipRail label={t("filters.categories")}>
          <FilterChip
            href={filterUrl(undefined, status, query, sort)}
            active={!category}
            label={t("filters.allCategories")}
          />
          {[
            ...(category ? [category] : []),
            ...Object.values(ProjectCategory).filter((value) => value !== category),
          ].map((value) => (
            <FilterChip
              key={value}
              href={filterUrl(value, status, query, sort)}
              active={category === value}
              label={categoryLabel(locale, value)}
            />
          ))}
        </ChipRail>
        {/* Statuts et tri partagent la seconde ligne. */}
        <ChipRail label={t("filters.statusesAndSort")}>
          <FilterChip
            href={filterUrl(category, undefined, query, sort)}
            active={!status}
            label={t("filters.allStatuses")}
          />
          {Object.values(ProjectStatus).map((value) => (
            <FilterChip
              key={value}
              href={filterUrl(category, value, query, sort)}
              active={status === value}
              label={statusLabel(locale, value)}
            />
          ))}
          <span className="mx-1.5 h-5 w-px shrink-0 self-center bg-white/[0.12]" aria-hidden />
          <span className="data-label mr-1 self-center">{t("filters.sortLabel")}</span>
          {SORT_KEYS.map((value) => (
            <FilterChip
              key={value}
              href={filterUrl(category, status, query, value)}
              active={sort === value}
              label={t(`sort.${value}`)}
            />
          ))}
        </ChipRail>
        {category && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{categoryLabel(locale, category)}</span> —{" "}
            {categoryDescription(locale, category)}
          </p>
        )}
        {(query || category || status) && (
          <p className="data-label">
            {t("results.count", { count: projects.length })}
            {query && t("results.forQuery", { query })}
          </p>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] py-20 text-center text-muted-foreground">
          <p className="text-lg font-semibold">{t("empty.title")}</p>
          <p className="text-sm">{t("empty.body")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              replaces={replaces.get(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
