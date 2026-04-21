// ═══════════════════════════════════════════════════════════════
// SITA OS — OS ↔ App Experience Contract
// Canonical contract defining how OS shell and app surfaces relate
// visually, structurally, and behaviorally.
// ═══════════════════════════════════════════════════════════════

export type ExperienceLayer = "shell" | "app" | "shared";

export interface SurfaceOwnership {
  readonly surfaceId: string;
  readonly layer: ExperienceLayer;
  readonly description: string;
  readonly componentRef: string;
}

/** Shell layer owns these surfaces */
export const SHELL_OWNED_SURFACES: readonly SurfaceOwnership[] = [
  { surfaceId: "desktop",              layer: "shell", description: "Desktop wallpaper and widget canvas",         componentRef: "SitaDesktop" },
  { surfaceId: "dock",                 layer: "shell", description: "Focus dock / app launcher bar",              componentRef: "FocusDock" },
  { surfaceId: "menu-bar",             layer: "shell", description: "System menu bar (macOS-style)",              componentRef: "SystemMenuBar" },
  { surfaceId: "control-center",       layer: "shell", description: "Quick-access system controls",              componentRef: "ControlCenter" },
  { surfaceId: "window-compositor",    layer: "shell", description: "Window render and z-order layer",            componentRef: "WindowCompositor" },
  { surfaceId: "notification-dropdown",layer: "shell", description: "Global notification dropdown",              componentRef: "NotificationDropdown" },
  { surfaceId: "command-palette",      layer: "shell", description: "Global command palette (⌘K)",               componentRef: "CommandPalette" },
  { surfaceId: "context-menu",         layer: "shell", description: "Surface-aware right-click menus",           componentRef: "SurfaceContextMenu" },
  { surfaceId: "lock-screen",          layer: "shell", description: "Lock screen overlay",                       componentRef: "LockScreen" },
  { surfaceId: "widget-gallery",       layer: "shell", description: "Widget picker overlay",                     componentRef: "WidgetGallery" },
] as const;

/** App layer owns these surfaces */
export const APP_OWNED_SURFACES: readonly SurfaceOwnership[] = [
  { surfaceId: "app-sidebar",          layer: "app",   description: "In-app sidebar navigation",                 componentRef: "AppSidebarNav" },
  { surfaceId: "app-toolbar",          layer: "app",   description: "App-level toolbar / action bar",            componentRef: "AppToolbar" },
  { surfaceId: "app-content",          layer: "app",   description: "Primary domain content area",               componentRef: "DomainContent" },
  { surfaceId: "domain-command",       layer: "app",   description: "Domain-scoped command palette",             componentRef: "DomainCommandPalette" },
  { surfaceId: "app-settings",         layer: "app",   description: "In-app settings panels",                   componentRef: "AppSettingsPanel" },
  { surfaceId: "app-detail-drawer",    layer: "app",   description: "Detail drawer / side panel",                componentRef: "DetailDrawer" },
] as const;

/** Shared system primitives used by both layers */
export const SHARED_SYSTEM_SURFACES: readonly SurfaceOwnership[] = [
  { surfaceId: "surface-hierarchy",    layer: "shared", description: "4-level surface material hierarchy (0-3)",  componentRef: "SURFACE_TOKENS" },
  { surfaceId: "trust-badges",         layer: "shared", description: "Trust/provenance badges",                   componentRef: "TrustBadge" },
  { surfaceId: "state-grammar",        layer: "shared", description: "13 canonical product states",               componentRef: "STATE_METADATA_DEFAULTS" },
  { surfaceId: "typography-scale",     layer: "shared", description: "Shared type scale (SITA_TYPE + APP_TYPE)",  componentRef: "SITA_TYPE" },
  { surfaceId: "motion-system",        layer: "shared", description: "Shared spring/duration configs",            componentRef: "NOVA_MOTION" },
  { surfaceId: "domain-atmosphere",    layer: "shared", description: "Per-domain accent/tone palette",            componentRef: "DOMAIN_ATMOSPHERE" },
  { surfaceId: "status-primitives",    layer: "shared", description: "StatusBadge, StateBadge, etc.",             componentRef: "StatusBadge" },
] as const;

// ── Merge Rules ─────────────────────────────────────────────────

export interface MergeRule {
  readonly ruleId: string;
  readonly description: string;
  readonly shellBehavior: string;
  readonly appBehavior: string;
}

export const MERGE_RULES: readonly MergeRule[] = [
  {
    ruleId: "fullscreen-yield",
    description: "When app enters fullscreen, shell chrome yields except menu bar",
    shellBehavior: "Menu bar persists; dock auto-hides; desktop hidden",
    appBehavior: "App takes remaining viewport below menu bar",
  },
  {
    ruleId: "notification-routing",
    description: "All notifications route through shell notification center",
    shellBehavior: "NotificationCenter aggregates all notifications",
    appBehavior: "Apps emit notifications via shared notification API; in-app toasts allowed for transient feedback",
  },
  {
    ruleId: "command-merge",
    description: "App commands merge into global command palette",
    shellBehavior: "CommandPalette shows system + app commands; app-scoped commands grouped under domain header",
    appBehavior: "Apps register commands via command registry; domain palettes are sub-scopes of global palette",
  },
  {
    ruleId: "focus-transfer",
    description: "Focus transfers between shell and app cleanly",
    shellBehavior: "Shell captures global shortcuts (⌘K, ⌘W, ⌃⌘Q) before app",
    appBehavior: "App receives all other keyboard input when focused",
  },
  {
    ruleId: "depth-layer-respect",
    description: "Apps cannot override shell depth layers",
    shellBehavior: "Shell controls z-index via DEPTH_LAYERS (dock=25, menuBar=30, overlay=40)",
    appBehavior: "App content renders within windows layer (z=20); app modals use z=21-24 max",
  },
  {
    ruleId: "search-scoping",
    description: "Search results scoped by context",
    shellBehavior: "Global search returns cross-domain results",
    appBehavior: "In-app search scoped to current domain; results can elevate to global via prefix",
  },
] as const;

// ── Context Handoff ─────────────────────────────────────────────

export interface ContextHandoff {
  readonly handoffId: string;
  readonly from: ExperienceLayer;
  readonly to: ExperienceLayer;
  readonly trigger: string;
  readonly dataTransferred: string;
}

export const CONTEXT_HANDOFFS: readonly ContextHandoff[] = [
  { handoffId: "app-launch",         from: "shell", to: "app",   trigger: "Dock click / desktop icon double-click", dataTransferred: "appId, initial route, window position" },
  { handoffId: "app-close",          from: "app",   to: "shell", trigger: "Window close button / ⌘W",               dataTransferred: "unsaved state warning, last position" },
  { handoffId: "notification-click", from: "shell", to: "app",   trigger: "Click notification in dropdown",         dataTransferred: "target appId, deep-link route, context" },
  { handoffId: "search-navigate",    from: "shell", to: "app",   trigger: "Select search result from command palette", dataTransferred: "target appId, route, search query" },
  { handoffId: "settings-navigate",  from: "shell", to: "app",   trigger: "Shell settings links to app-specific settings", dataTransferred: "settings section, appId" },
] as const;

// ── Contract Summary ────────────────────────────────────────────

export const OS_APP_EXPERIENCE_CONTRACT = {
  shellSurfaces: SHELL_OWNED_SURFACES,
  appSurfaces: APP_OWNED_SURFACES,
  sharedSurfaces: SHARED_SYSTEM_SURFACES,
  mergeRules: MERGE_RULES,
  contextHandoffs: CONTEXT_HANDOFFS,
  totalSurfaces: SHELL_OWNED_SURFACES.length + APP_OWNED_SURFACES.length + SHARED_SYSTEM_SURFACES.length,
} as const;