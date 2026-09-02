import type { Notification } from "@/generated/prisma/client";
import { notificationTypeLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/locales";
import { makeT, type Vars } from "@/lib/i18n/t";
import { formatMoney } from "@/lib/money";
import { NOTIFICATION_KEYS, type NotificationKey } from "@/lib/notification-catalog";
import { MESSAGES } from "@/messages";

export type RenderedNotification = { title: string; body: string | null };

type RenderableNotification = Pick<
  Notification,
  "type" | "key" | "params" | "excerpt" | "retractedAt"
>;

/**
 * Rend une notification dans la langue du LECTEUR — la base ne stocke que la
 * matière (clé + params bruts + extrait). Chaque lecture rend dans la langue
 * COURANTE du membre : changer de langue traduit aussi l'historique.
 *
 * - `{actor}` : nom du membre acteur, ou « Quelqu'un » traduit si anonyme ;
 * - `{money}` : `amountMinor`+`currency` formatés dans la locale du lecteur ;
 * - `{reason}` (échec de campagne) : motif du jeu fermé, traduit ;
 * - extrait retiré (`retractedAt`) : la pierre tombale du type remplace le corps ;
 * - clé inconnue (fenêtre de déploiement, gabarit disparu) : repli sur le
 *   libellé du type — jamais d'écran cassé pour une vieille ligne.
 */
export function renderNotification(
  locale: Locale,
  notification: RenderableNotification
): RenderedNotification {
  const meta = NOTIFICATION_KEYS[notification.key as NotificationKey];
  if (!meta) {
    return { title: notificationTypeLabel(locale, notification.type), body: null };
  }

  const t = makeT(MESSAGES[locale].notif, locale);
  const tCommon = makeT(MESSAGES[locale].common, locale);
  const raw = (notification.params ?? {}) as Record<string, string | number | null>;

  const vars: Vars = { ...raw };
  vars.actor = typeof raw.actorName === "string" && raw.actorName ? raw.actorName : tCommon("someone");
  if (typeof raw.amountMinor === "number" && typeof raw.currency === "string") {
    vars.money = formatMoney(raw.amountMinor, raw.currency, locale);
  }
  if (typeof raw.reasonKey === "string") {
    vars.reason = t(`failReason.${raw.reasonKey}` as keyof (typeof MESSAGES)["fr"]["notif"], {
      days: raw.days ?? null,
    });
  }
  if (typeof raw.reason === "string" || raw.reason === null) {
    // boycottRemoved : motif libre du modérateur, ou défaut traduit.
    vars.reason =
      typeof raw.reason === "string" && raw.reason
        ? raw.reason
        : t("boycottRemoved.defaultReason");
  }
  vars.excerpt = notification.excerpt ?? "";

  const title = t(`${notification.key}.title` as keyof (typeof MESSAGES)["fr"]["notif"], vars);

  let body: string | null = null;
  if (notification.retractedAt) {
    const tombstoneKey = `tombstone.${notification.type}` as keyof (typeof MESSAGES)["fr"]["notif"];
    body = (MESSAGES[locale].notif as Record<string, unknown>)[tombstoneKey]
      ? t(tombstoneKey)
      : null;
  } else if (meta.body) {
    body = t(`${notification.key}.body` as keyof (typeof MESSAGES)["fr"]["notif"], vars);
  }

  return { title, body };
}
