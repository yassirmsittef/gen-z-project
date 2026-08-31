import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Handshake } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import { Card, CardContent } from "@/components/ui/card";
import { PartnershipForm } from "@/components/partnership-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("projectsPages");
  return { title: t("meta.partnershipTitle") };
}

/**
 * Page PUBLIQUE côté marque : proposer un partenariat au porteur d'un projet,
 * sans créer de compte. La demande atterrit dans la boîte /partenariats du
 * porteur, avec analyse IA avant réponse.
 */
export default async function PartnershipRequestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getT("projectsPages");
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, title: true, pitch: true, slug: true, owner: { select: { name: true } } },
  });
  if (!project) notFound();

  return (
    <div className="page-halo">
      <div className="container max-w-3xl space-y-8 py-10">
        <div className="space-y-3">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("partnership.back")}
          </Link>
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight">
            <Handshake className="h-8 w-8 text-primary" aria-hidden />
            {t("partnership.title")}
          </h1>
          <p className="text-muted-foreground">
            {/* Une seule phrase traduisible : le nom du porteur y entre en
                paramètre plutôt que d'être encadré par deux fragments. */}
            <span dir="auto">
              {t("partnership.intro", {
                owner: project.owner.name ?? "",
                title: project.title,
              })}
            </span>
          </p>
        </div>

        <Card className="rounded-tr-sm">
          <CardContent className="relative pt-6">
            <PartnershipForm projectId={project.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
