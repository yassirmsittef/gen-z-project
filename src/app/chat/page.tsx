import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatStream } from "@/components/chat-stream";
import { getConversations } from "@/lib/chat";
import { getMyGroups } from "@/lib/chat-groups";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [conversations, groups] = await Promise.all([
    getConversations(session.user.id),
    getMyGroups(session.user.id),
  ]);

  return (
    <div className="container py-10">
      <ChatStream />
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Chat</h1>
        <p className="data-label">Entraide entre porteurs · collabs · coups de main</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <ChatSidebar conversations={conversations} groups={groups} />
        <div className="glass hidden flex-col items-center justify-center gap-3 rounded-2xl rounded-tr-sm p-12 text-center lg:flex">
          <MessagesSquare className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="max-w-sm text-sm text-muted-foreground">
            Choisis une conversation — ou rejoins un groupe de ta catégorie pour parler à
            plusieurs.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/chat/groupes">Explorer les groupes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
