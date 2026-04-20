// ═══════════════════════════════════════════════════════════════
// SITA OS — Accessibility Baseline
// Per-page-class WCAG requirements for CI validation.
// ═══════════════════════════════════════════════════════════════

import type { PageClass } from "@/lib/reality/page-state-contract";

export type AccessibilityRequirement =
  | "semantic-landmarks"
  | "keyboard-navigation"
  | "focus-management"
  | "aria-labels"
  | "dialog-focus-trap"
  | "reduced-motion"
  | "contrast-compliance"
  | "screen-reader-states"
  | "accessible-error-copy"
  | "skip-navigation";

export interface AccessibilityBaseline {
  readonly pageClass: PageClass;
  readonly required: readonly AccessibilityRequirement[];
}

export const ACCESSIBILITY_BASELINES: Readonly<Record<PageClass, AccessibilityBaseline>> = {
  "data-list": {
    pageClass: "data-list",
    required: ["semantic-landmarks", "keyboard-navigation", "aria-labels", "screen-reader-states", "accessible-error-copy", "skip-navigation"],
  },
  "data-detail": {
    pageClass: "data-detail",
    required: ["semantic-landmarks", "keyboard-navigation", "aria-labels", "screen-reader-states", "accessible-error-copy"],
  },
  "form": {
    pageClass: "form",
    required: ["semantic-landmarks", "keyboard-navigation", "focus-management", "aria-labels", "accessible-error-copy", "contrast-compliance"],
  },
  "dashboard": {
    pageClass: "dashboard",
    required: ["semantic-landmarks", "keyboard-navigation", "aria-labels", "reduced-motion", "screen-reader-states", "skip-navigation"],
  },
  "auth": {
    pageClass: "auth",
    required: ["semantic-landmarks", "keyboard-navigation", "focus-management", "aria-labels", "accessible-error-copy", "contrast-compliance"],
  },
  "static": {
    pageClass: "static",
    required: ["semantic-landmarks", "skip-navigation", "contrast-compliance"],
  },
};

/** Get accessibility requirements for a page class. */
export function getAccessibilityRequirements(pageClass: PageClass): readonly AccessibilityRequirement[] {
  return ACCESSIBILITY_BASELINES[pageClass].required;
}

/** Evidence source path. */
export const ACCESSIBILITY_EVIDENCE_PATH = "generated/accessibility-summary.json";