// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Envelope
// Universal envelope flowing through all 4 layers
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationLayer, OrchestrationDomain, OrchestrationPriority, OrchestrationStatus } from "./orchestration-types";

export interface OrchestrationEnvelope {
  envelopeId: string;
  correlationId: string;
  parentEnvelopeId?: string;

  // Source
  sourceSurface: string;
  sourceUserId: string;
  sourceTenantId?: string;

  // Domain
  domain: OrchestrationDomain;
  capabilityId: string;
  intentRaw: string;

  // State
  currentLayer: OrchestrationLayer;
  status: OrchestrationStatus;
  priority: OrchestrationPriority;

  // Layer state snapshots
  intentState?: IntentLayerState;
  planningState?: PlanningLayerState;
  executionState?: ExecutionLayerState;
  proofState?: ProofLayerState;

  // Policy
  policySnapshot?: PolicySnapshot;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  expiresAt?: string;

  // Metadata
  idempotencyKey: string;
  isSimulation: boolean;
  metadata: Record<string, unknown>;
}

export interface IntentLayerState {
  classification: string;
  resolvedDomain: OrchestrationDomain;
  resolvedCapability: string;
  riskTier: string;
  confidenceScore: number;
  escalationRequired: boolean;
  recommendationIds: string[];
}

export interface PlanningLayerState {
  planId: string;
  steps: PlannedStep[];
  approvalRequired: boolean;
  approvalStatus: "not_required" | "pending" | "approved" | "denied";
  approvalId?: string;
  simulationResult?: SimulationSummary;
  dependencyGraph: Record<string, string[]>;
  contingencyPlanId?: string;
}

export interface PlannedStep {
  stepId: string;
  order: number;
  type: "capability_call" | "approval_gate" | "side_effect" | "notification" | "checkpoint";
  target: string;
  params: Record<string, unknown>;
  dependsOn: string[];
  estimatedDurationMs: number;
  reversible: boolean;
}

export interface SimulationSummary {
  simulationId: string;
  passed: boolean;
  riskScore: number;
  sideEffectsDetected: number;
  durationMs: number;
}

export interface ExecutionLayerState {
  executionId: string;
  stepsCompleted: number;
  stepsTotal: number;
  currentStep?: string;
  result: "pending" | "success" | "partial" | "failure" | "rolled_back";
  sideEffects: ExecutedSideEffect[];
  retryCount: number;
  rollbackAvailable: boolean;
  durationMs: number;
}

export interface ExecutedSideEffect {
  effectId: string;
  type: "data_mutation" | "notification" | "external_call" | "state_change" | "financial";
  target: string;
  reversible: boolean;
  reversed: boolean;
}

export interface ProofLayerState {
  receiptId: string;
  auditTrailId: string;
  eventLineageId: string;
  proofChainHash: string;
  proofIntegrity: "full" | "partial" | "degraded";
  truthRecordId?: string;
}

export interface PolicySnapshot {
  policyIds: string[];
  evaluatedAt: string;
  decisions: Array<{
    policyId: string;
    decision: "allow" | "deny" | "require_approval" | "downgrade";
    reason: string;
  }>;
  riskTier: string;
  trustGrade: string;
}

export function createOrchestrationEnvelope(params: {
  sourceSurface: string;
  sourceUserId: string;
  domain: OrchestrationDomain;
  capabilityId: string;
  intentRaw: string;
  priority?: OrchestrationPriority;
  isSimulation?: boolean;
  metadata?: Record<string, unknown>;
}): OrchestrationEnvelope {
  const now = new Date().toISOString();
  return {
    envelopeId: crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
    sourceSurface: params.sourceSurface,
    sourceUserId: params.sourceUserId,
    domain: params.domain,
    capabilityId: params.capabilityId,
    intentRaw: params.intentRaw,
    currentLayer: "intent",
    status: "pending",
    priority: params.priority ?? "medium",
    createdAt: now,
    updatedAt: now,
    idempotencyKey: crypto.randomUUID(),
    isSimulation: params.isSimulation ?? false,
    metadata: params.metadata ?? {},
  };
}

export function advanceEnvelopeLayer(
  envelope: OrchestrationEnvelope,
  toLayer: OrchestrationLayer
): OrchestrationEnvelope {
  return {
    ...envelope,
    currentLayer: toLayer,
    updatedAt: new Date().toISOString(),
  };
}
