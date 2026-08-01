import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: partnerId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (partnerId === session.user.id) redirect("/chat");

  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, avatarUrl: true, reputation: true, skills: true },
  });
  if (!partner) notFound();

  const [conversations, groups, thread] = await Promise.all([
    getConversations(session.user.id),
    getMyGroups(session.user.id),
    getThread(session.user.id, partnerId),
  ]);

  return (
    <div className="container py-10">
      <ChatStream />
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Chat</h1>
        <p className="data-label">Entraide entre porteurs · collabs · coups de main</p>
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
                  <ReputationBadge reputation={partner.reputation} showScore={false} />
                  {partner.skills.slice(0, 3).map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Démarre la conversation — propose un coup de main, une collab, un échange de
                compétences.
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
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <ThreadAutoScroll count={thread.length} />
          </div>

          <div className="border-t border-white/[0.06] p-4">
            <MessageForm recipientId={partner.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
