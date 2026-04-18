// ═══════════════════════════════════════════════════════════════
// SITA OS — Host Window vs Simulated Shell Map
// Truth file: what is real host windowing vs simulated
// References: desktop-host-runtime.ts, electron-ipc.ts
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/packages/contracts/runtime/unified-surface-runtime";
import type { HostOwnedDomain, RendererOwnedDomain } from "@/packages/contracts/native/desktop-host-runtime";

// ── Classification ───────────────────────────────────────────

export type WindowingMode = "host-native" | "simulated" | "hybrid-delegated";

export interface WindowingClassification {
  surfaceId: SurfaceId;
  mode: WindowingMode;
  hostProvider: string;
  simulationLayer: string | null;
  ipcChannels: string[];
  hostOwnedDomains: HostOwnedDomain[];
  rendererOwnedDomains: RendererOwnedDomain[];
  truthSource: string;
  notes: string;
}

// ── Map ──────────────────────────────────────────────────────

export const HOST_VS_SIMULATED_MAP: Record<SurfaceId, WindowingClassification> = {
  web: {
    surfaceId: "web",
    mode: "simulated",
    hostProvider: "browser-tab",
    simulationLayer: "FloatingWindow + useWindowManager",
    ipcChannels: [],
    hostOwnedDomains: [],
    rendererOwnedDomains: [
      "ui-rendering", "state-management", "routing",
      "command-composition", "shell-grammar", "capability-ui",
    ],
    truthSource: "useWindowManager state",
    notes: "All windowing is React-simulated. Browser is a single host window.",
  },
  admin: {
    surfaceId: "admin",
    mode: "simulated",
    hostProvider: "browser-tab",
    simulationLayer: "FloatingWindow + useWindowManager (restricted)",
    ipcChannels: [],
    hostOwnedDomains: [],
    rendererOwnedDomains: [
      "ui-rendering", "state-management", "routing",
      "command-composition", "shell-grammar",
    ],
    truthSource: "useWindowManager state",
    notes: "Simulated with restricted operations for admin safety.",
  },
  desktop: {
    surfaceId: "desktop",
    mode: "hybrid-delegated",
    hostProvider: "Electron BrowserWindow",
    simulationLayer: "FloatingWindow (sub-windows within main BrowserWindow)",
    ipcChannels: [
      "window-control", "system-info", "deep-link",
      "notifications", "auto-update", "tray-actions",
      "trust-attestation", "proof-emit",
    ],
    hostOwnedDomains: [
      "file-system-access", "biometric-auth", "tpm-attestation",
      "system-notifications", "tray-management", "auto-update",
      "deep-link-handling", "hardware-probe", "window-management",
      "native-clipboard",
    ],
    rendererOwnedDomains: [
      "ui-rendering", "state-management", "routing",
      "command-composition", "proof-display", "approval-ui",
      "shell-grammar", "capability-ui",
    ],
    truthSource: "Electron main process + IPC bridge",
    notes: "Main window is host-native. Sub-windows within renderer are simulated.",
  },
  mobile: {
    surfaceId: "mobile",
    mode: "simulated",
    hostProvider: "mobile-browser | capacitor-webview",
    simulationLayer: null,
    ipcChannels: [],
    hostOwnedDomains: [],
    rendererOwnedDomains: [
      "ui-rendering", "state-management", "routing",
      "command-composition", "capability-ui",
    ],
    truthSource: "React state (single-app mode)",
    notes: "No windowing. Single-app full-screen with tab navigation.",
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getWindowingMode(surfaceId: SurfaceId): WindowingMode {
  return HOST_VS_SIMULATED_MAP[surfaceId].mode;
}

export function isHostNative(surfaceId: SurfaceId): boolean {
  return HOST_VS_SIMULATED_MAP[surfaceId].mode === "host-native";
}

export function isSimulated(surfaceId: SurfaceId): boolean {
  return HOST_VS_SIMULATED_MAP[surfaceId].mode === "simulated";
}

export function isHybrid(surfaceId: SurfaceId): boolean {
  return HOST_VS_SIMULATED_MAP[surfaceId].mode === "hybrid-delegated";
}

export function getIPCChannels(surfaceId: SurfaceId): string[] {
  return HOST_VS_SIMULATED_MAP[surfaceId].ipcChannels;
}

export function getSimulatedEquivalent(ipcChannel: string): string | null {
  const IPC_TO_SIMULATED: Record<string, string> = {
    "window-control": "useWindowManager.minimize/maximize/close",
    "system-info": "navigator.userAgent + performance API",
    "notifications": "Notification API / toast system",
    "deep-link": "React Router navigation",
    "auto-update": "service-worker update check",
    "tray-actions": "dock context menu (simulated)",
    "trust-attestation": "software-only trust scoring",
    "proof-emit": "cloud proof chain via Supabase",
  };
  return IPC_TO_SIMULATED[ipcChannel] ?? null;
}
