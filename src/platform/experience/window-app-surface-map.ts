// ═══════════════════════════════════════════════════════════════
// SITA OS — Window App Surface Map
// Maps each app type to its window behavior defaults.
// ═══════════════════════════════════════════════════════════════

export interface WindowAppEntry {
  readonly appId: string;
  readonly displayName: string;
  readonly defaultWidth: number;
  readonly defaultHeight: number;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly resizable: boolean;
  readonly snapEligible: boolean;
  readonly fullscreenCapable: boolean;
  readonly chromeRef: string;
}

export const WINDOW_APP_SURFACE_MAP: readonly WindowAppEntry[] = [
  { appId: "business",    displayName: "Business",    defaultWidth: 1200, defaultHeight: 800, minWidth: 800, minHeight: 600, resizable: true,  snapEligible: true,  fullscreenCapable: true,  chromeRef: "APP_CHROME" },
  { appId: "finance",     displayName: "Finance",     defaultWidth: 1200, defaultHeight: 800, minWidth: 800, minHeight: 600, resizable: true,  snapEligible: true,  fullscreenCapable: true,  chromeRef: "APP_CHROME" },
  { appId: "concierge",   displayName: "Concierge",   defaultWidth: 1000, defaultHeight: 700, minWidth: 600, minHeight: 500, resizable: true,  snapEligible: true,  fullscreenCapable: true,  chromeRef: "APP_CHROME" },
  { appId: "files",       displayName: "Files",       defaultWidth: 1000, defaultHeight: 700, minWidth: 600, minHeight: 400, resizable: true,  snapEligible: true,  fullscreenCapable: true,  chromeRef: "APP_CHROME" },
  { appId: "boardroom",   displayName: "Boardroom",   defaultWidth: 1200, defaultHeight: 800, minWidth: 800, minHeight: 600, resizable: true,  snapEligible: true,  fullscreenCapable: true,  chromeRef: "APP_CHROME" },
  { appId: "investment",  displayName: "Investment",  defaultWidth: 1200, defaultHeight: 800, minWidth: 800, minHeight: 600, resizable: true,  snapEligible: true,  fullscreenCapable: true,  chromeRef: "APP_CHROME" },
  { appId: "settings",    displayName: "Settings",    defaultWidth: 900,  defaultHeight: 650, minWidth: 600, minHeight: 400, resizable: true,  snapEligible: true,  fullscreenCapable: false, chromeRef: "APP_CHROME" },
  { appId: "search",      displayName: "Search",      defaultWidth: 700,  defaultHeight: 500, minWidth: 500, minHeight: 400, resizable: true,  snapEligible: false, fullscreenCapable: false, chromeRef: "APP_CHROME" },
] as const;

export const WINDOW_APP_SURFACE_COUNT = WINDOW_APP_SURFACE_MAP.length;