"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { groupModerationAction } from "@/actions/chat-groups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useT } from "@/components/i18n-provider";

type Trouve = { id: string; name: string | null; avatarUrl: string | null; city: string | null };

/**
 * Outil réservé aux gérants d'un groupe fermé : chercher une personne et
 * l'ajouter. C'est le SEUL moyen d'entrer dans un groupe privé — pas de lien
 * partageable qui pourrait traîner et laisser entrer un inconnu.
 */
export function AddGroupMember({ slug }: { slug: string }) {
  const t = useT("chat");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Trouve[]>([]);
  const [cherche, setCherche] = useState(false);
  const [ajoute, setAjoute] = useState<string | null>(null);

  async function chercher() {
    if (q.trim().length < 2) return;
    setCherche(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const d = (await r.json()) as { members?: Trouve[] };
      setResults(d.members ?? []);
    } catch {
      setResults([]);
    } finally {
      setCherche(false);
    }
  }

  async function ajouter(id: string) {
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("targetId", id);
    fd.set("geste", "ajouter");
    await groupModerationAction(undefined, fd);
    setAjoute(id);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <UserPlus className="h-4 w-4 text-primary" aria-hidden />
        {t("addMember.title")}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{t("addMember.hint")}</p>
      <div className="mt-3 flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), chercher())}
          placeholder={t("addMember.searchPlaceholder")}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={chercher} disabled={cherche || q.trim().length < 2}>
          {t("addMember.search")}
        </Button>
      </div>
      {results.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {results.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/40">
              <span className="flex min-w-0 items-center gap-2">
                <UserAvatar name={m.name} avatarUrl={m.avatarUrl} className="h-7 w-7" />
                <span className="truncate text-sm">{m.name ?? t("addMember.member")}</span>
              </span>
              {ajoute === m.id ? (
                <span className="text-xs text-success">{t("addMember.added")}</span>
              ) : (
                <Button type="button" size="sm" onClick={() => ajouter(m.id)}>
                  {t("addMember.add")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
