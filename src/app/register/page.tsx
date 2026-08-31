import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/auth";
import { getRequestLocale, getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth-forms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("authPages");
  return { title: t("meta.registerTitle") };
}

export default async function RegisterPage() {
  const t = await getT("authPages");
  const session = await auth();
  // Ne rediriger que si l'utilisateur du token existe toujours (un JWT peut
  // survivre à un utilisateur supprimé, ex. après un re-seed).
  if (session?.user?.id) {
    const exists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (exists) redirect("/");
  }

  return (
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("register.title")}
          </CardTitle>
          <CardDescription>
            {t("register.description")}{" "}
            <Link
              href="/comment-ca-marche"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("register.howItWorks")}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm googleEnabled={googleEnabled} defaultLocale={await getRequestLocale()} />
        </CardContent>
      </Card>
    </div>
  );
}
