import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { CreateCallForm } from "@/components/create-call-form";

export const metadata: Metadata = { title: "Publier un appel" };

export default async function NouvelAppelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="container max-w-3xl py-10">
      <Link
        href="/appels"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Retour au fil
      </Link>

      <header className="hero-reveal mb-8 space-y-3">
        <p className="data-label">Nouvel appel</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Nomme ce que tu veux voir remplacé
        </h1>
        <p className="text-muted-foreground">
          Un appel n&apos;est pas un coup de gueule : c&apos;est une commande passée à ceux qui
          savent construire. Plus tu décris précisément ce que tu achèterais à la place, plus tu as
          de chances qu&apos;un porteur s&apos;en saisisse.
        </p>
      </header>

      <CreateCallForm />
    </div>
  );
}
