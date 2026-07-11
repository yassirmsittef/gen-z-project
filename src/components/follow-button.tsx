"use client";

import { useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import { toggleFollowAction } from "@/actions/project-feed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Suivre / suivi — l'étoile se remplit, le compteur suit. */

function SubmitButton({ following, count }: { following: boolean; count: number }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={following ? "secondary" : "outline"}
      size="sm"
      disabled={pending}
      title={following ? "Ne plus suivre ce projet" : "Suivre ce projet"}
    >
      <Star className={cn(following && "fill-current")} aria-hidden />
      {pending ? "…" : following ? "Suivi" : "Suivre"}
      <span className="font-mono text-xs opacity-75">{count}</span>
    </Button>
  );
}

export function FollowButton({
  projectId,
  following,
  count,
}: {
  projectId: string;
  following: boolean;
  count: number;
}) {
  return (
    <form action={toggleFollowAction} className="inline-flex">
      <input type="hidden" name="projectId" value={projectId} />
      <SubmitButton following={following} count={count} />
    </form>
  );
}
