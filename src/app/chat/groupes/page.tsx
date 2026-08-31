import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProjectCategory } from "@prisma/client";
import { Hash, MessagesSquare, Search, Users } from "lucide-react";
import { auth } from "@/auth";
import { categoryDescription, categoryLabel } from "@/lib/i18n/labels";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatStream } from "@/components/chat-stream";
import { CreateGroupForm } from "@/components/create-group-form";
import { ChipRail, FilterChip } from "@/components/filter-chips";
import { JoinGroupButton } from "@/components/group-membership";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageRoomsBanner } from "@/components/language-rooms-banner";
import { getConversations } from "@/lib/chat";
import {
  getMyGroups,
  groupCountsByCategory,
  listGroups,
  missingLanguageRooms,
} from "@/lib/chat-groups";
import { formatDate } from "@/lib/format";
import { isAdmin } from "@/lib/moderation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("memberPages");
  return {
    title: t("meta.groupsTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function GroupsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const t = await getT("memberPages");
  const locale = await getRequestLocale();

  const params = await searchParams;
  const category = (Object.values(ProjectCategory) as string[]).includes(params.categorie ?? "")
    ? (params.categorie as ProjectCategory)
    : undefined;
  const query = (params.q ?? "").trim().slice(0, 60);

  const [conversations, myGroups, groups, counts, admin] = await Promise.all([
    getConversations(session.user.id),
    getMyGroups(session.user.id),
    listGroups({ category, query, userId: session.user.id, locale }),
    groupCountsByCategory(),
    isAdmin(session.user.id),
  ]);
  // Les salons d'accueil ne s'ouvrent qu'une fois : la bannière disparaît
  // dès qu'ils sont tous là.
  const missingRooms = admin ? await missingLanguageRooms() : 0;

  // Les chips gardent la recherche en cours, et inversement.
  const chipHref = (value?: string) => {
    const p = new URLSearchParams();
    if (value) p.set("categorie", value);
    if (query) p.set("q", query);
    const qs = p.toString();
    return qs ? `/chat/groupes?${qs}` : "/chat/groupes";
  };

  return (
    <div className="container py-10">
      <ChatStream />
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">{t("groupsDir.title")}</h1>
        <p className="data-label">{t("groupsDir.tagline")}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <div className="hidden min-w-0 lg:block">
          <ChatSidebar conversations={conversations} groups={myGroups} />
        </div>

        {/* min-w-0 : sans lui, la largeur max-content du rail de catégories
            imposerait sa loi à la colonne (grid item = min-width auto). */}
        <div className="min-w-0 space-y-6">
          {/* Recherche en GET : partageable, et sans JavaScript. */}
          <form action="/chat/groupes" method="get" className="flex max-w-md gap-2">
            {category && <input type="hidden" name="categorie" value={category} />}
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={t("groupsDir.searchPlaceholder")}
              aria-label={t("groupsDir.searchLabel")}
              maxLength={60}
              className="flex-1"
            />
            <Button type="submit" size="icon" variant="outline" title={t("groupsDir.search")}>
              <Search aria-hidden />
              <span className="sr-only">{t("groupsDir.search")}</span>
            </Button>
          </form>

          <div className="space-y-3">
            {/* La catégorie active passe en tête pour rester visible sans JS. */}
            <ChipRail label={t("groupsDir.categoriesLabel")}>
              <FilterChip
                href={chipHref()}
                active={!category}
                label={t("groupsDir.allCategories")}
              />
              {[
                ...(category ? [category] : []),
                ...Object.values(ProjectCategory).filter((value) => value !== category),
              ].map((value) => (
                <FilterChip
                  key={value}
                  href={chipHref(value)}
                  active={category === value}
                  label={categoryLabel(locale, value)}
                  count={counts[value]}
                />
              ))}
            </ChipRail>
            {category && (
              <p className="max-w-2xl text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{categoryLabel(locale, category)}</span> —{" "}
                {categoryDescription(locale, category)}
              </p>
            )}
          </div>

          {missingRooms > 0 && <LanguageRoomsBanner missing={missingRooms} />}

          {/* Le formulaire se remonte quand la catégorie change : elle y est
              déjà choisie. */}
          <CreateGroupForm key={category ?? "toutes"} defaultCategory={category} />

          {groups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.12] py-16 text-center">
              <MessagesSquare
                className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
                aria-hidden
              />
              <p className="text-lg font-semibold">
                {query
                  ? category
                    ? t("groupsDir.noRoomForQueryInCategory", {
                        query,
                        category: categoryLabel(locale, category),
                      })
                    : t("groupsDir.noRoomForQuery", { query })
                  : category
                    ? t("groupsDir.noGroupInCategory", {
                        category: categoryLabel(locale, category),
                      })
                    : t("groupsDir.noGroup")}
              </p>
              <p className="text-sm text-muted-foreground">
                {query ? t("groupsDir.tryAnotherWord") : t("groupsDir.openFirst")}
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="glass flex flex-col gap-3 rounded-2xl rounded-tr-sm p-5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl rounded-tr-sm border border-white/[0.12] bg-card/80 text-muted-foreground"
                      aria-hidden
                    >
                      <Hash className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/chat/groupes/${group.slug}`}
                        dir="auto"
                        className="block truncate text-left font-display text-lg font-semibold transition-colors duration-200 hover:text-primary"
                      >
                        {group.name}
                      </Link>
                      <p className="data-label">
                        {group.official
                          ? t("groupsDir.officialRoomCategory", {
                              category: categoryLabel(locale, group.category),
                            })
                          : categoryLabel(locale, group.category)}
                      </p>
                    </div>
                  </div>

                  <p dir="auto" className="line-clamp-2 text-left text-sm text-muted-foreground">
                    {group.purpose}
                  </p>

                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden />
                      {group.memberCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessagesSquare className="h-3 w-3" aria-hidden />
                      {group.messageCount}
                    </span>
                    <span>{formatDate(group.lastAt, locale)}</span>
                  </p>

                  <div className="mt-auto pt-1">
                    {group.joined ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/chat/groupes/${group.slug}`}>
                          {t("groupsDir.openThread")}
                        </Link>
                      </Button>
                    ) : (
                      <JoinGroupButton slug={group.slug} full={group.full} size="sm" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
