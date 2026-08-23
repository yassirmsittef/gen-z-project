import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MAX_VIDEO_BYTES, MAX_VIDEOS_PER_DAY, VIDEO_CONTENT_TYPES } from "@/lib/constants";

/**
 * Jeton d'upload direct navigateur → Vercel Blob.
 *
 * Une vidéo ne peut PAS transiter par une Server Action : leur corps est
 * plafonné (~1 Mo), très en dessous d'un fichier vidéo. Le navigateur envoie
 * donc directement au stockage, avec un jeton que ce serveur signe — et c'est
 * le jeton qui porte les limites (`maximumSizeInBytes`, `allowedContentTypes`).
 * Elles sont donc opposables : un client trafiqué ne peut pas les desserrer.
 *
 * Le jeton n'est délivré qu'à un membre connecté qui n'a pas épuisé son
 * plafond quotidien — sinon on paierait le stockage d'un flood avant même de
 * pouvoir le refuser en base.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Connecte-toi pour publier un témoignage.");

        const récentes = await prisma.callVideo.count({
          where: {
            authorId: session.user.id,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });
        if (récentes >= MAX_VIDEOS_PER_DAY) {
          throw new Error(`${MAX_VIDEOS_PER_DAY} témoignages par jour maximum.`);
        }

        return {
          allowedContentTypes: [...VIDEO_CONTENT_TYPES, "image/jpeg", "image/webp"],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
          // Le propriétaire voyage avec le blob : on saura à qui appartient un
          // fichier orphelin sans avoir à interroger la base.
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Rien à faire ici : la ligne en base est créée par l'action serveur
        // qui suit l'upload, avec la légende et la durée. Ce hook n'est pas
        // appelé en développement local (Vercel ne peut pas joindre
        // localhost) — en dépendre casserait le parcours hors production.
      },
    });

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Envoi impossible." },
      { status: 400 }
    );
  }
}
