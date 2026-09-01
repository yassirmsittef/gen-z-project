import Link from "next/link";
import { Hash, MessagesSquare, Users } from "lucide-react";
import type { ProjectCategory } from "@prisma/client";
import { JoinGroupButton } from "@/components/group-membership";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLivelyRoom } from "@/lib/chat-groups";
import { CATEGORY_LABELS } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";

/**
 * Le pont entre un projet et les gens qui parlent de la même chose : depuis
 * une page projet, le salon le plus vivant de sa catégorie. Un salon que
 * personne ne croise reste vide — c'est ici que passe le trafic.
 *
 * Rien pour les visiteurs déconnectés : rejoindre suppose un compte, et une
 * carte qui ne mène qu'à /login est une fausse promesse.
 */
export async function CategoryRoomCard({
  category,
  viewerId,
}: {
  category: ProjectCategory;
  viewerId: string | null;
}) {
  if (!viewerId) return null;
  const t = await getT("chat");
  const room = await getLivelyRoom(category, viewerId);
  const label = CATEGORY_LABELS[category];

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <p className="data-label">{t("categoryRoomCard.roomLabel", { category: label })}</p>

        {room ? (
          <>
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl rounded-se-sm border border-white/[0.12] bg-card/80 text-muted-foreground"
                aria-hidden
              >
                <Hash className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p dir="auto" className="text-start font-semibold">
                  {room.name}
                </p>
                <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <Users className="h-3 w-3" aria-hidden />
                  {t("categoryRoomCard.memberCount", { count: room.memberCount })}
                </p>
              </div>
            </div>
            <p dir="auto" className="text-start text-sm text-muted-foreground">
              {room.purpose}
            </p>
            {room.joined ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/chat/groupes/${room.slug}`}>{t("categoryRoomCard.openThread")}</Link>
              </Button>
            ) : (
              <JoinGroupButton
                slug={room.slug}
                full={room.full}
                size="sm"
                label={t("categoryRoomCard.joinRoom", { category: label })}
              />
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t("categoryRoomCard.emptyBody", { category: label })}
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={`/chat/groupes?categorie=${category}`}>
                <MessagesSquare aria-hidden />
                {t("categoryRoomCard.openRoom", { category: label })}
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
