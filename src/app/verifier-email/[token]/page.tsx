import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { verifyEmailToken } from "@/lib/email-verification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("authPages");
  return { title: t("verify.title"), robots: { index: false, follow: false } };
}

/**
 * Le jeton est consommé AU RENDU : c'est un lien qu'on clique depuis sa boîte,
 * et le consommer ne donne rien à qui l'aurait vu passer — il confirme
 * seulement que l'email est arrivé à destination.
 */
export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const t = await getT("authPages");
  const { token } = await params;
  const ok = await verifyEmailToken(token);

  return (
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">{t("verify.title")}</CardTitle>
          <CardDescription>{ok ? t("verify.success") : t("verify.invalid")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">{t("verify.cta")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
