// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Capability Matrix
// Per-surface window capability declarations
// References: snap-zones.ts, FloatingWindow, useWindowSnap
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/packages/contracts/runtime/unified-surface-runtime";

// ── Capability Shape ─────────────────────────────────────────

export interface WindowCapabilities {
  drag: boolean;
  resize: boolean;
  snap: boolean;
  minimize: boolean;
  maximize: boolean;
  tile: boolean;
  splitView: boolean;
  pictureInPicture: boolean;
  fullscreen: boolean;
  alwaysOnTop: boolean;
  titleBar: boolean;
  customChrome: boolean;
  errorBoundary: boolean;
  performanceMonitor: boolean;
  animatedTransitions: boolean;
  shadowElevation: boolean;
}

export interface SnapCapabilities {
  zones: number;
  edgeResistancePx: number;
  magneticDockingPx: number;
  guidesVisible: boolean;
  keyboardSnap: boolean;
  touchSnap: boolean;
}

export interface ResizeCapabilities {
  minWidth: number;
  minHeight: number;
  maxWidth: number | null;
  maxHeight: number | null;
  aspectRatioLock: boolean;
  handleSize: number;
  edgeHandles: boolean;
  cornerHandles: boolean;
}

export interface WindowCapabilityEntry {
  surfaceId: SurfaceId;
  window: WindowCapabilities;
  snap: SnapCapabilities;
  resize: ResizeCapabilities;
}

// ── Matrix ───────────────────────────────────────────────────

export const WINDOW_CAPABILITY_MATRIX: Record<SurfaceId, WindowCapabilityEntry> = {
  web: {
    surfaceId: "web",
    window: {
      drag: true, resize: true, snap: true,
      minimize: true, maximize: true, tile: true,
      splitView: true, pictureInPicture: false,
      fullscreen: true, alwaysOnTop: false,
      titleBar: true, customChrome: true,
      errorBoundary: true, performanceMonitor: true,
      animatedTransitions: true, shadowElevation: true,
    },
    snap: {
      zones: 7, edgeResistancePx: 20, magneticDockingPx: 40,
      guidesVisible: true, keyboardSnap: true, touchSnap: false,
    },
    resize: {
      minWidth: 320, minHeight: 200,
      maxWidth: null, maxHeight: null,
      aspectRatioLock: false, handleSize: 8,
      edgeHandles: true, cornerHandles: true,
    },
  },
  admin: {
    surfaceId: "admin",
    window: {
      drag: true, resize: true, snap: false,
      minimize: true, maximize: true, tile: false,
      splitView: false, pictureInPicture: false,
      fullscreen: true, alwaysOnTop: false,
      titleBar: true, customChrome: true,
      errorBoundary: true, performanceMonitor: true,
      animatedTransitions: true, shadowElevation: true,
    },
    snap: {
      zones: 0, edgeResistancePx: 0, magneticDockingPx: 0,
      guidesVisible: false, keyboardSnap: false, touchSnap: false,
    },
    resize: {
      minWidth: 400, minHeight: 300,
      maxWidth: null, maxHeight: null,
      aspectRatioLock: false, handleSize: 8,
      edgeHandles: true, cornerHandles: true,
    },
  },
  desktop: {
    surfaceId: "desktop",
    window: {
      drag: true, resize: true, snap: true,
      minimize: true, maximize: true, tile: true,
      splitView: true, pictureInPicture: true,
      fullscreen: true, alwaysOnTop: true,
      titleBar: true, customChrome: true,
      errorBoundary: true, performanceMonitor: true,
      animatedTransitions: true, shadowElevation: true,
    },
    snap: {
      zones: 7, edgeResistancePx: 15, magneticDockingPx: 50,
      guidesVisible: true, keyboardSnap: true, touchSnap: false,
    },
    resize: {
      minWidth: 280, minHeight: 180,
      maxWidth: null, maxHeight: null,
      aspectRatioLock: false, handleSize: 6,
      edgeHandles: true, cornerHandles: true,
    },
  },
  mobile: {
    surfaceId: "mobile",
    window: {
      drag: false, resize: false, snap: false,
      minimize: false, maximize: false, tile: false,
      splitView: false, pictureInPicture: false,
      fullscreen: true, alwaysOnTop: false,
      titleBar: false, customChrome: false,
      errorBoundary: true, performanceMonitor: false,
      animatedTransitions: true, shadowElevation: false,
    },
    snap: {
      zones: 0, edgeResistancePx: 0, magneticDockingPx: 0,
      guidesVisible: false, keyboardSnap: false, touchSnap: false,
    },
    resize: {
      minWidth: 320, minHeight: 568,
      maxWidth: null, maxHeight: null,
      aspectRatioLock: false, handleSize: 0,
      edgeHandles: false, cornerHandles: false,
    },
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getWindowCapabilities(surfaceId: SurfaceId): WindowCapabilityEntry {
  return WINDOW_CAPABILITY_MATRIX[surfaceId];
}

export function surfaceSupportsSnap(surfaceId: SurfaceId): boolean {
  return WINDOW_CAPABILITY_MATRIX[surfaceId].window.snap;
}

export function surfaceSupportsDrag(surfaceId: SurfaceId): boolean {
  return WINDOW_CAPABILITY_MATRIX[surfaceId].window.drag;
}

export function surfaceSupportsTiling(surfaceId: SurfaceId): boolean {
  return WINDOW_CAPABILITY_MATRIX[surfaceId].window.tile;
}
