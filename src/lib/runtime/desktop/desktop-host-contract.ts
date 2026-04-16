// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Host Contract
// Defines what the Electron runtime owns, its privileges, and
// deployment assumptions. This is the authoritative model.
// ═══════════════════════════════════════════════════════════════

export type DesktopPrivilege =
  | "filesystem-read"
  | "filesystem-write"
  | "native-notifications"
  | "auto-update"
  | "window-management"
  | "system-info"
  | "deep-link-handling"
  | "crash-reporting"
  | "local-backup"
  | "menu-actions"
  | "navigation-control"
  | "tray-actions";

export type DesktopBoundary =
  | "host-only"      // Electron main process exclusively
  | "renderer-only"  // Renderer process exclusively
  | "bridge-shared"  // Crosses preload bridge
  | "web-shared";    // Available on both web and desktop

export interface DesktopHostContractEntry {
  privilege: DesktopPrivilege;
  boundary: DesktopBoundary;
  hostOwns: boolean;
  rendererAccess: boolean;
  requiresPreload: boolean;
  proofRequired: boolean;
  description: string;
}

/**
 * Authoritative contract defining the Electron host runtime model.
 * Every desktop-only privilege is enumerated with its ownership boundary.
 */
export const DESKTOP_HOST_CONTRACT: readonly DesktopHostContractEntry[] = [
  {
    privilege: "filesystem-read",
    boundary: "bridge-shared",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "Read files via IPC bridge (fs-read-file). Host validates paths and enforces sandbox.",
  },
  {
    privilege: "filesystem-write",
    boundary: "bridge-shared",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: true,
    description: "Write/export files via IPC bridge (fs-save-file, fs-export-backup). Host enforces allowed directories.",
  },
  {
    privilege: "native-notifications",
    boundary: "bridge-shared",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "System-level notifications sent via Electron Notification API through IPC.",
  },
  {
    privilege: "auto-update",
    boundary: "host-only",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: true,
    description: "Auto-updater lifecycle managed entirely by main process. Renderer receives status events.",
  },
  {
    privilege: "window-management",
    boundary: "bridge-shared",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "Minimize, maximize, close, fullscreen, restore via IPC window-control channel.",
  },
  {
    privilege: "system-info",
    boundary: "bridge-shared",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "Platform, arch, hostname, CPU, memory, OS version, Electron version, app version.",
  },
  {
    privilege: "deep-link-handling",
    boundary: "host-only",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "Custom protocol deep links received by main process and forwarded to renderer.",
  },
  {
    privilege: "crash-reporting",
    boundary: "bridge-shared",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "Crash report collection, retrieval, and clearing. Renderer can report errors to main.",
  },
  {
    privilege: "local-backup",
    boundary: "bridge-shared",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: true,
    description: "Auto-backup and manual backup/restore via IPC fs-auto-backup, fs-export-backup, fs-import-backup.",
  },
  {
    privilege: "menu-actions",
    boundary: "host-only",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "Native menu items emit actions to renderer via menu-action IPC channel.",
  },
  {
    privilege: "navigation-control",
    boundary: "host-only",
    hostOwns: true,
    rendererAccess: true,
    requiresPreload: true,
    proofRequired: false,
    description: "Main process can instruct renderer to navigate via navigate IPC channel.",
  },
  {
    privilege: "tray-actions",
    boundary: "host-only",
    hostOwns: true,
    rendererAccess: false,
    requiresPreload: false,
    proofRequired: false,
    description: "System tray icon and context menu managed entirely by main process.",
  },
] as const;

/** Deployment assumptions for the Electron desktop runtime */
export const DESKTOP_DEPLOYMENT_ASSUMPTIONS = {
  /** Electron version range supported */
  electronVersionRange: ">=28.0.0",
  /** Node.js version embedded in Electron */
  nodeVersionRange: ">=20.0.0",
  /** Supported OS platforms */
  supportedPlatforms: ["win32", "darwin", "linux"] as const,
  /** Supported architectures */
  supportedArchitectures: ["x64", "arm64"] as const,
  /** Context isolation is always enabled */
  contextIsolation: true,
  /** Node integration is always disabled in renderer */
  nodeIntegration: false,
  /** Sandbox is enforced */
  sandbox: true,
  /** Content Security Policy enforced */
  cspEnforced: true,
  /** Package format by platform */
  packageFormats: {
    win32: ["nsis", "portable", "zip"],
    darwin: ["dmg", "zip"],
    linux: ["AppImage", "deb", "tar.gz"],
  },
} as const;

/** Features that are desktop-exclusive (no web equivalent) */
export const DESKTOP_EXCLUSIVE_FEATURES = [
  "filesystem-read",
  "filesystem-write",
  "auto-update",
  "window-management",
  "deep-link-handling",
  "crash-reporting",
  "local-backup",
  "menu-actions",
  "navigation-control",
  "tray-actions",
] as const;

/** Features shared between desktop and web (with different implementations) */
export const DESKTOP_WEB_SHARED_FEATURES = [
  "native-notifications", // Web uses Notification API, desktop uses Electron Notification
  "system-info",          // Web uses navigator, desktop uses os module
] as const;
