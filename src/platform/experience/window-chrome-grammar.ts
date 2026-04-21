// ═══════════════════════════════════════════════════════════════
// SITA OS — Window / Panel / App Chrome Grammar
// Unifies chrome across windows, panels, modals, and shell surfaces.
// ═══════════════════════════════════════════════════════════════

export type ChromeSurface = "window" | "panel" | "modal" | "drawer" | "dock" | "menu-bar" | "context-menu" | "overlay";

export interface ChromeSpec {
  readonly surfaceType: ChromeSurface;
  readonly description: string;
  readonly cornerRadius: number;
  readonly titleBarHeight: number | null;
  readonly toolbarHeight: number | null;
  readonly backdropBlur: string;
  readonly materialRef: string;
  readonly shadowRef: string;
  readonly borderTreatment: string;
  readonly depthLayer: string;
  readonly sharedProperties: readonly string[];
  readonly intentionalDifferences: readonly string[];
}

export const CHROME_SPECS: Record<ChromeSurface, ChromeSpec> = {
  window: {
    surfaceType: "window",
    description: "App windows (FloatingWindow, AppWindow) — canonical chrome",
    cornerRadius: 16,
    titleBarHeight: 40,
    toolbarHeight: 36,
    backdropBlur: "backdrop-blur-2xl",
    materialRef: "APP_MATERIALS.windowBg + MATERIALS.frostedGlass",
    shadowRef: "APP_SHADOWS.focused / APP_SHADOWS.unfocused",
    borderTreatment: "APP_MATERIALS.windowBorder (1px)",
    depthLayer: "DEPTH_LAYERS.windows (z=20)",
    sharedProperties: ["cornerRadius", "borderTreatment", "titleBarHeight"],
    intentionalDifferences: ["shadow intensity varies by focus state"],
  },
  panel: {
    surfaceType: "panel",
    description: "Side panels, detail drawers within app windows",
    cornerRadius: 16,
    titleBarHeight: null,
    toolbarHeight: 36,
    backdropBlur: "backdrop-blur-lg",
    materialRef: "APP_MATERIALS.sidebarBg",
    shadowRef: "SURFACE_TOKENS[1].shadow",
    borderTreatment: "APP_MATERIALS.sidebarBorder",
    depthLayer: "Within parent window (z inherited)",
    sharedProperties: ["cornerRadius", "toolbarHeight"],
    intentionalDifferences: ["lower backdrop blur", "lighter shadow"],
  },
  modal: {
    surfaceType: "modal",
    description: "Dialogs, confirmation prompts — shadcn Dialog + glassmorphic overlay",
    cornerRadius: 16,
    titleBarHeight: null,
    toolbarHeight: null,
    backdropBlur: "backdrop-blur-md",
    materialRef: "MATERIALS.frostedGlass (overlay backdrop)",
    shadowRef: "SURFACE_TOKENS[3].shadow",
    borderTreatment: "SURFACE_TOKENS[3] border (0.10 opacity)",
    depthLayer: "DEPTH_LAYERS.overlay (z=40)",
    sharedProperties: ["cornerRadius"],
    intentionalDifferences: ["full-screen backdrop", "highest shadow elevation"],
  },
  drawer: {
    surfaceType: "drawer",
    description: "Slide-out panels (detail, settings, help)",
    cornerRadius: 16,
    titleBarHeight: null,
    toolbarHeight: 36,
    backdropBlur: "backdrop-blur-lg",
    materialRef: "APP_MATERIALS.sidebarBg",
    shadowRef: "APP_SHADOWS.focused",
    borderTreatment: "APP_MATERIALS.sidebarBorder",
    depthLayer: "DEPTH_LAYERS.overlay (z=40) or within window",
    sharedProperties: ["cornerRadius", "toolbarHeight", "borderTreatment"],
    intentionalDifferences: ["slides from edge", "may overlay or embed"],
  },
  dock: {
    surfaceType: "dock",
    description: "Focus dock / app launcher bar",
    cornerRadius: 20,
    titleBarHeight: null,
    toolbarHeight: null,
    backdropBlur: "backdrop-blur-xl",
    materialRef: "MATERIALS.glass",
    shadowRef: "NOVA_SHADOWS.window (if defined) or APP_SHADOWS.focused",
    borderTreatment: "MATERIALS.glass border (0.30 light / 0.10 dark)",
    depthLayer: "DEPTH_LAYERS.dock (z=25)",
    sharedProperties: ["backdropBlur treatment"],
    intentionalDifferences: ["higher cornerRadius (pill shape)", "glassmorphic material"],
  },
  "menu-bar": {
    surfaceType: "menu-bar",
    description: "System menu bar (top of screen)",
    cornerRadius: 0,
    titleBarHeight: 28,
    toolbarHeight: null,
    backdropBlur: "backdrop-blur-md saturate-[1.8]",
    materialRef: "MATERIALS.menuBar",
    shadowRef: "none",
    borderTreatment: "none (full-width)",
    depthLayer: "DEPTH_LAYERS.menuBar (z=30)",
    sharedProperties: [],
    intentionalDifferences: ["no corner radius", "no shadow", "full-width", "highest non-overlay z-index"],
  },
  "context-menu": {
    surfaceType: "context-menu",
    description: "Right-click context menus",
    cornerRadius: 12,
    titleBarHeight: null,
    toolbarHeight: null,
    backdropBlur: "backdrop-blur-xl",
    materialRef: "MATERIALS.frostedGlass",
    shadowRef: "SURFACE_TOKENS[3].shadow",
    borderTreatment: "SURFACE_TOKENS[2] border",
    depthLayer: "DEPTH_LAYERS.contextMenu (z=50)",
    sharedProperties: ["backdropBlur"],
    intentionalDifferences: ["smaller radius", "highest z-index", "ephemeral"],
  },
  overlay: {
    surfaceType: "overlay",
    description: "Command palette, notification dropdown, control center overlays",
    cornerRadius: 16,
    titleBarHeight: null,
    toolbarHeight: null,
    backdropBlur: "backdrop-blur-2xl",
    materialRef: "MATERIALS.frostedGlass",
    shadowRef: "APP_SHADOWS.focused",
    borderTreatment: "APP_MATERIALS.windowBorder",
    depthLayer: "DEPTH_LAYERS.overlay (z=40)",
    sharedProperties: ["cornerRadius", "borderTreatment"],
    intentionalDifferences: ["floating position", "dismiss on outside click"],
  },
} as const;

export const CHROME_SURFACE_COUNT = Object.keys(CHROME_SPECS).length;

/** Canonical shared chrome values across all surfaces */
export const SHARED_CHROME_DEFAULTS = {
  defaultCornerRadius: 16,
  defaultToolbarHeight: 36,
  defaultTitleBarHeight: 40,
  trafficLightSize: 12,
  trafficLightSpacing: 8,
  accentStripHeight: 2,
} as const;