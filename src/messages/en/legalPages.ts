import type { Messages } from "../types";

/**
 * Shell of the legal pages. The three documents (terms, privacy, legal
 * notice) stay in French — founder's decision: only the French version is
 * authoritative. Outside the fr locale, the layout says so plainly.
 */
export const legalPages = {
  "layout.frame": "The legal frame",
  frenchPrevails:
    "This page exists in French only — the French version is the one that legally prevails.",
} satisfies Messages["legalPages"];
