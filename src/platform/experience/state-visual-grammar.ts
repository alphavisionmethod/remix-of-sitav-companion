// ═══════════════════════════════════════════════════════════════
// SITA OS — State Visual Grammar
// Maps all 13 ProductState values to concrete visual tokens.
// Shell and app surfaces MUST render identical state presentations.
// ═══════════════════════════════════════════════════════════════

import type { ProductState } from "@/platform/product/state-grammar";

export type StateColorToken = "info" | "warning" | "error" | "muted" | "success" | "accent";
export type StateAnimation = "none" | "pulse" | "spin" | "fade-in" | "shimmer";
export type StateSurfaceTreatment = "muted-bg" | "bordered-card" | "overlay" | "inline-banner" | "full-page" | "skeleton";

export interface StateVisualMapping {
  readonly state: ProductState;
  readonly colorToken: StateColorToken;
  readonly surfaceTreatment: StateSurfaceTreatment;
  readonly animation: StateAnimation;
  readonly badgeVariant: string;
  readonly canonicalComponentRef: string;
  readonly iconRef: string;
}

export const STATE_VISUAL_MAP: Record<ProductState, StateVisualMapping> = {
  "loading":             { state: "loading",             colorToken: "muted",   surfaceTreatment: "skeleton",       animation: "shimmer",  badgeVariant: "secondary",    canonicalComponentRef: "PageSkeleton / SectionSkeleton",    iconRef: "loader" },
  "empty":               { state: "empty",               colorToken: "muted",   surfaceTreatment: "full-page",      animation: "fade-in",  badgeVariant: "secondary",    canonicalComponentRef: "EmptyState / EmptyStateCTA",        iconRef: "inbox" },
  "error":               { state: "error",               colorToken: "error",   surfaceTreatment: "bordered-card",  animation: "none",     badgeVariant: "destructive",  canonicalComponentRef: "ErrorBoundary",                     iconRef: "alert-circle" },
  "blocked":             { state: "blocked",             colorToken: "warning", surfaceTreatment: "bordered-card",  animation: "none",     badgeVariant: "warning",      canonicalComponentRef: "DegradedStatePanel",                iconRef: "shield-off" },
  "degraded":            { state: "degraded",            colorToken: "warning", surfaceTreatment: "inline-banner",  animation: "none",     badgeVariant: "warning",      canonicalComponentRef: "DegradedStateBanner",               iconRef: "alert-triangle" },
  "recovering":          { state: "recovering",          colorToken: "info",    surfaceTreatment: "inline-banner",  animation: "pulse",    badgeVariant: "secondary",    canonicalComponentRef: "DegradedStateBanner (recovering)",  iconRef: "refresh-cw" },
  "ready":               { state: "ready",               colorToken: "success", surfaceTreatment: "muted-bg",       animation: "none",     badgeVariant: "default",      canonicalComponentRef: "(normal render)",                    iconRef: "check-circle" },
  "attention-required":  { state: "attention-required",  colorToken: "accent",  surfaceTreatment: "inline-banner",  animation: "pulse",    badgeVariant: "warning",      canonicalComponentRef: "InlineBanner",                      iconRef: "bell" },
  "stale-data":          { state: "stale-data",          colorToken: "muted",   surfaceTreatment: "inline-banner",  animation: "none",     badgeVariant: "outline",      canonicalComponentRef: "StaleBanner",                       iconRef: "clock" },
  "permission-required": { state: "permission-required", colorToken: "warning", surfaceTreatment: "bordered-card",  animation: "none",     badgeVariant: "warning",      canonicalComponentRef: "PermissionGate",                    iconRef: "lock" },
  "evidence-required":   { state: "evidence-required",   colorToken: "accent",  surfaceTreatment: "bordered-card",  animation: "none",     badgeVariant: "outline",      canonicalComponentRef: "EvidenceRequiredPanel",             iconRef: "file-check" },
  "offline":             { state: "offline",             colorToken: "warning", surfaceTreatment: "overlay",        animation: "none",     badgeVariant: "destructive",  canonicalComponentRef: "OfflineBanner",                     iconRef: "wifi-off" },
  "maintenance":         { state: "maintenance",         colorToken: "info",    surfaceTreatment: "full-page",      animation: "none",     badgeVariant: "secondary",    canonicalComponentRef: "MaintenancePage",                   iconRef: "wrench" },
} as const;

export const STATE_VISUAL_COUNT = Object.keys(STATE_VISUAL_MAP).length;

export function getStateVisual(state: ProductState): StateVisualMapping {
  return STATE_VISUAL_MAP[state];
}