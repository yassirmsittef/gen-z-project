import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Hash, Lock, Users } from "lucide-react";
import { auth } from "@/auth";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatStream } from "@/components/chat-stream";
import {
  DissolveGroupButton,
  JoinGroupButton,
  LeaveGroupButton,
} from "@/components/group-membership";
import { GroupMessageActions } from "@/components/group-message-actions";
import { GroupMessageForm } from "@/components/group-message-form";
import { ReportButton } from "@/components/report-button";
import { ThreadAutoScroll } from "@/components/thread-autoscroll";
import { UserAvatar } from "@/components/user-avatar";
import { getConversations } from "@/lib/chat";
import { getGroupBySlug, getGroupThread, getMyGroups, markGroupRead } from "@/lib/chat-groups";
import { CATEGORY_LABELS, roomTexts } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Groupe",
  robots: { index: false, follow: false },
};

/** Les cinq premiers visages du salon, puis le compte des autres. */
function MemberStack({
  group,
}: {
  group: NonNullable<Awaited<ReturnType<typeof getGroupBySlug>>>;
}) {
  return (
    <>
      {group.memberPreview.slice(0, 5).map((member) => (
        <UserAvatar
          key={member.id}
          name={member.name}
          avatarUrl={member.avatarUrl}
          className="h-8 w-8 ring-1 ring-background"
        />
      ))}
      {group.memberCount > 5 && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.12] bg-card/80 font-mono text-[10px] text-muted-foreground ring-1 ring-background">
          +{group.memberCount - 5}
        </span>
      )}
    </>
  );
}

export default async function GroupThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ avant?: string }>;
}) {
  const [{ slug }, { avant }] = await Promise.all([params, searchParams]);
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const group = await getGroupBySlug(slug, userId);
  if (!group) notFound();

  // Ouvrir le fil vaut lecture : la pastille « non lus » retombe ici.
  if (group.isMember) await markGroupRead(userId, group.id);

  const [conversations, myGroups, fil] = await Promise.all([
    getConversations(userId),
    getMyGroups(userId),
    group.isMember
      ? getGroupThread(group.id, avant)
      : Promise.resolve({ messages: [], hasOlder: false, isHistory: false }),
  ]);
  const { messages: thread, hasOlder, isHistory } = fil;

  return (
    <div className="container py-10">
      <ChatStream />
      <div className="mb-8 space-y-2">
        <Link
          href="/chat/groupes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Tous les groupes
        </Link>
        {/* dir="auto" ordonne correctement un nom arabe ; text-left le garde
            ancré à la mise en page (sinon il part à l'autre bout de l'écran,
            loin de son sous-titre). Même parti pris partout où un nom de
            groupe occupe un bloc pleine largeur. */}
        <h1 dir="auto" className="text-left text-4xl font-semibold tracking-tight">
          {group.name}
        </h1>
        <p className="data-label">
          {group.official ? "Salon d'accueil · " : ""}
          {CATEGORY_LABELS[group.category]} · {group.memberCount} membre
          {group.memberCount > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <div className="hidden min-w-0 lg:block">
          <ChatSidebar
            conversations={conversations}
            groups={myGroups}
            activeGroupSlug={group.slug}
          />
        </div>

        <div className="glass flex min-h-[60vh] min-w-0 flex-col rounded-2xl rounded-tr-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] p-4">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl rounded-tr-sm border border-white/[0.12] bg-card/80 text-muted-foreground"
                aria-hidden
              >
                <Hash className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p dir="auto" className="text-left font-semibold">
                  {group.name}
                </p>
                <p dir="auto" className="text-left text-sm text-muted-foreground">
                  {group.purpose}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Animé par{" "}
                  <Link href={`/u/${group.owner.id}`} className="hover:text-foreground">
                    {group.owner.name}
                  </Link>{" "}
                  · ouvert le {formatDate(group.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* La pile d'avatars mène au trombinoscope : c'est de là que
                  l'animation nomme les gérant·es et exclut. */}
              {group.isMember || group.canModerate ? (
                <Link
                  href={`/chat/groupes/${group.slug}/membres`}
                  className="flex -space-x-2 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                  title={`Voir les ${group.memberCount} membres`}
                >
                  <MemberStack group={group} />
                </Link>
              ) : (
                <div className="flex -space-x-2" aria-label={`${group.memberCount} membres`}>
                  <MemberStack group={group} />
                </div>
              )}
              {group.isMember && (
                <>
                  {group.isOwner ? (
                    <DissolveGroupButton slug={group.slug} />
                  ) : (
                    <ReportButton targetType="CHAT_GROUP" targetId={group.id} iconOnly />
                  )}
                  <LeaveGroupButton slug={group.slug} isOwner={group.isOwner} />
                </>
              )}
            </div>
          </div>

          {group.isMember ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {hasOlder && thread.length > 0 && (
                  <p className="text-center">
                    <Link
                      href={`/chat/groupes/${group.slug}?avant=${thread[0].id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-card/60 px-3.5 py-1 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                      Messages plus anciens
                    </Link>
                  </p>
                )}
                {thread.length === 0 ? (
                  <p dir="auto" className="py-12 text-center text-sm text-muted-foreground">
                    {roomTexts(group.slug).empty}
                  </p>
                ) : (
                  thread.map((message) => {
                    // Arrivée d'un membre : filet centré dans la langue du
                    // salon, jamais une bulle — ce n'est pas quelqu'un qui parle.
                    if (message.system) {
                      return (
                        <p
                          key={message.id}
                          dir="auto"
                          className="py-1 text-center text-xs text-muted-foreground"
                        >
                          {message.body}
                        </p>
                      );
                    }
                    const mine = message.senderId === userId;
                    return (
                      <div
                        key={message.id}
                        className={cn("flex items-end gap-2", mine && "flex-row-reverse")}
                      >
                        {!mine && (
                          <Link href={`/u/${message.sender.id}`} className="shrink-0">
                            <UserAvatar
                              name={message.sender.name}
                              avatarUrl={message.sender.avatarUrl}
                              className="h-8 w-8"
                            />
                          </Link>
                        )}
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                            mine
                              ? "rounded-br-sm border border-primary/30 bg-primary/10"
                              : "rounded-bl-sm border border-white/[0.08] bg-card/80"
                          )}
                        >
                          {!mine && (
                            <Link
                              href={`/u/${message.sender.id}`}
                              className="font-semibold transition-colors duration-200 hover:text-primary"
                            >
                              {message.sender.name}
                            </Link>
                          )}
                          {/* dir="auto" : un message en arabe s'affiche de
                              droite à gauche sans casser le reste du fil. */}
                          <p dir="auto" className="whitespace-pre-line break-words">
                            {message.body}
                          </p>
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                            <GroupMessageActions
                              messageId={message.id}
                              canDelete={mine || group.canModerate}
                              canReport={!mine}
                            />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {isHistory && (
                  <p className="text-center">
                    <Link
                      href={`/chat/groupes/${group.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/20"
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      Revenir aux derniers messages
                    </Link>
                  </p>
                )}
                {/* Dernier enfant du conteneur défilant : le fil s'ouvre sur
                    le présent, pas sur les plus vieux messages. En remontant
                    l'historique, on reste au contraire en HAUT de la page
                    chargée — c'est là que la lecture reprend. */}
                {!isHistory && <ThreadAutoScroll count={thread.length} />}
              </div>

              <div className="border-t border-white/[0.06] p-4">
                <GroupMessageForm groupId={group.id} groupName={group.name} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center">
              <Lock className="h-8 w-8 text-muted-foreground" aria-hidden />
              <div className="space-y-1">
                <p className="font-semibold">Le fil est réservé aux membres</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Rejoins le groupe pour lire les échanges et écrire — tu peux en repartir quand
                  tu veux.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <JoinGroupButton slug={group.slug} full={group.full} />
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" aria-hidden />
                  {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                </span>
              </div>
              <ReportButton targetType="CHAT_GROUP" targetId={group.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
