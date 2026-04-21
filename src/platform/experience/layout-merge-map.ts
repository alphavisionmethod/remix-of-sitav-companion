// ═══════════════════════════════════════════════════════════════
// SITA OS — Layout Merge Map
// Maps layout patterns to shell/app merge behavior.
// ═══════════════════════════════════════════════════════════════

import type { LayoutPatternId } from "@/lib/frontend/layout-grammar-map";

export interface LayoutMergeEntry {
  readonly patternId: LayoutPatternId;
  readonly shellChromeVisible: boolean;
  readonly activeNavigationSystem: "shell" | "app" | "both" | "none";
  readonly sidebarInteraction: string;
  readonly windowChromeApplies: boolean;
}

export const LAYOUT_MERGE_MAP: readonly LayoutMergeEntry[] = [
  { patternId: "landing",           shellChromeVisible: false, activeNavigationSystem: "app",  sidebarInteraction: "none",                      windowChromeApplies: false },
  { patternId: "auth",              shellChromeVisible: false, activeNavigationSystem: "none", sidebarInteraction: "none",                      windowChromeApplies: false },
  { patternId: "onboarding",        shellChromeVisible: false, activeNavigationSystem: "none", sidebarInteraction: "none",                      windowChromeApplies: false },
  { patternId: "workspace",         shellChromeVisible: true,  activeNavigationSystem: "both", sidebarInteraction: "app sidebar inside window", windowChromeApplies: true },
  { patternId: "admin-operator",    shellChromeVisible: true,  activeNavigationSystem: "both", sidebarInteraction: "app sidebar inside window", windowChromeApplies: true },
  { patternId: "desktop-os",        shellChromeVisible: true,  activeNavigationSystem: "shell",sidebarInteraction: "dock replaces sidebar",     windowChromeApplies: false },
  { patternId: "app-detail",        shellChromeVisible: true,  activeNavigationSystem: "app",  sidebarInteraction: "detail drawer within app",  windowChromeApplies: true },
  { patternId: "settings",          shellChromeVisible: true,  activeNavigationSystem: "both", sidebarInteraction: "settings nav sidebar",      windowChromeApplies: true },
  { patternId: "marketing",         shellChromeVisible: false, activeNavigationSystem: "app",  sidebarInteraction: "none",                      windowChromeApplies: false },
  { patternId: "mobile-optimized",  shellChromeVisible: false, activeNavigationSystem: "app",  sidebarInteraction: "hidden; tab-bar instead",   windowChromeApplies: false },
] as const;

export const LAYOUT_MERGE_COUNT = LAYOUT_MERGE_MAP.length;