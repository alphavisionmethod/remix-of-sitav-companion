// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Registry
// Typed registry of all launchable windows with app identity,
// permissions, lifecycle, and runtime metadata.
// ═══════════════════════════════════════════════════════════════

import type {
  WindowType, WindowRole, RuntimeSurface, ShellTarget,
  PersistencePolicy, RecoveryPolicy, PermissionScope,
  CommunicationPolicy,
} from "@/packages/window-contracts";

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
  // ── Extended fields (Wave 12.7) ────────────────────────────
  windowType: WindowType;
  windowRole: WindowRole;
  runtimeSurface: RuntimeSurface;
  shellTarget: ShellTarget;
  persistencePolicy: PersistencePolicy;
  recoveryPolicy: RecoveryPolicy;
  permissionScope: PermissionScope;
  communicationPolicy: CommunicationPolicy;
  multiWindow: boolean;
  modalSupport: boolean;
  standaloneSupport: boolean;
}

export const WINDOW_REGISTRY: readonly WindowRegistryEntry[] = [
  { windowId: "business-os", appId: "business-os", displayName: "Business", defaultWidth: 1200, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps", "boardroom"], ownerDomain: "business-os", iconId: "briefcase", persistState: true, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "standard", communicationPolicy: "domain-only", multiWindow: false, modalSupport: true, standaloneSupport: true },
  { windowId: "money-os", appId: "money-os", displayName: "Money", defaultWidth: 1200, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps", "boardroom"], ownerDomain: "finance-os", iconId: "wallet", persistState: true, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "standard", communicationPolicy: "domain-only", multiWindow: false, modalSupport: true, standaloneSupport: true },
  { windowId: "concierge", appId: "concierge", displayName: "Concierge", defaultWidth: 1100, defaultHeight: 750, minWidth: 500, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps"], ownerDomain: "concierge-os", iconId: "bell-concierge", persistState: true, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "standard", communicationPolicy: "domain-only", multiWindow: false, modalSupport: true, standaloneSupport: true },
  { windowId: "investment", appId: "investment", displayName: "Investment", defaultWidth: 1200, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps", "boardroom"], ownerDomain: "finance-os", iconId: "trending-up", persistState: true, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "standard", communicationPolicy: "domain-only", multiWindow: false, modalSupport: true, standaloneSupport: true },
  { windowId: "boardroom", appId: "boardroom", displayName: "Boardroom", defaultWidth: 1400, defaultHeight: 900, minWidth: 800, minHeight: 500, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["boardroom", "domain-apps"], ownerDomain: "platform", iconId: "layout-dashboard", persistState: true, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "standard", communicationPolicy: "open", multiWindow: false, modalSupport: true, standaloneSupport: true },
  { windowId: "files", appId: "files", displayName: "Files", defaultWidth: 1000, defaultHeight: 700, minWidth: 500, minHeight: 350, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["system"], ownerDomain: "files", iconId: "folder", persistState: true, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "standard", communicationPolicy: "system-only", multiWindow: true, modalSupport: true, standaloneSupport: true },
  { windowId: "communications", appId: "communications", displayName: "Communications", defaultWidth: 1100, defaultHeight: 750, minWidth: 500, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["domain-apps"], ownerDomain: "communications", iconId: "message-square", persistState: true, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "standard", communicationPolicy: "domain-only", multiWindow: false, modalSupport: true, standaloneSupport: true },
  { windowId: "settings", appId: "settings", displayName: "Settings", defaultWidth: 900, defaultHeight: 650, minWidth: 500, minHeight: 400, resizable: true, maximizable: true, minimizable: false, allowedIPCGroups: ["system"], ownerDomain: "platform", iconId: "settings", persistState: false, windowType: "primary", windowRole: "system", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "never", recoveryPolicy: "discard", permissionScope: "full", communicationPolicy: "system-only", multiWindow: false, modalSupport: true, standaloneSupport: true },
  { windowId: "terminal", appId: "terminal", displayName: "Terminal", defaultWidth: 800, defaultHeight: 500, minWidth: 400, minHeight: 300, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["system"], ownerDomain: "shell", iconId: "terminal", persistState: true, windowType: "primary", windowRole: "utility", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "always", recoveryPolicy: "auto", permissionScope: "full", communicationPolicy: "system-only", multiWindow: true, modalSupport: false, standaloneSupport: true },
  { windowId: "app-store", appId: "app-store", displayName: "App Store", defaultWidth: 1100, defaultHeight: 800, minWidth: 600, minHeight: 400, resizable: true, maximizable: true, minimizable: true, allowedIPCGroups: ["system"], ownerDomain: "app-platform", iconId: "store", persistState: false, windowType: "primary", windowRole: "app", runtimeSurface: "web", shellTarget: "floating", persistencePolicy: "never", recoveryPolicy: "discard", permissionScope: "restricted", communicationPolicy: "system-only", multiWindow: false, modalSupport: true, standaloneSupport: true },
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

// ── Extended APIs (Wave 12.7) ───────────────────────────────
export function getWindowsForWorkspace(workspaceId: string): WindowRegistryEntry[] {
  // All registered windows default to "default" workspace
  return workspaceId === "default" ? [...WINDOW_REGISTRY] : [];
}

export function getMultiWindowApps(): WindowRegistryEntry[] {
  return WINDOW_REGISTRY.filter(w => w.multiWindow);
}

export function getWindowsByPermissionScope(scope: string): WindowRegistryEntry[] {
  return WINDOW_REGISTRY.filter(w => w.permissionScope === scope);
}