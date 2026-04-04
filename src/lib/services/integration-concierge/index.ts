// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Concierge Service
// Connector onboarding, health monitoring, recommendations
// Canonical contract: contracts/runtime/integration-concierge-runtime
// ═══════════════════════════════════════════════════════════════

import type {
  IntegrationConciergeRuntime,
  ConnectorState,
  IntegrationStatus,
} from "@/packages/contracts";

// ── Service ─────────────────────────────────────────────────────

export class IntegrationConciergeService {
  private connectors = new Map<string, ConnectorState>();
  private pendingSetups: string[] = [];
  private recommendations: IntegrationConciergeRuntime["recommendations"] = [];

  registerConnector(connector: ConnectorState): void {
    this.connectors.set(connector.connectorId, connector);
  }

  updateStatus(connectorId: string, status: IntegrationStatus): void {
    const c = this.connectors.get(connectorId);
    if (c) {
      c.status = status;
      c.lastHealthCheck = new Date().toISOString();
    }
  }

  recordError(connectorId: string): void {
    const c = this.connectors.get(connectorId);
    if (c) {
      c.errorCount++;
      if (c.errorCount >= 5) c.status = "degraded";
    }
  }

  resetErrors(connectorId: string): void {
    const c = this.connectors.get(connectorId);
    if (c) c.errorCount = 0;
  }

  addPendingSetup(connectorId: string): void {
    if (!this.pendingSetups.includes(connectorId)) {
      this.pendingSetups.push(connectorId);
    }
  }

  completePendingSetup(connectorId: string): void {
    this.pendingSetups = this.pendingSetups.filter(id => id !== connectorId);
  }

  addRecommendation(rec: IntegrationConciergeRuntime["recommendations"][0]): void {
    this.recommendations.push(rec);
  }

  getConnector(connectorId: string): ConnectorState | undefined {
    return this.connectors.get(connectorId);
  }

  getActiveConnectors(): ConnectorState[] {
    return Array.from(this.connectors.values()).filter(c => c.status === "active");
  }

  getDegradedConnectors(): ConnectorState[] {
    return Array.from(this.connectors.values()).filter(c => c.status === "degraded");
  }

  healthCheck(): void {
    const now = new Date().toISOString();
    for (const c of this.connectors.values()) {
      c.lastHealthCheck = now;
    }
  }

  computeOnboardingProgress(): number {
    const total = this.connectors.size + this.pendingSetups.length;
    if (total === 0) return 100;
    const active = this.getActiveConnectors().length;
    return Math.round((active / total) * 100);
  }

  evaluate(): IntegrationConciergeRuntime {
    const states = Array.from(this.connectors.values());
    return {
      totalConnectors: states.length,
      activeConnectors: states.filter(c => c.status === "active").length,
      connectorStates: states,
      pendingSetups: [...this.pendingSetups],
      recommendations: [...this.recommendations],
      onboardingProgress: this.computeOnboardingProgress(),
    };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createIntegrationConciergeService(): IntegrationConciergeService {
  return new IntegrationConciergeService();
}
