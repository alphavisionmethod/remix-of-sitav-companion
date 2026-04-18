// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Policy
// Policy contracts governing transitions between layers
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationLayer, OrchestrationDomain } from "./orchestration-types";
import type { OrchestrationEnvelope, PolicySnapshot } from "./orchestration-envelope";
import type { OrchestrationContext } from "./orchestration-context";

export type TransitionDecision = "allow" | "deny" | "require_approval" | "downgrade_to_simulation";

export interface TransitionPolicy {
  policyId: string;
  name: string;
  fromLayer: OrchestrationLayer;
  toLayer: OrchestrationLayer;
  evaluate: (envelope: OrchestrationEnvelope, context: OrchestrationContext) => TransitionEvaluation;
}

export interface TransitionEvaluation {
  decision: TransitionDecision;
  reason: string;
  policyId: string;
  requiresApprovalFrom?: string[];
  downgradeReason?: string;
}

// ── Default transition policies ──

export const intentToPlanningPolicy: TransitionPolicy = {
  policyId: "pol-intent-to-planning",
  name: "Intent → Planning Gate",
  fromLayer: "intent",
  toLayer: "planning",
  evaluate: (envelope, context) => {
    if (!envelope.intentState) {
      return { decision: "deny", reason: "Intent state not resolved", policyId: "pol-intent-to-planning" };
    }
    if (envelope.intentState.riskTier === "critical" && context.trust.trustScore < 0.7) {
      return {
        decision: "require_approval",
        reason: "Critical risk with insufficient trust",
        policyId: "pol-intent-to-planning",
        requiresApprovalFrom: ["admin"],
      };
    }
    return { decision: "allow", reason: "Intent validated", policyId: "pol-intent-to-planning" };
  },
};

export const planningToExecutionPolicy: TransitionPolicy = {
  policyId: "pol-planning-to-execution",
  name: "Planning → Execution Gate",
  fromLayer: "planning",
  toLayer: "execution",
  evaluate: (envelope, context) => {
    if (!envelope.planningState) {
      return { decision: "deny", reason: "Plan not constructed", policyId: "pol-planning-to-execution" };
    }
    if (envelope.planningState.approvalRequired && envelope.planningState.approvalStatus !== "approved") {
      return { decision: "deny", reason: "Approval required but not granted", policyId: "pol-planning-to-execution" };
    }
    if (envelope.isSimulation) {
      return {
        decision: "downgrade_to_simulation",
        reason: "Simulation mode — no real execution",
        policyId: "pol-planning-to-execution",
        downgradeReason: "Envelope marked as simulation",
      };
    }
    if (!context.permission.allowFinancial && envelope.domain === "finance") {
      return { decision: "deny", reason: "Financial permission not granted", policyId: "pol-planning-to-execution" };
    }
    return { decision: "allow", reason: "Plan approved for execution", policyId: "pol-planning-to-execution" };
  },
};

export const executionToProofPolicy: TransitionPolicy = {
  policyId: "pol-execution-to-proof",
  name: "Execution → Proof Gate",
  fromLayer: "execution",
  toLayer: "proof",
  evaluate: (envelope) => {
    // Proof is always written, even on failure
    if (!envelope.executionState) {
      return { decision: "allow", reason: "Execution skipped, writing refusal proof", policyId: "pol-execution-to-proof" };
    }
    return { decision: "allow", reason: "Execution complete, writing proof", policyId: "pol-execution-to-proof" };
  },
};

export const DEFAULT_TRANSITION_POLICIES: TransitionPolicy[] = [
  intentToPlanningPolicy,
  planningToExecutionPolicy,
  executionToProofPolicy,
];

export function evaluateTransition(
  fromLayer: OrchestrationLayer,
  toLayer: OrchestrationLayer,
  envelope: OrchestrationEnvelope,
  context: OrchestrationContext,
  policies: TransitionPolicy[] = DEFAULT_TRANSITION_POLICIES
): TransitionEvaluation {
  const applicable = policies.find(p => p.fromLayer === fromLayer && p.toLayer === toLayer);
  if (!applicable) {
    return { decision: "deny", reason: `No policy for ${fromLayer} → ${toLayer}`, policyId: "none" };
  }
  return applicable.evaluate(envelope, context);
}

export function buildPolicySnapshot(
  evaluations: TransitionEvaluation[],
  riskTier: string,
  trustGrade: string
): PolicySnapshot {
  return {
    policyIds: evaluations.map(e => e.policyId),
    evaluatedAt: new Date().toISOString(),
    decisions: evaluations.map(e => ({
      policyId: e.policyId,
      decision: e.decision,
      reason: e.reason,
    })),
    riskTier,
    trustGrade,
  };
}
