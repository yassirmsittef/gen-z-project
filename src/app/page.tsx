import Link from "next/link";
import { Flame, HandCoins, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSceneLoader } from "@/components/hero-scene-loader";
import { LaunchLink } from "@/components/launch-button";
import { ProjectCard } from "@/components/project-card";
import { prisma } from "@/lib/prisma";
import { WELCOME_CREDITS } from "@/lib/constants";

const STEPS = [
  {
    icon: HandCoins,
    chip: "border-primary/30 bg-primary/15 text-primary",
    title: "1. Contribue",
    text: `Tu reçois ${WELCOME_CREDITS} tokens à l'inscription. Soutiens les projets qui te parlent — c'est le ticket d'entrée de la communauté.`,
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

export default async function HomePage() {
  const [featured, projectCount, userCount, contributed] = await Promise.all([
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      orderBy: { raised: "desc" },
      take: 3,
      include: { owner: true, _count: { select: { contributions: true } } },
    }),
    prisma.project.count(),
    prisma.user.count(),
    prisma.contribution.aggregate({ _sum: { amount: true } }),
  ]);

  const stats = [
    { label: "Projets", value: projectCount.toLocaleString("fr-FR") },
    { label: "Membres", value: userCount.toLocaleString("fr-FR") },
    { label: "Crédits investis", value: (contributed._sum.amount ?? 0).toLocaleString("fr-FR") },
  ];

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
            Phase 1 · argent fictif · vraies mécaniques
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
              <LaunchLink href="/projects" variant="default" tint="aurora">
                Découvrir les projets
              </LaunchLink>
            </span>
            <span data-magnetic className="inline-flex">
              <LaunchLink href="/projects/new" variant="outline" tint="aurora">
                Lancer le mien
              </LaunchLink>
            </span>
          </div>
          <dl
            className="hero-reveal mt-4 grid w-full max-w-2xl grid-cols-3 gap-4"
            style={{ animationDelay: "3.05s" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5">
                <dd className="font-display text-3xl font-semibold">{stat.value}</dd>
                <dt className="data-label mt-1">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

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
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
