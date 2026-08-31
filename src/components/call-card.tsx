import Link from "next/link";
import { Rocket, Target } from "lucide-react";
import { CallSupportButton } from "@/components/call-support-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import type { CallListItem } from "@/lib/boycott";
import { CATEGORY_LABELS } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";

/**
 * Une carte du fil. Deux informations priment, dans cet ordre : la marque
 * visée (grande, c'est le sujet) et le fait qu'un remplaçant existe ou non —
 * c'est ce vide qui doit donner envie de se lancer.
 */
export async function CallCard({
  call,
  supporting,
  authenticated,
}: {
  call: CallListItem;
  supporting: boolean;
  authenticated: boolean;
}) {
  const t = await getT("calls");
  const answers = call._count.answers;

  return (
    <Card className="flex h-full flex-col rounded-tr-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-secondary/25 hover:shadow-glow-violet">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{CATEGORY_LABELS[call.category]}</Badge>
          {answers > 0 ? (
            <Badge variant="success">
              {t("callCard.replacementCount", { count: answers })}
            </Badge>
          ) : (
            <Badge variant="outline">{t("callCard.nobodyYet")}</Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="data-label">{t("callCard.noLongerWants")}</p>
          {/* `translate="no"` : une page auto-traduite mangerait le nom de la
              marque — sur un fil qui ne parle que de marques, c'est le sens
              même de l'appel qui se perd. */}
          <h3 translate="no" className="font-display text-2xl font-semibold leading-tight">
            <Link
              href={`/appels/${call.slug}`}
              className="transition-colors duration-200 hover:text-secondary"
            >
              {call.target}
            </Link>
          </h3>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">{call.reason}</p>

        <div className="rounded-xl border border-white/[0.08] bg-background/40 p-3">
          <p className="data-label mb-1 flex items-center gap-1.5">
            <Target aria-hidden className="h-3 w-3" />
            {t("callCard.instead")}
          </p>
          <p className="line-clamp-2 text-sm text-foreground">{call.wanted}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <Link
            href={`/u/${call.author.id}`}
            className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <UserAvatar
              name={call.author.name}
              avatarUrl={call.author.avatarUrl}
              className="h-7 w-7"
            />
            <span className="truncate">{call.author.name ?? t("callCard.memberFallback")}</span>
          </Link>

          <CallSupportButton
            callId={call.id}
            count={call._count.supports}
            supporting={supporting}
            authenticated={authenticated}
          />
        </div>

        {answers === 0 && (
          <Link
            href={`/appels/${call.slug}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-secondary/30 py-2.5 text-sm font-semibold text-secondary transition-colors duration-200 hover:bg-secondary/10"
          >
            <Rocket aria-hidden className="h-4 w-4" />
            {t("callCard.takeCall")}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
