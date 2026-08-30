import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Github,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  MessagesSquare,
  PenLine,
  Twitter,
  Youtube,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { ReportButton } from "@/components/report-button";
import { ReputationBadge } from "@/components/reputation-badge";
import { ReputationRing } from "@/components/reputation-ring";
import { SkillTag } from "@/components/skill-tag";
import { UserAvatar } from "@/components/user-avatar";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string; description?: string }> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, city: true, bio: true },
  });
  if (!user) return { title: "Profil introuvable" };
  return {
    title: user.name ?? "Profil",
    description:
      user.bio ??
      `${user.name} sur GeniGain${user.city ? ` — ${user.city}` : ""} : réputation, projets et compétences.`,
  };
}

/** Icône et libellé court d'un lien public (plateformes connues → leur icône). */
function linkMeta(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const Icon = host.includes("instagram.")
      ? Instagram
      : host.includes("youtube.") || host === "youtu.be"
        ? Youtube
        : host.includes("github.")
          ? Github
          : host.includes("twitter.") || host === "x.com"
            ? Twitter
            : host.includes("linkedin.")
              ? Linkedin
              : Globe;
    // Le pseudo (« @toi », « /toi ») est plus parlant que le domaine seul.
    const segment = parsed.pathname.split("/").filter(Boolean)[0];
    const label = segment ? `${host}/${segment}` : host;
    return { Icon, label: label.length > 40 ? `${label.slice(0, 37)}…` : label };
  } catch {
    return { Icon: Globe, label: url };
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      projects: {
        include: PROJECT_CARD_INCLUDE,
        orderBy: { createdAt: "desc" },
      },
      reputationEvents: { orderBy: { createdAt: "desc" }, take: 8 },
      _count: { select: { contributions: true, votes: true } },
    },
  });
  if (!user) notFound();

  return (
    <div className="container space-y-10 py-10">
      <div className="flex flex-wrap items-center gap-5">
        <ReputationRing reputation={user.reputation} admin={user.role === "ADMIN"}>
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-20 w-20 border-0 text-2xl" />
        </ReputationRing>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <ReputationBadge reputation={user.reputation} admin={user.role === "ADMIN"} />
            {user.city && (
              <Link
                href={`/communaute?ville=${encodeURIComponent(user.city)}`}
                className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-primary"
                title="Voir sur le globe Communauté"
              >
                <MapPin className="h-3.5 w-3.5 text-primary/70" aria-hidden />
                {user.city}
                {user.country ? ` · ${user.country}` : ""}
              </Link>
            )}
            <span>Membre depuis {formatDate(user.createdAt)}</span>
          </div>
          {user.bio && (
            <p className="max-w-xl text-sm leading-relaxed text-foreground/85">{user.bio}</p>
          )}
          {user.links.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
              {user.links.map((link) => {
                const { Icon, label } = linkMeta(link);
                return (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener nofollow"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary/70" aria-hidden />
                    {label}
                  </a>
                );
              })}
            </div>
          )}
          {user.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {user.skills.map((skill) => (
                <SkillTag key={skill} skill={skill} />
              ))}
            </div>
          )}
        </div>
        {session?.user?.id === user.id && (
          <div className="ml-auto">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard#profil">
                <PenLine aria-hidden />
                Modifier mon profil
              </Link>
            </Button>
          </div>
        )}
        {session?.user?.id && session.user.id !== user.id && (
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/chat/${user.id}`}>
                <MessagesSquare aria-hidden />
                Envoyer un message
              </Link>
            </Button>
            <ReportButton
              targetType="USER"
              targetId={user.id}
              iconOnly
              label="Signaler ce profil"
              className="text-muted-foreground/70"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{user.projects.length}</p>
            <p className="text-sm text-muted-foreground">Projets lancés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{user._count.contributions}</p>
            <p className="text-sm text-muted-foreground">Contributions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{formatMoney(user.contributedUsdCents, "usd")}</p>
            <p className="text-sm text-muted-foreground">Investis dans la communauté</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-display text-3xl">{user._count.votes}</p>
            <p className="text-sm text-muted-foreground">Votes sur des preuves</p>
          </CardContent>
        </Card>
      </div>

      {user.projects.length > 0 && (
        <section className="space-y-4">
          <h2 data-reveal className="text-2xl font-semibold tracking-tight">Ses projets</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {user.reputationEvents.length > 0 && (
        <section data-reveal className="max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Activité récente</h2>
          <Card>
            <CardContent className="divide-y pt-6">
              {user.reputationEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{event.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      "ml-auto shrink-0 font-bold",
                      event.delta >= 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {event.delta >= 0 ? "+" : ""}
                    {event.delta} rép.
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
