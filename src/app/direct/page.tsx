import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { VideoFeed, type VideoDuFilRendu } from "@/components/video-feed";
import { Button } from "@/components/ui/button";
import { getVideo, listVideos } from "@/lib/call-videos";
import { isAdmin } from "@/lib/moderation";

export const metadata: Metadata = {
  title: "Le direct",
  description:
    "Les témoignages filmés de la communauté : pourquoi on ne veut plus de ces marques, et ce qu'on voudrait à la place.",
};

/** Le fil se lit toujours frais : on ne sert pas un cache de la veille. */
export const dynamic = "force-dynamic";

export default async function DirectPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  const [{ videos, cursor }, admin, épinglée] = await Promise.all([
    listVideos({}),
    userId ? isAdmin(userId) : Promise.resolve(false),
    // Lien direct vers un témoignage (`/direct?v=…`, celui des notifications
    // et du partage) : on l'ouvre en tête plutôt que d'obliger à le chercher.
    v ? getVideo(v) : Promise.resolve(null),
  ]);

  const liste = épinglée
    ? [épinglée, ...videos.filter((video) => video.id !== épinglée.id)]
    : videos;

  const rendues: VideoDuFilRendu[] = liste.map((video) => ({
    id: video.id,
    url: video.url,
    posterUrl: video.posterUrl,
    caption: video.caption,
    createdAt: video.createdAt.toISOString(),
    author: video.author,
    call: {
      slug: video.call.slug,
      target: video.call.target,
      category: video.call.category,
      voix: video.call._count.supports,
    },
    // Mêmes titres que pour la discussion écrite : son auteur, l'auteur de
    // l'appel, la modération. L'auteur de l'appel manquait ici alors que
    // `removeVideo` l'autorise : la règle existait, aucun bouton ne l'offrait.
    peutRetirer:
      Boolean(userId) &&
      (video.authorId === userId || video.call.authorId === userId || admin),
  }));

  return (
    // AUCUN chrome au-dessus du fil : un en-tête dans le flux poussait la
    // première vidéo hors de l'écran et imposait DEUX défilements — celui de
    // la page, puis celui du fil. Le titre est donc posé en surimpression, et
    // le scroller occupe exactement la hauteur sous la navbar.
    <div className="relative">
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="rounded-2xl bg-background/40 px-3 py-2 backdrop-blur-md">
          <p className="data-label">Le direct</p>
          <h1 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            Ce qu&apos;on ne veut plus, filmé
          </h1>
        </div>
        <Button asChild variant="outline" size="sm" className="pointer-events-auto mr-14 shrink-0">
          <Link href="/appels">Publier</Link>
        </Button>
      </header>

      <VideoFeed initiales={rendues} curseurInitial={cursor} />
    </div>
  );
}
