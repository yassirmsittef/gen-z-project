import Link from "next/link";
import { Bell, Globe2, LogOut, MessagesSquare, Zap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
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
  const unread = user
    ? await prisma.notification.count({ where: { userId: user.id, readAt: null } })
    : 0;

  // Largeur mobile au cordeau (375px) : icônes 32px et pastille compacte
  // sous `sm`, tailles confortables au-dessus.
  const iconButton = "h-8 w-8 sm:h-10 sm:w-10";

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          {/* Logo 3D vivant : le masque en toupie */}
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl rounded-br-sm border border-white/[0.12] bg-card/70 shadow-glow transition-shadow duration-200 group-hover:shadow-glow-strong">
            <NavbarSigilLoader />
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-tight min-[420px]:inline">
            Tremplin
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">Projets</Link>
          </Button>
          {/* Icône seule (comme le chat) : la Communauté reste accessible sur mobile. */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Communauté — le réseau sur le globe"
            className={iconButton}
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
                className={iconButton}
              >
                <Link href="/chat">
                  <MessagesSquare aria-hidden />
                  <span className="sr-only">Chat</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Notifications"
                className={`relative ${iconButton}`}
              >
                <Link href="/notifications">
                  <Bell aria-hidden />
                  {unread > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground shadow-glow"
                      aria-hidden
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                  <span className="sr-only">
                    Notifications{unread > 0 ? ` (${unread} non lues)` : ""}
                  </span>
                </Link>
              </Button>
              <Link
                href="/dashboard"
                className="flex h-8 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 font-mono text-xs text-primary transition-colors duration-200 hover:bg-primary/20 sm:h-9 sm:gap-1.5 sm:px-3 sm:text-sm"
                title="Ton solde"
              >
                <Zap className="h-3.5 w-3.5" aria-hidden />
                {user.credits.toLocaleString("fr-FR")}
                <span className="hidden sm:inline">tokens</span>
              </Link>
              <Link href={`/u/${user.id}`} title="Ton profil public">
                <UserAvatar name={user.name} className="h-8 w-8 sm:h-9 sm:w-9" />
              </Link>
              <form action={signOutAction}>
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  title="Se déconnecter"
                  className={iconButton}
                >
                  <LogOut />
                  <span className="sr-only">Se déconnecter</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">S&apos;inscrire</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
