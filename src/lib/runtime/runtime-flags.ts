// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Flags
// Feature flags tied to runtime detection
// ═══════════════════════════════════════════════════════════════

import { isElectronRuntime } from "./desktop/desktop-runtime-detection";

export interface RuntimeFlag {
  id: string;
  name: string;
  description: string;
  enabled: () => boolean;
}

export const RUNTIME_FLAGS: RuntimeFlag[] = [
  {
    id: "desktop-window-controls",
    name: "Desktop Window Controls",
    description: "Show custom title bar with minimize/maximize/close buttons",
    enabled: () => isElectronRuntime(),
  },
  {
    id: "local-filesystem-access",
    name: "Local Filesystem Access",
    description: "Enable file save/open dialogs and local backup features",
    enabled: () => isElectronRuntime(),
  },
  {
    id: "auto-update-ui",
    name: "Auto-Update UI",
    description: "Show update notification and download/install controls",
    enabled: () => isElectronRuntime(),
  },
  {
    id: "crash-reporter-ui",
    name: "Crash Reporter UI",
    description: "Show crash report history and diagnostics in admin",
    enabled: () => isElectronRuntime(),
  },
  {
    id: "deep-link-handler",
    name: "Deep Link Handler",
    description: "Handle custom protocol deep links",
    enabled: () => isElectronRuntime(),
  },
  {
    id: "native-menu",
    name: "Native Menu Bar",
    description: "Respond to native menu actions",
    enabled: () => isElectronRuntime(),
  },
  {
    id: "system-tray",
    name: "System Tray Icon",
    description: "Show system tray icon with context menu",
    enabled: () => isElectronRuntime(),
  },
  {
    id: "simulated-os",
    name: "Simulated OS Layer",
    description: "Enable Nova OS simulated kernel, filesystem, and compositor",
    enabled: () => true, // Always enabled — it's the product's UX layer
  },
  {
    id: "pwa-install",
    name: "PWA Install Prompt",
    description: "Show PWA install prompt on mobile/web",
    enabled: () => !isElectronRuntime() && typeof window !== "undefined",
  },
];

/** Check if a runtime flag is enabled */
export function isRuntimeFlagEnabled(flagId: string): boolean {
  const flag = RUNTIME_FLAGS.find((f) => f.id === flagId);
  return flag ? flag.enabled() : false;
}

/** Get all enabled flags */
export function getEnabledFlags(): RuntimeFlag[] {
  return RUNTIME_FLAGS.filter((f) => f.enabled());
}

/** Get all disabled flags */
export function getDisabledFlags(): RuntimeFlag[] {
  return RUNTIME_FLAGS.filter((f) => !f.enabled());
}
