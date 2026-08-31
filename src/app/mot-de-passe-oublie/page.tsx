import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/password-reset-forms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("authPages");
  return {
    title: t("meta.forgotTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage() {
  const t = await getT("authPages");
  return (
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("forgot.title")}
          </CardTitle>
          <CardDescription>{t("forgot.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
