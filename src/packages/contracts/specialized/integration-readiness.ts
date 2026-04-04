// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Integration Readiness
// ═══════════════════════════════════════════════════════════════

export type ReadinessStatus = "not-started" | "in-progress" | "ready" | "blocked" | "degraded";

export interface IntegrationReadinessItem {
  connectorId: string;
  name: string;
  status: ReadinessStatus;
  configCompleteness: number; // 0-100
  dataFlowVerified: boolean;
  lastHealthCheck?: string;
  blockers: string[];
  estimatedSetupMinutes: number;
}

export interface IntegrationReadiness {
  overallReadiness: number; // 0-100
  items: IntegrationReadinessItem[];
  criticalBlockers: string[];
  recommendations: string[];
  lastAssessedAt: string;
}
