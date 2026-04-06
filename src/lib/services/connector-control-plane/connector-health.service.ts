// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Health Service
// Health checks, staleness detection
// ═══════════════════════════════════════════════════════════════

import { CONNECTOR_FRESHNESS_POLICIES, type ConnectorFreshnessPolicy } from "@/packages/policy-contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface ConnectorHealthReport {
  connectorId: string;
  healthy: boolean;
  lastSyncAt: string;
  staleness: "fresh" | "warning" | "stale" | "critical";
  latencyMs: number;
  errorRate: number;
  affectedFields: string[];
  recommendation: string;
}

const lastSyncTimes = new Map<string, number>();

// Initialize mock sync times
["plaid", "google-calendar", "stripe", "gmail", "crm", "accounting"].forEach((id) => {
  lastSyncTimes.set(id, Date.now() - Math.floor(Math.random() * 7200000));
});

export function checkConnectorHealth(connectorId: string): ConnectorHealthReport {
  const policy = CONNECTOR_FRESHNESS_POLICIES.find((p) => p.connectorId === connectorId);
  const lastSync = lastSyncTimes.get(connectorId) || 0;
  const elapsed = Date.now() - lastSync;

  let staleness: ConnectorHealthReport["staleness"] = "fresh";
  let recommendation = "No action needed";

  if (policy) {
    if (elapsed > policy.maxStalenessMs * 3) { staleness = "critical"; recommendation = "Immediate resync required"; }
    else if (elapsed > policy.maxStalenessMs * 1.5) { staleness = "stale"; recommendation = "Schedule resync soon"; }
    else if (elapsed > policy.maxStalenessMs) { staleness = "warning"; recommendation = "Data may be outdated"; }
  } else if (elapsed > 7200000) {
    staleness = "warning";
    recommendation = "Consider syncing";
  }

  return {
    connectorId,
    healthy: staleness !== "critical",
    lastSyncAt: new Date(lastSync).toISOString(),
    staleness,
    latencyMs: Math.floor(Math.random() * 300) + 50,
    errorRate: Math.random() * 0.05,
    affectedFields: policy?.affectedFields || [],
    recommendation,
  };
}

export function checkAllConnectorHealth(): ConnectorHealthReport[] {
  return Array.from(lastSyncTimes.keys()).map(checkConnectorHealth);
}

export function recordSync(connectorId: string): void {
  lastSyncTimes.set(connectorId, Date.now());
}

export function getFreshnessPolicy(connectorId: string): ConnectorFreshnessPolicy | undefined {
  return CONNECTOR_FRESHNESS_POLICIES.find((p) => p.connectorId === connectorId);
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "connector-control-plane/connector-health";

function _serializeState(): Record<string, unknown> {
  return {
    lastSyncTimes: Array.from(lastSyncTimes.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.lastSyncTimes) { lastSyncTimes.clear(); (state.lastSyncTimes as any[]).forEach(([k, v]: any) => lastSyncTimes.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}