// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Surface Map
// Maps which shell elements compose each surface
// References: existing shell components
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/packages/contracts/runtime/unified-surface-runtime";

// ── Shell Elements ───────────────────────────────────────────

export type ShellElement =
  | "taskbar" | "dock" | "sidebar" | "launcher"
  | "notification-center" | "control-center" | "status-bar"
  | "menu-bar" | "command-palette" | "search-overlay"
  | "widget-grid" | "desktop-canvas" | "context-menu"
  | "window-switcher" | "apps-rail" | "focus-indicator";

export type ShellVisibility = "always" | "auto-hide" | "on-demand" | "never";
export type ShellPosition = "top" | "bottom" | "left" | "right" | "floating" | "overlay";

export interface ShellElementConfig {
  element: ShellElement;
  visibility: ShellVisibility;
  position: ShellPosition;
  draggable: boolean;
  resizable: boolean;
  zLayer: number;
  component: string;
}

export interface ShellSurfaceEntry {
  surfaceId: SurfaceId;
  elements: ShellElementConfig[];
  layoutMode: "windowed" | "stacked" | "tabbed" | "single-app";
  supportsWorkspaces: boolean;
  maxWorkspaces: number;
}

// ── Map ──────────────────────────────────────────────────────

export const SHELL_SURFACE_MAP: Record<SurfaceId, ShellSurfaceEntry> = {
  web: {
    surfaceId: "web",
    elements: [
      { element: "dock", visibility: "auto-hide", position: "bottom", draggable: false, resizable: false, zLayer: 9000, component: "FocusDock" },
      { element: "sidebar", visibility: "always", position: "left", draggable: false, resizable: false, zLayer: 8000, component: "AppSidebar" },
      { element: "launcher", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9500, component: "AppLauncherPanel" },
      { element: "notification-center", visibility: "on-demand", position: "right", draggable: false, resizable: false, zLayer: 9200, component: "NotificationCenter" },
      { element: "command-palette", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9800, component: "CommandPalette" },
      { element: "search-overlay", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9700, component: "SearchOverlay" },
      { element: "widget-grid", visibility: "always", position: "floating", draggable: true, resizable: true, zLayer: 500, component: "WidgetGrid" },
      { element: "desktop-canvas", visibility: "always", position: "floating", draggable: false, resizable: false, zLayer: 0, component: "DesktopCanvas" },
      { element: "apps-rail", visibility: "always", position: "left", draggable: true, resizable: false, zLayer: 600, component: "DesktopLeftRail" },
      { element: "context-menu", visibility: "on-demand", position: "floating", draggable: false, resizable: false, zLayer: 9900, component: "ContextMenu" },
      { element: "status-bar", visibility: "always", position: "top", draggable: false, resizable: false, zLayer: 8500, component: "StatusBar" },
    ],
    layoutMode: "windowed",
    supportsWorkspaces: true,
    maxWorkspaces: 4,
  },
  admin: {
    surfaceId: "admin",
    elements: [
      { element: "sidebar", visibility: "always", position: "left", draggable: false, resizable: false, zLayer: 8000, component: "AdminSidebar" },
      { element: "command-palette", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9800, component: "CommandPalette" },
      { element: "notification-center", visibility: "on-demand", position: "right", draggable: false, resizable: false, zLayer: 9200, component: "NotificationCenter" },
      { element: "status-bar", visibility: "always", position: "top", draggable: false, resizable: false, zLayer: 8500, component: "AdminHeader" },
    ],
    layoutMode: "stacked",
    supportsWorkspaces: false,
    maxWorkspaces: 1,
  },
  desktop: {
    surfaceId: "desktop",
    elements: [
      { element: "dock", visibility: "auto-hide", position: "bottom", draggable: false, resizable: false, zLayer: 9000, component: "FocusDock" },
      { element: "sidebar", visibility: "always", position: "left", draggable: false, resizable: true, zLayer: 8000, component: "AppSidebar" },
      { element: "launcher", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9500, component: "AppLauncherPanel" },
      { element: "notification-center", visibility: "on-demand", position: "right", draggable: false, resizable: false, zLayer: 9200, component: "NotificationCenter" },
      { element: "control-center", visibility: "on-demand", position: "right", draggable: false, resizable: false, zLayer: 9300, component: "ControlCenter" },
      { element: "menu-bar", visibility: "always", position: "top", draggable: false, resizable: false, zLayer: 8800, component: "DesktopMenuBar" },
      { element: "command-palette", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9800, component: "CommandPalette" },
      { element: "widget-grid", visibility: "always", position: "floating", draggable: true, resizable: true, zLayer: 500, component: "WidgetGrid" },
      { element: "desktop-canvas", visibility: "always", position: "floating", draggable: false, resizable: false, zLayer: 0, component: "DesktopCanvas" },
      { element: "window-switcher", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9600, component: "WindowSwitcher" },
      { element: "context-menu", visibility: "on-demand", position: "floating", draggable: false, resizable: false, zLayer: 9900, component: "ContextMenu" },
    ],
    layoutMode: "windowed",
    supportsWorkspaces: true,
    maxWorkspaces: 8,
  },
  mobile: {
    surfaceId: "mobile",
    elements: [
      { element: "status-bar", visibility: "always", position: "top", draggable: false, resizable: false, zLayer: 9000, component: "MobileStatusBar" },
      { element: "dock", visibility: "always", position: "bottom", draggable: false, resizable: false, zLayer: 8000, component: "MobileTabBar" },
      { element: "notification-center", visibility: "on-demand", position: "overlay", draggable: false, resizable: false, zLayer: 9200, component: "MobileNotifications" },
    ],
    layoutMode: "single-app",
    supportsWorkspaces: false,
    maxWorkspaces: 1,
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getShellElements(surfaceId: SurfaceId): ShellElementConfig[] {
  return SHELL_SURFACE_MAP[surfaceId].elements;
}

export function getVisibleElements(surfaceId: SurfaceId): ShellElementConfig[] {
  return SHELL_SURFACE_MAP[surfaceId].elements.filter(e => e.visibility !== "never");
}

export function hasShellElement(surfaceId: SurfaceId, element: ShellElement): boolean {
  return SHELL_SURFACE_MAP[surfaceId].elements.some(e => e.element === element);
}

export function getLayoutMode(surfaceId: SurfaceId): ShellSurfaceEntry["layoutMode"] {
  return SHELL_SURFACE_MAP[surfaceId].layoutMode;
}
