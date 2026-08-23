import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listVideos } from "@/lib/call-videos";
import { isAdmin } from "@/lib/moderation";

/** Pagination au curseur du fil vidéo (défilement infini). */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
  const session = await auth();
  const userId = session?.user?.id;

  const [{ videos, cursor: suivant }, admin] = await Promise.all([
    listVideos({ cursor }),
    userId ? isAdmin(userId) : Promise.resolve(false),
  ]);

  return NextResponse.json({
    videos: videos.map((video) => ({
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
      peutRetirer: Boolean(userId) && (video.authorId === userId || admin),
    })),
    cursor: suivant,
  });
}
