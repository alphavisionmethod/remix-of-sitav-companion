// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Health Service
// Health checks, staleness detection
// ═══════════════════════════════════════════════════════════════

import { CONNECTOR_FRESHNESS_POLICIES, type ConnectorFreshnessPolicy } from "@/packages/policy-contracts";


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

