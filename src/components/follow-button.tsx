"use client";

import { useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import { toggleFollowAction } from "@/actions/project-feed";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Suivre / suivi — l'étoile se remplit, le compteur suit. */

function SubmitButton({ following, count }: { following: boolean; count: number }) {
  const t = useT("project");
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={following ? "secondary" : "outline"}
      size="sm"
      disabled={pending}
      title={following ? t("followButton.unfollowTitle") : t("followButton.followTitle")}
    >
      <Star className={cn(following && "fill-current")} aria-hidden />
      {pending ? "…" : following ? t("followButton.following") : t("followButton.follow")}
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
