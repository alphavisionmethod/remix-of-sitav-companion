// ═══════════════════════════════════════════════════════════════
// SITA OS — Layout Persistence Map
// Per-surface persistence rules for window/widget state
// References: session-persistence.ts, useWindowManager
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/packages/contracts/runtime/unified-surface-runtime";

// ── Types ────────────────────────────────────────────────────

export type PersistableItem =
  | "window-positions" | "window-sizes" | "window-z-order"
  | "snap-state" | "widget-placements" | "widget-collapse-state"
  | "sidebar-state" | "dock-state" | "active-workspace"
  | "scroll-positions" | "panel-splits" | "drawer-state";

export type StorageBackend = "localStorage" | "sessionStorage" | "cloud" | "indexedDB";

export interface PersistenceRule {
  item: PersistableItem;
  enabled: boolean;
  backend: StorageBackend;
  ttlMs: number | null;
  maxEntries: number;
  debounceMs: number;
  storageKey: string;
}

export interface LayoutPersistenceEntry {
  surfaceId: SurfaceId;
  rules: PersistenceRule[];
  snapshotOnUnload: boolean;
  restoreOnMount: boolean;
  crossSessionRestore: boolean;
  maxSnapshotSizeKB: number;
}

// ── Constants ────────────────────────────────────────────────

const ONE_DAY = 86_400_000;
const SEVEN_DAYS = 7 * ONE_DAY;
const THIRTY_DAYS = 30 * ONE_DAY;

// ── Map ──────────────────────────────────────────────────────

export const LAYOUT_PERSISTENCE_MAP: Record<SurfaceId, LayoutPersistenceEntry> = {
  web: {
    surfaceId: "web",
    rules: [
      { item: "window-positions", enabled: true, backend: "localStorage", ttlMs: SEVEN_DAYS, maxEntries: 20, debounceMs: 500, storageKey: "sita-win-pos" },
      { item: "window-sizes", enabled: true, backend: "localStorage", ttlMs: SEVEN_DAYS, maxEntries: 20, debounceMs: 500, storageKey: "sita-win-size" },
      { item: "window-z-order", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 20, debounceMs: 200, storageKey: "sita-win-z" },
      { item: "snap-state", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 20, debounceMs: 200, storageKey: "sita-snap" },
      { item: "widget-placements", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 30, debounceMs: 1000, storageKey: "sita-widgets" },
      { item: "sidebar-state", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 1, debounceMs: 300, storageKey: "sita-sidebar" },
      { item: "dock-state", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 1, debounceMs: 300, storageKey: "sita-dock" },
      { item: "active-workspace", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 1, debounceMs: 100, storageKey: "sita-workspace" },
      { item: "scroll-positions", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 20, debounceMs: 500, storageKey: "sita-scroll" },
    ],
    snapshotOnUnload: true,
    restoreOnMount: true,
    crossSessionRestore: true,
    maxSnapshotSizeKB: 256,
  },
  admin: {
    surfaceId: "admin",
    rules: [
      { item: "window-positions", enabled: true, backend: "localStorage", ttlMs: SEVEN_DAYS, maxEntries: 10, debounceMs: 500, storageKey: "sita-admin-win-pos" },
      { item: "window-sizes", enabled: true, backend: "localStorage", ttlMs: SEVEN_DAYS, maxEntries: 10, debounceMs: 500, storageKey: "sita-admin-win-size" },
      { item: "sidebar-state", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 1, debounceMs: 300, storageKey: "sita-admin-sidebar" },
      { item: "active-workspace", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 1, debounceMs: 100, storageKey: "sita-admin-workspace" },
    ],
    snapshotOnUnload: true,
    restoreOnMount: true,
    crossSessionRestore: true,
    maxSnapshotSizeKB: 128,
  },
  desktop: {
    surfaceId: "desktop",
    rules: [
      { item: "window-positions", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 30, debounceMs: 300, storageKey: "sita-desk-win-pos" },
      { item: "window-sizes", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 30, debounceMs: 300, storageKey: "sita-desk-win-size" },
      { item: "window-z-order", enabled: true, backend: "localStorage", ttlMs: SEVEN_DAYS, maxEntries: 30, debounceMs: 200, storageKey: "sita-desk-win-z" },
      { item: "snap-state", enabled: true, backend: "localStorage", ttlMs: SEVEN_DAYS, maxEntries: 30, debounceMs: 200, storageKey: "sita-desk-snap" },
      { item: "widget-placements", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 40, debounceMs: 1000, storageKey: "sita-desk-widgets" },
      { item: "widget-collapse-state", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 40, debounceMs: 500, storageKey: "sita-desk-widget-collapse" },
      { item: "sidebar-state", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 1, debounceMs: 300, storageKey: "sita-desk-sidebar" },
      { item: "dock-state", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 1, debounceMs: 300, storageKey: "sita-desk-dock" },
      { item: "active-workspace", enabled: true, backend: "localStorage", ttlMs: SEVEN_DAYS, maxEntries: 1, debounceMs: 100, storageKey: "sita-desk-workspace" },
      { item: "scroll-positions", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 30, debounceMs: 500, storageKey: "sita-desk-scroll" },
      { item: "panel-splits", enabled: true, backend: "localStorage", ttlMs: THIRTY_DAYS, maxEntries: 10, debounceMs: 500, storageKey: "sita-desk-splits" },
    ],
    snapshotOnUnload: true,
    restoreOnMount: true,
    crossSessionRestore: true,
    maxSnapshotSizeKB: 512,
  },
  mobile: {
    surfaceId: "mobile",
    rules: [
      { item: "active-workspace", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 1, debounceMs: 100, storageKey: "sita-mobile-workspace" },
      { item: "scroll-positions", enabled: true, backend: "sessionStorage", ttlMs: null, maxEntries: 5, debounceMs: 300, storageKey: "sita-mobile-scroll" },
      { item: "sidebar-state", enabled: false, backend: "sessionStorage", ttlMs: null, maxEntries: 0, debounceMs: 0, storageKey: "" },
    ],
    snapshotOnUnload: false,
    restoreOnMount: true,
    crossSessionRestore: false,
    maxSnapshotSizeKB: 64,
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getPersistenceRules(surfaceId: SurfaceId): PersistenceRule[] {
  return LAYOUT_PERSISTENCE_MAP[surfaceId].rules.filter(r => r.enabled);
}

export function isPersisted(surfaceId: SurfaceId, item: PersistableItem): boolean {
  return LAYOUT_PERSISTENCE_MAP[surfaceId].rules.some(r => r.item === item && r.enabled);
}

export function getStorageBackend(surfaceId: SurfaceId, item: PersistableItem): StorageBackend | null {
  const rule = LAYOUT_PERSISTENCE_MAP[surfaceId].rules.find(r => r.item === item && r.enabled);
  return rule?.backend ?? null;
}
