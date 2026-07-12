import Link from "next/link";
import { LogOut, MessagesSquare, ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command-palette";
import { NavbarBell } from "@/components/navbar-bell";
import { NavbarGlobe } from "@/components/navbar-globe";
import { NavbarSigilLoader } from "@/components/navbar-sigil-loader";
import { UserAvatar } from "@/components/user-avatar";

export async function Navbar() {
  const session = await auth();
  // Une seule requête pour l'identité ET le badge de notifications — la
  // navbar est rendue à chaque page, chaque aller-retour DB compte.
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          _count: { select: { notifications: { where: { readAt: null } } } },
        },
      })
    : null;
  const unread = user?._count.notifications ?? 0;
  // File de modération : compteur pour les admins uniquement.
  const openReports =
    user?.role === "ADMIN" ? await prisma.report.count({ where: { status: "OPEN" } }) : 0;

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
            GeniGain
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
              {/* La Terre miniature qui tourne — écho du globe Communauté */}
              <NavbarGlobe />
              <span className="sr-only">Communauté</span>
            </Link>
          </Button>
          <CommandPalette className={iconButton} />
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
              {user.role === "ADMIN" && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  title="Cockpit admin"
                  className={`relative ${iconButton}`}
                >
                  <Link href="/admin">
                    <ShieldAlert aria-hidden />
                    {openReports > 0 && (
                      <span
                        className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[9px] font-bold text-destructive-foreground"
                        aria-hidden
                      >
                        {openReports > 9 ? "9+" : openReports}
                      </span>
                    )}
                    <span className="sr-only">
                      Cockpit admin{openReports > 0 ? ` (${openReports} signalements ouverts)` : ""}
                    </span>
                  </Link>
                </Button>
              )}
              <NavbarBell initialUnread={unread} className={`relative ${iconButton}`} />
                            <Link href={`/u/${user.id}`} title="Ton profil public">
                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-8 w-8 sm:h-9 sm:w-9" />
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
