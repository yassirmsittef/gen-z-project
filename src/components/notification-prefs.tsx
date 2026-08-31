"use client";

import { useActionState } from "react";
import { ChevronDown, Settings2 } from "lucide-react";
import { updateNotificationPrefsAction } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";
import type { NotificationType } from "@prisma/client";
import { NOTIFICATION_TYPE_LABELS, isUnmutable } from "@/lib/constants";

/**
 * Préférences de notifications : coché = je reçois. Les types décochés sont
 * coupés à la source (aucune notification créée).
 */
export function NotificationPrefs({ muted }: { muted: string[] }) {
  const t = useT("account");
  const [state, formAction, pending] = useActionState(updateNotificationPrefsAction, undefined);

  return (
    <details className="glass overflow-hidden rounded-2xl">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 p-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 hover:text-foreground [&::-webkit-details-marker]:hidden">
        <Settings2 className="h-4 w-4 text-primary" aria-hidden />
        {t("notificationPrefs.summary")}
        <ChevronDown className="ml-auto h-4 w-4" aria-hidden />
      </summary>
      <form action={formAction} className="space-y-4 border-t border-white/[0.06] p-4">
        <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {/* Les types non masquables ne sont pas proposés : promettre un
              réglage qui n'a aucun effet vaut moins que ne rien promettre. */}
          {Object.entries(NOTIFICATION_TYPE_LABELS)
            .filter(([type]) => !isUnmutable(type as NotificationType))
            .map(([type, label]) => (
            <label key={type} className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                name="enabled"
                value={type}
                defaultChecked={!muted.includes(type)}
                className="h-4 w-4 rounded accent-[#38BDF8]"
              />
              {label}
            </label>
          ))}
        </div>

        {state?.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm font-medium text-success">{t("notificationPrefs.success")}</p>
        )}

        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? t("notificationPrefs.submitPending") : t("notificationPrefs.submit")}
        </Button>
      </form>
    </details>
  );
}
