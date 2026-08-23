import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, users, calls] = await Promise.all([
    prisma.project.findMany({ select: { slug: true, createdAt: true } }),
    prisma.user.findMany({ select: { id: true, createdAt: true } }),
    // Les appels retirés sortent du sitemap : on n'envoie pas les moteurs
    // vers une pierre tombale.
    prisma.boycottCall.findMany({
      where: { removedAt: null },
      select: { slug: true, createdAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/projects",
    "/appels",
    "/communaute",
    "/classements",
    "/comment-ca-marche",
    "/login",
    "/register",
  ].map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "daily" as const }));

  const legalRoutes: MetadataRoute.Sitemap = ["/cgu", "/confidentialite", "/mentions-legales"].map(
    (path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly" as const })
  );

  return [
    ...staticRoutes,
    ...legalRoutes,
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: project.createdAt,
      changeFrequency: "daily" as const,
    })),
    ...calls.map((call) => ({
      url: `${SITE_URL}/appels/${call.slug}`,
      lastModified: call.createdAt,
      changeFrequency: "daily" as const,
    })),
    ...users.map((user) => ({
      url: `${SITE_URL}/u/${user.id}`,
      lastModified: user.createdAt,
      changeFrequency: "weekly" as const,
    })),
  ];
}
