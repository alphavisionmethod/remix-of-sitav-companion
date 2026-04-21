// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell ↔ App Merge Grammar
// How apps appear, embed, and behave within the OS shell.
// ═══════════════════════════════════════════════════════════════

export type ShellMode = "desktop-windowed" | "desktop-fullscreen" | "browser-web" | "mobile";

export interface ShellAppMergeRule {
  readonly mode: ShellMode;
  readonly description: string;
  readonly shellChromeVisible: boolean;
  readonly menuBarVisible: boolean;
  readonly dockBehavior: "visible" | "auto-hide" | "hidden";
  readonly windowChromeVisible: boolean;
  readonly appContainerRef: string;
  readonly navigationSystem: string;
  readonly sidebarBehavior: string;
  readonly depthLayerRange: string;
}

export const SHELL_APP_MERGE_RULES: readonly ShellAppMergeRule[] = [
  {
    mode: "desktop-windowed",
    description: "App inside FloatingWindow/AppWindow with full shell chrome",
    shellChromeVisible: true,
    menuBarVisible: true,
    dockBehavior: "visible",
    windowChromeVisible: true,
    appContainerRef: "FloatingWindow / AppWindow",
    navigationSystem: "Shell: SystemMenuBar + Dock; App: internal sidebar/tabs",
    sidebarBehavior: "App sidebar inside window; shell sidebar is dock",
    depthLayerRange: "App content at z=20; app modals at z=21-24",
  },
  {
    mode: "desktop-fullscreen",
    description: "App takes viewport below menu bar; dock auto-hides",
    shellChromeVisible: true,
    menuBarVisible: true,
    dockBehavior: "auto-hide",
    windowChromeVisible: false,
    appContainerRef: "DomainAppShell (fullscreen variant)",
    navigationSystem: "Shell: SystemMenuBar only; App: full sidebar + toolbar",
    sidebarBehavior: "App sidebar persistent; replaces dock as primary nav",
    depthLayerRange: "App content at z=10; shell overlays at z=30+",
  },
  {
    mode: "browser-web",
    description: "Route-based rendering without OS shell; DomainAppShell as container",
    shellChromeVisible: false,
    menuBarVisible: false,
    dockBehavior: "hidden",
    windowChromeVisible: false,
    appContainerRef: "DomainAppShell (web variant)",
    navigationSystem: "App: top-bar or sidebar based on layout-grammar-map pattern",
    sidebarBehavior: "Collapsible sidebar or drawer-on-mobile per layout grammar",
    depthLayerRange: "Standard stacking; no shell depth layers",
  },
  {
    mode: "mobile",
    description: "Stacked layout with tab-bar; no window chrome",
    shellChromeVisible: false,
    menuBarVisible: false,
    dockBehavior: "hidden",
    windowChromeVisible: false,
    appContainerRef: "MobileShell",
    navigationSystem: "App: MobileTabBar at bottom; no shell navigation",
    sidebarBehavior: "Hidden; drawer-on-demand only",
    depthLayerRange: "Standard mobile stacking",
  },
] as const;

// ── Embedding Rules ─────────────────────────────────────────────

export interface EmbeddingRule {
  readonly ruleId: string;
  readonly description: string;
  readonly enforcement: "block" | "advisory";
}

export const EMBEDDING_RULES: readonly EmbeddingRule[] = [
  { ruleId: "no-depth-override",      description: "App cannot override shell DEPTH_LAYERS z-index values",                    enforcement: "block" },
  { ruleId: "command-merge",          description: "App commands register into global CommandPalette via command registry",     enforcement: "block" },
  { ruleId: "notification-routing",   description: "App notifications route through shell NotificationCenter",                 enforcement: "block" },
  { ruleId: "shared-trust-grammar",   description: "App trust badges use shared TRUST_BADGES from trust-explanation-layer",    enforcement: "block" },
  { ruleId: "shared-state-grammar",   description: "App state rendering uses shared STATE_METADATA_DEFAULTS",                  enforcement: "block" },
  { ruleId: "shell-shortcut-priority",description: "Shell global shortcuts (⌘K, ⌘W, ⌃⌘Q) take priority over app shortcuts",   enforcement: "block" },
  { ruleId: "domain-accent-only",     description: "Apps may only vary accent color via DOMAIN_ATMOSPHERE; not base palette",  enforcement: "advisory" },
  { ruleId: "consistent-motion",      description: "Apps should use shared NOVA_MOTION spring defaults",                       enforcement: "advisory" },
] as const;

export const SHELL_APP_MERGE_GRAMMAR = {
  modes: SHELL_APP_MERGE_RULES,
  embeddingRules: EMBEDDING_RULES,
  modeCount: SHELL_APP_MERGE_RULES.length,
  embeddingRuleCount: EMBEDDING_RULES.length,
} as const;