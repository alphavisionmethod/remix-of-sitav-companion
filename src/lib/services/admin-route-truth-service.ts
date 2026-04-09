// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Route Truth Service
// Validates admin routes against generated manifest
// ═══════════════════════════════════════════════════════════════

import {
  loadServiceState,
  debouncedSaveServiceState,
} from "@/lib/persistence/universal-service-persistence";
import type {
  AdminApiManifestEntry,
  AdminRouteTruthResult,
  RouteTruthValidation,
  RouteTruthSnapshot,
  RouteTruthState,
} from "@/packages/contracts/domain-types/admin-route-truth";

const SERVICE_ID = "admin-route-truth";

interface RouteTruthState_ {
  manifest: AdminApiManifestEntry[];
  snapshots: RouteTruthSnapshot[];
  lastGeneratedAt: string | null;
}

function emptyState(): RouteTruthState_ {
  return { manifest: [], snapshots: [], lastGeneratedAt: null };
}

let _cache: RouteTruthState_ | null = null;

async function getState(): Promise<RouteTruthState_> {
  if (_cache) return _cache;
  const raw = await loadServiceState<RouteTruthState_>(SERVICE_ID);
  _cache = raw ?? emptyState();
  return _cache;
}

function persist(state: RouteTruthState_): void {
  _cache = state;
  debouncedSaveServiceState(SERVICE_ID, state as unknown as Record<string, unknown>);
}

// ── Public API ──────────────────────────────────────────────

/** Load or refresh manifest entries */
export async function loadManifest(entries: AdminApiManifestEntry[]): Promise<void> {
  const state = await getState();
  state.manifest = entries;
  state.lastGeneratedAt = new Date().toISOString();
  persist(state);
}

/** Validate current routes against manifest */
export async function validateRouteTruth(
  runtimeRoutes: Array<{ path: string; method: string; handler: string }>,
): Promise<RouteTruthValidation> {
  const state = await getState();
  const results: AdminRouteTruthResult[] = [];
  const now = new Date().toISOString();

  // Check each manifest entry against runtime
  for (const entry of state.manifest) {
    const runtime = runtimeRoutes.find(
      (r) => r.path === entry.path && r.method === entry.method,
    );

    if (!runtime) {
      results.push({
        routeKey: entry.routeKey,
        method: entry.method,
        path: entry.path,
        state: "missing-backend",
        manifestEntry: entry,
        runtimeHandler: null,
        driftDetails: null,
        lastCheckedAt: now,
      });
    } else if (runtime.handler !== entry.handlerPath) {
      results.push({
        routeKey: entry.routeKey,
        method: entry.method,
        path: entry.path,
        state: "drifted",
        manifestEntry: entry,
        runtimeHandler: runtime.handler,
        driftDetails: [
          { field: "handlerPath", expected: entry.handlerPath, actual: runtime.handler },
        ],
        lastCheckedAt: now,
      });
    } else {
      results.push({
        routeKey: entry.routeKey,
        method: entry.method,
        path: entry.path,
        state: "matched",
        manifestEntry: entry,
        runtimeHandler: runtime.handler,
        driftDetails: null,
        lastCheckedAt: now,
      });
    }
  }

  // Check for runtime routes not in manifest
  for (const runtime of runtimeRoutes) {
    const inManifest = state.manifest.find(
      (m) => m.path === runtime.path && m.method === runtime.method,
    );
    if (!inManifest) {
      results.push({
        routeKey: `unknown:${runtime.method}:${runtime.path}`,
        method: runtime.method as AdminApiManifestEntry["method"],
        path: runtime.path,
        state: "missing-manifest",
        manifestEntry: null,
        runtimeHandler: runtime.handler,
        driftDetails: null,
        lastCheckedAt: now,
      });
    }
  }

  const matched = results.filter((r) => r.state === "matched").length;
  const drifted = results.filter((r) => r.state === "drifted").length;
  const missingBackend = results.filter((r) => r.state === "missing-backend").length;
  const missingManifest = results.filter((r) => r.state === "missing-manifest").length;
  const deprecated = results.filter((r) => r.manifestEntry?.deprecated).length;

  const staleDays = state.lastGeneratedAt
    ? Math.floor((Date.now() - new Date(state.lastGeneratedAt).getTime()) / 86400000)
    : 999;

  const overallHealth: RouteTruthValidation["overallHealth"] =
    drifted > 0 || missingBackend > 2 ? "critical" : missingManifest > 0 || staleDays > 7 ? "degraded" : "healthy";

  return {
    validatedAt: now,
    manifestVersion: state.lastGeneratedAt ?? "unknown",
    manifestStaleness: {
      lastGeneratedAt: state.lastGeneratedAt ?? "never",
      staleDays,
      isStale: staleDays > 7,
    },
    totalRoutes: results.length,
    matched,
    drifted,
    missingBackend,
    missingManifest,
    deprecated,
    results,
    overallHealth,
    recommendations: [
      ...(staleDays > 7 ? ["Regenerate admin API manifest — current is stale"] : []),
      ...(drifted > 0 ? [`${drifted} routes have drifted from manifest — investigate`] : []),
      ...(missingBackend > 0 ? [`${missingBackend} manifest routes missing backend handlers`] : []),
    ],
  };
}

/** Get route mismatches only */
export async function getRouteMismatches(
  runtimeRoutes: Array<{ path: string; method: string; handler: string }>,
): Promise<AdminRouteTruthResult[]> {
  const validation = await validateRouteTruth(runtimeRoutes);
  return validation.results.filter((r) => r.state !== "matched");
}

/** Get manifest staleness info */
export async function getManifestStaleness(): Promise<{
  lastGeneratedAt: string | null;
  staleDays: number;
  isStale: boolean;
}> {
  const state = await getState();
  const staleDays = state.lastGeneratedAt
    ? Math.floor((Date.now() - new Date(state.lastGeneratedAt).getTime()) / 86400000)
    : 999;
  return {
    lastGeneratedAt: state.lastGeneratedAt,
    staleDays,
    isStale: staleDays > 7,
  };
}

/** Save a validation snapshot */
export async function saveSnapshot(snapshot: RouteTruthSnapshot): Promise<void> {
  const state = await getState();
  state.snapshots.unshift(snapshot);
  if (state.snapshots.length > 50) state.snapshots = state.snapshots.slice(0, 50);
  persist(state);
}

/** Get recent snapshots */
export async function getSnapshots(): Promise<RouteTruthSnapshot[]> {
  const state = await getState();
  return state.snapshots;
}

export function clearRouteTruthCache(): void {
  _cache = null;
}
