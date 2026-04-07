// ═══════════════════════════════════════════════════════════════
// SITA OS — Scoped Cortex Loop Runtime
// Controlled cycle: Sense → State → Plan → Approve → Execute → Prove → Learn
// Applied to selected high-value domains only
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "@/packages/contracts/_contract-scaffold";
import type { GradedEvidenceSet } from "./evidence-grader";
import type { AssumptionSet } from "./assumption-registry";
import type { SentinelReport } from "./sentinel-engine";

// ── Cortex Loop Types ──────────────────────────────────────────

export type CortexStage = "sense" | "state-update" | "plan" | "approve" | "execute" | "prove" | "learn";

export interface CortexLoopConfig {
  loopId: string;
  domain: DomainId;
  description: string;
  enabled: boolean;
  requiresApproval: boolean;
  requiresProof: boolean;
  learnFromOutcomes: boolean;
  maxIterations: number;
}

export interface CortexState {
  loopId: string;
  currentStage: CortexStage;
  iteration: number;
  startedAt: string;
  context: Record<string, unknown>;
  evidenceSet?: GradedEvidenceSet;
  assumptions?: AssumptionSet;
  sentinelReport?: SentinelReport;
  planApproved: boolean;
  executionComplete: boolean;
  proofGenerated: boolean;
  learningApplied: boolean;
  stageHistory: CortexStageRecord[];
  correlationId: string;
  userId?: string;
}

export interface CortexStageRecord {
  stage: CortexStage;
  enteredAt: string;
  exitedAt?: string;
  durationMs?: number;
  outcome: "success" | "failed" | "skipped" | "blocked";
  details: string;
}

export interface CortexOutcome {
  loopId: string;
  correlationId: string;
  domain: DomainId;
  totalDurationMs: number;
  stagesCompleted: number;
  finalStage: CortexStage;
  success: boolean;
  proofAvailable: boolean;
  learningApplied: boolean;
  assumptions: number;
  evidenceGrade: string;
  completedAt: string;
}

// ── Loop Configurations ────────────────────────────────────────

export const CORTEX_LOOP_CONFIGS: CortexLoopConfig[] = [
  {
    loopId: "cortex-finance-planning",
    domain: "finance",
    description: "Financial planning and projection cycle with deterministic proof",
    enabled: true,
    requiresApproval: true,
    requiresProof: true,
    learnFromOutcomes: true,
    maxIterations: 3,
  },
  {
    loopId: "cortex-boardroom-synthesis",
    domain: "general",
    description: "Boardroom synthesis and strategic decision support",
    enabled: true,
    requiresApproval: false,
    requiresProof: true,
    learnFromOutcomes: true,
    maxIterations: 2,
  },
  {
    loopId: "cortex-recommendation-execution",
    domain: "general",
    description: "Recommendation → approval → execution → proof cycle",
    enabled: true,
    requiresApproval: true,
    requiresProof: true,
    learnFromOutcomes: true,
    maxIterations: 1,
  },
  {
    loopId: "cortex-connector-action",
    domain: "general",
    description: "External connector action with governance",
    enabled: true,
    requiresApproval: true,
    requiresProof: true,
    learnFromOutcomes: false,
    maxIterations: 1,
  },
];

// ── Cortex Loop Executor ───────────────────────────────────────

export function createCortexState(
  config: CortexLoopConfig,
  correlationId: string,
  userId?: string
): CortexState {
  return {
    loopId: config.loopId,
    currentStage: "sense",
    iteration: 0,
    startedAt: new Date().toISOString(),
    context: {},
    planApproved: false,
    executionComplete: false,
    proofGenerated: false,
    learningApplied: false,
    stageHistory: [],
    correlationId,
    userId,
  };
}

export function advanceStage(
  state: CortexState,
  outcome: "success" | "failed" | "skipped" | "blocked",
  details: string
): CortexState {
  const now = new Date().toISOString();
  const lastRecord = state.stageHistory[state.stageHistory.length - 1];

  if (lastRecord && !lastRecord.exitedAt) {
    lastRecord.exitedAt = now;
    lastRecord.durationMs = new Date(now).getTime() - new Date(lastRecord.enteredAt).getTime();
    lastRecord.outcome = outcome;
    lastRecord.details = details;
  }

  const nextStage = getNextStage(state.currentStage, outcome);

  if (nextStage) {
    state.currentStage = nextStage;
    state.stageHistory.push({
      stage: nextStage,
      enteredAt: now,
      outcome: "success",
      details: "",
    });
  }

  // Update state flags
  if (state.currentStage === "approve" && outcome === "success") state.planApproved = true;
  if (state.currentStage === "execute" && outcome === "success") state.executionComplete = true;
  if (state.currentStage === "prove" && outcome === "success") state.proofGenerated = true;
  if (state.currentStage === "learn" && outcome === "success") state.learningApplied = true;

  return state;
}

function getNextStage(
  current: CortexStage,
  outcome: string
): CortexStage | null {
  if (outcome === "failed" || outcome === "blocked") return null;

  const sequence: CortexStage[] = ["sense", "state-update", "plan", "approve", "execute", "prove", "learn"];
  const idx = sequence.indexOf(current);
  return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null;
}

export function completeCortexLoop(state: CortexState): CortexOutcome {
  const now = new Date();
  const startTime = new Date(state.startedAt);

  return {
    loopId: state.loopId,
    correlationId: state.correlationId,
    domain: CORTEX_LOOP_CONFIGS.find((c) => c.loopId === state.loopId)?.domain || "general",
    totalDurationMs: now.getTime() - startTime.getTime(),
    stagesCompleted: state.stageHistory.filter((s) => s.outcome === "success").length,
    finalStage: state.currentStage,
    success: state.executionComplete,
    proofAvailable: state.proofGenerated,
    learningApplied: state.learningApplied,
    assumptions: state.assumptions?.totalCount || 0,
    evidenceGrade: state.evidenceSet?.bestGrade || "N/A",
    completedAt: now.toISOString(),
  };
}

// ── Outcome Learning ───────────────────────────────────────────

export interface VerifiedOutcome {
  outcomeId: string;
  loopId: string;
  correlationId: string;
  domain: DomainId;
  prediction: string;
  actualResult: string;
  accurate: boolean;
  confidenceDelta: number;
  verifiedAt: string;
  verifiedBy: "system" | "operator" | "auto";
  learningAction: "increase-confidence" | "decrease-confidence" | "tighten-policy" | "no-change";
}

const outcomeLog: VerifiedOutcome[] = [];

export function recordVerifiedOutcome(params: {
  loopId: string;
  correlationId: string;
  domain: DomainId;
  prediction: string;
  actualResult: string;
  accurate: boolean;
  verifiedBy: VerifiedOutcome["verifiedBy"];
}): VerifiedOutcome {
  const outcome: VerifiedOutcome = {
    outcomeId: `vo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    loopId: params.loopId,
    correlationId: params.correlationId,
    domain: params.domain,
    prediction: params.prediction,
    actualResult: params.actualResult,
    accurate: params.accurate,
    confidenceDelta: params.accurate ? 0.05 : -0.1,
    verifiedAt: new Date().toISOString(),
    verifiedBy: params.verifiedBy,
    learningAction: params.accurate ? "increase-confidence" : "decrease-confidence",
  };

  outcomeLog.push(outcome);
  if (outcomeLog.length > 500) outcomeLog.splice(0, outcomeLog.length - 500);

  return outcome;
}

export function getVerifiedOutcomes(filters?: {
  domain?: DomainId;
  loopId?: string;
  accurate?: boolean;
}): VerifiedOutcome[] {
  let results = [...outcomeLog];
  if (filters?.domain) results = results.filter((o) => o.domain === filters.domain);
  if (filters?.loopId) results = results.filter((o) => o.loopId === filters.loopId);
  if (filters?.accurate !== undefined) results = results.filter((o) => o.accurate === filters.accurate);
  return results;
}

export function getOutcomeLearningStats(): {
  total: number;
  accuracyRate: number;
  avgConfidenceDelta: number;
  byDomain: Record<string, { accurate: number; inaccurate: number }>;
} {
  const byDomain: Record<string, { accurate: number; inaccurate: number }> = {};
  let accurate = 0;
  let totalDelta = 0;

  for (const o of outcomeLog) {
    if (o.accurate) accurate++;
    totalDelta += o.confidenceDelta;
    if (!byDomain[o.domain]) byDomain[o.domain] = { accurate: 0, inaccurate: 0 };
    if (o.accurate) byDomain[o.domain].accurate++;
    else byDomain[o.domain].inaccurate++;
  }

  return {
    total: outcomeLog.length,
    accuracyRate: outcomeLog.length > 0 ? accurate / outcomeLog.length : 0,
    avgConfidenceDelta: outcomeLog.length > 0 ? totalDelta / outcomeLog.length : 0,
    byDomain,
  };
}

export function getCortexLoopConfig(loopId: string): CortexLoopConfig | undefined {
  return CORTEX_LOOP_CONFIGS.find((c) => c.loopId === loopId);
}
