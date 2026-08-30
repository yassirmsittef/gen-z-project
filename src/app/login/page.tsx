import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
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
          <CardTitle className="text-2xl font-semibold tracking-tight">Re-bienvenue</CardTitle>
          <CardDescription>Connecte-toi pour contribuer et suivre tes projets.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm googleEnabled={googleEnabled} />
        </CardContent>
      </Card>
    </div>
  );
}
