import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileDown, Handshake, PenLine, ShieldAlert, Sparkles, Star, Swords } from "lucide-react";
import { auth } from "@/auth";
import { liveAnswer } from "@/lib/boycott";
import { isLocale } from "@/lib/i18n/locales";
import { prisma } from "@/lib/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { stripeEnabled } from "@/lib/stripe";
import { stripeLive } from "@/lib/stripe-mode";
import { ReputationBadge } from "@/components/reputation-badge";
import { ReputationRing } from "@/components/reputation-ring";
import { ConnectForm } from "@/components/connect-form";
import { DeleteAccount } from "@/components/delete-account";
import { LocationForm } from "@/components/location-form";
import { PasswordForm } from "@/components/password-form";
import { ProfileForm } from "@/components/profile-form";
import { SkillsForm } from "@/components/skills-form";
import { getConnectStatus } from "@/lib/payouts";
import { StatRing } from "@/components/stat-ring";
import { UserAvatar } from "@/components/user-avatar";
import { nextReputationTarget } from "@/lib/reputation";
import { GATE_USD_CENTS } from "@/lib/constants";
import { formatMoney, formatMoneyRounded } from "@/lib/money";
import { convertMinor } from "@/lib/fx";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/** Bandeaux de retour de l'onboarding Stripe Connect (?connect=done|refresh). */
const CONNECT_BANNERS = {
  done: {
    tone: "text-success border-success/30 bg-success/10",
    text: `Configuration transmise à Stripe — tes versements s'activent dès validation${stripeLive ? "." : " (souvent immédiat en mode test)."}`,
  },
  refresh: {
    tone: "text-muted-foreground border-white/[0.12] bg-card/60",
    text: "La session Stripe a expiré — relance la configuration des versements quand tu veux.",
  },
} as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { connect } = await searchParams;
  const connectBanner =
    connect === "done" || connect === "refresh" ? CONNECT_BANNERS[connect] : null;

  const [
    user,
    contributions,
    myProjects,
    reputationEvents,
    pendingPartnerships,
    followedProjects,
    payoutParts,
    myCalls,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.contribution.findMany({
      where: { userId: session.user.id },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { ownerId: session.user.id },
      include: PROJECT_CARD_INCLUDE,
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
    prisma.follow.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          include: PROJECT_CARD_INCLUDE,
        },
      },
    }),
    // Parts de versement des étapes débloquées de MES projets (dues + versées).
    prisma.milestonePayout.findMany({
      where: { milestone: { project: { ownerId: session.user.id } } },
      select: {
        amountMinor: true,
        stripeTransferId: true,
        milestone: { select: { project: { select: { currency: true } } } },
      },
    }),
    // Mes appels encore en ligne — les retirés ne sont pas une liste à gérer.
    prisma.boycottCall.findMany({
      where: { authorId: session.user.id, removedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        target: true,
        createdAt: true,
        _count: { select: { supports: true, answers: { where: liveAnswer } } },
      },
    }),
  ]);
  if (!user) redirect("/login");

  // État Connect : un seul appel Stripe, uniquement si un compte existe déjà.
  const connectStatus =
    stripeEnabled && user.stripeAccountId ? await getConnectStatus(user.stripeAccountId) : null;

  // Totaux des versements par devise de projet (en attente / déjà virés).
  const payoutTotals = new Map<string, { dueMinor: number; sentMinor: number }>();
  for (const part of payoutParts) {
    const currency = part.milestone.project.currency;
    const totals = payoutTotals.get(currency) ?? { dueMinor: 0, sentMinor: 0 };
    if (part.stripeTransferId) totals.sentMinor += part.amountMinor;
    else totals.dueMinor += part.amountMinor;
    payoutTotals.set(currency, totals);
  }
  const payoutSummary = [...payoutTotals.entries()].map(([currency, totals]) => ({
    currency,
    ...totals,
  }));

  // « Mes contributions » dans la devise CHOISIE par le membre (conversion
  // indicative au taux du jour, « ≈ » quand la devise du projet diffère).
  // La jauge des 50 $ pour poster, elle, reste en dollars : c'est la règle.
  const displayCurrency = user.preferredCurrency;
  const contributionsDisplay = await Promise.all(
    contributions.map(async (c) => {
      if (c.project.currency === displayCurrency) return { converted: null };
      const converted = await convertMinor(c.amount, c.project.currency, displayCurrency);
      return { converted };
    })
  );

  const failedProjects = myProjects.filter((p) => p.status === "FAILED");
  const nextLevel = nextReputationTarget(user.reputation);
  // Le rôle ADMIN poste sans le gate (démarrage à froid, décision fondateur).
  const gateExempt = user.role === "ADMIN";
  // L'accès au cockpit vit ici depuis que la barre de navigation ne le porte
  // plus sur téléphone : c'est la page d'atterrissage d'un membre connecté,
  // et un signalement qui attend doit se voir sans ouvrir un ordinateur.
  const openReports =
    user.role === "ADMIN" ? await prisma.report.count({ where: { status: "OPEN" } }) : 0;
  const gateReached = gateExempt || user.contributedUsdCents >= GATE_USD_CENTS;
  // Trajectoire : du plus ancien au plus récent, gauche → droite.
  const trajectory = [...reputationEvents].reverse();

  return (
    <div className="page-halo">
      <div className="container space-y-12 py-10">
        {connectBanner && (
          <p
            className={cn("rounded-2xl border p-4 text-sm font-medium", connectBanner.tone)}
            role="status"
          >
            {connectBanner.text}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-5">
          {/* La photo mène à la carte « Mon profil » plus bas : le premier
              réflexe pour changer sa photo est d'appuyer dessus. */}
          <Link href="#profil" title="Modifier mon profil" className="rounded-full">
            <ReputationRing reputation={user.reputation} admin={user.role === "ADMIN"}>
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-16 w-16 border-0 text-xl" />
            </ReputationRing>
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-4xl font-semibold tracking-tight">Salut {user.name}</h1>
            <p className="data-label">QG personnel · systèmes opérationnels</p>
            <Link
              href="#profil"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80"
            >
              <PenLine className="h-3.5 w-3.5" aria-hidden />
              Modifier mon profil
            </Link>
          </div>
          <ReputationBadge reputation={user.reputation} admin={user.role === "ADMIN"} className="ml-auto" />
        </div>

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="glass flex items-center gap-3 rounded-2xl rounded-tr-sm p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-white/20 sm:hidden"
          >
            <ShieldAlert
              className={cn("h-5 w-5", openReports > 0 ? "text-destructive" : "text-primary")}
              aria-hidden
            />
            <span className="text-sm font-medium">Cockpit admin</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {openReports > 0
                ? `${openReports} signalement${openReports > 1 ? "s" : ""} à traiter`
                : "rien à modérer"}
            </span>
          </Link>
        )}

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
              value={formatMoneyRounded(user.contributedUsdCents, "usd")}
              percent={gateExempt ? 1 : Math.min(1, user.contributedUsdCents / GATE_USD_CENTS)}
              label="Vers ton projet"
              sublabel={
                gateExempt
                  ? "Fondateur — tu postes sans le gate"
                  : gateReached
                    ? "Gate débloqué — tu peux poster"
                    : `${formatMoney(GATE_USD_CENTS - user.contributedUsdCents, "usd")} avant de pouvoir poster`
              }
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

        {/* Mes appels : l'auteur doit pouvoir retrouver les siens pour les
            suivre ou les retirer — un contenu publié sous son nom qu'il ne
            sait plus où retrouver, c'est un contenu qu'il ne peut plus
            corriger. */}
        {myCalls.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <Swords className="h-6 w-6 text-secondary" aria-hidden />
                Mes appels
              </h2>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/appels/nouveau">Publier un appel</Link>
              </Button>
            </div>
            <ul className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl rounded-tr-sm">
              {myCalls.map((call) => (
                <li key={call.id}>
                  <Link
                    href={`/appels/${call.slug}`}
                    className="flex items-center gap-3.5 p-4 transition-colors duration-200 hover:bg-accent"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        Remplacer {call.target}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {call._count.supports} voix ·{" "}
                        {call._count.answers > 0
                          ? `${call._count.answers} remplaçant${call._count.answers > 1 ? "s" : ""}`
                          : "aucun remplaçant pour l'instant"}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatRelative(call.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {followedProjects.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Star className="h-6 w-6 text-secondary" aria-hidden />
              Projets suivis
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {followedProjects.map((follow) => (
                <ProjectCard key={follow.id} project={follow.project} />
              ))}
            </div>
          </section>
        )}

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
                  {contributions.map((contribution, i) => {
                    const converted = contributionsDisplay[i].converted;
                    return (
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
                        <span className="ml-auto shrink-0 text-right font-mono text-sm">
                          {converted != null ? (
                            <>
                              {`≈ ${formatMoney(converted, displayCurrency)}`}
                              <span className="block text-[10px] text-muted-foreground">
                                {formatMoney(contribution.amount, contribution.project.currency)}
                              </span>
                            </>
                          ) : (
                            formatMoney(contribution.amount, contribution.project.currency)
                          )}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

                  </section>

        <section id="profil" data-reveal className="grid scroll-mt-24 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Mon profil</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <ProfileForm
                  initialName={user.name}
                  initialAvatarUrl={user.avatarUrl}
                  initialBio={user.bio}
                  initialLanguage={isLocale(user.preferredLanguage) ? user.preferredLanguage : "fr"}
                  initialCurrency={user.preferredCurrency}
                  initialLinks={user.links}
                />
                <div className="border-t border-white/[0.06] pt-6">
                  <LocationForm initialCity={user.city} />
                </div>
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
            <h2 className="text-2xl font-semibold tracking-tight">Mes versements</h2>
            <Card>
              <CardContent className="pt-6">
                <ConnectForm
                  stripeEnabled={stripeEnabled}
                  status={connectStatus}
                  payouts={payoutSummary}
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Sécurité</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <PasswordForm />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Mes données</h3>
                  <p className="text-xs text-muted-foreground">
                    Tout ce que tu as confié à GeniGain (profil, projets, contributions, votes,
                    messages envoyés…), en un fichier JSON — droit à la portabilité.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/api/me/export" download>
                      <FileDown aria-hidden />
                      Télécharger mes données
                    </a>
                  </Button>
                </div>
                <DeleteAccount />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
