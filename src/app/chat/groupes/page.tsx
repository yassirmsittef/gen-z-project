import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProjectCategory } from "@prisma/client";
import { Hash, MessagesSquare, Users } from "lucide-react";
import { auth } from "@/auth";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatStream } from "@/components/chat-stream";
import { CreateGroupForm } from "@/components/create-group-form";
import { ChipRail, FilterChip } from "@/components/filter-chips";
import { JoinGroupButton } from "@/components/group-membership";
import { Button } from "@/components/ui/button";
import { getConversations } from "@/lib/chat";
import { getMyGroups, groupCountsByCategory, listGroups } from "@/lib/chat-groups";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Groupes",
  robots: { index: false, follow: false },
};

export default async function GroupsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const category = Object.keys(CATEGORY_LABELS).includes(params.categorie ?? "")
    ? (params.categorie as ProjectCategory)
    : undefined;

  const [conversations, myGroups, groups, counts] = await Promise.all([
    getConversations(session.user.id),
    getMyGroups(session.user.id),
    listGroups({ category, userId: session.user.id }),
    groupCountsByCategory(),
  ]);

  const chipHref = (value?: string) =>
    value ? `/chat/groupes?categorie=${value}` : "/chat/groupes";

  return (
    <div className="container py-10">
      <ChatStream />
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Groupes</h1>
        <p className="data-label">Un salon par envie · rangés dans les catégories des projets</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <div className="hidden min-w-0 lg:block">
          <ChatSidebar conversations={conversations} groups={myGroups} />
        </div>

        {/* min-w-0 : sans lui, la largeur max-content du rail de catégories
            imposerait sa loi à la colonne (grid item = min-width auto). */}
        <div className="min-w-0 space-y-6">
          <div className="space-y-3">
            {/* La catégorie active passe en tête pour rester visible sans JS. */}
            <ChipRail label="Catégories de groupes">
              <FilterChip href={chipHref()} active={!category} label="Toutes catégories" />
              {[
                ...(category ? [[category, CATEGORY_LABELS[category]] as const] : []),
                ...Object.entries(CATEGORY_LABELS).filter(([value]) => value !== category),
              ].map(([value, label]) => (
                <FilterChip
                  key={value}
                  href={chipHref(value)}
                  active={category === value}
                  label={label}
                  count={counts[value as ProjectCategory]}
                />
              ))}
            </ChipRail>
            {category && (
              <p className="max-w-2xl text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{CATEGORY_LABELS[category]}</span> —{" "}
                {CATEGORY_DESCRIPTIONS[category]}
              </p>
            )}
          </div>

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
                {category
                  ? `Aucun groupe en ${CATEGORY_LABELS[category]} pour l'instant.`
                  : "Aucun groupe pour l'instant."}
              </p>
              <p className="text-sm text-muted-foreground">
                Ouvre le premier — c&apos;est souvent lui qui rassemble.
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
                        className="truncate font-display text-lg font-semibold transition-colors duration-200 hover:text-primary"
                      >
                        {group.name}
                      </Link>
                      <p className="data-label">{CATEGORY_LABELS[group.category]}</p>
                    </div>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">{group.purpose}</p>

                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden />
                      {group.memberCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessagesSquare className="h-3 w-3" aria-hidden />
                      {group.messageCount}
                    </span>
                    <span>{formatDate(group.lastAt)}</span>
                  </p>

                  <div className="mt-auto pt-1">
                    {group.joined ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/chat/groupes/${group.slug}`}>Ouvrir le fil</Link>
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
