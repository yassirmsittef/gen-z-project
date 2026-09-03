import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { liveAnswer, targetKeyOf } from "@/lib/boycott";
import { prisma } from "@/lib/prisma";

/**
 * Recherche globale (palette ⌘K) : projets par titre/pitch, membres par nom,
 * salons par nom/intention.
 *
 * Projets et membres sont publics. Les SALONS ne remontent que pour une
 * personne connectée : l'annuaire des groupes vit derrière le login, cette
 * route ne doit pas devenir la porte dérobée qui l'expose.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ projects: [], members: [], rooms: [], calls: [] });

  const session = await auth();

  const [projects, members, rooms, calls] = await Promise.all([
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
    session?.user?.id
      ? prisma.chatGroup.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { purpose: { contains: q, mode: "insensitive" } },
                ],
              },
              { OR: [{ private: false }, { members: { some: { userId: session.user.id } } }] },
            ],
          },
          // Les salons d'accueil d'abord, puis les plus peuplés.
          orderBy: [{ official: "desc" }, { members: { _count: "desc" } }],
          select: {
            slug: true,
            name: true,
            purpose: true,
            _count: { select: { members: true } },
          },
          take: 5,
        })
      : Promise.resolve([]),
    // Les appels sont publics comme les projets. Chercher une marque doit
    // mener au fil : c'est souvent par là qu'on arrive sur la plateforme.
    prisma.boycottCall.findMany({
      where: {
        removedAt: null,
        OR: [
          { target: { contains: q, mode: "insensitive" } },
          // La clé normalisée aussi, comme dans `listCalls` : sans elle,
          // « nestle » ne trouve pas « Nestlé » ici alors que le champ de
          // recherche du fil, lui, le trouve. Deux surfaces de recherche ne
          // peuvent pas obéir à deux règles.
          { targetKey: { contains: targetKeyOf(q) } },
          { wanted: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: [{ supports: { _count: "desc" } }, { createdAt: "desc" }],
      select: {
        slug: true,
        target: true,
        wanted: true,
        _count: { select: { supports: true, answers: { where: liveAnswer } } },
      },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    projects,
    members,
    rooms: rooms.map(({ _count, ...room }) => ({ ...room, memberCount: _count.members })),
    calls: calls.map(({ _count, ...call }) => ({
      ...call,
      supportCount: _count.supports,
      answerCount: _count.answers,
    })),
  });
}
