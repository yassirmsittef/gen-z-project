import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Crown, ShieldCheck, UserMinus } from "lucide-react";
import { auth } from "@/auth";
import { MemberActions, ReadmitButton } from "@/components/group-moderation";
import { ReputationBadge } from "@/components/reputation-badge";
import { UserAvatar } from "@/components/user-avatar";
import { getGroupBySlug, getGroupMembers } from "@/lib/chat-groups";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Membres du groupe",
  robots: { index: false, follow: false },
};

export default async function GroupMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const group = await getGroupBySlug(slug, session.user.id);
  if (!group) notFound();
  // Un salon est une place publique, mais son trombinoscope reste entre ceux
  // qui y sont : on ne fiche pas les membres depuis l'extérieur.
  if (!group.isMember && !group.canModerate) redirect(`/chat/groupes/${slug}`);

  const { members, bans } = await getGroupMembers(group.id, group.canModerate);

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-2">
        <Link
          href={`/chat/groupes/${group.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour au fil
        </Link>
        <h1 dir="auto" className="text-left text-4xl font-semibold tracking-tight">
          {group.name}
        </h1>
        <p className="data-label">
          {members.length} membre{members.length > 1 ? "s" : ""}
          {group.canModerate && bans.length > 0
            ? ` · ${bans.length} exclu${bans.length > 1 ? "s" : ""}`
            : ""}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-8">
        <ul className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl rounded-tr-sm">
          {members.map(({ user, manager, joinedAt }) => {
            const isOwner = user.id === group.owner.id;
            return (
              <li
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <Link href={`/u/${user.id}`} className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-semibold">
                      {user.name}
                      {isOwner && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/15 px-2 py-0.5 text-[11px] font-medium text-secondary">
                          <Crown className="h-3 w-3" aria-hidden />
                          Animateur
                        </span>
                      )}
                      {manager && !isOwner && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          <ShieldCheck className="h-3 w-3" aria-hidden />
                          Gérant·e
                        </span>
                      )}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <ReputationBadge reputation={user.reputation} admin={user.role === "ADMIN"} showScore={false} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        depuis le {formatDate(joinedAt)}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* L'animation ne s'exclut pas elle-même, et on ne se modère
                    pas soi-même. */}
                {group.canModerate && !isOwner && user.id !== session.user.id && (
                  <MemberActions
                    slug={group.slug}
                    targetId={user.id}
                    targetName={user.name ?? "ce membre"}
                    isManager={manager}
                    canManage={group.canManage}
                  />
                )}
              </li>
            );
          })}
        </ul>

        {group.canModerate && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <UserMinus className="h-4 w-4 text-muted-foreground" aria-hidden />
              Exclusions
            </h2>
            {bans.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/[0.12] p-6 text-center text-sm text-muted-foreground">
                Personne n&apos;a été exclu de ce salon. Une exclusion retire la personne et lui
                ferme la porte ; ses messages, eux, restent.
              </p>
            ) : (
              <ul className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
                {bans.map(({ user, createdAt }) => (
                  <li
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        className="h-9 w-9 opacity-60"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{user.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          exclu le {formatDate(createdAt)}
                        </p>
                      </div>
                    </div>
                    <ReadmitButton slug={group.slug} targetId={user.id} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
