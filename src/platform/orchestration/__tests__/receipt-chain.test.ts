import { describe, it, expect } from "vitest";
import { buildReceipt } from "../proof/receipt-builder";
import { buildAuditTrail } from "../proof/audit-trail-writer";
import { buildEventLineage } from "../proof/event-lineage-builder";
import { buildApprovalProof } from "../proof/approval-proof-builder";
import { buildReversibilityRecord } from "../proof/reversibility-writer";
import { buildTruthRecord } from "../proof/truth-record-builder";
import { createOrchestrationEnvelope, type OrchestrationEnvelope } from "../shared/orchestration-envelope";

function makeEnvelope(overrides: Partial<OrchestrationEnvelope> = {}): OrchestrationEnvelope {
  const base = createOrchestrationEnvelope({
    sourceSurface: "test",
    sourceUserId: "u1",
    domain: "business",
    capabilityId: "test.query",
    intentRaw: "test intent",
  });
  return {
    ...base,
    intentState: {
      classification: "query",
      resolvedDomain: "business",
      resolvedCapability: "test.query",
      riskTier: "standard",
      confidenceScore: 0.8,
      escalationRequired: false,
      recommendationIds: [],
    },
    planningState: {
      planId: "plan-1",
      steps: [
        { stepId: "s1", order: 1, type: "capability_call", target: "t1", params: {}, dependsOn: [], estimatedDurationMs: 100, reversible: true },
      ],
      approvalRequired: false,
      approvalStatus: "not_required",
      dependencyGraph: { s1: [] },
    },
    executionState: {
      executionId: "exec-1",
      stepsCompleted: 1,
      stepsTotal: 1,
      result: "success",
      sideEffects: [{ effectId: "e1", type: "state_change", target: "t1", reversible: true, reversed: false }],
      retryCount: 0,
      rollbackAvailable: true,
      durationMs: 50,
    },
    proofState: {
      receiptId: "r1",
      auditTrailId: "a1",
      eventLineageId: "l1",
      proofChainHash: "abc123",
      proofIntegrity: "full",
      truthRecordId: "t1",
    },
    ...overrides,
  };
}

describe("Receipt Chain", () => {
  it("buildReceipt produces all required fields", () => {
    const receipt = buildReceipt(makeEnvelope());
    expect(receipt.receiptId).toBeTruthy();
    expect(receipt.envelopeId).toBeTruthy();
    expect(receipt.domain).toBe("business");
    expect(receipt.outcome).toBe("success");
    expect(receipt.stepsExecuted).toBe(1);
    expect(receipt.sideEffectCount).toBe(1);
    expect(receipt.rollbackAvailable).toBe(true);
  });

  it("buildAuditTrail captures all layers", () => {
    const trail = buildAuditTrail(makeEnvelope());
    expect(trail.length).toBe(3); // intent, planning, execution
    expect(trail.map(e => e.layer)).toEqual(["intent", "planning", "execution"]);
  });

  it("buildEventLineage produces parent-child chain", () => {
    const lineage = buildEventLineage(makeEnvelope());
    expect(lineage.length).toBeGreaterThanOrEqual(4);
    // First event has no parent, rest have parentEventId
    expect(lineage[0].parentEventId).toBeUndefined();
    expect(lineage[1].parentEventId).toBe(lineage[0].eventId);
  });

  it("buildApprovalProof with not_required state", () => {
    const proof = buildApprovalProof(makeEnvelope());
    expect(proof.approvalRequired).toBe(false);
    expect(proof.approvalStatus).toBe("not_required");
  });

  it("buildReversibilityRecord with reversible effects", () => {
    const rev = buildReversibilityRecord(makeEnvelope());
    expect(rev.reversibleEffects).toBe(1);
    expect(rev.irreversibleEffects).toBe(0);
    expect(rev.fullReversalPossible).toBe(true);
    expect(rev.effects.length).toBe(1);
  });

  it("buildTruthRecord composes all sub-records", () => {
    const env = makeEnvelope();
    const receipt = buildReceipt(env);
    const audit = buildAuditTrail(env);
    const lineage = buildEventLineage(env);
    const rev = buildReversibilityRecord(env);
    const approval = buildApprovalProof(env);
    const truth = buildTruthRecord(env, receipt, audit, lineage, rev, approval);
    expect(truth.truthRecordId).toBeTruthy();
    expect(truth.receipt).toBe(receipt);
    expect(truth.auditTrail).toBe(audit);
    expect(truth.lineage).toBe(lineage);
    expect(truth.reversibility).toBe(rev);
    expect(truth.approvalProof).toBe(approval);
    expect(truth.integrity).toBe("full");
  });
});