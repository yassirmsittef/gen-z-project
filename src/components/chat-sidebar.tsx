"use client";

import Link from "next/link";
import { useState } from "react";
import { Hash, MessagesSquare, Plus, Users } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { getConversations } from "@/lib/chat";
import type { getMyGroups } from "@/lib/chat-groups";

type Conversations = Awaited<ReturnType<typeof getConversations>>;
type Groups = Awaited<ReturnType<typeof getMyGroups>>;

const TABS = [
  { key: "prive", label: "Privé" },
  { key: "groupes", label: "Groupes" },
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
  const [tab, setTab] = useState<TabKey>(activeGroupSlug ? "groupes" : "prive");
  const unreadGroups = groups.filter((group) => group.unread).length;

  return (
    <nav className="glass overflow-hidden rounded-2xl">
      <div role="tablist" aria-label="Conversations" className="flex border-b border-white/[0.06]">
        {TABS.map(({ key, label }) => (
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
            {label}
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
                aria-label={`${unreadGroups} groupe(s) avec des messages non lus`}
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
              Aucune conversation privée. Écris à un·e porteur·se depuis sa page projet ou son
              profil — ou passe par un groupe de ta catégorie.
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
                        {lastFromMe ? "Toi : " : ""}
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
              Tu n&apos;as encore rejoint aucun groupe. Chaque catégorie a les siens — ouvre le
              tien ou entre dans un salon existant.
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
                            aria-label="Messages non lus"
                          />
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {group.lastBody
                          ? `${group.lastFromMe ? "Toi" : (group.lastSenderName ?? "Un membre")} : ${group.lastBody}`
                          : `${CATEGORY_LABELS[group.category]} · ${group.memberCount} membre${group.memberCount > 1 ? "s" : ""}`}
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
              Explorer et créer des groupes
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
