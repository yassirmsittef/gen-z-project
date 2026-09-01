"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { answerCallAction } from "@/actions/boycott";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm transition-colors duration-200 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * « Mon projet répond à cet appel » — la charnière du produit : une colère
 * devient une commande, la commande trouve son porteur. Quand le membre n'a
 * aucun projet éligible, on ne cache pas le bloc : on l'envoie en créer un,
 * l'appel en main.
 */
export function CallAnswerForm({
  callId,
  slug,
  target,
  projects,
}: {
  callId: string;
  slug: string;
  target: string;
  projects: { id: string; title: string }[];
}) {
  const t = useT("calls");
  const [state, formAction, pending] = useActionState(answerCallAction, undefined);

  if (projects.length === 0) {
    return (
      <div className="glass rounded-2xl rounded-se-sm p-5">
        <h2 className="font-display text-lg font-semibold">{t("callAnswerForm.emptyHeading")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("callAnswerForm.emptyBody")}</p>
        <Button asChild className="mt-4">
          {/* Le slug voyage avec le porteur : le projet sera déclaré
              remplaçant à sa création, sans détour de retour par ici. */}
          <Link href={`/projects/new?appel=${slug}`}>
            <Rocket aria-hidden />
            {t("callAnswerForm.launchReplacement", { target })}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="glass rounded-2xl rounded-se-sm p-5">
      <h2 className="font-display text-lg font-semibold">{t("callAnswerForm.heading")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("callAnswerForm.body")}</p>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="answer-project">{t("callAnswerForm.projectLabel")}</Label>
        <select id="answer-project" name="projectId" required defaultValue="" className={selectClass}>
          <option value="" disabled>
            {t("callAnswerForm.projectPlaceholder")}
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      <input type="hidden" name="callId" value={callId} />

      {state?.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="mt-3 text-sm font-medium text-success">
          {t("callAnswerForm.success")}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-4">
        {pending ? t("callAnswerForm.pending") : t("callAnswerForm.submit", { target })}
      </Button>
    </form>
  );
}
