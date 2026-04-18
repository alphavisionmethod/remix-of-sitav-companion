// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Runtime Registry
// Master registry of all OS surfaces with runtime classification
// References: unified-surface-runtime.ts, useWindowManager
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/packages/contracts/runtime/unified-surface-runtime";

// ── Surface Types ────────────────────────────────────────────

export type SurfaceType = "host-window" | "simulated-shell" | "hybrid";
export type RuntimeTarget = "browser" | "electron" | "mobile" | "appliance";
export type CompositorMode = "react-dom" | "wayland-sim" | "native";

export type WindowOperation =
  | "open" | "close" | "minimize" | "maximize" | "restore"
  | "resize" | "drag" | "snap" | "tile" | "split"
  | "fullscreen" | "picture-in-picture" | "always-on-top";

export interface ZLayerRange {
  min: number;
  max: number;
  modalOffset: number;
  overlayOffset: number;
}

export interface SurfaceRuntimeEntry {
  id: SurfaceId;
  name: string;
  type: SurfaceType;
  runtimeTarget: RuntimeTarget;
  compositorMode: CompositorMode;
  supportedOperations: WindowOperation[];
  maxConcurrentWindows: number;
  zLayerRange: ZLayerRange;
  supportsMultiMonitor: boolean;
  supportsBackground: boolean;
  hasTitleBar: boolean;
  hasStatusBar: boolean;
  renderEngine: "react-18" | "native-view" | "webview";
  description: string;
}

// ── Registry ─────────────────────────────────────────────────

export const SURFACE_RUNTIME_REGISTRY: Record<SurfaceId, SurfaceRuntimeEntry> = {
  web: {
    id: "web",
    name: "Web Surface",
    type: "simulated-shell",
    runtimeTarget: "browser",
    compositorMode: "react-dom",
    supportedOperations: [
      "open", "close", "minimize", "maximize", "restore",
      "resize", "drag", "snap", "tile", "split", "fullscreen",
    ],
    maxConcurrentWindows: 12,
    zLayerRange: { min: 100, max: 9999, modalOffset: 10000, overlayOffset: 20000 },
    supportsMultiMonitor: false,
    supportsBackground: false,
    hasTitleBar: true,
    hasStatusBar: true,
    renderEngine: "react-18",
    description: "Browser-based simulated desktop shell with FloatingWindow compositor",
  },
  admin: {
    id: "admin",
    name: "Admin Surface",
    type: "simulated-shell",
    runtimeTarget: "browser",
    compositorMode: "react-dom",
    supportedOperations: [
      "open", "close", "minimize", "maximize", "restore",
      "resize", "drag", "fullscreen",
    ],
    maxConcurrentWindows: 6,
    zLayerRange: { min: 100, max: 9999, modalOffset: 10000, overlayOffset: 20000 },
    supportsMultiMonitor: false,
    supportsBackground: false,
    hasTitleBar: true,
    hasStatusBar: true,
    renderEngine: "react-18",
    description: "Admin governance surface — restricted window operations for safety",
  },
  desktop: {
    id: "desktop",
    name: "Desktop Surface",
    type: "hybrid",
    runtimeTarget: "electron",
    compositorMode: "native",
    supportedOperations: [
      "open", "close", "minimize", "maximize", "restore",
      "resize", "drag", "snap", "tile", "split",
      "fullscreen", "picture-in-picture", "always-on-top",
    ],
    maxConcurrentWindows: 24,
    zLayerRange: { min: 0, max: 99999, modalOffset: 100000, overlayOffset: 200000 },
    supportsMultiMonitor: true,
    supportsBackground: true,
    hasTitleBar: true,
    hasStatusBar: true,
    renderEngine: "react-18",
    description: "Electron hybrid — host BrowserWindows with React renderers",
  },
  mobile: {
    id: "mobile",
    name: "Mobile Surface",
    type: "simulated-shell",
    runtimeTarget: "mobile",
    compositorMode: "react-dom",
    supportedOperations: ["open", "close", "fullscreen"],
    maxConcurrentWindows: 1,
    zLayerRange: { min: 0, max: 999, modalOffset: 1000, overlayOffset: 2000 },
    supportsMultiMonitor: false,
    supportsBackground: false,
    hasTitleBar: false,
    hasStatusBar: true,
    renderEngine: "react-18",
    description: "Mobile single-app surface — tab-bar navigation, no windowing",
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getSurfaceRuntime(id: SurfaceId): SurfaceRuntimeEntry {
  return SURFACE_RUNTIME_REGISTRY[id];
}

export function getSurfacesByType(type: SurfaceType): SurfaceRuntimeEntry[] {
  return Object.values(SURFACE_RUNTIME_REGISTRY).filter(s => s.type === type);
}

export function getSurfacesByTarget(target: RuntimeTarget): SurfaceRuntimeEntry[] {
  return Object.values(SURFACE_RUNTIME_REGISTRY).filter(s => s.runtimeTarget === target);
}

export function supportsOperation(surfaceId: SurfaceId, op: WindowOperation): boolean {
  return SURFACE_RUNTIME_REGISTRY[surfaceId].supportedOperations.includes(op);
}

export function getMaxWindows(surfaceId: SurfaceId): number {
  return SURFACE_RUNTIME_REGISTRY[surfaceId].maxConcurrentWindows;
}

export function getAllSurfaces(): SurfaceRuntimeEntry[] {
  return Object.values(SURFACE_RUNTIME_REGISTRY);
}
