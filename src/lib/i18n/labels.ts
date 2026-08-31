import type {
  PartnershipCompensation,
  PartnershipStatus,
  NotificationType,
  ProjectCategory,
  ProjectStatus,
} from "@prisma/client";
import type { Locale } from "@/lib/i18n/locales";
import { MESSAGES } from "@/messages";

/**
 * Libellés d'enums dans une langue donnée. Isomorphes (pas de "server-only") :
 * un composant client qui en a besoin les reçoit via le provider ou en props —
 * ces helpers servent surtout aux pages serveur.
 */
const label = (locale: Locale, key: keyof (typeof MESSAGES)["fr"]["labels"]): string =>
  MESSAGES[locale].labels[key] as string;

export const categoryLabel = (locale: Locale, category: ProjectCategory) =>
  label(locale, `category.${category}`);

export const categoryDescription = (locale: Locale, category: ProjectCategory) =>
  label(locale, `categoryDesc.${category}`);

export const statusLabel = (locale: Locale, status: ProjectStatus) =>
  label(locale, `status.${status}`);

export const compensationLabel = (locale: Locale, compensation: PartnershipCompensation) =>
  label(locale, `compensation.${compensation}`);

export const partnershipStatusLabel = (locale: Locale, status: PartnershipStatus) =>
  label(locale, `partnershipStatus.${status}`);

export const notificationTypeLabel = (locale: Locale, type: NotificationType) =>
  label(locale, `notifType.${type}`);
