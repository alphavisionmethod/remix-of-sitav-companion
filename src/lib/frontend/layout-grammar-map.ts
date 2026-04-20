// ═══════════════════════════════════════════════════════════════
// SITA OS — Layout Grammar Map
// Canonical layout patterns for all page families.
// ═══════════════════════════════════════════════════════════════

export type LayoutPatternId =
  | "landing"
  | "auth"
  | "onboarding"
  | "workspace"
  | "admin-operator"
  | "desktop-os"
  | "app-detail"
  | "settings"
  | "marketing"
  | "mobile-optimized";

export type NavRole = "none" | "top-bar" | "sidebar" | "shell-menu-bar" | "tab-bar";
export type SidebarBehavior = "none" | "persistent" | "collapsible" | "drawer-on-mobile";
export type MobileAdaptation = "responsive" | "stack" | "drawer-nav" | "hide-sidebar" | "desktop-only";

export interface LayoutGrammarEntry {
  readonly patternId: LayoutPatternId;
  readonly description: string;
  readonly shellComponent: string;
  readonly navRole: NavRole;
  readonly sidebarBehavior: SidebarBehavior;
  readonly mobileAdaptation: MobileAdaptation;
  readonly supportsFullBleed: boolean;
}

export const LAYOUT_GRAMMAR_MAP: readonly LayoutGrammarEntry[] = [
  {
    patternId: "landing",
    description: "Public pages, no auth, no sidebar",
    shellComponent: "PublicLayout",
    navRole: "top-bar",
    sidebarBehavior: "none",
    mobileAdaptation: "responsive",
    supportsFullBleed: true,
  },
  {
    patternId: "auth",
    description: "Centered auth card (login/signup/recovery)",
    shellComponent: "AuthLayout",
    navRole: "none",
    sidebarBehavior: "none",
    mobileAdaptation: "stack",
    supportsFullBleed: false,
  },
  {
    patternId: "onboarding",
    description: "Stepper flow for account setup",
    shellComponent: "OnboardingLayout",
    navRole: "none",
    sidebarBehavior: "none",
    mobileAdaptation: "stack",
    supportsFullBleed: false,
  },
  {
    patternId: "workspace",
    description: "Sidebar + main content (standard product pages)",
    shellComponent: "AppSidebar",
    navRole: "sidebar",
    sidebarBehavior: "collapsible",
    mobileAdaptation: "drawer-nav",
    supportsFullBleed: false,
  },
  {
    patternId: "admin-operator",
    description: "Admin control plane with tab navigation",
    shellComponent: "AdminControlPlaneShell",
    navRole: "sidebar",
    sidebarBehavior: "persistent",
    mobileAdaptation: "hide-sidebar",
    supportsFullBleed: false,
  },
  {
    patternId: "desktop-os",
    description: "Full desktop OS simulation (ShellComposer)",
    shellComponent: "ShellComposer",
    navRole: "shell-menu-bar",
    sidebarBehavior: "none",
    mobileAdaptation: "desktop-only",
    supportsFullBleed: true,
  },
  {
    patternId: "app-detail",
    description: "Floating window for app-backed pages",
    shellComponent: "FloatingWindow",
    navRole: "none",
    sidebarBehavior: "none",
    mobileAdaptation: "stack",
    supportsFullBleed: false,
  },
  {
    patternId: "settings",
    description: "Settings sidebar + tabbed content",
    shellComponent: "SettingsLayout",
    navRole: "sidebar",
    sidebarBehavior: "collapsible",
    mobileAdaptation: "drawer-nav",
    supportsFullBleed: false,
  },
  {
    patternId: "marketing",
    description: "Full-width marketing sections",
    shellComponent: "PublicLayout",
    navRole: "top-bar",
    sidebarBehavior: "none",
    mobileAdaptation: "responsive",
    supportsFullBleed: true,
  },
  {
    patternId: "mobile-optimized",
    description: "Stack layout, no sidebar, touch-optimized",
    shellComponent: "MobileLayout",
    navRole: "tab-bar",
    sidebarBehavior: "none",
    mobileAdaptation: "stack",
    supportsFullBleed: false,
  },
] as const;

/** Total canonical layout patterns. */
export const LAYOUT_PATTERN_COUNT = LAYOUT_GRAMMAR_MAP.length;

/** Look up a layout pattern by ID. */
export function getLayoutPattern(id: LayoutPatternId): LayoutGrammarEntry | undefined {
  return LAYOUT_GRAMMAR_MAP.find(l => l.patternId === id);
}