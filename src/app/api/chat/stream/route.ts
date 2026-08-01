import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Flux temps réel du chat (Server-Sent Events).
 *
 * Le serveur surveille les nouveaux messages de l'utilisateur — privés (les
 * deux sens : un message envoyé depuis un autre onglet compte aussi) ET ceux
 * des groupes qu'il a rejoints — et pousse un événement `message` dès qu'il y
 * en a. Le client fait alors un router.refresh() ciblé, bien plus léger que
 * l'ancien polling 5 s pleine page.
 *
 * Contrainte serverless (Vercel) : une fonction ne vit pas éternellement.
 * On ferme proprement le flux avant la limite (~50 s) après avoir annoncé
 * `retry: 1500` — EventSource se reconnecte tout seul, le chat reste vivant.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STREAM_LIFETIME_MS = 50_000;
const HEARTBEAT_MS = 12_000; // un commentaire SSE toutes les ~12 s garde les proxys éveillés

/**
 * Cadence dégressive : vif quand ça discute, calme quand il ne se passe
 * rien. Une conversation active reste à 1,2 s (chaque événement remet le
 * compteur à zéro) ; un fil ouvert mais silencieux ralentit et cesse de
 * réveiller la base pour rien.
 */
const POLL_STEPS_MS = [1_200, 2_500, 5_000] as const;
const TICKS_BEFORE_SLOWING = 8;

function pollInterval(idleTicks: number): number {
  const step = Math.min(Math.floor(idleTicks / TICKS_BEFORE_SLOWING), POLL_STEPS_MS.length - 1);
  return POLL_STEPS_MS[step];
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }
  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // déjà fermé côté client
        }
      };
      request.signal.addEventListener("abort", close);

      const push = (chunk: string) => {
        if (closed) return false;
        try {
          controller.enqueue(encoder.encode(chunk));
          return true;
        } catch {
          closed = true;
          return false;
        }
      };

      // Reconnexion rapide quand la fonction serverless rend l'antenne.
      push(`retry: 1500\n\n`);

      // Léger recouvrement au démarrage : mieux vaut un refresh en trop
      // qu'un message raté entre deux connexions.
      let since = new Date(Date.now() - 2_000);
      const startedAt = Date.now();
      let idleTicks = 0;
      let lastHeartbeat = Date.now();

      // Une seule fois par connexion : inutile d'interroger les messages de
      // groupe à chaque tour pour quelqu'un qui n'a rejoint aucun salon.
      // Une adhésion en cours de route sera vue à la reconnexion (~50 s).
      let watchesGroups = true;
      try {
        watchesGroups = (await prisma.chatGroupMember.count({ where: { userId } })) > 0;
      } catch {
        // Doute : on surveille, quitte à payer une requête de plus.
      }

      while (!closed && Date.now() - startedAt < STREAM_LIFETIME_MS) {
        try {
          const [privateMessage, groupMessage] = await Promise.all([
            prisma.message.findFirst({
              where: {
                OR: [{ recipientId: userId }, { senderId: userId }],
                createdAt: { gt: since },
              },
              orderBy: { createdAt: "desc" },
              select: { createdAt: true },
            }),
            // Groupes rejoints : le fil ouvert et la pastille « non lus » de
            // la barre latérale suivent la même horloge que le privé.
            watchesGroups
              ? prisma.groupMessage.findFirst({
                  where: {
                    group: { members: { some: { userId } } },
                    createdAt: { gt: since },
                  },
                  orderBy: { createdAt: "desc" },
                  select: { createdAt: true },
                })
              : null,
          ]);
          const latestAt = [privateMessage?.createdAt, groupMessage?.createdAt]
            .filter((date): date is Date => date != null)
            .sort((a, b) => b.getTime() - a.getTime())[0];

          if (latestAt) {
            since = latestAt;
            idleTicks = 0; // ça discute : on repasse en cadence vive
            lastHeartbeat = Date.now();
            if (!push(`event: message\ndata: ${latestAt.getTime()}\n\n`)) break;
          } else {
            idleTicks += 1;
            if (Date.now() - lastHeartbeat >= HEARTBEAT_MS) {
              lastHeartbeat = Date.now();
              if (!push(`: ping\n\n`)) break;
            }
          }
        } catch {
          // Base momentanément indisponible : on retentera au tick suivant.
        }
        await new Promise((resolve) => setTimeout(resolve, pollInterval(idleTicks)));
      }
      close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
