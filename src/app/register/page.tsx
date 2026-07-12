import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Inscription" };

export default async function RegisterPage() {
  const session = await auth();
  // Ne rediriger que si l'utilisateur du token existe toujours (un JWT peut
  // survivre à un utilisateur supprimé, ex. après un re-seed).
  if (session?.user?.id) {
    const exists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (exists) redirect("/projects");
  }

  return (
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Rejoins la communauté
          </CardTitle>
          <CardDescription>
            Contribue aux projets de ta génération par carte, dans leur devise — et lance le tien dès 20&nbsp;$ de contributions cumulées.{" "}
            <Link
              href="/comment-ca-marche"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Comment ça marche&nbsp;?
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm googleEnabled={googleEnabled} />
        </CardContent>
      </Card>
    </div>
  );
}
