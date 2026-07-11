import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { TransactionType } from "@prisma/client";
import { Handshake, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { RechargeForm } from "@/components/recharge-form";
import { stripeEnabled } from "@/lib/stripe";
import { ReputationBadge } from "@/components/reputation-badge";
import { ReputationRing } from "@/components/reputation-ring";
import { ConnectForm } from "@/components/connect-form";
import { LocationForm } from "@/components/location-form";
import { SkillsForm } from "@/components/skills-form";
import { getConnectStatus } from "@/lib/payouts";
import { StatRing } from "@/components/stat-ring";
import { UserAvatar } from "@/components/user-avatar";
import { nextReputationTarget } from "@/lib/reputation";
import { formatCredits, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

/** Bandeaux de retour du paiement Stripe (?recharge=success|cancel). */
const RECHARGE_BANNERS = {
  success: {
    tone: "text-success border-success/30 bg-success/10",
    text: "Paiement confirmé — tes tokens sont crédités (quelques secondes si le webhook travaille encore).",
  },
  cancel: {
    tone: "text-muted-foreground border-white/[0.12] bg-card/60",
    text: "Paiement annulé — aucun débit, aucun token crédité.",
  },
} as const;

/** Bandeaux de retour de l'onboarding Stripe Connect (?connect=done|refresh). */
const CONNECT_BANNERS = {
  done: {
    tone: "text-success border-success/30 bg-success/10",
    text: "Configuration transmise à Stripe — tes versements s'activent dès validation (souvent immédiat en mode test).",
  },
  refresh: {
    tone: "text-muted-foreground border-white/[0.12] bg-card/60",
    text: "La session Stripe a expiré — relance la configuration des versements quand tu veux.",
  },
} as const;

/** Pastilles de type pour le flux de crédits (couleur ≠ seule porteuse : label mono). */
const TYPE_STYLES: Record<TransactionType, { dot: string; label: string }> = {
  WELCOME: { dot: "bg-success", label: "Bienvenue" },
  BONUS: { dot: "bg-success", label: "Bonus" },
  CONTRIBUTION: { dot: "bg-primary", label: "Contribution" },
  REFUND: { dot: "bg-amber-400", label: "Remboursement" },
  MILESTONE_RELEASE: { dot: "bg-secondary", label: "Étape débloquée" },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ recharge?: string; connect?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { recharge, connect } = await searchParams;
  const rechargeBanner =
    recharge === "success" || recharge === "cancel" ? RECHARGE_BANNERS[recharge] : null;
  const connectBanner =
    connect === "done" || connect === "refresh" ? CONNECT_BANNERS[connect] : null;

  const [user, transactions, contributions, myProjects, reputationEvents, pendingPartnerships] =
    await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.creditTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.contribution.findMany({
      where: { userId: session.user.id },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { ownerId: session.user.id },
      include: { owner: true, _count: { select: { contributions: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reputationEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.partnershipRequest.count({
      where: { project: { ownerId: session.user.id }, status: "PENDING" },
    }),
  ]);
  if (!user) redirect("/login");

  // État Connect : un seul appel Stripe, uniquement si un compte existe déjà.
  const connectStatus =
    stripeEnabled && user.stripeAccountId ? await getConnectStatus(user.stripeAccountId) : null;

  const failedProjects = myProjects.filter((p) => p.status === "FAILED");
  const nextLevel = nextReputationTarget(user.reputation);
  const totalMoved = user.credits + user.totalContributed;
  // Trajectoire : du plus ancien au plus récent, gauche → droite.
  const trajectory = [...reputationEvents].reverse();

  return (
    <div className="page-halo">
      <div className="container space-y-12 py-10">
        {rechargeBanner && (
          <p
            className={cn(
              "rounded-2xl border p-4 text-sm font-medium",
              rechargeBanner.tone
            )}
            role="status"
          >
            {rechargeBanner.text}
          </p>
        )}
        {connectBanner && (
          <p
            className={cn("rounded-2xl border p-4 text-sm font-medium", connectBanner.tone)}
            role="status"
          >
            {connectBanner.text}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-5">
          <ReputationRing reputation={user.reputation}>
            <UserAvatar name={user.name} className="h-16 w-16 border-0 text-xl" />
          </ReputationRing>
          <div className="space-y-1.5">
            <h1 className="text-4xl font-semibold tracking-tight">Salut {user.name}</h1>
            <p className="data-label">QG personnel · systèmes opérationnels</p>
          </div>
          <ReputationBadge reputation={user.reputation} className="ml-auto" />
        </div>

        {failedProjects.length > 0 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Un projet n&apos;a pas abouti — et maintenant ?</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                L&apos;échec n&apos;est pas une sortie. Découvre d&apos;autres opportunités et
                repars plus fort·e.
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/rebond?from=${failedProjects[0].slug}`}>
                  Voir les opportunités →
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* HUD — l'audace de l'écran : trois jauges orbitales sur verre */}
        <section data-reveal data-spotlight className="glass rounded-2xl rounded-tr-sm p-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <StatRing
              tint="violet"
              value={String(user.reputation)}
              percent={nextLevel ? nextLevel.progress : 1}
              label="Réputation"
              sublabel={
                nextLevel
                  ? `${nextLevel.nextLabel} à ${nextLevel.target}`
                  : "Niveau maximal atteint"
              }
            />
            <StatRing
              value={formatCredits(user.credits)}
              percent={totalMoved > 0 ? user.credits / totalMoved : 1}
              label="Crédits disponibles"
              sublabel={`${formatCredits(user.totalContributed)} investis à vie`}
            />
            <StatRing
              value={String(contributions.length)}
              percent={Math.min(1, contributions.length / 10)}
              label="Soutiens"
              sublabel={
                contributions.length >= 10
                  ? "Pilier de la communauté"
                  : `Objectif : 10 projets soutenus`
              }
            />
          </div>
        </section>

        {/* Trajectoire : l'activité récente en nœuds lumineux */}
        {trajectory.length > 0 && (
          <section data-reveal className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Ta trajectoire</h2>
            <div className="relative">
              <span
                className="absolute left-0 right-0 top-[13px] h-px bg-gradient-to-r from-transparent via-primary/40 to-primary/10"
                aria-hidden
              />
              <ol className="relative grid gap-6 sm:grid-cols-5">
                {trajectory.map((event) => (
                  <li key={event.id} className="flex flex-col items-start gap-2 sm:items-center">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold",
                        event.delta >= 0
                          ? "border-success/50 bg-success/15 text-success shadow-glow-teal"
                          : "border-destructive/50 bg-destructive/15 text-destructive"
                      )}
                    >
                      {event.delta >= 0 ? `+${event.delta}` : event.delta}
                    </span>
                    <div className="sm:text-center">
                      <p className="line-clamp-2 text-xs leading-snug text-foreground/90">
                        {event.reason}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatDate(event.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {pendingPartnerships > 0 && (
          <p className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4 text-sm font-medium">
            <Handshake className="mr-2 inline h-4 w-4 text-secondary" aria-hidden />
            {pendingPartnerships} demande{pendingPartnerships > 1 ? "s" : ""} de partenariat en
            attente de ta réponse —{" "}
            <Link href="/partenariats" className="font-semibold text-secondary hover:underline">
              voir avec le copilote IA →
            </Link>
          </p>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Mes projets</h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" asChild>
                <Link href="/partenariats">
                  Partenariats{pendingPartnerships > 0 ? ` (${pendingPartnerships})` : ""}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/projects/new">Lancer un projet</Link>
              </Button>
            </div>
          </div>
          {myProjects.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/[0.12] p-8 text-center text-sm text-muted-foreground">
              Pas encore de projet. Contribue à un projet pour débloquer la création du tien.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        <section data-reveal className="grid gap-8 lg:grid-cols-2">
          {/* min-w-0 : sans lui, les lignes truncate imposent leur largeur à la colonne */}
          <div className="min-w-0 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Mes contributions</h2>
            {contributions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/[0.12] p-8 text-center text-sm text-muted-foreground">
                Aucune contribution pour l&apos;instant.{" "}
                <Link href="/projects" className="font-medium text-primary hover:underline">
                  Trouve un projet à soutenir →
                </Link>
              </p>
            ) : (
              <Card>
                <CardContent className="divide-y divide-white/[0.06] pt-6">
                  {contributions.map((contribution) => (
                    <div key={contribution.id} className="flex items-center gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <Link
                          href={`/projects/${contribution.project.slug}`}
                          className="block truncate font-medium transition-colors duration-200 hover:text-primary"
                        >
                          {contribution.project.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {formatDate(contribution.createdAt)}
                          {contribution.refunded && " · remboursée"}
                        </p>
                      </div>
                      <span className="ml-auto shrink-0 font-mono text-sm">
                        {formatCredits(contribution.amount)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Mouvements</h2>
            {transactions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/[0.12] p-8 text-center text-sm text-muted-foreground">
                Aucun mouvement.
              </p>
            ) : (
              <Card>
                <CardContent className="divide-y divide-white/[0.06] pt-6">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-3 py-3 text-sm">
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          TYPE_STYLES[transaction.type].dot
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{transaction.label}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {TYPE_STYLES[transaction.type].label} · {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "ml-auto shrink-0 font-mono text-sm",
                          transaction.amount > 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount} tokens
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section data-reveal className="grid gap-8 lg:grid-cols-2">
          <div id="recharge" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Recharger mon compte</h2>
            <Card>
              <CardContent className="pt-6">
                <RechargeForm stripeEnabled={stripeEnabled} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Mes compétences</h2>
            <Card>
              <CardContent className="pt-6">
                <SkillsForm initialSkills={user.skills} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Ma ville</h2>
            <Card>
              <CardContent className="pt-6">
                <LocationForm initialCity={user.city} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Mes versements</h2>
            <Card>
              <CardContent className="pt-6">
                <ConnectForm stripeEnabled={stripeEnabled} status={connectStatus} />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
