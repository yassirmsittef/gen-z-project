import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { MapPin, MessagesSquare, Search, X } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommunityGlobe } from "@/components/community-globe";
import type { CityMarker } from "@/components/earth-scene";
import { ReputationBadge } from "@/components/reputation-badge";
import { SkillTag } from "@/components/skill-tag";
import { UserAvatar } from "@/components/user-avatar";
import { CITIES } from "@/lib/cities";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("communityPages");
  return { title: t("meta.communityTitle") };
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ville?: string }>;
}) {
  const t = await getT("communityPages");
  const locale = await getRequestLocale();
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const cityParam = (params.ville ?? "").trim();

  const session = await auth();

  const filters: Prisma.UserWhereInput[] = [];
  if (query) {
    filters.push({
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { skills: { has: query.toLowerCase() } },
        { city: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  if (cityParam) {
    filters.push({ city: { equals: cityParam, mode: "insensitive" } });
  }

  const [members, located, totalMembers, me] = await Promise.all([
    prisma.user.findMany({
      where: filters.length ? { AND: filters } : undefined,
      orderBy: [{ reputation: "desc" }, { contributedUsdCents: "desc" }, { createdAt: "asc" }],
      take: 60,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        city: true,
        country: true,
        skills: true,
        reputation: true,
        role: true,
        contributedUsdCents: true,
        _count: { select: { projects: true, contributions: true } },
      },
    }),
    prisma.user.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      select: { city: true, country: true, latitude: true, longitude: true },
    }),
    prisma.user.count(),
    session?.user?.id
      ? prisma.user.findUnique({ where: { id: session.user.id }, select: { city: true } })
      : Promise.resolve(null),
  ]);

  // Agrégation par ville pour le globe : un marqueur = une ville + son effectif.
  const markerMap = new Map<string, CityMarker>();
  for (const user of located) {
    if (!user.city || user.latitude === null || user.longitude === null) continue;
    const existing = markerMap.get(user.city);
    if (existing) {
      existing.count += 1;
    } else {
      markerMap.set(user.city, {
        city: user.city,
        country: user.country ?? "",
        lat: user.latitude,
        lng: user.longitude,
        count: 1,
      });
    }
  }
  const markers = [...markerMap.values()];

  // Nom canonique de la ville sélectionnée (l'URL peut arriver en minuscules).
  const selectedCity = cityParam
    ? (markers.find((m) => m.city.toLowerCase() === cityParam.toLowerCase())?.city ?? cityParam)
    : null;
  const selectedMarker = selectedCity
    ? markers.find((m) => m.city === selectedCity)
    : undefined;

  const hasFilters = Boolean(query || selectedCity);
  const clearCityHref = query ? `/communaute?q=${encodeURIComponent(query)}` : "/communaute";

  return (
    <div className="page-halo">
      <div className="container space-y-8 py-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">{t("community.title")}</h1>
          <p className="data-label">
            {t("count.members", { count: totalMembers })} ·{" "}
            {t("stats.cities", { count: markers.length })} · {t("stats.network")}
          </p>
        </div>

        {/* L'audace de l'écran : la Terre en points, membres en signaux bleus */}
        <section
          data-reveal
          className="glass relative h-[400px] overflow-hidden rounded-2xl rounded-tr-sm sm:h-[540px]"
        >
          <CommunityGlobe markers={markers} selectedCity={selectedCity} query={query} />

          {selectedMarker && (
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-primary/40 bg-card/80 py-1 pl-4 pr-1 backdrop-blur-md">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                {selectedMarker.city} · {t("count.members", { count: selectedMarker.count })}
              </span>
              <Button variant="ghost" size="icon" asChild className="h-7 w-7 rounded-full">
                <Link href={clearCityHref} scroll={false} title={t("globe.clearCity")}>
                  <X className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">{t("globe.clearCity")}</span>
                </Link>
              </Button>
            </div>
          )}

          {markers.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
              <p className="data-label">{t("globe.empty")}</p>
            </div>
          ) : (
            <>
              <p className="pointer-events-none absolute bottom-4 left-4 hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
                {t("globe.hintDesktop")}
              </p>
              <p className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:hidden">
                {t("globe.hintMobile")}
              </p>
            </>
          )}
        </section>

        {session?.user?.id && me && !me.city && (
          <p className="rounded-2xl border border-primary/25 bg-primary/[0.07] p-4 text-sm">
            {t("locate.notYet")}{" "}
            <Link href="/dashboard" className="font-medium text-primary hover:underline">
              {t("locate.cta")}
            </Link>
          </p>
        )}

        {/* Recherche : nom / compétence / ville — GET, URL partageable */}
        <section className="space-y-6">
          <form
            action="/communaute"
            method="GET"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={t("search.placeholder")}
                className="pl-9"
                aria-label={t("search.memberLabel")}
              />
            </div>
            <div className="relative sm:w-64">
              <MapPin
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                name="ville"
                list="cities-filter"
                defaultValue={selectedCity ?? ""}
                placeholder={t("search.cityPlaceholder")}
                autoComplete="off"
                className="pl-9"
                aria-label={t("search.cityLabel")}
              />
              <datalist id="cities-filter">
                {CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {`${city.name} — ${city.country}`}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="outline" size="default">
                {t("search.submit")}
              </Button>
              {hasFilters && (
                <Button variant="ghost" size="default" asChild>
                  <Link href="/communaute">{t("search.reset")}</Link>
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <p className="data-label">
              {t("count.members", { count: members.length })}
              {selectedCity ? t("results.inCity", { city: selectedCity }) : ""}
              {query ? t("results.forQuery", { query }) : ""}
            </p>

            {members.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/[0.12] p-10 text-center text-sm text-muted-foreground">
                {t("results.empty")}{" "}
                <Link href="/communaute" className="font-medium text-primary hover:underline">
                  {t("results.resetCta")}
                </Link>
              </p>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <li key={member.id} className="min-w-0">
                    <Card className="h-full">
                      <CardContent className="flex h-full flex-col gap-3 pt-6">
                        <div className="flex items-center gap-3">
                          <Link href={`/u/${member.id}`} className="shrink-0">
                            <UserAvatar name={member.name} avatarUrl={member.avatarUrl} className="h-12 w-12" />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/u/${member.id}`}
                              className="block truncate font-display text-lg font-semibold transition-colors duration-200 hover:text-primary"
                            >
                              {member.name}
                            </Link>
                            {member.city ? (
                              <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0 text-primary/70" aria-hidden />
                                <span className="truncate">
                                  {member.city}
                                  {member.country ? ` · ${member.country}` : ""}
                                </span>
                              </p>
                            ) : (
                              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                                {t("member.offRadar")}
                              </p>
                            )}
                          </div>
                          {session?.user?.id && session.user.id !== member.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8 shrink-0"
                              title={t("member.contact", { name: member.name })}
                            >
                              <Link href={`/chat/${member.id}`}>
                                <MessagesSquare className="h-4 w-4" aria-hidden />
                                <span className="sr-only">
                                  {t("member.contact", { name: member.name })}
                                </span>
                              </Link>
                            </Button>
                          )}
                        </div>

                        {member.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {member.skills.slice(0, 4).map((skill) => (
                              <SkillTag key={skill} skill={skill} />
                            ))}
                          </div>
                        )}

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-white/[0.06] pt-3">
                          <ReputationBadge reputation={member.reputation} admin={member.role === "ADMIN"} showScore={false} />
                          <p
                            className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                            title={`${t("count.projects", { count: member._count.projects })} · ${t("count.supports", { count: member._count.contributions })} · ${t("member.invested", { amount: formatMoney(member.contributedUsdCents, "usd", locale) })}`}
                          >
                            {t("count.projects", { count: member._count.projects })} ·{" "}
                            {t("count.supports", { count: member._count.contributions })} ·{" "}
                            {formatMoney(member.contributedUsdCents, "usd", locale)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
