// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Integration Concierge Runtime
// ═══════════════════════════════════════════════════════════════

export type IntegrationStatus = "not-started" | "configuring" | "testing" | "active" | "degraded" | "disconnected";

export interface ConnectorState {
  connectorId: string;
  name: string;
  status: IntegrationStatus;
  lastHealthCheck: string;
  errorCount: number;
  dataFlowRate: number;
  configCompleteness: number; // 0-100
}

export interface IntegrationConciergeRuntime {
  totalConnectors: number;
  activeConnectors: number;
  connectorStates: ConnectorState[];
  pendingSetups: string[];
  recommendations: Array<{
    connectorId: string;
    reason: string;
    estimatedValueCents: number;
    priority: "high" | "medium" | "low";
  }>;
  onboardingProgress: number; // 0-100
}
