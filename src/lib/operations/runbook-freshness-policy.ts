// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Freshness Policy (Wave 21)
// Per-severity freshness windows and stale detection.
// ═══════════════════════════════════════════════════════════════

import type { RunbookSeverity } from "@/lib/support/runbook-types";

export interface FreshnessWindow {
  readonly severity: RunbookSeverity;
  readonly maxDrillAgeDays: number;
  readonly maxReviewAgeDays: number;
  readonly label: string;
}

export const FRESHNESS_WINDOWS: readonly FreshnessWindow[] = [
  { severity: "critical", maxDrillAgeDays: 7, maxReviewAgeDays: 14, label: "Critical — weekly drills, biweekly review" },
  { severity: "high", maxDrillAgeDays: 14, maxReviewAgeDays: 30, label: "High — biweekly drills, monthly review" },
  { severity: "medium", maxDrillAgeDays: 30, maxReviewAgeDays: 60, label: "Medium — monthly drills, quarterly review" },
  { severity: "low", maxDrillAgeDays: 90, maxReviewAgeDays: 180, label: "Low — quarterly drills, semi-annual review" },
];

export interface FreshnessStatus {
  readonly runbookId: string;
  readonly severity: RunbookSeverity;
  readonly lastDrilledAt: string | null;
  readonly lastReviewedAt: string | null;
  readonly drillStale: boolean;
  readonly reviewStale: boolean;
  readonly drillAgeDays: number | null;
  readonly maxDrillAgeDays: number;
}

export const DEPENDENCY_CHANGE_INVALIDATORS: readonly string[] = [
  "Auth provider change",
  "Database schema migration",
  "AI provider addition/removal",
  "Kill-switch policy change",
  "Connector OAuth scope change",
  "RLS policy modification",
  "Release pipeline change",
  "Payment gateway change",
  "Ingress/edge routing change",
];

export function getFreshnessWindow(severity: RunbookSeverity): FreshnessWindow {
  return FRESHNESS_WINDOWS.find((w) => w.severity === severity) ?? FRESHNESS_WINDOWS[2];
}

export function checkFreshness(
  runbookId: string,
  severity: RunbookSeverity,
  lastDrilledAt: string | null,
  lastReviewedAt: string | null,
  now: Date = new Date(),
): FreshnessStatus {
  const window = getFreshnessWindow(severity);
  const drillAgeDays = lastDrilledAt ? Math.floor((now.getTime() - new Date(lastDrilledAt).getTime()) / 86_400_000) : null;
  const reviewAgeDays = lastReviewedAt ? Math.floor((now.getTime() - new Date(lastReviewedAt).getTime()) / 86_400_000) : null;

  return {
    runbookId,
    severity,
    lastDrilledAt,
    lastReviewedAt,
    drillStale: drillAgeDays === null || drillAgeDays > window.maxDrillAgeDays,
    reviewStale: reviewAgeDays === null || reviewAgeDays > window.maxReviewAgeDays,
    drillAgeDays,
    maxDrillAgeDays: window.maxDrillAgeDays,
  };
}