"use client";

import Link from "next/link";
import { useState } from "react";
import { Hash, MessagesSquare, Plus, Users } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { UserAvatar } from "@/components/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { getConversations } from "@/lib/chat";
import type { getMyGroups } from "@/lib/chat-groups";

type Conversations = Awaited<ReturnType<typeof getConversations>>;
type Groups = Awaited<ReturnType<typeof getMyGroups>>;

const TABS = [
  { key: "prive", labelKey: "chatSidebar.tabPrivate" },
  { key: "groupes", labelKey: "chatSidebar.tabGroups" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/**
 * Colonne de gauche du chat : deux temps de la conversation — le un-à-un
 * (« Privé ») et les salons de catégorie (« Groupes »). L'onglet s'ouvre sur
 * le contexte courant : on arrive dans un groupe, on voit ses groupes.
 */
export function ChatSidebar({
  conversations,
  groups,
  activePartnerId,
  activeGroupSlug,
}: {
  conversations: Conversations;
  groups: Groups;
  activePartnerId?: string;
  activeGroupSlug?: string;
}) {
  const t = useT("chat");
  const [tab, setTab] = useState<TabKey>(activeGroupSlug ? "groupes" : "prive");
  const unreadGroups = groups.filter((group) => group.unread).length;

  return (
    <nav className="glass overflow-hidden rounded-2xl">
      <div
        role="tablist"
        aria-label={t("chatSidebar.tablistLabel")}
        className="flex border-b border-white/[0.06]"
      >
        {TABS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`chat-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`chat-panel-${key}`}
            onClick={() => setTab(key)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                const next = TABS.find((t) => t.key !== tab)?.key ?? tab;
                setTab(next);
                document.getElementById(`chat-tab-${next}`)?.focus();
              }
            }}
            className={cn(
              "relative flex-1 cursor-pointer px-4 py-3 text-sm font-semibold transition-colors duration-200",
              tab === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(labelKey)}
            {key === "prive" && conversations.length > 0 && (
              <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-60">
                {conversations.length}
              </span>
            )}
            {key === "groupes" && groups.length > 0 && (
              <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-60">
                {groups.length}
              </span>
            )}
            {key === "groupes" && unreadGroups > 0 && tab !== "groupes" && (
              <span
                className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-gradient align-middle shadow-glow"
                aria-label={t("chatSidebar.unreadGroupsDot", { count: unreadGroups })}
              />
            )}
            {tab === key && (
              <span
                className="absolute inset-x-4 bottom-0 h-px bg-accent-gradient shadow-glow"
                aria-hidden
              />
            )}
          </button>
        ))}
      </div>

      {tab === "prive" ? (
        <div role="tabpanel" id="chat-panel-prive" aria-labelledby="chat-tab-prive">
          {conversations.length === 0 ? (
            <EmptyPanel icon={<MessagesSquare className="h-7 w-7" aria-hidden />}>
              {t("chatSidebar.emptyPrivate")}
            </EmptyPanel>
          ) : (
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
                    <UserAvatar
                      name={partner.name}
                      avatarUrl={partner.avatarUrl}
                      className="h-10 w-10"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{partner.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {lastFromMe ? t("chatSidebar.youPrefix") : ""}
                        {lastBody}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div role="tabpanel" id="chat-panel-groupes" aria-labelledby="chat-tab-groupes">
          {groups.length === 0 ? (
            <EmptyPanel icon={<Users className="h-7 w-7" aria-hidden />}>
              {t("chatSidebar.emptyGroups")}
            </EmptyPanel>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {groups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/chat/groupes/${group.slug}`}
                    className={cn(
                      "flex items-center gap-3 p-4 transition-colors duration-200 hover:bg-accent",
                      activeGroupSlug === group.slug && "bg-primary/10"
                    )}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl rounded-tr-sm border border-white/[0.12] bg-card/80 text-muted-foreground"
                      aria-hidden
                    >
                      <Hash className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-semibold">
                        <span dir="auto" className="truncate">
                          {group.name}
                        </span>
                        {group.unread && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gradient shadow-glow"
                            aria-label={t("chatSidebar.unreadDot")}
                          />
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {group.lastBody
                          ? t("chatSidebar.lastMessageLine", {
                              name: group.lastFromMe
                                ? t("chatSidebar.you")
                                : (group.lastSenderName ?? t("chatSidebar.someMember")),
                              body: group.lastBody,
                            })
                          : t("chatSidebar.groupMeta", {
                              category: CATEGORY_LABELS[group.category],
                              count: group.memberCount,
                            })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-white/[0.06] p-3">
            <Link
              href="/chat/groupes"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-accent"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t("chatSidebar.exploreGroups")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function EmptyPanel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
      {icon}
      <p className="text-sm">{children}</p>
    </div>
  );
}
