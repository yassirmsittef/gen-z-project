import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Flux temps réel du chat (Server-Sent Events).
 *
 * Le serveur surveille les nouveaux messages de l'utilisateur (les deux sens :
 * un message envoyé depuis un autre onglet compte aussi) et pousse un
 * événement `message` dès qu'il y en a — le client fait alors un
 * router.refresh() ciblé, bien plus léger que l'ancien polling 5 s pleine page.
 *
 * Contrainte serverless (Vercel) : une fonction ne vit pas éternellement.
 * On ferme proprement le flux avant la limite (~50 s) après avoir annoncé
 * `retry: 1500` — EventSource se reconnecte tout seul, le chat reste vivant.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STREAM_LIFETIME_MS = 50_000;
const POLL_INTERVAL_MS = 1_200;
const HEARTBEAT_EVERY = 10; // un commentaire SSE toutes les ~12 s garde les proxys éveillés

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
      let ticks = 0;

      while (!closed && Date.now() - startedAt < STREAM_LIFETIME_MS) {
        try {
          const latest = await prisma.message.findFirst({
            where: {
              OR: [{ recipientId: userId }, { senderId: userId }],
              createdAt: { gt: since },
            },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true, senderId: true },
          });
          if (latest) {
            since = latest.createdAt;
            if (!push(`event: message\ndata: ${latest.createdAt.getTime()}\n\n`)) break;
          } else if (ticks % HEARTBEAT_EVERY === 0) {
            if (!push(`: ping\n\n`)) break;
          }
        } catch {
          // Base momentanément indisponible : on retentera au tick suivant.
        }
        ticks += 1;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
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
