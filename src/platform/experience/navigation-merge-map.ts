// ═══════════════════════════════════════════════════════════════
// SITA OS — Navigation Merge Map
// How shell nav and app nav coexist across modes.
// ═══════════════════════════════════════════════════════════════

export interface NavigationMergeEntry {
  readonly surfaceId: string;
  readonly layer: "shell" | "app";
  readonly componentRef: string;
  readonly visibleInModes: readonly string[];
  readonly coexistsWith: readonly string[];
  readonly priority: number;
}

export const NAVIGATION_MERGE_MAP: readonly NavigationMergeEntry[] = [
  { surfaceId: "system-menu-bar",  layer: "shell", componentRef: "SystemMenuBar",     visibleInModes: ["desktop-windowed", "desktop-fullscreen"], coexistsWith: ["app-sidebar", "app-toolbar"], priority: 1 },
  { surfaceId: "focus-dock",       layer: "shell", componentRef: "FocusDock",          visibleInModes: ["desktop-windowed"],                       coexistsWith: ["app-sidebar"],                priority: 2 },
  { surfaceId: "desktop-icons",    layer: "shell", componentRef: "DesktopIconGrid",    visibleInModes: ["desktop-windowed"],                       coexistsWith: [],                             priority: 3 },
  { surfaceId: "app-sidebar",      layer: "app",   componentRef: "AppSidebarNav",      visibleInModes: ["desktop-windowed", "desktop-fullscreen", "browser-web"], coexistsWith: ["system-menu-bar", "focus-dock"], priority: 4 },
  { surfaceId: "app-toolbar",      layer: "app",   componentRef: "AppToolbar",          visibleInModes: ["desktop-windowed", "desktop-fullscreen", "browser-web"], coexistsWith: ["system-menu-bar"],             priority: 5 },
  { surfaceId: "app-tab-groups",   layer: "app",   componentRef: "AppTabGroup",         visibleInModes: ["desktop-windowed", "desktop-fullscreen", "browser-web"], coexistsWith: ["app-sidebar"],                 priority: 6 },
  { surfaceId: "app-breadcrumbs",  layer: "app",   componentRef: "AppBreadcrumbs",      visibleInModes: ["desktop-windowed", "desktop-fullscreen", "browser-web"], coexistsWith: ["app-toolbar"],                 priority: 7 },
  { surfaceId: "mobile-tab-bar",   layer: "app",   componentRef: "MobileTabBar",        visibleInModes: ["mobile"],                                coexistsWith: [],                             priority: 1 },
] as const;