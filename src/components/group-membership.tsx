"use client";

import { useActionState, useState } from "react";
import { Bell, BellOff, DoorOpen, LogIn, Trash2 } from "lucide-react";
import {
  dissolveGroupAction,
  joinGroupAction,
  leaveGroupAction,
  toggleGroupMuteAction,
} from "@/actions/chat-groups";
import { Button } from "@/components/ui/button";

/** Rejoindre un groupe — un seul geste, depuis l'annuaire ou la fiche. */
export function JoinGroupButton({
  slug,
  full,
  size = "default",
  label = "Rejoindre",
}: {
  slug: string;
  full?: boolean;
  size?: "default" | "sm";
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(joinGroupAction, undefined);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="slug" value={slug} />
      <Button type="submit" size={size} disabled={pending || full}>
        <LogIn aria-hidden />
        {full ? "Groupe complet" : pending ? "On t'installe…" : label}
      </Button>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}

/**
 * Quitter un groupe. L'animateur qui s'en va passe la main au plus ancien
 * membre — c'est dit avant, pour que le geste ne surprenne pas.
 */
export function LeaveGroupButton({ slug, isOwner }: { slug: string; isOwner: boolean }) {
  const [state, formAction, pending] = useActionState(leaveGroupAction, undefined);
  const [armed, setArmed] = useState(false);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="slug" value={slug} />
      {armed ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            <DoorOpen aria-hidden />
            {pending ? "Sortie…" : "Oui, quitter"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(false)}>
            Annuler
          </Button>
          {isOwner && (
            <p className="text-xs text-muted-foreground">
              L&apos;animation passe au membre le plus ancien.
            </p>
          )}
        </div>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(true)}>
          <DoorOpen aria-hidden />
          Quitter
        </Button>
      )}
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}

/**
 * Mettre CE salon en silence sans toucher aux autres. La pastille de non-lus
 * continue de vivre : se taire n'est pas se cacher ce qui s'y dit.
 */
export function MuteGroupButton({ slug, muted }: { slug: string; muted: boolean }) {
  const [state, formAction, pending] = useActionState(toggleGroupMuteAction, undefined);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="muted" value={muted ? "false" : "true"} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        title={
          muted
            ? "Recevoir à nouveau les notifications de ce salon"
            : "Ne plus être notifié·e de ce salon"
        }
        className={muted ? "text-primary hover:text-primary" : undefined}
      >
        {muted ? <BellOff aria-hidden /> : <Bell aria-hidden />}
        {muted ? "En silence" : "Silence"}
      </Button>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}

/** Dissoudre le groupe (animateur) : confirmation en deux temps, irréversible. */
export function DissolveGroupButton({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(dissolveGroupAction, undefined);
  const [armed, setArmed] = useState(false);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="slug" value={slug} />
      {armed ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="destructive" size="sm" disabled={pending}>
            <Trash2 aria-hidden />
            {pending ? "Dissolution…" : "Oui, dissoudre le groupe"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(false)}>
            Annuler
          </Button>
          <p className="text-xs text-muted-foreground">Le fil et ses messages disparaissent.</p>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setArmed(true)}
        >
          <Trash2 aria-hidden />
          Dissoudre
        </Button>
      )}
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
