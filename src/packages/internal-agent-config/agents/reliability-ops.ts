export { RELIABILITY_OPS_AGENTS } from "@/lib/internal-agents/agents/reliability-ops";

/**
 * Reliability Ops Council — Contract-Level Extension
 */
export interface ReliabilityMetric {
  serviceId: string;
  metric: "availability" | "latency_p50" | "latency_p99" | "error_rate" | "saturation";
  value: number;
  threshold: number;
  status: "healthy" | "warning" | "critical";
  measuredAt: string;
  windowMinutes: number;
}

export interface SelfHealingAction {
  id: string;
  triggeredBy: string;
  serviceId: string;
  action: "restart" | "scale-up" | "failover" | "circuit-break" | "cache-clear" | "reconnect";
  reason: string;
  status: "pending" | "executing" | "succeeded" | "failed";
  executedAt: string;
  durationMs: number;
  rollbackAvailable: boolean;
  proofId: string;
}

export interface CapacityForecast {
  serviceId: string;
  resource: "cpu" | "memory" | "storage" | "connections" | "api-calls";
  currentUsage: number;
  projectedUsage: number;
  projectionHorizonDays: number;
  exhaustionDate?: string;
  recommendation: string;
  confidence: number;
  generatedAt: string;
}

export interface IncidentCorrelation {
  incidentIds: string[];
  rootCauseHypothesis: string;
  confidence: number;
  sharedSignals: string[];
  suggestedMitigation: string;
  correlatedAt: string;
}
