"use client";

import { useActionState, useState } from "react";
import { ShieldCheck, ShieldMinus, UserMinus, UserPlus } from "lucide-react";
import { groupModerationAction } from "@/actions/chat-groups";
import { Button } from "@/components/ui/button";

/**
 * Gestes d'animation sur un membre. L'exclusion demande une confirmation en
 * deux temps (elle ferme la porte au retour) ; nommer ou démettre un·e
 * gérant·e se défait d'un clic, donc pas de cérémonie.
 */
export function MemberActions({
  slug,
  targetId,
  targetName,
  isManager,
  canManage,
}: {
  slug: string;
  targetId: string;
  targetName: string;
  isManager: boolean;
  /** Animateur (ou ADMIN) : peut nommer et démettre, pas seulement exclure. */
  canManage: boolean;
}) {
  const [state, formAction, pending] = useActionState(groupModerationAction, undefined);
  const [armed, setArmed] = useState(false);

  return (
    <form action={formAction} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="targetId" value={targetId} />

      {state?.error && (
        <p role="alert" className="w-full text-right text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      {canManage &&
        (isManager ? (
          <Button
            type="submit"
            name="geste"
            value="demettre"
            variant="ghost"
            size="sm"
            disabled={pending}
          >
            <ShieldMinus aria-hidden />
            Retirer la gérance
          </Button>
        ) : (
          <Button
            type="submit"
            name="geste"
            value="nommer"
            variant="ghost"
            size="sm"
            disabled={pending}
          >
            <ShieldCheck aria-hidden />
            Nommer gérant·e
          </Button>
        ))}

      {armed ? (
        <>
          <Button
            type="submit"
            name="geste"
            value="exclure"
            variant="destructive"
            size="sm"
            disabled={pending}
          >
            <UserMinus aria-hidden />
            {pending ? "Exclusion…" : `Oui, exclure ${targetName}`}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setArmed(false)}>
            Annuler
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setArmed(true)}
        >
          <UserMinus aria-hidden />
          Exclure
        </Button>
      )}
    </form>
  );
}

/** Lever une exclusion : la personne peut à nouveau rejoindre le salon. */
export function ReadmitButton({ slug, targetId }: { slug: string; targetId: string }) {
  const [state, formAction, pending] = useActionState(groupModerationAction, undefined);

  return (
    <form action={formAction} className="flex items-center justify-end gap-2">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="targetId" value={targetId} />
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        name="geste"
        value="readmettre"
        variant="outline"
        size="sm"
        disabled={pending}
      >
        <UserPlus aria-hidden />
        {pending ? "Réadmission…" : "Réadmettre"}
      </Button>
    </form>
  );
}
