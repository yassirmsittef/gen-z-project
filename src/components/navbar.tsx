import Link from "next/link";
import { Globe2, LogOut, MessagesSquare, Zap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { LaunchLink } from "@/components/launch-button";
import { NavbarSigilLoader } from "@/components/navbar-sigil-loader";
import { UserAvatar } from "@/components/user-avatar";

export async function Navbar() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, credits: true },
      })
    : null;

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          {/* Logo 3D vivant : le masque en toupie, cible du portail de
              lancement (ancre data-sigil-dock) */}
          <span
            data-sigil-dock
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl rounded-br-sm border border-white/[0.12] bg-card/70 shadow-glow transition-shadow duration-200 group-hover:shadow-glow-strong"
          >
            <NavbarSigilLoader />
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-tight min-[420px]:inline">
            Tremplin
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">Projets</Link>
          </Button>
          {/* Icône seule (comme le chat) : la Communauté reste accessible sur mobile. */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Communauté — le réseau sur le globe"
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <Link href="/communaute">
              <Globe2 aria-hidden />
              <span className="sr-only">Communauté</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
            <Link href="/classements">Classements</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
            <Link href="/projects/new">Lancer un projet</Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Chat — entraide entre porteurs"
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Link href="/chat">
                  <MessagesSquare aria-hidden />
                  <span className="sr-only">Chat</span>
                </Link>
              </Button>
              <Link
                href="/dashboard"
                className="flex h-9 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 font-mono text-sm text-primary transition-colors duration-200 hover:bg-primary/20"
                title="Ton solde"
              >
                <Zap className="h-3.5 w-3.5" aria-hidden />
                {user.credits.toLocaleString("fr-FR")}
                <span className="hidden sm:inline">tokens</span>
              </Link>
              <Link href={`/u/${user.id}`} title="Ton profil public">
                <UserAvatar name={user.name} className="h-9 w-9" />
              </Link>
              <form action={signOutAction}>
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  title="Se déconnecter"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  <LogOut />
                  <span className="sr-only">Se déconnecter</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Transition « portail » : le bleu vire au violet foncé */}
              <LaunchLink href="/login" variant="ghost" size="sm" tint="violet">
                Connexion
              </LaunchLink>
              <LaunchLink href="/register" variant="default" size="sm" tint="violet">
                S&apos;inscrire
              </LaunchLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
