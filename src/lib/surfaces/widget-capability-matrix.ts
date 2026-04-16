// ═══════════════════════════════════════════════════════════════
// SITA OS — Widget Capability Matrix
// Per-surface widget support declarations
// References: WidgetRegistry, WidgetGrid
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/packages/contracts/runtime/unified-surface-runtime";

// ── Types ────────────────────────────────────────────────────

export type WidgetSize = "1x1" | "1x2" | "2x1" | "2x2" | "3x2" | "4x2" | "full-width";

export interface WidgetCapabilityEntry {
  surfaceId: SurfaceId;
  supportedSizes: WidgetSize[];
  maxWidgetCount: number;
  supportsDragReorder: boolean;
  supportsResize: boolean;
  supportsAutoRefresh: boolean;
  supportsPermissionGating: boolean;
  supportsCollapse: boolean;
  supportsRemove: boolean;
  gridColumns: number;
  gridGapPx: number;
  persistPlacement: boolean;
  placementStorageKey: string;
}

// ── Matrix ───────────────────────────────────────────────────

export const WIDGET_CAPABILITY_MATRIX: Record<SurfaceId, WidgetCapabilityEntry> = {
  web: {
    surfaceId: "web",
    supportedSizes: ["1x1", "1x2", "2x1", "2x2", "3x2", "4x2", "full-width"],
    maxWidgetCount: 16,
    supportsDragReorder: true,
    supportsResize: true,
    supportsAutoRefresh: true,
    supportsPermissionGating: true,
    supportsCollapse: true,
    supportsRemove: true,
    gridColumns: 4,
    gridGapPx: 16,
    persistPlacement: true,
    placementStorageKey: "sita-widget-placement-web",
  },
  admin: {
    surfaceId: "admin",
    supportedSizes: ["1x1", "2x1", "2x2", "full-width"],
    maxWidgetCount: 8,
    supportsDragReorder: true,
    supportsResize: false,
    supportsAutoRefresh: true,
    supportsPermissionGating: true,
    supportsCollapse: true,
    supportsRemove: false,
    gridColumns: 3,
    gridGapPx: 12,
    persistPlacement: true,
    placementStorageKey: "sita-widget-placement-admin",
  },
  desktop: {
    surfaceId: "desktop",
    supportedSizes: ["1x1", "1x2", "2x1", "2x2", "3x2", "4x2", "full-width"],
    maxWidgetCount: 24,
    supportsDragReorder: true,
    supportsResize: true,
    supportsAutoRefresh: true,
    supportsPermissionGating: true,
    supportsCollapse: true,
    supportsRemove: true,
    gridColumns: 6,
    gridGapPx: 16,
    persistPlacement: true,
    placementStorageKey: "sita-widget-placement-desktop",
  },
  mobile: {
    surfaceId: "mobile",
    supportedSizes: ["full-width"],
    maxWidgetCount: 6,
    supportsDragReorder: false,
    supportsResize: false,
    supportsAutoRefresh: true,
    supportsPermissionGating: true,
    supportsCollapse: true,
    supportsRemove: true,
    gridColumns: 1,
    gridGapPx: 8,
    persistPlacement: true,
    placementStorageKey: "sita-widget-placement-mobile",
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getWidgetCapabilities(surfaceId: SurfaceId): WidgetCapabilityEntry {
  return WIDGET_CAPABILITY_MATRIX[surfaceId];
}

export function surfaceSupportsWidgetSize(surfaceId: SurfaceId, size: WidgetSize): boolean {
  return WIDGET_CAPABILITY_MATRIX[surfaceId].supportedSizes.includes(size);
}

export function getMaxWidgets(surfaceId: SurfaceId): number {
  return WIDGET_CAPABILITY_MATRIX[surfaceId].maxWidgetCount;
}
