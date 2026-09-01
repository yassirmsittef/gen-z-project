import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { CreateCallForm } from "@/components/create-call-form";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("callsPages");
  return { title: t("meta.newTitle") };
}

export default async function NouvelAppelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const t = await getT("callsPages");

  return (
    <div className="container max-w-3xl py-10">
      <Link
        href="/appels"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="h-4 w-4 rtl:-scale-x-100" />
        {t("back.toFeed")}
      </Link>

      <header className="hero-reveal mb-8 space-y-3">
        <p className="data-label">{t("new.label")}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{t("new.title")}</h1>
        <p className="text-muted-foreground">{t("new.body")}</p>
      </header>

      <CreateCallForm />
    </div>
  );
}
