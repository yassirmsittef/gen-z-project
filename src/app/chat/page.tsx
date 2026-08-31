import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatStream } from "@/components/chat-stream";
import { getT } from "@/lib/i18n/server";
import { getConversations } from "@/lib/chat";
import { getMyGroups } from "@/lib/chat-groups";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("memberPages");
  return {
    title: t("meta.chatTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const t = await getT("memberPages");

  const [conversations, groups] = await Promise.all([
    getConversations(session.user.id),
    getMyGroups(session.user.id),
  ]);

  return (
    <div className="container py-10">
      <ChatStream />
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">{t("chatHeader.title")}</h1>
        <p className="data-label">{t("chatHeader.tagline")}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <ChatSidebar conversations={conversations} groups={groups} />
        <div className="glass hidden flex-col items-center justify-center gap-3 rounded-2xl rounded-tr-sm p-12 text-center lg:flex">
          <MessagesSquare className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("chatIndex.pickConversation")}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/chat/groupes">{t("chatIndex.exploreGroups")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
