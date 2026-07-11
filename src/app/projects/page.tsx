import Link from "next/link";
import type { Metadata } from "next";
import { ProjectCategory, ProjectStatus, type Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Projets" };

const SORT_LABELS = {
  recent: "Plus récents",
  suivis: "Plus suivis",
  fin: "Bientôt terminés",
  finances: "Plus financés",
} as const;

type SortKey = keyof typeof SORT_LABELS;

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

  const category = Object.keys(CATEGORY_LABELS).includes(params.categorie ?? "")
    ? (params.categorie as ProjectCategory)
    : undefined;
  const status = Object.keys(STATUS_LABELS).includes(params.statut ?? "")
    ? (params.statut as ProjectStatus)
    : undefined;
  const query = (params.q ?? "").trim().slice(0, 80);
  const sort: SortKey = Object.keys(SORT_LABELS).includes(params.tri ?? "")
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
    include: { owner: true, _count: { select: { contributions: true } } },
  });

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Les projets de la communauté</h1>
        <p className="font-medium text-muted-foreground">
          Chaque contribution compte — et c&apos;est ton ticket pour lancer le tien.
        </p>
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
          placeholder="Rechercher un projet, une idée, un mot-clé..."
          aria-label="Rechercher un projet"
          className="flex-1"
        />
        <Button type="submit" size="icon" variant="outline" title="Rechercher">
          <Search aria-hidden />
          <span className="sr-only">Rechercher</span>
        </Button>
      </form>

      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            href={filterUrl(undefined, status, query, sort)}
            active={!category}
            label="Toutes catégories"
          />
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <FilterChip
              key={value}
              href={filterUrl(value, status, query, sort)}
              active={category === value}
              label={label}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            href={filterUrl(category, undefined, query, sort)}
            active={!status}
            label="Tous statuts"
          />
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <FilterChip
              key={value}
              href={filterUrl(category, value, query, sort)}
              active={status === value}
              label={label}
            />
          ))}
        </div>
        {/* Tri — l'ordre d'affichage, préservé par les autres filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="data-label mr-1">Tri</span>
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <FilterChip
              key={value}
              href={filterUrl(category, status, query, value)}
              active={sort === value}
              label={label}
            />
          ))}
        </div>
        {category && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{CATEGORY_LABELS[category]}</span> —{" "}
            {CATEGORY_DESCRIPTIONS[category]}
          </p>
        )}
        {(query || category || status) && (
          <p className="data-label">
            {projects.length} résultat{projects.length > 1 ? "s" : ""}
            {query && ` pour « ${query} »`}
          </p>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] py-20 text-center text-muted-foreground">
          <p className="text-lg font-semibold">Aucun projet ne correspond.</p>
          <p className="text-sm">
            Essaie un autre mot-clé, change de filtre — ou sois le premier à te lancer.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1 text-sm font-medium transition-all duration-200 ease-out",
        active
          ? "border-primary/40 bg-primary/15 text-primary shadow-glow"
          : "border-white/[0.12] bg-card/60 text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
