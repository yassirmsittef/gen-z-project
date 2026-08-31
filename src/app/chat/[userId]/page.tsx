import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatStream } from "@/components/chat-stream";
import { MessageForm } from "@/components/message-form";
import { ReputationBadge } from "@/components/reputation-badge";
import { SkillTag } from "@/components/skill-tag";
import { ThreadAutoScroll } from "@/components/thread-autoscroll";
import { UserAvatar } from "@/components/user-avatar";
import { getConversations, getThread } from "@/lib/chat";
import { getMyGroups } from "@/lib/chat-groups";
import { formatDate } from "@/lib/format";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("memberPages");
  return {
    title: t("meta.chatTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ChatThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ avant?: string }>;
}) {
  const [{ userId: partnerId }, { avant }] = await Promise.all([params, searchParams]);
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (partnerId === session.user.id) redirect("/chat");
  const t = await getT("memberPages");
  const locale = await getRequestLocale();

  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, avatarUrl: true, reputation: true, role: true, skills: true },
  });
  if (!partner) notFound();

  const [conversations, groups, fil] = await Promise.all([
    getConversations(session.user.id),
    getMyGroups(session.user.id),
    getThread(session.user.id, partnerId, avant),
  ]);
  const { messages: thread, hasOlder, isHistory } = fil;

  return (
    <div className="container py-10">
      <ChatStream />
      <div className="mb-8 space-y-2">
        {/* Sous 1024 px la colonne des conversations disparaît : sans ce
            retour, on ne sort d'un fil qu'au bouton précédent du navigateur. */}
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("chatThread.allConversations")}
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">{t("chatHeader.title")}</h1>
        <p className="data-label">{t("chatHeader.tagline")}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <div className="hidden lg:block">
          <ChatSidebar
            conversations={conversations}
            groups={groups}
            activePartnerId={partner.id}
          />
        </div>

        <div className="glass flex min-h-[60vh] flex-col rounded-2xl rounded-tr-sm">
          <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
            <Link href={`/u/${partner.id}`} className="flex items-center gap-3 hover:opacity-90">
              <UserAvatar name={partner.name} avatarUrl={partner.avatarUrl} className="h-10 w-10" />
              <div>
                <p className="font-semibold">{partner.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <ReputationBadge reputation={partner.reputation} admin={partner.role === "ADMIN"} showScore={false} />
                  {partner.skills.slice(0, 3).map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {hasOlder && thread.length > 0 && (
              <p className="text-center">
                <Link
                  href={`/chat/${partner.id}?avant=${thread[0].id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-card/60 px-3.5 py-1 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                  {t("chatThread.olderMessages")}
                </Link>
              </p>
            )}
            {thread.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {t("chatThread.startConversation")}
              </p>
            ) : (
              thread.map((message) => {
                const mine = message.senderId === session.user.id;
                return (
                  <div key={message.id} className={cn("flex", mine && "justify-end")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        mine
                          ? "rounded-br-sm border border-primary/30 bg-primary/10"
                          : "rounded-bl-sm border border-white/[0.08] bg-card/80"
                      )}
                    >
                      <p className="whitespace-pre-line break-words">{message.body}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatDate(message.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {isHistory && (
              <p className="text-center">
                <Link
                  href={`/chat/${partner.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/20"
                >
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  {t("chatThread.backToLatest")}
                </Link>
              </p>
            )}
            {!isHistory && <ThreadAutoScroll count={thread.length} />}
          </div>

          <div className="border-t border-white/[0.06] p-4">
            <MessageForm recipientId={partner.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
