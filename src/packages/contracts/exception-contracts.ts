// ═══════════════════════════════════════════════════════════════
// SITA OS — Exception & Recovery Contracts
// Doc Section 5: Exception-handling and recovery system
// ═══════════════════════════════════════════════════════════════

export type ExceptionSeverity = "low" | "medium" | "high" | "critical";
export type ExceptionCategory = "connector" | "workflow" | "payment" | "approval" | "data" | "security" | "system";

export interface ExceptionRecord {
  id: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  source: string;
  message: string;
  correlationId: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolution?: ExceptionResolution;
}

export type ExceptionResolution =
  | { type: "auto-retry"; attempt: number; maxAttempts: number }
  | { type: "fallback"; fallbackProvider: string }
  | { type: "human-escalation"; escalatedTo: string }
  | { type: "rollback"; rollbackId: string }
  | { type: "dismissed"; reason: string };

export interface RecoveryPlan {
  id: string;
  exceptionId: string;
  steps: RecoveryStep[];
  status: "pending" | "executing" | "completed" | "failed";
  estimatedImpact: string;
}

export interface RecoveryStep {
  id: string;
  action: string;
  type: "rollback" | "retry" | "compensate" | "notify" | "escalate";
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
}

export interface RollbackEligibility {
  eligible: boolean;
  reason: string;
  affectedEntities: string[];
  estimatedDataLoss: string;
  requiresApproval: boolean;
}

export interface FallbackRoute {
  primaryProvider: string;
  fallbackProvider: string;
  conditions: string[];
  lastSwitchAt?: string;
  switchCount: number;
}

export interface DegradedModeConfig {
  service: string;
  degradedCapabilities: string[];
  fullCapabilities: string[];
  currentMode: "full" | "degraded" | "offline";
  reason?: string;
}
