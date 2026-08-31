import type { Locale } from "@/lib/i18n/locales";
import { ar } from "./ar";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { pt } from "./pt";
import type { Messages } from "./types";

export const MESSAGES: Record<Locale, Messages> = { fr, en, es, de, it, pt, ar };

export type { Messages, Namespace } from "./types";
