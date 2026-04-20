// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Adaptive Policy
// Breakpoints, touch targets, and adaptive behavior standards.
// ═══════════════════════════════════════════════════════════════

import type { LayoutPatternId } from "./layout-grammar-map";

export interface Breakpoints {
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly xxl: number;
}

export const CANONICAL_BREAKPOINTS: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export const TOUCH_TARGET_MIN_PX = 44;

export type CollapseStrategy = "none" | "hide" | "drawer" | "bottom-sheet" | "tab-bar";

export interface MobileAdaptiveRule {
  readonly layoutPattern: LayoutPatternId;
  readonly sidebarCollapse: CollapseStrategy;
  readonly navCollapse: CollapseStrategy;
  readonly reducedDensity: boolean;
  readonly desktopOnlyFeatures: readonly string[];
  readonly minBreakpoint: keyof Breakpoints | "none";
}

export const MOBILE_ADAPTIVE_RULES: readonly MobileAdaptiveRule[] = [
  { layoutPattern: "landing",          sidebarCollapse: "none",   navCollapse: "drawer",       reducedDensity: false, desktopOnlyFeatures: [],                        minBreakpoint: "none" },
  { layoutPattern: "auth",             sidebarCollapse: "none",   navCollapse: "none",         reducedDensity: false, desktopOnlyFeatures: [],                        minBreakpoint: "none" },
  { layoutPattern: "onboarding",       sidebarCollapse: "none",   navCollapse: "none",         reducedDensity: false, desktopOnlyFeatures: [],                        minBreakpoint: "none" },
  { layoutPattern: "workspace",        sidebarCollapse: "drawer", navCollapse: "drawer",       reducedDensity: false, desktopOnlyFeatures: [],                        minBreakpoint: "none" },
  { layoutPattern: "admin-operator",   sidebarCollapse: "hide",   navCollapse: "drawer",       reducedDensity: true,  desktopOnlyFeatures: ["multi-panel", "charts"], minBreakpoint: "lg" },
  { layoutPattern: "desktop-os",       sidebarCollapse: "none",   navCollapse: "none",         reducedDensity: false, desktopOnlyFeatures: ["window-management", "dock", "drag-resize"], minBreakpoint: "lg" },
  { layoutPattern: "app-detail",       sidebarCollapse: "none",   navCollapse: "none",         reducedDensity: false, desktopOnlyFeatures: ["floating-window"],        minBreakpoint: "md" },
  { layoutPattern: "settings",         sidebarCollapse: "drawer", navCollapse: "drawer",       reducedDensity: false, desktopOnlyFeatures: [],                        minBreakpoint: "none" },
  { layoutPattern: "marketing",        sidebarCollapse: "none",   navCollapse: "drawer",       reducedDensity: false, desktopOnlyFeatures: [],                        minBreakpoint: "none" },
  { layoutPattern: "mobile-optimized", sidebarCollapse: "none",   navCollapse: "tab-bar",      reducedDensity: true,  desktopOnlyFeatures: [],                        minBreakpoint: "none" },
] as const;

/** Get mobile adaptive rule for a layout pattern. */
export function getMobileRule(pattern: LayoutPatternId): MobileAdaptiveRule | undefined {
  return MOBILE_ADAPTIVE_RULES.find(r => r.layoutPattern === pattern);
}