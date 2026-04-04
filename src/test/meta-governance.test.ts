import { describe, it, expect, beforeEach } from "vitest";
import { TrustDebtEngine } from "@/lib/engines/trust-debt-engine";
import { ExecutionDebtEngine } from "@/lib/engines/execution-debt-engine";
import { DragEngine } from "@/lib/engines/drag-engine";
import { ReadinessEngine } from "@/lib/engines/readiness-engine";
import { InvisibleLaborEngine } from "@/lib/engines/invisible-labor-engine";
import { FounderBottleneckEngine } from "@/lib/engines/founder-bottleneck-engine";
import { DelegationEngine } from "@/lib/engines/delegation-engine";
import { WorkspaceViewEngine } from "@/lib/engines/workspace-view-engine";
import { MetaGovernanceEngine } from "@/lib/engines/meta-governance-engine";
import type { OSEntityScope as EntityScope, ActionRecord } from "@/packages/contracts";

const SCOPE: EntityScope = { ownerId: "user1", visibility: "private" };

const makeAction = (overrides: Partial<ActionRecord> = {}): ActionRecord => ({
  id: `act_${Math.random().toString(36).slice(2)}`,
  workflowId: "wf_test",
  domain: "business",
  currentState: "completed",
  stateHistory: [{ from: "detected", to: "completed", triggeredBy: "system", timestamp: new Date().toISOString(), reason: "done", confidence: 0.9 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  rollbackEligible: true,
  replayable: true,
  blockingReasons: [],
  dependsOn: [],
  confidenceScore: 0.9,
  assignedAdvisor: "advisor1",
  proofIds: ["p1"],
  entityScope: SCOPE,
  ...overrides,
});

// ── Trust Debt Engine ───────────────────────────────────────────
describe("TrustDebtEngine", () => {
  let engine: TrustDebtEngine;
  beforeEach(() => { engine = new TrustDebtEngine(); });

  it("records trust debt with full lineage", () => {
    const record = engine.record({
      category: "weak_proof", severity: "high",
      source: { type: "workflow", id: "wf1", name: "Test" },
      entityScope: SCOPE, domain: "business", trustDimension: "proofCompleteness",
      evidence: [{ sourceEventId: "e1", timestamp: new Date().toISOString(), metric: "proof_rate", value: 0.3, description: "Low proof" }],
      proofGaps: ["p1"], policyGaps: [], replayGaps: [],
      description: "Test debt", impact: "High", recommendation: "Fix it",
    });
    expect(record.id).toBeTruthy();
    expect(record.remediationStatus).toBe("open");
    expect(engine.getLedger()).toHaveLength(1);
  });

  it("detects trust debt from action with weak proof", () => {
    const action = makeAction({ proofIds: ["p1", "p2"], confidenceScore: 0.3 });
    const result = engine.detectFromAction(action, []);
    expect(result).not.toBeNull();
    expect(result!.category).toBe("weak_proof");
  });

  it("does not detect debt from well-proven action", () => {
    const action = makeAction({ proofIds: ["p1"] });
    const result = engine.detectFromAction(action, [{ id: "p1", verified: true } as never]);
    expect(result).toBeNull();
  });

  it("updates remediation status", () => {
    const record = engine.record({
      category: "policy_bypass", severity: "medium",
      source: { type: "policy", id: "pol1", name: "Pol" },
      entityScope: SCOPE, domain: "system", trustDimension: "policyCompliance",
      evidence: [], proofGaps: [], policyGaps: ["pol1"], replayGaps: [],
      description: "Bypass", impact: "Med", recommendation: "Review",
    });
    const updated = engine.updateRemediation(record.id, "resolved");
    expect(updated?.remediationStatus).toBe("resolved");
    expect(updated?.trend).toBe("improving");
  });

  it("computes debt score normalized 0-1", () => {
    engine.record({ category: "weak_proof", severity: "critical", source: { type: "system", id: "s", name: "S" }, entityScope: SCOPE, domain: "system", trustDimension: "proofCompleteness", evidence: [], proofGaps: [], policyGaps: [], replayGaps: [], description: "D", impact: "I", recommendation: "R" });
    const score = engine.computeDebtScore();
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("produces boardroom section", () => {
    const section = engine.getBoardroomSection();
    expect(section.systemId).toBe("trust-debt-ledger");
    expect(section.drilldownRoute).toBe("/governance/trust-debt");
  });

  it("filters by dimension, category, domain", () => {
    engine.record({ category: "weak_proof", severity: "low", source: { type: "system", id: "s", name: "S" }, entityScope: SCOPE, domain: "finance", trustDimension: "proofCompleteness", evidence: [], proofGaps: [], policyGaps: [], replayGaps: [], description: "D", impact: "I", recommendation: "R" });
    engine.record({ category: "policy_bypass", severity: "low", source: { type: "system", id: "s", name: "S" }, entityScope: SCOPE, domain: "business", trustDimension: "policyCompliance", evidence: [], proofGaps: [], policyGaps: [], replayGaps: [], description: "D", impact: "I", recommendation: "R" });
    expect(engine.getByDimension("proofCompleteness")).toHaveLength(1);
    expect(engine.getByCategory("policy_bypass")).toHaveLength(1);
    expect(engine.getByDomain("finance")).toHaveLength(1);
  });
});

// ── Execution Debt Engine ───────────────────────────────────────
describe("ExecutionDebtEngine", () => {
  let engine: ExecutionDebtEngine;
  beforeEach(() => { engine = new ExecutionDebtEngine(); });

  it("detects stuck workflows", () => {
    const actions = [makeAction({ stuckSince: new Date(Date.now() - 3600000).toISOString(), currentState: "executing" })];
    const debts = engine.detectFromActions(actions);
    expect(debts.some(d => d.category === "stuck_workflow")).toBe(true);
  });

  it("detects repeated failures", () => {
    const actions = [
      makeAction({ currentState: "failed" }),
      makeAction({ currentState: "rolled_back" }),
    ];
    const debts = engine.detectFromActions(actions);
    expect(debts.some(d => d.category === "repeated_recovery")).toBe(true);
  });

  it("computes heatmap", () => {
    engine.record({ category: "stuck_workflow", severity: "high", source: { type: "workflow", id: "w", name: "W" }, entityScope: SCOPE, domain: "business", workflowFamily: "wf", actionStateBottleneck: "executing", evidence: [], sourceActionIds: [], patternCount: 1, downstreamImpact: [], affectedEntities: [], recommendation: "Fix", remediationType: "manual_fix" });
    const heatmap = engine.getHeatmap();
    expect(heatmap.length).toBeGreaterThan(0);
    expect(heatmap[0].category).toBe("stuck_workflow");
  });
});

// ── Drag Engine ─────────────────────────────────────────────────
describe("DragEngine", () => {
  let engine: DragEngine;
  beforeEach(() => { engine = new DragEngine(); });

  it("records drag events and computes index", () => {
    engine.recordEvent({ dimension: "manual_work", score: 0.7, evidence: [], entityScope: SCOPE, module: "test", domain: "business" });
    engine.recordEvent({ dimension: "blocked_approval", score: 0.8, evidence: [], entityScope: SCOPE, module: "test", domain: "business" });
    const index = engine.computeIndex(SCOPE);
    expect(index.compositeScore).toBeGreaterThan(0);
    expect(index.dimensions.length).toBe(14);
  });

  it("generates recommendations for high-drag dimensions", () => {
    engine.recordEvent({ dimension: "founder_dependency", score: 0.9, evidence: [], entityScope: SCOPE, module: "test", domain: "business" });
    const index = engine.computeIndex(SCOPE);
    expect(index.recommendations.length).toBeGreaterThan(0);
  });
});

// ── Readiness Engine ────────────────────────────────────────────
describe("ReadinessEngine", () => {
  let readiness: ReadinessEngine;
  let trustDebt: TrustDebtEngine;
  let execDebt: ExecutionDebtEngine;
  const goodInput = {
    proofCompleteness: { rate: 0.95, evidence: [] },
    replaySafety: { rate: 0.9, evidence: [] },
    rollbackReadiness: { rate: 0.85, evidence: [] },
    policyMaturity: { score: 0.8, evidence: [] },
    errorRate: { rate: 0.05, evidence: [] },
    approvalBehavior: { autoApprovalRate: 0.7, evidence: [] },
    connectorStability: { uptimeRate: 0.99, evidence: [] },
    observabilityQuality: { coverage: 0.85, evidence: [] },
    supportBurden: { ticketRate: 0.1, evidence: [] },
    confidenceQuality: { avgConfidence: 0.88, evidence: [] },
  };

  beforeEach(() => { readiness = new ReadinessEngine(); trustDebt = new TrustDebtEngine(); execDebt = new ExecutionDebtEngine(); });

  it("computes high readiness for good inputs", () => {
    const score = readiness.compute(goodInput, trustDebt, execDebt, SCOPE);
    expect(score.compositeScore).toBeGreaterThan(0.7);
    expect(["bounded_recurring", "expanded_recurring", "approval_exceptions"]).toContain(score.recommendedTier);
  });

  it("blocks promotion when trust debt is high", () => {
    for (let i = 0; i < 15; i++) {
      trustDebt.record({ category: "weak_proof", severity: "critical", source: { type: "system", id: "s", name: "S" }, entityScope: SCOPE, domain: "system", trustDimension: "proofCompleteness", evidence: [], proofGaps: [], policyGaps: [], replayGaps: [], description: "D", impact: "I", recommendation: "R" });
    }
    const score = readiness.compute(goodInput, trustDebt, execDebt, SCOPE);
    expect(score.subscores.trustDebt.value).toBeLessThan(0.5);
  });

  it("returns explainable reason string", () => {
    const score = readiness.compute(goodInput, trustDebt, execDebt, SCOPE);
    expect(score.explanation.length).toBeGreaterThan(10);
  });
});

// ── Delegation Engine ───────────────────────────────────────────
describe("DelegationEngine", () => {
  let engine: DelegationEngine;
  beforeEach(() => { engine = new DelegationEngine(); });

  it("registers and promotes delegation", () => {
    const reg = engine.register({ workflowFamily: "invoicing", domain: "finance", entityScope: SCOPE });
    expect(reg.currentTier).toBe("observe");
    engine.promote(reg.id, "Meets requirements", ["proof1"]);
    const updated = engine.getByWorkflowFamily("invoicing");
    expect(updated?.currentTier).toBe("suggest");
  });

  it("demotes and resets consecutive successes", () => {
    const reg = engine.register({ workflowFamily: "billing", domain: "finance", entityScope: SCOPE, initialTier: "approval_exceptions" });
    engine.demote(reg.id, "observe", "Trust debt spike", "incident_1");
    const updated = engine.getByWorkflowFamily("billing");
    expect(updated?.currentTier).toBe("observe");
    expect(updated?.consecutiveSuccesses).toBe(0);
  });

  it("tracks execution outcomes", () => {
    const reg = engine.register({ workflowFamily: "reports", domain: "business", entityScope: SCOPE });
    engine.recordExecution(reg.id, true);
    engine.recordExecution(reg.id, true);
    engine.recordExecution(reg.id, false);
    const record = engine.getByWorkflowFamily("reports");
    expect(record?.totalExecutions).toBe(3);
    expect(record?.totalFailures).toBe(1);
    expect(record?.consecutiveSuccesses).toBe(0);
  });
});

// ── Invisible Labor Engine ──────────────────────────────────────
describe("InvisibleLaborEngine", () => {
  let engine: InvisibleLaborEngine;
  beforeEach(() => { engine = new InvisibleLaborEngine(); });

  it("blocks recording without consent", () => {
    const result = engine.recordEvent({ laborType: "reminder_origination", originatorId: "u1", householdId: "h1", domain: "concierge", evidence: [] });
    expect(result).toBeNull();
  });

  it("records after consent granted", () => {
    engine.grantConsent({ householdId: "h1", enabledBy: "u1", enabledAt: new Date().toISOString(), scope: ["reminder_origination"], sensitivityLevel: "basic" });
    const result = engine.recordEvent({ laborType: "reminder_origination", originatorId: "u1", householdId: "h1", domain: "concierge", evidence: [] });
    expect(result).not.toBeNull();
  });

  it("blocks after consent revoked", () => {
    const consent = engine.grantConsent({ householdId: "h1", enabledBy: "u1", enabledAt: new Date().toISOString(), scope: ["follow_up"], sensitivityLevel: "basic" });
    engine.revokeConsent(consent.id, "u1");
    expect(engine.hasConsent("h1", "follow_up")).toBe(false);
  });

  it("generates equalization suggestions for imbalanced labor", () => {
    engine.grantConsent({ householdId: "h1", enabledBy: "u1", enabledAt: new Date().toISOString(), scope: ["reminder_origination", "follow_up", "scheduling", "planning", "coordination", "tracking", "preparation", "anticipation"], sensitivityLevel: "detailed" });
    for (let i = 0; i < 20; i++) engine.recordEvent({ laborType: "reminder_origination", originatorId: "u1", householdId: "h1", domain: "concierge", evidence: [] });
    for (let i = 0; i < 3; i++) engine.recordEvent({ laborType: "reminder_origination", originatorId: "u2", householdId: "h1", domain: "concierge", evidence: [] });
    const suggestions = engine.getEqualizationSuggestions("h1", "household");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].respectfulExplanation.length).toBeGreaterThan(10);
  });
});

// ── Founder Bottleneck Engine ───────────────────────────────────
describe("FounderBottleneckEngine", () => {
  let engine: FounderBottleneckEngine;
  beforeEach(() => { engine = new FounderBottleneckEngine(); });

  it("detects approval stalls", () => {
    const actions = Array.from({ length: 3 }, (_, i) => makeAction({
      currentState: "approval_requested",
      entityScope: { ...SCOPE, ownerId: "founder1" },
      stateHistory: [{ from: "drafted", to: "approval_requested", triggeredBy: "system", timestamp: new Date(Date.now() - 3600000).toISOString(), reason: "Ready", confidence: 1 }],
    }));
    const events = engine.detectApprovalStalls(actions, "founder1");
    expect(events.length).toBe(1);
    expect(events[0].bottleneckType).toBe("approval_stall");
    expect(events[0].costEstimate.estimatedCost).toBeGreaterThan(0);
  });

  it("computes total cost of unresolved bottlenecks", () => {
    engine.recordBottleneck({
      bottleneckType: "decision_queue", founderId: "f1", blockedWorkflows: ["w1"], domain: "business",
      costEstimate: { estimationMethod: "delay_impact", estimatedCost: 500, currency: "USD", confidence: 0.6, inputs: {}, explanation: "Test" },
      severity: "high", evidence: [], entityScope: SCOPE, handoffRecommendation: "Delegate", delegationCandidates: [],
    });
    expect(engine.getTotalCost().total).toBe(500);
  });
});

// ── Workspace View Engine ───────────────────────────────────────
describe("WorkspaceViewEngine", () => {
  let engine: WorkspaceViewEngine;
  beforeEach(() => { engine = new WorkspaceViewEngine(); });

  it("principal view redacts operational fields", () => {
    const data = [{ domain: "business", severity: "critical", internalNotes: "secret", debugInfo: "debug" }];
    const filtered = engine.filterForView(data, "principal");
    expect(filtered[0].internalNotes).toBeUndefined();
    expect(filtered[0].debugInfo).toBeUndefined();
  });

  it("operator view sees all fields", () => {
    const data = [{ domain: "business", severity: "info", internalNotes: "visible", debugInfo: "visible" }];
    const filtered = engine.filterForView(data, "operator");
    expect(filtered[0].internalNotes).toBe("visible");
  });

  it("principal cannot execute, operator cannot approve", () => {
    expect(engine.isActionAuthorized("execute", "principal")).toBe(false);
    expect(engine.isActionAuthorized("approve", "operator")).toBe(false);
    expect(engine.isActionAuthorized("approve", "principal")).toBe(true);
    expect(engine.isActionAuthorized("execute", "operator")).toBe(true);
  });

  it("handoffs flow between roles", () => {
    const handoff = engine.createHandoff({ fromRole: "operator", toRole: "principal", subject: "Review needed", context: "Invoice approval", urgency: "high", evidencePacketIds: ["e1"] });
    expect(engine.getPendingHandoffs("principal")).toHaveLength(1);
    engine.acknowledgeHandoff(handoff.id);
    engine.completeHandoff(handoff.id);
    expect(engine.getPendingHandoffs("principal")).toHaveLength(0);
  });
});

// ── Meta-Governance Facade ──────────────────────────────────────
describe("MetaGovernanceEngine (Facade)", () => {
  it("exposes all 8 sub-engines", () => {
    const engine = new MetaGovernanceEngine();
    expect(engine.trustDebt).toBeInstanceOf(TrustDebtEngine);
    expect(engine.executionDebt).toBeInstanceOf(ExecutionDebtEngine);
    expect(engine.drag).toBeInstanceOf(DragEngine);
    expect(engine.readiness).toBeInstanceOf(ReadinessEngine);
    expect(engine.invisibleLabor).toBeInstanceOf(InvisibleLaborEngine);
    expect(engine.founderBottleneck).toBeInstanceOf(FounderBottleneckEngine);
    expect(engine.delegation).toBeInstanceOf(DelegationEngine);
    expect(engine.workspaceView).toBeInstanceOf(WorkspaceViewEngine);
  });

  it("produces boardroom sections from all systems", () => {
    const engine = new MetaGovernanceEngine();
    const sections = engine.getBoardroomSections(SCOPE, "h1");
    expect(sections.length).toBeGreaterThanOrEqual(6);
    expect(sections.every(s => s.systemId && s.title && s.drilldownRoute)).toBe(true);
  });
});
