// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Registry
// Typed registry of all launchable windows with app identity,
// permissions, and default dimensions.
// ═══════════════════════════════════════════════════════════════

export interface WindowRegistryEntry {
  windowId: string;
  appId: string;
  displayName: string;
  /** Default window dimensions. */
  defaultWidth: number;
  defaultHeight: number;
  /** Minimum resize constraints. */
  minWidth: number;
  minHeight: number;
  /** Can this window be resized? */
  resizable: boolean;
  /** Can this window be maximized? */
  maximizable: boolean;
  /** Can this window be minimized? */
  minimizable: boolean;
  /** IPC groups this window can communicate with. */
  allowedIPCGroups: readonly string[];
  /** Domain owner. */
  ownerDomain: string;
  /** Icon identifier for taskbar/dock. */
  iconId: string;
  /** Whether to persist window state across sessions. */
  persistState: boolean;
}

export const WINDOW_REGISTRY: readonly WindowRegistryEntry[] = [
  { windowId: "business-os", appId: "business-os", displayName: "Business", defaultWidth: 1200, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps", "boardroom"], ownerDomain: "business-os", iconId: "briefcase", persistState: true },
  { windowId: "money-os", appId: "money-os", displayName: "Money", defaultWidth: 1200, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps", "boardroom"], ownerDomain: "finance-os", iconId: "wallet", persistState: true },
  { windowId: "concierge", appId: "concierge", displayName: "Concierge", defaultWidth: 1100, defaultHeight: 750, minWidth: 500, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps"], ownerDomain: "concierge-os", iconId: "bell-concierge", persistState: true },
  { windowId: "investment", appId: "investment", displayName: "Investment", defaultWidth: 1200, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps", "boardroom"], ownerDomain: "finance-os", iconId: "trending-up", persistState: true },
  { windowId: "boardroom", appId: "boardroom", displayName: "Boardroom", defaultWidth: 1400, defaultHeight: 900, minWidth: 800, minHeight: 500, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["boardroom", "domain-apps"], ownerDomain: "platform", iconId: "layout-dashboard", persistState: true },
  { windowId: "files", appId: "files", displayName: "Files", defaultWidth: 1000, defaultHeight: 700, minWidth: 500, minHeight: 350, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["system"], ownerDomain: "files", iconId: "folder", persistState: true },
  { windowId: "communications", appId: "communications", displayName: "Communications", defaultWidth: 1100, defaultHeight: 750, minWidth: 500, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps"], ownerDomain: "communications", iconId: "message-square", persistState: true },
  { windowId: "settings", appId: "settings", displayName: "Settings", defaultWidth: 900, defaultHeight: 650, minWidth: 500, minHeight: 400, resizable: true, maximizable: true, minimizable: false, allowedIPCGroups: ["system"], ownerDomain: "platform", iconId: "settings", persistState: false },
  { windowId: "terminal", appId: "terminal", displayName: "Terminal", defaultWidth: 800, defaultHeight: 500, minWidth: 400, minHeight: 300, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["system"], ownerDomain: "shell", iconId: "terminal", persistState: true },
  { windowId: "app-store", appId: "app-store", displayName: "App Store", defaultWidth: 1100, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["system"], ownerDomain: "app-platform", iconId: "store", persistState: false },
] as const;

export function getWindowEntry(windowId: string): WindowRegistryEntry | undefined {
  return WINDOW_REGISTRY.find((w) => w.windowId === windowId);
}

export function getWindowsForDomain(domain: string): WindowRegistryEntry[] {
  return WINDOW_REGISTRY.filter((w) => w.ownerDomain === domain);
}

export function listPersistableWindows(): WindowRegistryEntry[] {
  return WINDOW_REGISTRY.filter((w) => w.persistState);
}