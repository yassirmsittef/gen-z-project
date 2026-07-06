import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import type { getConversations } from "@/lib/chat";
import { cn } from "@/lib/utils";

export function ConversationList({
  conversations,
  activePartnerId,
}: {
  conversations: Awaited<ReturnType<typeof getConversations>>;
  activePartnerId?: string;
}) {
  if (conversations.length === 0) {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
        <MessagesSquare className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Aucune conversation. Contacte un·e porteur·se depuis sa page projet ou son profil pour
          proposer ton aide.
        </p>
      </div>
    );
  }

  return (
    <nav className="glass overflow-hidden rounded-2xl">
      <ul className="divide-y divide-white/[0.06]">
        {conversations.map(({ partner, lastBody, lastFromMe }) => (
          <li key={partner.id}>
            <Link
              href={`/chat/${partner.id}`}
              className={cn(
                "flex items-center gap-3 p-4 transition-colors duration-200 hover:bg-accent",
                activePartnerId === partner.id && "bg-primary/10"
              )}
            >
              <UserAvatar name={partner.name} className="h-10 w-10" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{partner.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {lastFromMe ? "Toi : " : ""}
                  {lastBody}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
