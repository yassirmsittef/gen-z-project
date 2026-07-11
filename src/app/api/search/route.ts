import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Recherche globale (palette ⌘K) : projets par titre/pitch, membres par nom.
 * Données publiques uniquement — pas d'authentification requise.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ projects: [], members: [] });

  const [projects, members] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { pitch: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { slug: true, title: true, pitch: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      // Les comptes effacés (RGPD) ne remontent pas dans la recherche.
      where: { name: { contains: q, mode: "insensitive", not: "Membre retiré" } },
      select: { id: true, name: true, avatarUrl: true, city: true },
      orderBy: { reputation: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ projects, members });
}
