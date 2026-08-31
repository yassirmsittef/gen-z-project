import Link from "next/link";
import {
  Clapperboard,
  FolderKanban,
  LogOut,
  Megaphone,
  MessagesSquare,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command-palette";
import { NavbarBell } from "@/components/navbar-bell";
import { NavbarGlobe } from "@/components/navbar-globe";
import { NavbarSigilLoader } from "@/components/navbar-sigil-loader";
import { UserAvatar } from "@/components/user-avatar";

export async function Navbar() {
  const t = await getT("nav");
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
          <LienPrincipal href="/projects" label={t("projects")} Icon={FolderKanban} iconClass={iconButton} />
          {/* Le fil des appels : deuxième porte d'entrée du produit, juste
              après les projets — c'est de là que partent les remplaçants. */}
          <LienPrincipal href="/appels" label={t("calls")} Icon={Megaphone} iconClass={iconButton} />
          {/* Le direct : la version filmée du fil, une vidéo par écran. Il
              était masqué sous `sm` — soit invisible sur le seul format où un
              fil vidéo vertical a du sens. */}
          <LienPrincipal href="/direct" label={t("live")} Icon={Clapperboard} iconClass={iconButton} />
          {/* Icône seule (comme le chat) : la Communauté reste accessible sur mobile. */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            title={t("communityTitle")}
            className={iconButton}
          >
            <Link href="/communaute">
              {/* La Terre miniature qui tourne — écho du globe Communauté */}
              <NavbarGlobe />
              <span className="sr-only">{t("community")}</span>
            </Link>
          </Button>
          <CommandPalette className={iconButton} />
          <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
            <Link href="/classements">{t("rankings")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
            <Link href="/projects/new">{t("launchProject")}</Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/dashboard">{t("dashboard")}</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                title={t("chatTitle")}
                className={iconButton}
              >
                <Link href="/chat">
                  <MessagesSquare aria-hidden />
                  <span className="sr-only">{t("chat")}</span>
                </Link>
              </Button>
              {user.role === "ADMIN" && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  title={t("adminCockpit")}
                  /* Hors de la barre sur téléphone : c'est le seul bouton
                     réservé à une poignée de comptes, et il coûtait la place
                     qui manquait à tout le monde. Il est repris en tête du
                     Dashboard, compteur inclus — rien n'est perdu. */
                  className={`relative hidden sm:inline-flex ${iconButton}`}
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
                      {t("adminCockpit")}
                      {openReports > 0 ? ` (${t("adminOpenReports", { count: openReports })})` : ""}
                    </span>
                  </Link>
                </Button>
              )}
              <NavbarBell initialUnread={unread} className={`relative ${iconButton}`} />
                            <Link href={`/u/${user.id}`} title={t("profileTitle")}>
                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-8 w-8 sm:h-9 sm:w-9" />
              </Link>
              <form action={signOutAction}>
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  title={t("signOut")}
                  className={iconButton}
                >
                  <LogOut />
                  <span className="sr-only">{t("signOut")}</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">{t("signUp")}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/**
 * Un lien principal de la barre : ICÔNE SEULE sur téléphone, texte dès `sm`.
 *
 * La barre mobile était pleine à craquer — 414 px de contenu pour 375 px
 * d'écran : l'avatar était rogné et le bouton de déconnexion tombait hors de
 * l'écran, alors qu'il n'existe nulle part ailleurs. Trois libellés en toutes
 * lettres y coûtaient plus de 200 px, quand Communauté, Chat et Notifications
 * tiennent déjà en 32 px chacun. On aligne les trois premiers sur ce
 * traitement : le texte revient dès qu'il y a la place.
 *
 * Deux boutons plutôt qu'un seul dont le libellé se masque : un bouton `icon`
 * et un bouton `sm` n'ont ni la même boîte ni le même rembourrage, et faire
 * varier ça sur un seul élément produisait une pastille difforme au point de
 * bascule.
 */
function LienPrincipal({
  href,
  label,
  Icon,
  iconClass,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <>
      <Button variant="ghost" size="icon" asChild title={label} className={`sm:hidden ${iconClass}`}>
        <Link href={href}>
          <Icon aria-hidden />
          <span className="sr-only">{label}</span>
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
        <Link href={href}>{label}</Link>
      </Button>
    </>
  );
}
