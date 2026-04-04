// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Control Plane
// Lifecycle management, health scoring, sandbox→live promotion
// Canonical contracts: IntegrationStatus from contracts/runtime
// ═══════════════════════════════════════════════════════════════

import type { IntegrationStatus as CanonicalIntegrationStatus } from "@/packages/contracts";

export type { CanonicalIntegrationStatus };

export type ConnectorStatus = "registered" | "connected" | "disconnected" | "error";
export type ConnectorMode = "sandbox" | "live" | "fake";

export interface ConnectorDefinition {
  id: string;
  name: string;
  service: string;
  status: ConnectorStatus;
  mode: ConnectorMode;
  healthScore: number;
  healthMetrics: HealthMetrics;
  config: Record<string, unknown>;
  lastSyncAt: number | null;
  errorCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface HealthMetrics {
  uptimeMinutes: number;
  totalMinutes: number;
  errorRate: number;
  totalRequests: number;
  totalErrors: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  syncFrequencyMs: number;
}

export interface SyncResult {
  connectorId: string;
  status: "completed" | "failed" | "partial";
  recordsSynced: number;
  recordsFailed: number;
  durationMs: number;
  errors?: string[];
}

// ── Health Score Calculation ─────────────────────────────────────────────────

export function calculateHealthScore(metrics: HealthMetrics): number {
  let score = 100;

  // Uptime penalty
  if (metrics.totalMinutes > 0) {
    const downtime = metrics.totalMinutes - metrics.uptimeMinutes;
    score -= (downtime / metrics.totalMinutes) * 10;
  }

  // Error rate penalty
  if (metrics.totalRequests > 0) {
    score -= (metrics.totalErrors / metrics.totalRequests) * 20;
  }

  // Latency penalty
  if (metrics.p99LatencyMs > 1000) {
    score -= Math.floor((metrics.p99LatencyMs - 1000) / 100) * 5;
  }

  // Reliability bonus
  if (metrics.totalMinutes > 0 && metrics.uptimeMinutes / metrics.totalMinutes > 0.999) {
    score += 5;
  }

  // Fast sync bonus
  if (metrics.avgLatencyMs > 0 && metrics.avgLatencyMs < 100) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function qualifiesForLive(connector: ConnectorDefinition): boolean {
  return connector.healthScore >= 95 && connector.healthMetrics.errorRate < 0.01;
}

// ── Connector Control Plane ─────────────────────────────────────────────────

export class ConnectorControlPlane {
  private connectors = new Map<string, ConnectorDefinition>();

  register(name: string, service: string, config?: Record<string, unknown>): ConnectorDefinition {
    const connector: ConnectorDefinition = {
      id: crypto.randomUUID(),
      name,
      service,
      status: "registered",
      mode: "sandbox",
      healthScore: 100,
      healthMetrics: {
        uptimeMinutes: 0,
        totalMinutes: 0,
        errorRate: 0,
        totalRequests: 0,
        totalErrors: 0,
        avgLatencyMs: 0,
        p99LatencyMs: 0,
        syncFrequencyMs: 0,
      },
      config: config || {},
      lastSyncAt: null,
      errorCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.connectors.set(connector.id, connector);
    return connector;
  }

  connect(connectorId: string): boolean {
    const c = this.connectors.get(connectorId);
    if (!c || c.status === "connected") return false;
    c.status = "connected";
    c.updatedAt = Date.now();
    return true;
  }

  disconnect(connectorId: string): boolean {
    const c = this.connectors.get(connectorId);
    if (!c) return false;
    c.status = "disconnected";
    c.updatedAt = Date.now();
    return true;
  }

  recordSync(connectorId: string, result: SyncResult): void {
    const c = this.connectors.get(connectorId);
    if (!c) return;
    c.lastSyncAt = Date.now();
    c.healthMetrics.totalRequests += result.recordsSynced + result.recordsFailed;
    c.healthMetrics.totalErrors += result.recordsFailed;
    if (c.healthMetrics.totalRequests > 0) {
      c.healthMetrics.errorRate = c.healthMetrics.totalErrors / c.healthMetrics.totalRequests;
    }
    if (result.status === "failed") {
      c.errorCount++;
      c.status = c.errorCount >= 5 ? "error" : c.status;
    }
    c.healthScore = calculateHealthScore(c.healthMetrics);
    c.updatedAt = Date.now();
  }

  updateHealth(connectorId: string, metrics: Partial<HealthMetrics>): void {
    const c = this.connectors.get(connectorId);
    if (!c) return;
    c.healthMetrics = { ...c.healthMetrics, ...metrics };
    c.healthScore = calculateHealthScore(c.healthMetrics);
    c.updatedAt = Date.now();
  }

  promote(connectorId: string): { promoted: boolean; reason?: string } {
    const c = this.connectors.get(connectorId);
    if (!c) return { promoted: false, reason: "Connector not found" };
    if (c.mode === "live") return { promoted: false, reason: "Already in live mode" };
    if (!qualifiesForLive(c)) {
      return {
        promoted: false,
        reason: `Health score ${c.healthScore} < 95 or error rate ${c.healthMetrics.errorRate} >= 1%`,
      };
    }
    c.mode = "live";
    c.updatedAt = Date.now();
    return { promoted: true };
  }

  getConnector(connectorId: string): ConnectorDefinition | undefined {
    return this.connectors.get(connectorId);
  }

  getAllConnectors(): ConnectorDefinition[] {
    return Array.from(this.connectors.values());
  }

  getConnectorsByStatus(status: ConnectorStatus): ConnectorDefinition[] {
    return Array.from(this.connectors.values()).filter((c) => c.status === status);
  }

  resetErrorCount(connectorId: string): void {
    const c = this.connectors.get(connectorId);
    if (c) {
      c.errorCount = 0;
      c.status = "connected";
      c.updatedAt = Date.now();
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createConnectorControlPlane(): ConnectorControlPlane {
  return new ConnectorControlPlane();
}
