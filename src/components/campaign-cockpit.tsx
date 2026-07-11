import { Gauge } from "lucide-react";
import { daysLeft, formatCredits, formatDate } from "@/lib/format";

/**
 * Poste de pilotage du porteur (visible par lui seul) : collecte par jour en
 * sparkline + les chiffres qui aident à agir. Une seule série → pas de
 * légende, le titre nomme la donnée ; tooltips natifs (<title>) par jour.
 */

type Contribution = { amount: number; createdAt: Date; userId: string };

function dailyBuckets(contributions: Contribution[], from: Date, to: Date) {
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const totals = new Map<string, number>();
  for (const c of contributions) {
    totals.set(day(c.createdAt), (totals.get(day(c.createdAt)) ?? 0) + c.amount);
  }
  const buckets: { date: string; amount: number }[] = [];
  const cursor = new Date(from);
  const end = to < from ? from : to;
  while (day(cursor) <= day(end) && buckets.length < 90) {
    buckets.push({ date: day(cursor), amount: totals.get(day(cursor)) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return buckets;
}

export function CampaignCockpit({
  createdAt,
  deadline,
  goal,
  raised,
  status,
  realizationDeadline,
  contributions,
  followerIds,
  milestones,
}: {
  createdAt: Date;
  deadline: Date;
  goal: number;
  raised: number;
  status: string;
  realizationDeadline: Date | null;
  contributions: Contribution[];
  followerIds: string[];
  milestones: { status: string }[];
}) {
  const now = new Date();
  const buckets = dailyBuckets(contributions, createdAt, now < deadline ? now : deadline);

  // Sparkline : marques fines, dégradé accent, baseline discrète.
  const W = 320;
  const H = 56;
  const PAD = 3;
  const max = Math.max(...buckets.map((b) => b.amount), 1);
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / Math.max(buckets.length - 1, 1);
  const y = (v: number) => H - PAD - (v * (H - PAD * 2)) / max;
  const points = buckets.map((b, i) => `${x(i).toFixed(1)},${y(b.amount).toFixed(1)}`);
  const area = `M ${points.join(" L ")} L ${x(buckets.length - 1).toFixed(1)},${H - PAD} L ${x(0).toFixed(1)},${H - PAD} Z`;

  const contributors = new Set(contributions.map((c) => c.userId));
  const converted = followerIds.filter((id) => contributors.has(id)).length;
  const remainingDays = daysLeft(deadline);
  const neededPerDay = Math.max(Math.ceil((goal - raised) / Math.max(remainingDays, 1)), 0);
  const released = milestones.filter((m) => m.status === "RELEASED").length;

  return (
    <section className="glass space-y-4 rounded-2xl rounded-tr-sm p-5">
      <p className="data-label flex items-center gap-2">
        <Gauge className="h-3.5 w-3.5 text-primary" aria-hidden />
        Pilotage — visible par toi seul·e
      </p>

      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">Collecte par jour</p>
        {contributions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/[0.12] p-3 text-xs text-muted-foreground">
            Pas encore de contribution — partage ton lien, le compteur démarre ici.
          </p>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-14 w-full"
            role="img"
            aria-label={`Collecte par jour depuis le lancement : ${formatCredits(raised)} en ${buckets.length} jour${buckets.length > 1 ? "s" : ""}.`}
          >
            <defs>
              <linearGradient id="cockpit-aurora" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#5EEAD4" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
              <linearGradient id="cockpit-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#38BDF8" stopOpacity="0.25" />
                <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1={PAD}
              y1={H - PAD}
              x2={W - PAD}
              y2={H - PAD}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            {buckets.length > 1 ? (
              <>
                <path d={area} fill="url(#cockpit-fill)" />
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke="url(#cockpit-aurora)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <circle
                  cx={x(buckets.length - 1)}
                  cy={y(buckets[buckets.length - 1].amount)}
                  r="3"
                  fill="#38BDF8"
                  stroke="#0B0E14"
                  strokeWidth="2"
                />
              </>
            ) : (
              /* Premier jour : un point centré, la valeur en libellé direct. */
              <>
                {/* Couleur pleine : un dégradé objectBoundingBox dégénère sur
                    une ligne strictement verticale (boîte de largeur nulle). */}
                <line
                  x1={W / 2}
                  y1={y(buckets[0].amount)}
                  x2={W / 2}
                  y2={H - PAD}
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx={W / 2} cy={y(buckets[0].amount)} r="3" fill="#38BDF8" stroke="#0B0E14" strokeWidth="2" />
                <text x={W / 2 + 10} y={y(buckets[0].amount) + 4} fontSize="11" fill="#94A3B8">
                  {formatCredits(buckets[0].amount)} aujourd&apos;hui
                </text>
              </>
            )}
            {/* Cibles de survol par jour (plus larges que la marque) + tooltip natif. */}
            {buckets.map((b, i) => (
              <rect
                key={b.date}
                x={x(i) - (W - PAD * 2) / Math.max(buckets.length - 1, 1) / 2}
                y="0"
                width={(W - PAD * 2) / Math.max(buckets.length - 1, 1)}
                height={H}
                fill="transparent"
              >
                <title>{`${formatDate(new Date(b.date))} — ${formatCredits(b.amount)}`}</title>
              </rect>
            ))}
          </svg>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3">
        {status === "ACTIVE" ? (
          <div className="rounded-xl border border-white/[0.06] bg-background/40 p-3">
            <dt className="text-xs text-muted-foreground">Rythme pour y arriver</dt>
            <dd className="font-display text-lg font-semibold">
              {neededPerDay > 0 ? `${formatCredits(neededPerDay)}/j` : "Objectif atteint"}
            </dd>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-background/40 p-3">
            <dt className="text-xs text-muted-foreground">Étapes validées</dt>
            <dd className="font-display text-lg font-semibold">
              {released}/{milestones.length}
            </dd>
          </div>
        )}

        <div className="rounded-xl border border-white/[0.06] bg-background/40 p-3">
          <dt className="text-xs text-muted-foreground">Contributeur·rices</dt>
          <dd className="font-display text-lg font-semibold">{contributors.size}</dd>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-background/40 p-3">
          <dt className="text-xs text-muted-foreground">Suiveur·ses</dt>
          <dd className="font-display text-lg font-semibold">
            {followerIds.length}
            {followerIds.length > 0 && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                dont {Math.round((converted / followerIds.length) * 100)}&nbsp;% ont contribué
              </span>
            )}
          </dd>
        </div>

        {status === "FUNDED" && realizationDeadline && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
            <dt className="text-xs text-muted-foreground">À réaliser avant</dt>
            <dd className="font-display text-lg font-semibold text-amber-300">
              J-{daysLeft(realizationDeadline)}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
