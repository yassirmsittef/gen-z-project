import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertVideoStorageAvailable } from "@/lib/call-videos";
import {
  JETONS_PAR_PUBLICATION,
  MAX_UPLOAD_TICKETS_PER_DAY,
  MAX_VIDEOS_PER_DAY,
} from "@/lib/constants";
import { DomainError } from "@/lib/project-service";

/**
 * « Puis-je publier maintenant ? » — interrogé par le formulaire AVANT de
 * lancer l'envoi du fichier.
 *
 * Deux raisons, et la première n'est pas cosmétique. `@vercel/blob` lève sa
 * propre erreur quand la délivrance du jeton est refusée, SANS jamais lire le
 * corps de notre réponse : le motif écrit côté serveur (« Le direct est plein »,
 * « 5 témoignages par jour maximum ») n'atteignait donc jamais personne, et le
 * membre lisait un « Failed to retrieve the client token » en anglais. Demander
 * d'abord permet de dire pourquoi, dans nos mots.
 *
 * Ensuite, cela évite de faire monter 30 Mo pour rien — et donc d'abandonner
 * sur le stockage un fichier que sa publication ne viendra jamais réclamer.
 *
 * Ce n'est PAS le garde : les vraies limites restent posées sur le jeton
 * d'upload, côté serveur, où un client trafiqué ne peut pas les desserrer.
 * Ici on ne fait qu'annoncer la couleur.
 */
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, raison: "Connecte-toi pour publier un témoignage." });
  }

  const récentes = await prisma.callVideo.count({
    where: {
      authorId: session.user.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (récentes >= MAX_VIDEOS_PER_DAY) {
    return NextResponse.json({
      ok: false,
      raison: `${MAX_VIDEOS_PER_DAY} témoignages par jour maximum. Reviens demain — un fil se nourrit de voix différentes.`,
    });
  }

  const jetons = await prisma.uploadTicket.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  // DEUX places, pas une : une publication téléverse la vidéo puis la
  // vignette, donc consomme deux jetons. Sur un compteur impair, la vidéo
  // passait et la vignette était refusée — l'envoi échouait après coup, en
  // laissant un fichier de 30 Mo que personne ne réclamerait.
  if (jetons + JETONS_PAR_PUBLICATION > MAX_UPLOAD_TICKETS_PER_DAY) {
    return NextResponse.json({
      ok: false,
      raison: "Trop d'envois lancés aujourd'hui. Reviens demain, ou termine ceux qui sont en cours.",
    });
  }

  try {
    await assertVideoStorageAvailable();
  } catch (error) {
    if (error instanceof DomainError) return NextResponse.json({ ok: false, raison: error.message });
    throw error;
  }

  return NextResponse.json({ ok: true });
}
