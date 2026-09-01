"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CornerDownLeft, Hash, Search, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type Results = {
  projects: { slug: string; title: string; pitch: string; status: string }[];
  calls: { slug: string; target: string; supportCount: number; answerCount: number }[];
  rooms: { slug: string; name: string; purpose: string; memberCount: number }[];
  members: { id: string; name: string | null; avatarUrl: string | null; city: string | null }[];
};

const EMPTY: Results = { projects: [], calls: [], rooms: [], members: [] };

/**
 * Recherche globale ⌘K : projets, salons et membres depuis n'importe quelle page.
 * Dialogue en portal (verre), navigation aux flèches, Entrée pour ouvrir,
 * Échap pour fermer — le focus revient au déclencheur.
 */
export function CommandPalette({ className }: { className?: string }) {
  const t = useT("ui");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [active, setActive] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // ⌘K / Ctrl+K partout, Échap dans la palette.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Ouverture : focus dans le champ. Fermeture : focus rendu au déclencheur,
  // état remis à zéro.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setResults(EMPTY);
      setActive(0);
      triggerRef.current?.focus?.();
    }
  }, [open]);

  // Navigation = fermeture (la palette vit dans la navbar, jamais démontée).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Recherche debouncée, requêtes obsolètes annulées.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        setResults((await response.json()) as Results);
        setActive(0);
      } catch {
        // requête annulée ou réseau : on garde l'état courant
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  // ⚠️ Cet ordre doit être EXACTEMENT celui du rendu plus bas : c'est lui
  // qui décide ce qu'ouvre la touche Entrée.
  const items = [
    ...results.projects.map((p) => ({ href: `/projects/${p.slug}`, key: `p-${p.slug}` })),
    ...results.calls.map((c) => ({ href: `/appels/${c.slug}`, key: `a-${c.slug}` })),
    ...results.rooms.map((r) => ({ href: `/chat/groupes/${r.slug}`, key: `s-${r.slug}` })),
    ...results.members.map((m) => ({ href: `/u/${m.id}`, key: `m-${m.id}` })),
  ];

  function onInputKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && items[active]) {
      event.preventDefault();
      router.push(items[active].href);
      setOpen(false);
    }
  }

  const showEmpty = query.trim().length >= 2 && !searching && items.length === 0;
  let index = -1;

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        title={t("commandPalette.triggerTitle")}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden />
        <span className="sr-only">{t("commandPalette.triggerLabel")}</span>
      </Button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-background/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("commandPalette.dialogLabel")}
              className="glass mx-auto mt-[12vh] w-full max-w-lg overflow-hidden rounded-2xl rounded-se-sm border border-white/[0.12] shadow-glow"
              style={{ overscrollBehavior: "contain" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4">
                <Search className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder={t("commandPalette.inputPlaceholder")}
                  aria-label={t("commandPalette.inputLabel")}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="shrink-0 rounded border border-white/[0.12] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  esc
                </kbd>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {results.projects.length > 0 && (
                  <p className="data-label px-2 pb-1 pt-2">{t("commandPalette.sectionProjects")}</p>
                )}
                {results.projects.map((project) => {
                  index += 1;
                  const i = index;
                  return (
                    <Link
                      key={`p-${project.slug}`}
                      href={`/projects/${project.slug}`}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150",
                        active === i ? "bg-primary/10 text-foreground" : "text-foreground/85"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{project.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {project.pitch}
                        </span>
                      </span>
                      {active === i && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary rtl:-scale-x-100" aria-hidden />
                      )}
                    </Link>
                  );
                })}

                {results.calls.length > 0 && (
                  <p className="data-label px-2 pb-1 pt-2">{t("commandPalette.sectionCalls")}</p>
                )}
                {results.calls.map((call) => {
                  index += 1;
                  const i = index;
                  return (
                    <Link
                      key={`a-${call.slug}`}
                      href={`/appels/${call.slug}`}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150",
                        active === i ? "bg-primary/10 text-foreground" : "text-foreground/85"
                      )}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-secondary/25 bg-secondary/10 text-secondary"
                        aria-hidden
                      >
                        <Swords className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {t("commandPalette.replaceTarget", { target: call.target })}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {t("commandPalette.callVotes", { count: call.supportCount })} ·{" "}
                          {call.answerCount > 0
                            ? t("commandPalette.callAnswerers", { count: call.answerCount })
                            : t("commandPalette.callNoAnswerers")}
                        </span>
                      </span>
                      {active === i && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary rtl:-scale-x-100" aria-hidden />
                      )}
                    </Link>
                  );
                })}

                {results.rooms.length > 0 && (
                  <p className="data-label px-2 pb-1 pt-2">{t("commandPalette.sectionRooms")}</p>
                )}
                {results.rooms.map((room) => {
                  index += 1;
                  const i = index;
                  return (
                    <Link
                      key={`s-${room.slug}`}
                      href={`/chat/groupes/${room.slug}`}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150",
                        active === i ? "bg-primary/10 text-foreground" : "text-foreground/85"
                      )}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-card/80 text-muted-foreground"
                        aria-hidden
                      >
                        <Hash className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span dir="auto" className="block truncate text-start font-medium">
                          {room.name}
                        </span>
                        <span dir="auto" className="block truncate text-start text-xs text-muted-foreground">
                          {t("commandPalette.roomMeta", {
                            count: room.memberCount,
                            purpose: room.purpose,
                          })}
                        </span>
                      </span>
                      {active === i && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary rtl:-scale-x-100" aria-hidden />
                      )}
                    </Link>
                  );
                })}

                {results.members.length > 0 && (
                  <p className="data-label px-2 pb-1 pt-2">{t("commandPalette.sectionMembers")}</p>
                )}
                {results.members.map((member) => {
                  index += 1;
                  const i = index;
                  return (
                    <Link
                      key={`m-${member.id}`}
                      href={`/u/${member.id}`}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150",
                        active === i ? "bg-primary/10 text-foreground" : "text-foreground/85"
                      )}
                    >
                      <UserAvatar
                        name={member.name}
                        avatarUrl={member.avatarUrl}
                        className="h-7 w-7 text-[10px]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{member.name}</span>
                        {member.city && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {member.city}
                          </span>
                        )}
                      </span>
                      {active === i && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary rtl:-scale-x-100" aria-hidden />
                      )}
                    </Link>
                  );
                })}

                {showEmpty && (
                  <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                    {t("commandPalette.noResults", { query: query.trim() })}
                  </p>
                )}
                {query.trim().length < 2 && (
                  <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                    {t("commandPalette.minChars")}
                  </p>
                )}
              </div>

              <p className="border-t border-white/[0.08] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {t("commandPalette.shortcutsHint")}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
