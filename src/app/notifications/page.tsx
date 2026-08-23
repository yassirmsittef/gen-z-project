import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Handshake,
  Heart,
  LifeBuoy,
  LockOpen,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  PartyPopper,
  Rocket,
  ShieldX,
  Undo2,
  Users,
  Video,
  Vote,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationPrefs } from "@/components/notification-prefs";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

/** Icône + teinte par type — la couleur n'est jamais seule porteuse (icône dédiée). */
const TYPE_STYLES: Record<NotificationType, { Icon: LucideIcon; tone: string }> = {
  CONTRIBUTION: { Icon: Heart, tone: "text-primary" },
  CONTRIBUTION_CONFIRMED: { Icon: BadgeCheck, tone: "text-success" },
  PROJECT_FUNDED: { Icon: PartyPopper, tone: "text-success" },
  PROJECT_FAILED: { Icon: LifeBuoy, tone: "text-destructive" },
  REFUND: { Icon: Undo2, tone: "text-success" },
  PROOF_TO_VOTE: { Icon: Vote, tone: "text-secondary" },
  MILESTONE_RELEASED: { Icon: LockOpen, tone: "text-success" },
  PROOF_REJECTED: { Icon: ShieldX, tone: "text-destructive" },
  MESSAGE: { Icon: MessagesSquare, tone: "text-primary" },
  GROUP_MESSAGE: { Icon: Users, tone: "text-secondary" },
  PARTNERSHIP: { Icon: Handshake, tone: "text-secondary" },
  COMMENT: { Icon: MessageCircle, tone: "text-secondary" },
  PROJECT_UPDATE: { Icon: Megaphone, tone: "text-primary" },
  BOYCOTT_ANSWERED: { Icon: Rocket, tone: "text-success" },
  BOYCOTT_REMOVED: { Icon: ShieldX, tone: "text-destructive" },
  CALL_COMMENT: { Icon: MessageCircle, tone: "text-secondary" },
  CALL_VIDEO: { Icon: Video, tone: "text-secondary" },
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [notifications, viewer] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mutedNotifications: true },
    }),
  ]);

  // L'état non-lu est capturé pour l'affichage, PUIS tout passe en lu — y
  // compris au-delà des 50 affichées, sinon le badge ne retombe jamais à zéro.
  const unreadIds = notifications.filter((n) => !n.readAt).map((n) => n.id);
  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  const unreadSet = new Set(unreadIds);

  return (
    <div className="page-halo">
      <div className="container max-w-3xl space-y-8 py-10">
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
            <Bell className="h-8 w-8 text-primary" aria-hidden />
            Notifications
          </h1>
          <p className="data-label">
            {unreadIds.length > 0
              ? `${unreadIds.length} nouvelle${unreadIds.length > 1 ? "s" : ""} depuis ton dernier passage`
              : "Tout est à jour"}
          </p>
        </div>

        <NotificationPrefs muted={viewer?.mutedNotifications ?? []} />

        {notifications.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/[0.12] p-10 text-center text-sm text-muted-foreground">
            Rien pour l&apos;instant. Contributions reçues, preuves à voter, étapes débloquées,
            messages, commentaires, actus et demandes de partenariat arriveront ici.
          </p>
        ) : (
          <ul className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl rounded-tr-sm">
            {notifications.map((notification) => {
              const { Icon, tone } = TYPE_STYLES[notification.type];
              const isNew = unreadSet.has(notification.id);
              return (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    className={cn(
                      "flex items-start gap-3.5 p-4 transition-colors duration-200 hover:bg-accent",
                      isNew && "bg-primary/[0.06]"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-card/80",
                        tone
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={cn("truncate text-sm", isNew ? "font-semibold" : "font-medium")}>
                          {notification.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {formatRelative(notification.createdAt)}
                        </span>
                      </span>
                      {notification.body && (
                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                          {notification.body}
                        </span>
                      )}
                    </span>
                    {isNew && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary shadow-glow" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
