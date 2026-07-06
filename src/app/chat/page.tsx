import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { auth } from "@/auth";
import { ConversationList } from "@/components/conversation-list";
import { getConversations } from "@/lib/chat";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await getConversations(session.user.id);

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Chat</h1>
        <p className="data-label">Entraide entre porteurs · collabs · coups de main</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ConversationList conversations={conversations} />
        <div className="glass hidden flex-col items-center justify-center gap-3 rounded-2xl rounded-tr-sm p-12 text-center lg:flex">
          <MessagesSquare className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="max-w-sm text-sm text-muted-foreground">
            Choisis une conversation — ou repère un projet qui pourrait cohabiter avec le tien et
            écris à son porteur depuis sa page.
          </p>
        </div>
      </div>
    </div>
  );
}
