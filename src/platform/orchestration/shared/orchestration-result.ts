// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Result
// Canonical result type with layer-specific outcomes
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationLayer } from "./orchestration-types";
import type { OrchestrationEnvelope } from "./orchestration-envelope";

export type OrchestrationOutcome =
  | "success" | "partial_success" | "failure"
  | "refused" | "rolled_back" | "approval_pending" | "timeout";

export interface OrchestrationResult {
  correlationId: string;
  envelopeId: string;
  outcome: OrchestrationOutcome;
  finalLayer: OrchestrationLayer;
  envelope: OrchestrationEnvelope;

  intentOutcome?: IntentOutcome;
  planningOutcome?: PlanningOutcome;
  executionOutcome?: ExecutionOutcome;
  proofOutcome?: ProofOutcome;

  durationMs: number;
  timestamp: string;
  errors: OrchestrationError[];
}

export interface IntentOutcome {
  classification: string;
  domain: string;
  capability: string;
  riskTier: string;
  confidence: number;
  escalated: boolean;
}

export interface PlanningOutcome {
  planId: string;
  stepCount: number;
  approvalRequired: boolean;
  approvalStatus: string;
  simulationPassed?: boolean;
  estimatedDurationMs: number;
}

export interface ExecutionOutcome {
  executionId: string;
  stepsCompleted: number;
  stepsTotal: number;
  sideEffectCount: number;
  rollbackAvailable: boolean;
  durationMs: number;
}

export interface ProofOutcome {
  receiptId: string;
  auditTrailId: string;
  proofChainHash: string;
  integrity: "full" | "partial" | "degraded";
}

export interface OrchestrationError {
  layer: OrchestrationLayer;
  code: string;
  message: string;
  recoverable: boolean;
  timestamp: string;
}

export function createSuccessResult(
  envelope: OrchestrationEnvelope,
  startTime: number
): OrchestrationResult {
  return {
    correlationId: envelope.correlationId,
    envelopeId: envelope.envelopeId,
    outcome: "success",
    finalLayer: "proof",
    envelope,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    errors: [],
  };
}

export function createFailureResult(
  envelope: OrchestrationEnvelope,
  layer: OrchestrationLayer,
  error: string,
  startTime: number
): OrchestrationResult {
  return {
    correlationId: envelope.correlationId,
    envelopeId: envelope.envelopeId,
    outcome: "failure",
    finalLayer: layer,
    envelope,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    errors: [{
      layer,
      code: "ORCHESTRATION_FAILURE",
      message: error,
      recoverable: false,
      timestamp: new Date().toISOString(),
    }],
  };
}
