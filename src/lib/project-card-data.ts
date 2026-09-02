import type { Prisma } from "@/generated/prisma/client";

/**
 * Ce qu'une carte projet a besoin de savoir — écrit UNE fois, importé par
 * toutes les pages qui en affichent.
 *
 * `owner: true` remontait la ligne User complète : `passwordHash`, `email` et
 * `stripeAccountId` traversaient l'arbre de rendu de huit pages publiques.
 * Rien n'en sortait tant que tout restait serveur, mais un seul `"use client"`
 * en aval suffisait à sérialiser la ligne entière dans le payload RSC et à la
 * rendre lisible par un visiteur anonyme.
 *
 * Défini ici et pas dans `project-card.tsx` : des bibliothèques serveur
 * (`lib/boycott.ts`) et la suite de tests l'importent, et elles ne doivent
 * pas avoir à traverser du JSX pour ça.
 */
export const PROJECT_CARD_INCLUDE = {
  owner: { select: { id: true, name: true, avatarUrl: true, reputation: true, role: true } },
  _count: { select: { contributions: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectCardData = Prisma.ProjectGetPayload<{
  include: typeof PROJECT_CARD_INCLUDE;
}>;
