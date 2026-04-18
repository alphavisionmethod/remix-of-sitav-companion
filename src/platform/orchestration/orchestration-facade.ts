// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Facade
// THE SINGLE ENTRY POINT for all orchestration requests.
// Intent → Planning → Execution → Proof
// ═══════════════════════════════════════════════════════════════

import { createOrchestrationEnvelope, type OrchestrationEnvelope } from "./shared/orchestration-envelope";
import { createDefaultContext, type OrchestrationContext } from "./shared/orchestration-context";
import type { OrchestrationDomain, OrchestrationPriority } from "./shared/orchestration-types";
import { evaluateTransition } from "./shared/orchestration-policy";
import { createSuccessResult, createFailureResult, type OrchestrationResult } from "./shared/orchestration-result";
import { canonicalIntentOrchestrator } from "./intent/intent-orchestrator";
import { canonicalPlanningOrchestrator } from "./planning/planning-orchestrator";
import { canonicalExecutionOrchestrator } from "./execution/execution-orchestrator";
import { canonicalProofOrchestrator } from "./proof/proof-orchestrator";
import { buildReceipt } from "./proof/receipt-builder";
import { buildAuditTrail } from "./proof/audit-trail-writer";
import { buildEventLineage } from "./proof/event-lineage-builder";
import { buildApprovalProof } from "./proof/approval-proof-builder";
import { buildReversibilityRecord } from "./proof/reversibility-writer";
import { buildTruthRecord, type TruthRecord } from "./proof/truth-record-builder";
import { OrchestrationError as OrcError } from "./shared/orchestration-errors";

export interface ProcessIntentRequest {
  intentRaw: string;
  domain?: OrchestrationDomain;
  capabilityId?: string;
  sourceSurface?: string;
  userId: string;
  priority?: OrchestrationPriority;
  isSimulation?: boolean;
  metadata?: Record<string, unknown>;
  contextOverrides?: Partial<OrchestrationContext>;
}

/**
 * THE canonical orchestration facade.
 * All systems call processIntent() — nothing else.
 */
export class OrchestrationFacade {
  private lastResult: OrchestrationResult | null = null;
  private lastTruthRecord: TruthRecord | null = null;

  async processIntent(request: ProcessIntentRequest): Promise<OrchestrationResult> {
    const startTime = Date.now();

    // 1. Create envelope
    let envelope = createOrchestrationEnvelope({
      sourceSurface: request.sourceSurface ?? "desktop",
      sourceUserId: request.userId,
      domain: request.domain ?? "cross-domain",
      capabilityId: request.capabilityId ?? "auto-detect",
      intentRaw: request.intentRaw,
      priority: request.priority,
      isSimulation: request.isSimulation,
      metadata: request.metadata,
    });

    // 2. Build context
    const context: OrchestrationContext = {
      ...createDefaultContext(request.userId),
      ...request.contextOverrides,
    };

    try {
      // ── Layer A: Intent ──
      envelope = await canonicalIntentOrchestrator.resolveIntent(envelope, context);

      // Policy gate: Intent → Planning
      const intentToPlan = evaluateTransition("intent", "planning", envelope, context);
      if (intentToPlan.decision === "deny") {
        envelope = await canonicalProofOrchestrator.recordProof(
          { ...envelope, status: "refused" }, context
        );
        const result = createFailureResult(envelope, "intent", intentToPlan.reason, startTime);
        result.outcome = "refused";
        result.intentOutcome = this.extractIntentOutcome(envelope);
        this.lastResult = result;
        return result;
      }

      // ── Layer B: Planning ──
      envelope = await canonicalPlanningOrchestrator.buildPlan(envelope, context);

      // Policy gate: Planning → Execution
      const planToExec = evaluateTransition("planning", "execution", envelope, context);
      if (planToExec.decision === "deny") {
        envelope = await canonicalProofOrchestrator.recordProof(
          { ...envelope, status: "refused" }, context
        );
        const result = createFailureResult(envelope, "planning", planToExec.reason, startTime);
        result.outcome = "refused";
        result.intentOutcome = this.extractIntentOutcome(envelope);
        result.planningOutcome = this.extractPlanningOutcome(envelope);
        this.lastResult = result;
        return result;
      }

      if (planToExec.decision === "require_approval") {
        // Park for approval
        envelope = await canonicalProofOrchestrator.recordProof(
          { ...envelope, status: "awaiting_approval" }, context
        );
        const result = createSuccessResult(envelope, startTime);
        result.outcome = "approval_pending";
        result.intentOutcome = this.extractIntentOutcome(envelope);
        result.planningOutcome = this.extractPlanningOutcome(envelope);
        this.lastResult = result;
        return result;
      }

      // ── Layer C: Execution ──
      if (planToExec.decision !== "downgrade_to_simulation") {
        envelope = await canonicalExecutionOrchestrator.execute(envelope, context);
      }

      // ── Layer D: Proof ──
      envelope = await canonicalProofOrchestrator.recordProof(envelope, context);

      // Build full truth record
      const receipt = buildReceipt(envelope);
      const auditTrail = buildAuditTrail(envelope);
      const lineage = buildEventLineage(envelope);
      const reversibility = buildReversibilityRecord(envelope);
      const approvalProof = buildApprovalProof(envelope);
      this.lastTruthRecord = buildTruthRecord(
        envelope, receipt, auditTrail, lineage, reversibility, approvalProof
      );

      // Build result
      const result = createSuccessResult(envelope, startTime);
      result.intentOutcome = this.extractIntentOutcome(envelope);
      result.planningOutcome = this.extractPlanningOutcome(envelope);
      result.executionOutcome = this.extractExecutionOutcome(envelope);
      result.proofOutcome = this.extractProofOutcome(envelope);
      this.lastResult = result;
      return result;

    } catch (err) {
      // Always write proof, even on error
      try {
        envelope = await canonicalProofOrchestrator.recordProof(
          { ...envelope, status: "failed" }, context
        );
      } catch { /* proof failure is secondary */ }

      const layer = err instanceof OrcError ? err.layer : "execution";
      const message = err instanceof Error ? err.message : String(err);
      const result = createFailureResult(envelope, layer, message, startTime);
      this.lastResult = result;
      return result;
    }
  }

  getLastResult(): OrchestrationResult | null { return this.lastResult; }
  getLastTruthRecord(): TruthRecord | null { return this.lastTruthRecord; }

  private extractIntentOutcome(e: OrchestrationEnvelope) {
    if (!e.intentState) return undefined;
    return {
      classification: e.intentState.classification,
      domain: e.intentState.resolvedDomain,
      capability: e.intentState.resolvedCapability,
      riskTier: e.intentState.riskTier,
      confidence: e.intentState.confidenceScore,
      escalated: e.intentState.escalationRequired,
    };
  }

  private extractPlanningOutcome(e: OrchestrationEnvelope) {
    if (!e.planningState) return undefined;
    return {
      planId: e.planningState.planId,
      stepCount: e.planningState.steps.length,
      approvalRequired: e.planningState.approvalRequired,
      approvalStatus: e.planningState.approvalStatus,
      simulationPassed: e.planningState.simulationResult?.passed,
      estimatedDurationMs: e.planningState.steps.reduce((a, s) => a + s.estimatedDurationMs, 0),
    };
  }

  private extractExecutionOutcome(e: OrchestrationEnvelope) {
    if (!e.executionState) return undefined;
    return {
      executionId: e.executionState.executionId,
      stepsCompleted: e.executionState.stepsCompleted,
      stepsTotal: e.executionState.stepsTotal,
      sideEffectCount: e.executionState.sideEffects.length,
      rollbackAvailable: e.executionState.rollbackAvailable,
      durationMs: e.executionState.durationMs,
    };
  }

  private extractProofOutcome(e: OrchestrationEnvelope) {
    if (!e.proofState) return undefined;
    return {
      receiptId: e.proofState.receiptId,
      auditTrailId: e.proofState.auditTrailId,
      proofChainHash: e.proofState.proofChainHash,
      integrity: e.proofState.proofIntegrity,
    };
  }
}

/** Singleton facade instance */
export const orchestrationFacade = new OrchestrationFacade();
