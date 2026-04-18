// ═══════════════════════════════════════════════════════════════
// SITA OS — Drag & Snap Behavior Map
// Per-surface drag/snap behavior rules
// References: snap-zones.ts, useWindowSnap
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/packages/contracts/runtime/unified-surface-runtime";

// ── Types ────────────────────────────────────────────────────

export type SnapZoneId =
  | "left-half" | "right-half" | "top-half" | "bottom-half"
  | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  | "maximize" | "center-third" | "left-third" | "right-third";

export interface DragBehavior {
  enabled: boolean;
  throttleMs: number;
  useTransform3d: boolean;
  showShadowOnDrag: boolean;
  shadowIntensityByVelocity: boolean;
  showDistanceLabels: boolean;
  showRulerLines: boolean;
  edgePushback: boolean;
  edgePushbackStrengthPx: number;
  constrainToViewport: boolean;
  touchDragEnabled: boolean;
  touchDragDelayMs: number;
  keyboardMoveEnabled: boolean;
  keyboardMoveStepPx: number;
}

export interface SnapBehavior {
  enabled: boolean;
  zones: SnapZoneId[];
  thresholdPx: number;
  magneticDockingPx: number;
  edgeResistancePx: number;
  showGuideOverlay: boolean;
  guideStyle: "glassmorphic" | "solid" | "dashed";
  animationDurationMs: number;
  animationEasing: string;
  multiMonitorAware: boolean;
  respectDockedPanels: boolean;
  undoSnapOnDragAway: boolean;
}

export interface DragSnapEntry {
  surfaceId: SurfaceId;
  drag: DragBehavior;
  snap: SnapBehavior;
}

// ── Map ──────────────────────────────────────────────────────

export const DRAG_SNAP_BEHAVIOR_MAP: Record<SurfaceId, DragSnapEntry> = {
  web: {
    surfaceId: "web",
    drag: {
      enabled: true,
      throttleMs: 0,
      useTransform3d: true,
      showShadowOnDrag: true,
      shadowIntensityByVelocity: true,
      showDistanceLabels: true,
      showRulerLines: true,
      edgePushback: true,
      edgePushbackStrengthPx: 20,
      constrainToViewport: true,
      touchDragEnabled: false,
      touchDragDelayMs: 0,
      keyboardMoveEnabled: true,
      keyboardMoveStepPx: 10,
    },
    snap: {
      enabled: true,
      zones: ["left-half", "right-half", "top-left", "top-right", "bottom-left", "bottom-right", "maximize"],
      thresholdPx: 40,
      magneticDockingPx: 40,
      edgeResistancePx: 20,
      showGuideOverlay: true,
      guideStyle: "glassmorphic",
      animationDurationMs: 200,
      animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
      multiMonitorAware: false,
      respectDockedPanels: true,
      undoSnapOnDragAway: true,
    },
  },
  admin: {
    surfaceId: "admin",
    drag: {
      enabled: true,
      throttleMs: 0,
      useTransform3d: true,
      showShadowOnDrag: true,
      shadowIntensityByVelocity: false,
      showDistanceLabels: false,
      showRulerLines: false,
      edgePushback: true,
      edgePushbackStrengthPx: 30,
      constrainToViewport: true,
      touchDragEnabled: false,
      touchDragDelayMs: 0,
      keyboardMoveEnabled: true,
      keyboardMoveStepPx: 10,
    },
    snap: {
      enabled: false,
      zones: [],
      thresholdPx: 0,
      magneticDockingPx: 0,
      edgeResistancePx: 0,
      showGuideOverlay: false,
      guideStyle: "solid",
      animationDurationMs: 0,
      animationEasing: "linear",
      multiMonitorAware: false,
      respectDockedPanels: false,
      undoSnapOnDragAway: false,
    },
  },
  desktop: {
    surfaceId: "desktop",
    drag: {
      enabled: true,
      throttleMs: 0,
      useTransform3d: true,
      showShadowOnDrag: true,
      shadowIntensityByVelocity: true,
      showDistanceLabels: true,
      showRulerLines: true,
      edgePushback: true,
      edgePushbackStrengthPx: 15,
      constrainToViewport: false,
      touchDragEnabled: false,
      touchDragDelayMs: 0,
      keyboardMoveEnabled: true,
      keyboardMoveStepPx: 8,
    },
    snap: {
      enabled: true,
      zones: [
        "left-half", "right-half", "top-half", "bottom-half",
        "top-left", "top-right", "bottom-left", "bottom-right",
        "maximize", "center-third", "left-third", "right-third",
      ],
      thresholdPx: 35,
      magneticDockingPx: 50,
      edgeResistancePx: 15,
      showGuideOverlay: true,
      guideStyle: "glassmorphic",
      animationDurationMs: 180,
      animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
      multiMonitorAware: true,
      respectDockedPanels: true,
      undoSnapOnDragAway: true,
    },
  },
  mobile: {
    surfaceId: "mobile",
    drag: {
      enabled: false,
      throttleMs: 0,
      useTransform3d: false,
      showShadowOnDrag: false,
      shadowIntensityByVelocity: false,
      showDistanceLabels: false,
      showRulerLines: false,
      edgePushback: false,
      edgePushbackStrengthPx: 0,
      constrainToViewport: true,
      touchDragEnabled: false,
      touchDragDelayMs: 0,
      keyboardMoveEnabled: false,
      keyboardMoveStepPx: 0,
    },
    snap: {
      enabled: false,
      zones: [],
      thresholdPx: 0,
      magneticDockingPx: 0,
      edgeResistancePx: 0,
      showGuideOverlay: false,
      guideStyle: "solid",
      animationDurationMs: 0,
      animationEasing: "linear",
      multiMonitorAware: false,
      respectDockedPanels: false,
      undoSnapOnDragAway: false,
    },
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getDragSnapBehavior(surfaceId: SurfaceId): DragSnapEntry {
  return DRAG_SNAP_BEHAVIOR_MAP[surfaceId];
}

export function getAvailableSnapZones(surfaceId: SurfaceId): SnapZoneId[] {
  return DRAG_SNAP_BEHAVIOR_MAP[surfaceId].snap.zones;
}

export function isDragEnabled(surfaceId: SurfaceId): boolean {
  return DRAG_SNAP_BEHAVIOR_MAP[surfaceId].drag.enabled;
}

export function isSnapEnabled(surfaceId: SurfaceId): boolean {
  return DRAG_SNAP_BEHAVIOR_MAP[surfaceId].snap.enabled;
}
