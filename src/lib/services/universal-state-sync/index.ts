// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal State Sync
// Full UI-state serialization / restore across devices & sessions
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";

const SERVICE_KEY = "universal-state-sync";

// ── Types ────────────────────────────────────────────────────────

export interface AppStateSnapshot {
  appId: string;
  deviceId: string;
  scrollPositions: Record<string, number>;
  activePage: string;
  activeTab: string | null;
  selectedRecord: string | null;
  formData: Record<string, unknown>;
  panelStates: Record<string, boolean>;      // open/close states
  filterState: Record<string, string>;
  searchQuery: string;
  timestamp: number;
  version: number;
}

export interface StateDiff {
  appId: string;
  deviceA: string;
  deviceB: string;
  differences: Array<{
    path: string;
    valueA: unknown;
    valueB: unknown;
    type: "added" | "removed" | "changed";
  }>;
  conflictsResolvable: boolean;
}

export interface StateAdapter {
  appId: string;
  capture(): AppStateSnapshot;
  restore(snapshot: AppStateSnapshot): void;
  getVersion(): number;
}

export interface UniversalStateSyncService {
  captureAppState(appId: string): AppStateSnapshot | null;
  restoreAppState(appId: string, deviceId?: string): AppStateSnapshot | null;
  getStateDiff(appId: string, deviceA: string, deviceB: string): StateDiff;
  registerStateAdapter(appId: string, adapter: StateAdapter): void;
  unregisterStateAdapter(appId: string): void;
  getRegisteredApps(): string[];
  getLatestSnapshot(appId: string): AppStateSnapshot | null;
  getAllSnapshots(): Map<string, AppStateSnapshot>;
  clearAppState(appId: string): void;
  loadPersistedState(): Promise<void>;
}

// ── Implementation ───────────────────────────────────────────────

export function createUniversalStateSync(): UniversalStateSyncService {
  const adapters = new Map<string, StateAdapter>();
  const snapshots = new Map<string, Map<string, AppStateSnapshot>>(); // appId -> deviceId -> snapshot

  const CURRENT_DEVICE = `web_${navigator.userAgent.slice(0, 20).replace(/\s/g, "_")}`;

  function captureAppState(appId: string): AppStateSnapshot | null {
    const adapter = adapters.get(appId);
    if (adapter) {
      const snapshot = adapter.capture();
      storeSnapshot(appId, CURRENT_DEVICE, snapshot);
      return snapshot;
    }

    // Fallback: capture generic DOM state
    const snapshot: AppStateSnapshot = {
      appId,
      deviceId: CURRENT_DEVICE,
      scrollPositions: { main: window.scrollY },
      activePage: window.location.pathname,
      activeTab: null,
      selectedRecord: null,
      formData: {},
      panelStates: {},
      filterState: {},
      searchQuery: "",
      timestamp: Date.now(),
      version: 1,
    };

    storeSnapshot(appId, CURRENT_DEVICE, snapshot);
    return snapshot;
  }

  function storeSnapshot(appId: string, deviceId: string, snapshot: AppStateSnapshot) {
    if (!snapshots.has(appId)) snapshots.set(appId, new Map());
    snapshots.get(appId)!.set(deviceId, snapshot);
    persist();
  }

  function restoreAppState(appId: string, deviceId?: string): AppStateSnapshot | null {
    const appSnapshots = snapshots.get(appId);
    if (!appSnapshots) return null;

    if (deviceId) return appSnapshots.get(deviceId) ?? null;

    // Find most recent across devices
    let latest: AppStateSnapshot | null = null;
    for (const snap of appSnapshots.values()) {
      if (!latest || snap.timestamp > latest.timestamp) latest = snap;
    }

    if (latest) {
      const adapter = adapters.get(appId);
      if (adapter) adapter.restore(latest);
    }

    return latest;
  }

  function getStateDiff(appId: string, deviceA: string, deviceB: string): StateDiff {
    const snapA = snapshots.get(appId)?.get(deviceA);
    const snapB = snapshots.get(appId)?.get(deviceB);
    const differences: StateDiff["differences"] = [];

    if (!snapA && !snapB) return { appId, deviceA, deviceB, differences, conflictsResolvable: true };
    if (!snapA) return { appId, deviceA, deviceB, differences: [{ path: "root", valueA: null, valueB: "exists", type: "added" }], conflictsResolvable: true };
    if (!snapB) return { appId, deviceA, deviceB, differences: [{ path: "root", valueA: "exists", valueB: null, type: "removed" }], conflictsResolvable: true };

    // Compare key fields
    if (snapA.activePage !== snapB.activePage) {
      differences.push({ path: "activePage", valueA: snapA.activePage, valueB: snapB.activePage, type: "changed" });
    }
    if (snapA.activeTab !== snapB.activeTab) {
      differences.push({ path: "activeTab", valueA: snapA.activeTab, valueB: snapB.activeTab, type: "changed" });
    }
    if (snapA.selectedRecord !== snapB.selectedRecord) {
      differences.push({ path: "selectedRecord", valueA: snapA.selectedRecord, valueB: snapB.selectedRecord, type: "changed" });
    }
    if (snapA.searchQuery !== snapB.searchQuery) {
      differences.push({ path: "searchQuery", valueA: snapA.searchQuery, valueB: snapB.searchQuery, type: "changed" });
    }

    // Compare filter states
    const allFilters = new Set([...Object.keys(snapA.filterState), ...Object.keys(snapB.filterState)]);
    for (const key of allFilters) {
      if (snapA.filterState[key] !== snapB.filterState[key]) {
        differences.push({ path: `filters.${key}`, valueA: snapA.filterState[key], valueB: snapB.filterState[key], type: "changed" });
      }
    }

    return { appId, deviceA, deviceB, differences, conflictsResolvable: differences.length < 5 };
  }

  function registerStateAdapter(appId: string, adapter: StateAdapter) {
    adapters.set(appId, adapter);
  }

  function unregisterStateAdapter(appId: string) {
    adapters.delete(appId);
  }

  function getRegisteredApps(): string[] {
    return Array.from(adapters.keys());
  }

  function getLatestSnapshot(appId: string): AppStateSnapshot | null {
    return restoreAppState(appId);
  }

  function getAllSnapshots(): Map<string, AppStateSnapshot> {
    const result = new Map<string, AppStateSnapshot>();
    for (const [appId] of snapshots) {
      const latest = restoreAppState(appId);
      if (latest) result.set(appId, latest);
    }
    return result;
  }

  function clearAppState(appId: string) {
    snapshots.delete(appId);
    persist();
  }

  function persist() {
    const serialized: Record<string, Record<string, AppStateSnapshot>> = {};
    for (const [appId, deviceMap] of snapshots) {
      serialized[appId] = Object.fromEntries(deviceMap);
    }
    debouncedSaveServiceState(SERVICE_KEY, { snapshots: serialized });
  }

  async function loadPersistedState() {
    const saved = await loadServiceState(SERVICE_KEY);
    if (saved?.snapshots) {
      for (const [appId, deviceMap] of Object.entries(saved.snapshots as Record<string, Record<string, AppStateSnapshot>>)) {
        const map = new Map<string, AppStateSnapshot>();
        for (const [deviceId, snap] of Object.entries(deviceMap)) {
          map.set(deviceId, snap);
        }
        snapshots.set(appId, map);
      }
    }
  }

  return {
    captureAppState, restoreAppState, getStateDiff,
    registerStateAdapter, unregisterStateAdapter,
    getRegisteredApps, getLatestSnapshot, getAllSnapshots,
    clearAppState, loadPersistedState,
  };
}
