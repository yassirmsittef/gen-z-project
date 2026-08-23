import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Flame,
  HandCoins,
  Heart,
  Megaphone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Swords,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSceneLoader } from "@/components/hero-scene-loader";
import { LaunchLink } from "@/components/launch-button";
import { ProjectCard } from "@/components/project-card";
import { PROJECT_CARD_INCLUDE } from "@/lib/project-card-data";
import { featuredCalls, replacementsByProject, visibleAnswerCounts } from "@/lib/boycott";
import { prisma } from "@/lib/prisma";
import { stripeLive } from "@/lib/stripe-mode";
import { formatRelative } from "@/lib/format";
import { formatMoney } from "@/lib/money";

const STEPS = [
  {
    icon: HandCoins,
    chip: "border-primary/30 bg-primary/15 text-primary",
    title: "1. Contribue",
    text: "Soutiens les projets qui te parlent, par carte, dans leur devise — 20 $ de contributions cumulées débloquent la création du tien.",
  },
  {
    icon: Rocket,
    chip: "border-primary/30 bg-primary/15 text-primary",
    title: "2. Lance ton projet",
    text: "Poster est réservé à ceux qui ont déjà contribué. Fixe ton objectif, découpe ton plan en étapes claires.",
  },
  {
    icon: ShieldCheck,
    chip: "border-secondary/30 bg-secondary/15 text-secondary",
    title: "3. Débloque par étapes",
    text: "Les fonds restent sous séquestre. À chaque étape, tu montres une preuve d'avancement et tes contributeurs votent.",
  },
  {
    icon: Sparkles,
    chip: "border-success/30 bg-success/15 text-success",
    title: "4. Rate ? Rebondis",
    text: "Un échec n'est pas une sortie : les contributeurs sont remboursés et on te réoriente vers de nouvelles opportunités.",
  },
];

type PulseItem = {
  at: Date;
  Icon: LucideIcon;
  tone: string;
  href: string;
  text: React.ReactNode;
};

export default async function HomePage() {
  const [
    calls,
    vivier,
    projectCount,
    userCount,
    contributed,
    recentContributions,
    recentProjects,
    recentUpdates,
    recentMembers,
  ] = await Promise.all([
    featuredCalls(3),
    // Vivier large : le tri « répond à un appel d'abord » se fait ensuite en
    // mémoire, parce que Prisma ne sait pas filtrer un `orderBy: { _count }`
    // sur les appels encore visibles.
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      // Départage obligatoire : à `raised` égal — l'état normal d'une
      // plateforme jeune — l'ensemble même des 24 candidats devenait
      // arbitraire d'une requête à l'autre. /projects et /classements
      // départagent tous les deux ; l'accueil était la seule à ne pas le faire.
      orderBy: [{ raised: "desc" }, { createdAt: "desc" }],
      take: 24,
      include: PROJECT_CARD_INCLUDE,
    }),
    prisma.project.count(),
    prisma.user.count(),
    prisma.contribution.aggregate({ _sum: { usdCents: true } }),
    prisma.contribution.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true } },
        project: { select: { title: true, slug: true, currency: true } },
      },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { title: true, slug: true, createdAt: true, owner: { select: { name: true } } },
    }),
    prisma.projectUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { project: { select: { title: true, slug: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  // Répondre à un appel fait passer devant — mais c'est un BOOLÉEN, pas un
  // score. Sinon se rattacher à vingt appels suffirait à prendre la première
  // place de l'accueil, et le compteur est entièrement auto-déclaré. Les
  // appels retirés ne comptent plus : ils ne doivent produire aucun effet.
  const réponses = await visibleAnswerCounts(vivier.map((project) => project.id));
  const featured = [...vivier]
    .sort(
      (a, b) =>
        Number((réponses.get(b.id) ?? 0) > 0) - Number((réponses.get(a.id) ?? 0) > 0) ||
        b.raised - a.raised
    )
    .slice(0, 3);

  const replaces = await replacementsByProject(featured.map((project) => project.id));

  // Le pouls : les derniers événements de la plateforme, toutes sources
  // confondues, du plus récent au plus ancien.
  const pulse: PulseItem[] = [
    ...recentContributions.map((c) => ({
      at: c.createdAt,
      Icon: Heart,
      tone: "text-primary",
      href: `/projects/${c.project.slug}`,
      text: (
        <>
          <span className="font-semibold">{c.anonymous ? "Quelqu'un" : c.user.name}</span> a soutenu «{" "}
          {c.project.title} »{" "}
          <span className="font-mono text-primary">{formatMoney(c.amount, c.project.currency)}</span>
        </>
      ),
    })),
    ...recentProjects.map((p) => ({
      at: p.createdAt,
      Icon: Rocket,
      tone: "text-primary",
      href: `/projects/${p.slug}`,
      text: (
        <>
          <span className="font-semibold">{p.owner.name}</span> a lancé « {p.title} »
        </>
      ),
    })),
    ...recentUpdates.map((u) => ({
      at: u.createdAt,
      Icon: Megaphone,
      tone: "text-secondary",
      href: `/projects/${u.project.slug}#actus`,
      text: (
        <>
          Actu de « {u.project.title} » : <span className="font-semibold">{u.title}</span>
        </>
      ),
    })),
    ...recentMembers.map((m) => ({
      at: m.createdAt,
      Icon: UserPlus,
      tone: "text-secondary",
      href: `/u/${m.id}`,
      text: (
        <>
          <span className="font-semibold">{m.name}</span> a rejoint GeniGain
        </>
      ),
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

  const counters = [
    { label: "Projets", value: projectCount.toLocaleString("fr-FR") },
    { label: "Membres", value: userCount.toLocaleString("fr-FR") },
  ];
  const invested = formatMoney(contributed._sum.usdCents ?? 0, "usd");

  return (
    <div>
      <section className="page-halo relative overflow-hidden border-b border-white/[0.08]">
        <HeroSceneLoader />
        {/* Voile radial : garantit la lisibilité du texte sur la scène 3D */}
        <div
          className="absolute inset-0 bg-[radial-gradient(46%_54%_at_50%_46%,hsl(220_29%_6%/0.62),transparent_76%)]"
          aria-hidden
        />
        <div className="container relative z-10 flex flex-col items-center gap-8 py-28 text-center">
          {/* Révélation en cascade, synchronisée avec la naissance du sigil 3D */}
          <span
            className="hero-reveal data-label rounded-full border border-white/[0.12] bg-card/60 px-4 py-1.5 backdrop-blur-md"
            style={{ animationDelay: "1.7s" }}
          >
            {stripeLive
              ? "0 % de commission · paiements sécurisés par Stripe"
              : "Bêta · 0 % de commission · paiements Stripe en mode test"}
          </span>
          <h1
            className="hero-reveal max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
            style={{ animationDelay: "2.0s" }}
          >
            La communauté qui finance{" "}
            <span className="bg-accent-gradient bg-clip-text text-transparent">
              ta génération
            </span>
          </h1>
          <p
            className="hero-reveal max-w-2xl text-lg text-muted-foreground"
            style={{ animationDelay: "2.35s" }}
          >
            Contribue avant de poster. Débloque tes fonds avec des preuves. Construis ta
            réputation. Et si ça rate — rebondis.
          </p>
          <div
            className="hero-reveal flex flex-wrap justify-center gap-4"
            style={{ animationDelay: "2.7s" }}
          >
            <span data-magnetic className="inline-flex">
              <LaunchLink href="/projects" variant="default">
                Découvrir les projets
              </LaunchLink>
            </span>
            <span data-magnetic className="inline-flex">
              <LaunchLink href="/projects/new" variant="outline">
                Lancer le mien
              </LaunchLink>
            </span>
          </div>
          {/* Projets et membres côte à côte ; le montant investi en dessous
              sur toute la largeur — il peut grandir (10 M+) sans rien casser. */}
          <dl
            className="hero-reveal mt-4 grid w-full max-w-2xl grid-cols-2 gap-4"
            style={{ animationDelay: "3.05s" }}
          >
            {counters.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5">
                <dd className="font-display text-3xl font-semibold">{stat.value}</dd>
                <dt className="data-label mt-1">{stat.label}</dt>
              </div>
            ))}
            <div className="glass col-span-2 rounded-2xl rounded-tr-sm px-5 py-4">
              <dd className="font-display bg-accent-gradient bg-clip-text text-3xl font-semibold text-transparent [overflow-wrap:anywhere]">
                {invested}
              </dd>
              <dt className="data-label mt-1">Investis (équiv.)</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* Le manque avant la vitrine : ce que la communauté veut voir remplacé
          et que personne ne construit encore. C'est ce vide qui fait lever
          des porteurs — un palmarès de projets déjà lancés, non. */}
      {calls.length > 0 && (
        <section className="border-b border-white/[0.08] bg-secondary/[0.03]">
          <div className="container py-16">
            <div data-reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  <Swords className="h-8 w-8 text-secondary" aria-hidden />
                  À remplacer
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Des marques dont des membres ne veulent plus, et pour lesquelles{" "}
                  <span className="text-foreground">personne n&apos;a encore lancé</span> de
                  remplaçant. Chaque appel est une commande qui attend son porteur.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/appels">Voir tous les appels →</Link>
              </Button>
            </div>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {calls.map((call, i) => (
                <li key={call.id} data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                  <Link
                    href={`/appels/${call.slug}`}
                    className="glass flex h-full flex-col rounded-2xl rounded-tr-sm p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-secondary/25 hover:shadow-glow-violet"
                  >
                    <p className="data-label">Ne veut plus de</p>
                    <p
                      translate="no"
                      className="mt-1 font-display text-2xl font-semibold leading-tight"
                    >
                      {call.target}
                    </p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {call.wanted}
                    </p>
                    <p className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-sm">
                      <Megaphone className="h-4 w-4 text-secondary" aria-hidden />
                      <span className="font-mono tabular-nums text-secondary">
                        {call._count.supports}
                      </span>
                      <span className="text-muted-foreground">
                        {call._count.supports > 1 ? "personnes veulent" : "personne veut"} ça
                        remplacé
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/projects/new">
                  <Rocket aria-hidden />
                  Lancer un remplaçant
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/appels/nouveau">
                  <Megaphone aria-hidden />
                  Publier mon appel
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="container py-16">
        <h2
          data-reveal
          className="mb-10 text-center text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Comment ça marche
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Card key={step.title} data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
              <CardContent className="space-y-3 pt-6">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl rounded-br-sm border ${step.chip}`}
                >
                  <step.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/comment-ca-marche"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Le fonctionnement en détail — séquestre, votes, remboursements
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </section>

      {featured.length > 0 && (
        <section className="container pb-20">
          <div data-reveal className="mb-8 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              <Flame className="h-8 w-8 text-primary" aria-hidden />
              En campagne
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects">Tout voir →</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                replaces={replaces.get(project.id)}
              />
            ))}
          </div>
        </section>
      )}

      {pulse.length > 0 && (
        <section className="container pb-24">
          <div className="mx-auto max-w-3xl">
            <h2
              data-reveal
              className="mb-2 flex items-center justify-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              <Activity className="h-8 w-8 text-primary" aria-hidden />
              Le pouls de GeniGain
            </h2>
            <p data-reveal className="data-label mb-8 text-center">
              Ce qui vient de se passer sur la plateforme
            </p>
            <ul className="glass divide-y divide-white/[0.06] overflow-hidden rounded-2xl rounded-tr-sm">
              {pulse.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3.5 p-4 transition-colors duration-200 hover:bg-accent"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-card/80 ${item.tone}`}
                    >
                      <item.Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{item.text}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatRelative(item.at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
