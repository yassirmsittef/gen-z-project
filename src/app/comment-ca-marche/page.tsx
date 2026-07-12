import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GATE_USD_CENTS,
  MAX_DURATION_DAYS,
  MAX_GOAL,
  MAX_MILESTONES,
  MAX_PROOF_ATTEMPTS,
  MIN_CONTRIBUTION_MAJOR,
  MIN_DURATION_DAYS,
  MIN_GOAL,
  MIN_MILESTONES,
  REALIZATION_DAYS,
} from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { stripeLive } from "@/lib/stripe-mode";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "Contribue d'abord, lance ensuite : fonds sous séquestre, débloqués étape par étape par le vote des contributeurs, remboursés si ça n'aboutit pas.",
};

/**
 * Le mode d'emploi complet, version lisible (le pendant marketing des CGU —
 * les chiffres viennent des constantes pour ne jamais mentir). Trajectoire à
 * nœuds = le motif DA des jalons, appliqué au parcours entier.
 */

const gate = formatMoney(GATE_USD_CENTS, "usd");

const STAGES = [
  {
    title: "Contribue d'abord",
    chips: [`dès ${MIN_CONTRIBUTION_MAJOR} € / $ / …`, `${gate} → droit de poster`],
    body: `Ici, personne ne débarque avec sa cagnotte : on commence par soutenir les autres. Tu contribues par carte, dans la devise du projet. Chaque paiement est converti en dollars au taux du jour et s'ajoute à ton compteur — à ${gate} cumulés, tu gagnes le droit de lancer ton propre projet.`,
  },
  {
    title: "Lance ton projet",
    chips: [`${MIN_DURATION_DAYS}–${MAX_DURATION_DAYS} jours`, `${MIN_MILESTONES}–${MAX_MILESTONES} étapes`],
    body: `Objectif entre ${MIN_GOAL} et ${MAX_GOAL.toLocaleString("fr-FR")} dans la devise de ton choix, campagne de ${MIN_DURATION_DAYS} à ${MAX_DURATION_DAYS} jours, et surtout : un plan découpé en ${MIN_MILESTONES} à ${MAX_MILESTONES} étapes chiffrées dont la somme fait l'objectif. C'est ce découpage qui rend la suite honnête — tu ne reçois jamais tout d'un coup.`,
  },
  {
    title: "La communauté finance",
    chips: ["séquestre", "remboursement si raté"],
    body: "Pendant la campagne, les contributions s'accumulent sous séquestre : ni toi ni personne n'y touche. Objectif atteint — la collecte s'arrête et l'aventure commence. Objectif manqué à l'échéance — chaque contributeur est remboursé automatiquement sur sa carte, net des frais de carte que la banque ne restitue pas (GeniGain n'en garde aucun).",
  },
  {
    title: "Prouve, la communauté vote",
    chips: ["vote pondéré", `${REALIZATION_DAYS} jours pour réaliser`],
    body: `À chaque étape, tu publies une preuve (liens, images) et tes contributeurs votent. Chaque voix pèse le montant contribué : la majorité des montants décide. Étape validée = fonds de l'étape débloqués. Une même étape refusée ${MAX_PROOF_ATTEMPTS} fois, ou les ${REALIZATION_DAYS} jours écoulés, et le projet s'arrête.`,
  },
  {
    title: "Encaisse — ou rebondis",
    chips: ["versement par étape", "0 % de commission", "prorata remboursé"],
    body: "Chaque étape validée part vers ton compte de versement Stripe, nette des frais bancaires — GeniGain ne prend rien au passage. Et si le projet s'arrête en route ? Ce que la communauté a validé te reste acquis, tout le séquestre restant repart au prorata vers les contributeurs — et la communauté t'aide à rebondir sur la suite.",
  },
];

const FAQ: { q: string; a: string; anchor?: string }[] = [
  {
    q: "C'est un investissement ?",
    a: "Non. Une contribution est un soutien : elle ne donne ni part du projet, ni intérêt, ni rendement financier. Ce que tu y gagnes est ailleurs : tu fais naître des projets que tu as choisis parce qu'ils te parlent ou te seront utiles — l'app, le produit, le lieu ou le service que tu aimerais voir exister et dont tu profiteras une fois là. Tu gardes un droit de vote sur leurs étapes, tu construis ta réputation dans la communauté, et tu débloques le droit de lancer le tien.",
  },
  {
    q: "Ça coûte combien ?",
    a: "0 % de commission GeniGain. Le contributeur paie exactement le montant qu'il a choisi ; les frais bancaires (Stripe) sont déduits des versements au porteur, comme sur toute plateforme — GeniGain ne garde rien au passage. Si une commission arrive un jour, elle sera annoncée à l'avance, affichée avant chaque paiement et jamais rétroactive.",
    anchor: "frais",
  },
  {
    q: "Qui paie les frais de carte, exactement ?",
    a: "Les frais de traitement sont fixés par Stripe (le prestataire de paiement) et varient selon ta carte et ton pays — en général de l'ordre de 1,5 à 3 %. GeniGain ne les fixe pas, ne les voit pas et n'en ajoute aucun. Concrètement : quand tu contribues, tu paies exactement ton montant ; les frais sont prélevés par Stripe et déduits de ce que le porteur reçoit. Si le projet échoue et que tu es remboursé, Stripe ne rend pas la commission qu'il a prélevée au départ — ton remboursement est donc net de ces frais, et là encore GeniGain n'en garde aucun. C'est le seul « coût » d'une contribution, et il ne va jamais dans la poche de la plateforme.",
  },
  {
    q: "Qui peut participer ?",
    a: "L'inscription est ouverte dès 15 ans. Pour contribuer par carte ou lancer une campagne, il faut être majeur·e ou avoir l'accord de ton représentant légal.",
  },
  {
    q: "Et si le porteur disparaît dans la nature ?",
    a: `C'est exactement ce que le séquestre empêche : les fonds non débloqués ne sont jamais entre ses mains. Sans preuve validée, rien ne bouge — et au bout de ${REALIZATION_DAYS} jours, tout ce qui n'a pas été débloqué par un vote repart automatiquement vers les contributeurs (net des frais de carte, non restitués par la banque).`,
  },
  {
    q: "Comment je reçois mes fonds en tant que porteur ?",
    a: "Via Stripe Connect : tu crées ton compte de versement depuis ton dashboard et tu passes la vérification d'identité de Stripe. Chaque étape validée est ensuite virée automatiquement, dans la devise de ton projet. Une étape validée reste due tant que ton compte n'est pas prêt.",
  },
  {
    q: "C'est du vrai argent ?",
    a: stripeLive
      ? "Oui. Les paiements sont réels et sécurisés par Stripe : ta contribution est réellement débitée, placée sous séquestre, et débloquée au porteur étape par étape selon le vote des contributeurs. GeniGain ne voit ni ne stocke jamais ton numéro de carte."
      : "La mécanique est réelle de bout en bout, mais la plateforme est en phase de test : les paiements Stripe tournent en mode test, aucune carte n'est réellement débitée. L'ouverture des paiements réels sera annoncée clairement.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="page-halo">
      <div className="container max-w-3xl py-12 md:py-16">
        <p className="data-label">Le mode d&apos;emploi</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Comment ça marche
        </h1>
        <p className="mt-4 text-muted-foreground">
          GeniGain repose sur une idée simple : <strong className="font-medium text-foreground">l&apos;argent
          suit les preuves</strong>. On contribue avant de poster, les fonds restent sous séquestre,
          et c&apos;est le vote des contributeurs qui les débloque, étape par étape.
        </p>

        {/* Trajectoire à nœuds : le parcours entier, du premier soutien au versement. */}
        <ol className="relative mt-12 space-y-10 border-l border-white/10 pl-8 [border-image:linear-gradient(to_bottom,#5EEAD4,#38BDF8,transparent)_1]">
          {STAGES.map((stage, i) => (
            <li key={stage.title} className="relative">
              <span
                aria-hidden
                className="absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-card font-mono text-xs font-bold text-primary shadow-glow"
              >
                {i + 1}
              </span>
              <h2 className="font-display text-xl font-semibold tracking-tight">{stage.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
              <p className="mt-3 flex flex-wrap gap-2">
                {stage.chips.map((chip) => (
                  <span key={chip} className="data-label rounded-full border border-white/10 px-2.5 py-1">
                    {chip}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ol>

        <h2 className="mt-16 font-display text-2xl font-semibold tracking-tight">
          Les questions qu&apos;on nous pose
        </h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              id={item.anchor}
              className="glass group scroll-mt-24 rounded-2xl rounded-tr-sm px-5 py-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
                    aria-hidden
                  />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          La version juridique de ces règles vit dans les{" "}
          <Link href="/cgu" className="font-medium text-primary underline-offset-4 hover:underline">
            conditions d&apos;utilisation
          </Link>
          .
        </p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/projects">Découvrir les projets</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Créer mon compte</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
