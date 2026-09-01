import type { Messages } from "../types";

/**
 * Hülle der Rechtsseiten. Die drei Dokumente (Nutzungsbedingungen,
 * Datenschutz, Impressum) bleiben auf Französisch — Entscheidung des
 * Gründers: Nur die französische Fassung ist maßgeblich. Außerhalb der
 * Locale fr kündigt das Layout das nüchtern an.
 */
export const legalPages = {
  "layout.frame": "Der Rahmen",
  frenchPrevails:
    "Diese Seite gibt es nur auf Französisch — maßgeblich ist die französische Fassung.",
} satisfies Messages["legalPages"];
