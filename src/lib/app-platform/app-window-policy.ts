// ═══════════════════════════════════════════════════════════════
// SITA OS — App Window Policy
// Maps app class + trust tier to windowing behavior.
// ═══════════════════════════════════════════════════════════════

import type { TrustTier } from "./app-trust-tier-policy";

export type AppWindowClass = "internal" | "web-app" | "wrapped-app" | "native" | "restricted";

export interface WindowPolicy {
  windowClass: AppWindowClass;
  multiWindowAllowed: boolean;
  shellIntegration: "full" | "partial" | "none";
  resizable: boolean;
  closable: boolean;
  minimizable: boolean;
  ipcChannel: "full" | "restricted" | "none";
  restorationPolicy: "auto" | "manual" | "none";
  sandboxed: boolean;
}

const WINDOW_POLICIES: Record<AppWindowClass, WindowPolicy> = {
  internal: {
    windowClass: "internal",
    multiWindowAllowed: true,
    shellIntegration: "full",
    resizable: true,
    closable: true,
    minimizable: true,
    ipcChannel: "full",
    restorationPolicy: "auto",
    sandboxed: false,
  },
  "web-app": {
    windowClass: "web-app",
    multiWindowAllowed: false,
    shellIntegration: "partial",
    resizable: true,
    closable: true,
    minimizable: true,
    ipcChannel: "restricted",
    restorationPolicy: "auto",
    sandboxed: true,
  },
  "wrapped-app": {
    windowClass: "wrapped-app",
    multiWindowAllowed: false,
    shellIntegration: "partial",
    resizable: true,
    closable: true,
    minimizable: true,
    ipcChannel: "restricted",
    restorationPolicy: "manual",
    sandboxed: true,
  },
  native: {
    windowClass: "native",
    multiWindowAllowed: true,
    shellIntegration: "partial",
    resizable: true,
    closable: true,
    minimizable: true,
    ipcChannel: "full",
    restorationPolicy: "manual",
    sandboxed: false,
  },
  restricted: {
    windowClass: "restricted",
    multiWindowAllowed: false,
    shellIntegration: "none",
    resizable: false,
    closable: true,
    minimizable: false,
    ipcChannel: "none",
    restorationPolicy: "none",
    sandboxed: true,
  },
};

/** Get window policy for an app class. */
export function getWindowPolicy(windowClass: AppWindowClass): WindowPolicy {
  return WINDOW_POLICIES[windowClass];
}

/** Derive window class from app class string and trust tier. */
export function deriveWindowClass(appClass: string, trustTier: TrustTier): AppWindowClass {
  if (trustTier === "restricted") return "restricted";
  switch (appClass) {
    case "sita-native":
    case "internal":
      return "internal";
    case "native":
      return "native";
    case "pwa":
    case "wrapped":
      return "wrapped-app";
    case "web":
    case "external":
    default:
      return "web-app";
  }
}

/** Get all window policies for proof generation. */
export function getAllWindowPolicies(): Record<AppWindowClass, WindowPolicy> {
  return { ...WINDOW_POLICIES };
}