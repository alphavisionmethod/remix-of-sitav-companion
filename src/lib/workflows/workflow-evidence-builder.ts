// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Evidence Builder
// Generates per-workflow evidence bundles and closure artifacts
// ═══════════════════════════════════════════════════════════════

import { WORKFLOW_PROOF_REGISTRY, type WorkflowFamilyId } from "./workflow-proof-registry";
import { getStepContractsForFamily } from "./workflow-step-contracts";

export interface WorkflowRunRecord {
  runId: string;
  familyId: WorkflowFamilyId;
  startedAt: string;
  completedAt: string | null;
  finalState: string;
  stepsExecuted: WorkflowStepExecution[];
  retries: number;
  failures: WorkflowFailureRecord[];
  rollbackOutcome: string | null;
  correlationId: string | null;
}

export interface WorkflowStepExecution {
  stepId: string;
  startedAt: string;
  completedAt: string | null;
  state: "success" | "failed" | "skipped" | "rolled-back";
  evidenceRef: string | null;
  retryCount: number;
  error: string | null;
}

export interface WorkflowFailureRecord {
  stepId: string;
  failureMode: string;
  timestamp: string;
  retried: boolean;
  resolved: boolean;
  resolution: string | null;
}

export interface WorkflowEvidenceBundle {
  bundleId: string;
  familyId: WorkflowFamilyId;
  owner: string;
  generatedAt: string;
  runRecord: WorkflowRunRecord;
  stepContracts: number;
  evidenceSources: string[];
  decisionPoints: string[];
  retryCount: number;
  failureCount: number;
  rollbackOutcome: string | null;
  proofOfFinalState: string;
  supportableIdentifiers: Record<string, string>;
}

export function buildWorkflowEvidenceBundle(
  familyId: WorkflowFamilyId,
  run: WorkflowRunRecord
): WorkflowEvidenceBundle {
  const family = WORKFLOW_PROOF_REGISTRY[familyId];
  const contracts = getStepContractsForFamily(familyId);

  const decisionPoints = run.stepsExecuted
    .filter(s => s.state === "failed" || s.retryCount > 0)
    .map(s => `${s.stepId}:${s.state}${s.retryCount > 0 ? `:retried-${s.retryCount}x` : ""}`);

  return {
    bundleId: crypto.randomUUID(),
    familyId,
    owner: family.owner,
    generatedAt: new Date().toISOString(),
    runRecord: run,
    stepContracts: contracts.length,
    evidenceSources: family.evidenceSources,
    decisionPoints,
    retryCount: run.retries,
    failureCount: run.failures.length,
    rollbackOutcome: run.rollbackOutcome,
    proofOfFinalState: run.completedAt
      ? `completed:${run.finalState}@${run.completedAt}`
      : `incomplete:${run.finalState}@${run.stepsExecuted.at(-1)?.completedAt ?? "unknown"}`,
    supportableIdentifiers: {
      runId: run.runId,
      familyId,
      correlationId: run.correlationId ?? "none",
      runbookRef: family.runbookRef ?? "none",
    },
  };
}

export function buildClosureMatrixEntry(familyId: WorkflowFamilyId) {
  const family = WORKFLOW_PROOF_REGISTRY[familyId];
  const contracts = getStepContractsForFamily(familyId);
  const declaredSteps = family.stepIds.length;
  const contractedSteps = contracts.length;

  return {
    familyId,
    owner: family.owner,
    intent: family.intent,
    deploymentCriticality: family.deploymentCriticality,
    declaredSteps,
    contractedSteps,
    stepCoverage: declaredSteps > 0 ? Math.round((contractedSteps / declaredSteps) * 100) : 0,
    evidenceSources: family.evidenceSources,
    replayable: family.replayable,
    rollbackDeclared: family.rollbackSemantics.reversibleSteps.length > 0,
    failureInjectionPoints: family.failureInjectionPoints.length,
    dashboardRoute: family.dashboardRoute,
    killSwitchBinding: family.killSwitchBinding,
    goldenPathRef: family.goldenPathRef,
    runbookRef: family.runbookRef,
  };
}