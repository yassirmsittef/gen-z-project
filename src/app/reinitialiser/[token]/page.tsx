import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/password-reset-forms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("authPages");
  return {
    title: t("meta.resetTitle"),
    robots: { index: false, follow: false },
  };
}

/** Le token n'est validé qu'à la SOUMISSION (jamais au rendu : un simple
 * crawl du lien ne doit rien consommer ni révéler). */
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const t = await getT("authPages");
  const { token } = await params;

  return (
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("reset.title")}
          </CardTitle>
          <CardDescription>{t("reset.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
