// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Chain Integration Tests
// 13 test cases covering the full execution chain
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import {
  evaluatePolicy,
  classifyRiskTier,
  getConstitutionalRules,
  type PolicyContext,
} from "@/lib/core-services/policy-engine";
import {
  ExecutorService,
  createEnvelope,
  createExecutorService,
} from "@/lib/core-services/executor-service";
import {
  ReceiptService,
  createReceiptService,
} from "@/lib/core-services/receipt-service";
import {
  WorkflowEngine,
  createWorkflowEngine,
  getStateTransitionMap,
  isTerminalState,
  type ServiceWorkflowState as WorkflowState,
} from "@/lib/core-services/workflow-engine";
import {
  ProjectionService,
  createProjectionService,
  type ProjectionEvent,
} from "@/lib/core-services/projection-service";
import {
  IdentityService,
  createIdentityService,
  HouseholdOrgGraph,
  createHouseholdOrgGraph,
  getPermissionInheritance,
} from "@/lib/core-services/identity-graph";
import {
  ConnectorControlPlane,
  createConnectorControlPlane,
  calculateHealthScore,
  qualifiesForLive,
} from "@/lib/core-services/connector-control";
import {
  createCanonicalChain,
  type CanonicalChainInput,
} from "@/lib/core-services/index";

// ═══════════════════════════════════════════════════════════════
// 1. Intent Classification → Orchestration
// ═══════════════════════════════════════════════════════════════

describe("Intent Classification & Orchestration", () => {
  it("classifies risk tiers correctly based on domain and amount", () => {
    expect(classifyRiskTier("finance", "pay-bill", 10000)).toBe("critical");
    expect(classifyRiskTier("finance", "pay-bill", 1000)).toBe("high");
    expect(classifyRiskTier("finance", "view-balance")).toBe("medium");
    expect(classifyRiskTier("business", "delete-customer")).toBe("high");
    expect(classifyRiskTier("business", "update-lead")).toBe("medium");
    expect(classifyRiskTier("concierge", "view-tasks")).toBe("low");
  });

  it("returns all constitutional rules in priority order", () => {
    const rules = getConstitutionalRules();
    expect(rules.length).toBeGreaterThanOrEqual(10);
    // Verify sorted by priority descending
    for (let i = 1; i < rules.length; i++) {
      expect(rules[i - 1].priority).toBeGreaterThanOrEqual(rules[i].priority);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Policy Evaluation
// ═══════════════════════════════════════════════════════════════

describe("Policy Evaluation", () => {
  it("denies critical risk tier operations", () => {
    const result = evaluatePolicy({ riskTier: "critical" });
    expect(result.effect).toBe("deny");
    expect(result.matchedRule?.id).toBe("security-deny-critical");
  });

  it("requires dual approval for finance > $5K", () => {
    const result = evaluatePolicy({ domain: "finance", amount: 6000 });
    expect(result.effect).toBe("require-dual-approval");
  });

  it("requires approval for finance > $500", () => {
    const result = evaluatePolicy({ domain: "finance", amount: 800, riskTier: "medium" });
    expect(result.effect).toBe("require-approval");
  });

  it("allows simulation mode to bypass restrictions", () => {
    const result = evaluatePolicy({ isSimulation: true, riskTier: "medium" });
    expect(result.effect).toBe("allow");
  });

  it("blocks on material contradictions (>=2)", () => {
    const result = evaluatePolicy({ contradictionCount: 3 });
    expect(result.effect).toBe("deny");
    expect(result.reason).toContain("contradiction");
  });

  it("requires simulation on stale data", () => {
    const result = evaluatePolicy({ hasStaleSources: true });
    expect(result.effect).toBe("require-simulation");
  });

  it("allows low-risk operations by default", () => {
    const result = evaluatePolicy({ domain: "concierge", riskTier: "low" });
    expect(result.effect).toBe("allow");
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Approval Request Creation
// ═══════════════════════════════════════════════════════════════

describe("Approval Workflow", () => {
  let chain: ReturnType<typeof createCanonicalChain>;

  beforeEach(() => {
    chain = createCanonicalChain();
  });

  it("creates approval request for finance > $500", async () => {
    chain.executor.registerHandler("pay-bill", async () => ({
      status: "success",
      result: { paid: true },
    }));

    const result = await chain.orchestrator.execute({
      intent: "pay bill",
      domain: "finance",
      capabilityId: "pay-bill",
      payload: { billId: "b1", amount: 1000 },
      amount: 1000,
    });

    expect(result.blocked).toBe(true);
    expect(result.blockReason).toContain("approval");
    expect(result.workflow.state).toBe("approval-requested");
    expect(result.receipt?.receiptType).toBe("approval-record");
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Approval Decision Making
// ═══════════════════════════════════════════════════════════════

describe("Approval Decision", () => {
  let workflows: WorkflowEngine;

  beforeEach(() => {
    workflows = createWorkflowEngine();
  });

  it("transitions from approval-requested to approved", () => {
    const wf = workflows.createWorkflow("test", {});
    workflows.transition(wf.id, "proposed");
    workflows.transition(wf.id, "drafted");
    workflows.transition(wf.id, "approval-requested");
    const result = workflows.transition(wf.id, "approved", "Manager approved");
    expect(result.success).toBe(true);
    expect(result.workflow.state).toBe("approved");
    expect(result.event?.reason).toBe("Manager approved");
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Execution Envelope
// ═══════════════════════════════════════════════════════════════

describe("Execution Envelope", () => {
  let executor: ExecutorService;

  beforeEach(() => {
    executor = createExecutorService();
  });

  it("executes a registered capability", async () => {
    executor.registerHandler("send-email", async (env) => ({
      status: "success",
      result: { sent: true, to: env.payload.to },
    }));

    const envelope = createEnvelope("send-email", { to: "test@example.com" });
    const result = await executor.execute(envelope);

    expect(result.status).toBe("completed");
    expect(result.result?.sent).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("returns draft mode without executing", async () => {
    const envelope = createEnvelope("anything", { data: 1 }, { mode: "draft" });
    const result = await executor.execute(envelope);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("draft");
  });

  it("returns simulation mode without side effects", async () => {
    const envelope = createEnvelope("pay-bill", { amount: 500 }, { mode: "simulation" });
    const result = await executor.execute(envelope);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("simulation");
  });

  it("handles idempotent duplicate requests", async () => {
    executor.registerHandler("charge", async () => ({
      status: "success",
      result: { charged: true },
    }));

    const key = "idempotent-key-1";
    const env1 = createEnvelope("charge", { amount: 100 }, { idempotencyKey: key });
    const env2 = createEnvelope("charge", { amount: 100 }, { idempotencyKey: key });

    const r1 = await executor.execute(env1);
    const r2 = await executor.execute(env2);

    expect(r1.status).toBe("completed");
    expect(r2.status).toBe("completed");
    expect(r1.id).toBe(r2.id); // Same envelope returned
  });

  it("fails when no handler registered", async () => {
    const envelope = createEnvelope("unknown-capability", {});
    const result = await executor.execute(envelope);
    expect(result.status).toBe("failed");
    expect(result.errorDetails?.code).toBe("NO_HANDLER");
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Receipt Generation & Hash Chain
// ═══════════════════════════════════════════════════════════════

describe("Receipt Generation", () => {
  let receipts: ReceiptService;

  beforeEach(() => {
    receipts = createReceiptService();
  });

  it("creates receipt with hash", async () => {
    const r = await receipts.createReceipt("corr-1", "execution-summary", { result: "ok" });
    expect(r.hash).toBeTruthy();
    expect(r.previousHash).toBeNull();
    expect(r.sequenceNumber).toBe(1);
  });

  it("chains receipts with previous hash", async () => {
    const r1 = await receipts.createReceipt("corr-1", "execution-summary", { step: 1 });
    const r2 = await receipts.createReceipt("corr-1", "approval-record", { step: 2 });
    expect(r2.previousHash).toBe(r1.hash);
    expect(r2.sequenceNumber).toBe(2);
  });

  it("verifies valid chain", async () => {
    await receipts.createReceipt("corr-1", "execution-summary", { a: 1 });
    await receipts.createReceipt("corr-1", "approval-record", { b: 2 });
    await receipts.createReceipt("corr-1", "verification-proof", { c: 3 });

    const verification = await receipts.verifyChain();
    expect(verification.valid).toBe(true);
  });

  it("generates proof pack for correlation", async () => {
    await receipts.createReceipt("corr-A", "execution-summary", { x: 1 });
    await receipts.createReceipt("corr-B", "refusal", { y: 2 });
    await receipts.createReceipt("corr-A", "verification-proof", { z: 3 });

    const pack = await receipts.generateProofPack("corr-A");
    expect(pack.receipts.length).toBe(2);
    expect(pack.correlationId).toBe("corr-A");
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Event Topology
// ═══════════════════════════════════════════════════════════════

describe("Event Topology", () => {
  it("canonical chain emits events to projections in correct order", async () => {
    const chain = createCanonicalChain();
    chain.executor.registerHandler("view-balance", async () => ({
      status: "success",
      result: { balance: 5000 },
    }));

    const result = await chain.orchestrator.execute({
      intent: "check balance",
      domain: "concierge",
      capabilityId: "view-balance",
      payload: {},
    });

    expect(result.blocked).toBe(false);
    // Projection should have been updated
    const pulse = chain.projections.getProjection("daily-pulse", "default");
    expect(pulse).toBeDefined();
    expect(pulse!.eventCount).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. Full Canonical Chain (E2E)
// ═══════════════════════════════════════════════════════════════

describe("Full Canonical Chain", () => {
  it("executes complete chain: policy → workflow → execute → receipt → projection", async () => {
    const chain = createCanonicalChain();
    chain.executor.registerHandler("create-task", async (env) => ({
      status: "success",
      result: { taskId: "t1", title: env.payload.title },
    }));

    const result = await chain.orchestrator.execute({
      intent: "create a task",
      domain: "concierge",
      capabilityId: "create-task",
      payload: { title: "Buy groceries" },
    });

    expect(result.blocked).toBe(false);
    expect(result.policyResult.effect).toBe("allow");
    expect(result.workflow.state).toBe("completed");
    expect(result.envelope?.status).toBe("completed");
    expect(result.receipt?.receiptType).toBe("execution-summary");
    expect(result.receipt?.hash).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. Tenant Isolation
// ═══════════════════════════════════════════════════════════════

describe("Tenant Isolation", () => {
  it("identity service isolates users by userId", () => {
    const ids = createIdentityService();
    ids.createIdentity("user-1", "a@test.com", "Alice");
    ids.createIdentity("user-2", "b@test.com", "Bob");

    expect(ids.getIdentity("user-1")?.displayName).toBe("Alice");
    expect(ids.getIdentity("user-2")?.displayName).toBe("Bob");
    expect(ids.getIdentity("user-3")).toBeUndefined();
  });

  it("household graph prevents cross-entity access", () => {
    const graph = createHouseholdOrgGraph();
    const household = graph.addEntity("household", "Smith Family");
    const alice = graph.addEntity("individual", "Alice");
    const bob = graph.addEntity("individual", "Bob");
    const stranger = graph.addEntity("individual", "Stranger");

    graph.addRelationship(alice.id, bob.id, "spouse", { visibility: "household-shared" });

    const alicePerms = graph.getPermissions(alice.id, bob.id);
    expect(alicePerms).toContain("view_finances");

    const strangerPerms = graph.getPermissions(stranger.id, bob.id);
    expect(strangerPerms.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. Idempotency Guarantees
// ═══════════════════════════════════════════════════════════════

describe("Idempotency Guarantees", () => {
  it("duplicate idempotency keys return cached result without re-execution", async () => {
    const executor = createExecutorService();
    let callCount = 0;
    executor.registerHandler("charge-card", async () => {
      callCount++;
      return { status: "success", result: { charged: true } };
    });

    const key = "payment-abc-123";
    await executor.execute(createEnvelope("charge-card", {}, { idempotencyKey: key }));
    await executor.execute(createEnvelope("charge-card", {}, { idempotencyKey: key }));
    await executor.execute(createEnvelope("charge-card", {}, { idempotencyKey: key }));

    expect(callCount).toBe(1); // Handler only called once
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. Error Handling
// ═══════════════════════════════════════════════════════════════

describe("Error Handling", () => {
  it("policy denial creates refusal receipt", async () => {
    const chain = createCanonicalChain();
    const result = await chain.orchestrator.execute({
      intent: "delete everything",
      domain: "finance",
      capabilityId: "delete-all",
      payload: {},
      amount: 999999,
    });

    expect(result.blocked).toBe(true);
    expect(result.policyResult.effect).toBe("deny");
    expect(result.receipt?.receiptType).toBe("refusal");
    expect(result.workflow.state).toBe("failed");
  });

  it("handler errors are captured in envelope", async () => {
    const executor = createExecutorService();
    executor.registerHandler("buggy", async () => {
      throw new Error("Something broke");
    });

    const result = await executor.execute(createEnvelope("buggy", {}));
    expect(result.status).toBe("failed");
    expect(result.errorDetails?.code).toBe("HANDLER_ERROR");
    expect(result.errorDetails?.message).toBe("Something broke");
  });
});

// ═══════════════════════════════════════════════════════════════
// 12. Workflow State Transitions
// ═══════════════════════════════════════════════════════════════

describe("Workflow State Transitions", () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = createWorkflowEngine();
  });

  it("follows happy path through all canonical states", () => {
    const wf = engine.createWorkflow("test-cap", { data: 1 });
    expect(wf.state).toBe("detected");

    const states: WorkflowState[] = ["proposed", "drafted", "simulated", "approval-requested", "approved", "queued", "executing", "completed", "verified"];
    const result = engine.advanceThrough(wf.id, states, "happy path");

    expect(result.success).toBe(true);
    expect(result.workflow.state).toBe("verified");
    expect(result.workflow.eventLog.length).toBe(states.length);
    expect(isTerminalState("verified")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    const wf = engine.createWorkflow("test", {});
    const result = engine.transition(wf.id, "completed"); // Can't skip to completed
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid transition");
  });

  it("supports recovery from failed state", () => {
    const wf = engine.createWorkflow("test", {});
    engine.transition(wf.id, "proposed");
    engine.transition(wf.id, "failed");
    const recovery = engine.recover(wf.id, "Retry");
    expect(recovery.success).toBe(true);
    expect(recovery.workflow.state).toBe("detected");
    expect(recovery.workflow.recoveryAttempts).toBe(1);
  });

  it("provides valid transitions for current state", () => {
    const wf = engine.createWorkflow("test", {});
    const valid = engine.getValidTransitions(wf.id);
    expect(valid).toContain("proposed");
    expect(valid).toContain("failed");
    expect(valid).not.toContain("completed");
  });

  it("replays event log for diagnostics", () => {
    const wf = engine.createWorkflow("test", {});
    engine.transition(wf.id, "proposed");
    engine.transition(wf.id, "drafted");

    const events = engine.replay(wf.id);
    expect(events.length).toBe(2);
    expect(events[0].fromState).toBe("detected");
    expect(events[0].toState).toBe("proposed");
    expect(events[1].toState).toBe("drafted");
  });
});

// ═══════════════════════════════════════════════════════════════
// 13. Event Sourcing & Projection Reconstruction
// ═══════════════════════════════════════════════════════════════

describe("Event Sourcing & Projections", () => {
  let projections: ProjectionService;

  beforeEach(() => {
    projections = createProjectionService(100);
  });

  it("builds projections from event stream", () => {
    const events: ProjectionEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: `evt-${i}`,
      topic: "execution.completed.v1",
      payload: { domain: "finance", amount: (i + 1) * 100 },
      timestamp: Date.now() + i * 1000,
      source: "test",
    }));

    for (const evt of events) {
      projections.applyEvent("finance-dashboard", "user-1", evt);
    }

    const proj = projections.getProjection("finance-dashboard", "user-1");
    expect(proj).toBeDefined();
    expect(proj!.eventCount).toBe(5);
    expect((proj!.state.transactions as unknown[]).length).toBe(5);
  });

  it("rebuilds projections from full event replay", () => {
    const events: ProjectionEvent[] = Array.from({ length: 3 }, (_, i) => ({
      id: `evt-${i}`,
      topic: "task.created.v1",
      payload: { taskId: `t-${i}` },
      timestamp: Date.now() + i * 1000,
      source: "test",
    }));

    const rebuilt = projections.rebuildFromEvents("household-dashboard", "hh-1", events);
    expect(rebuilt.eventCount).toBe(3);
    expect((rebuilt.state.tasks as unknown[]).length).toBe(3);
  });

  it("supports 6 projection types", () => {
    const types = projections.getProjectionTypes();
    expect(types).toContain("customer-360");
    expect(types).toContain("finance-dashboard");
    expect(types).toContain("daily-pulse");
    expect(types).toContain("travel-dashboard");
    expect(types).toContain("household-dashboard");
    expect(types).toContain("boardroom");
    expect(types.length).toBe(6);
  });

  it("connector health scoring works correctly", () => {
    const perfect: Parameters<typeof calculateHealthScore>[0] = {
      uptimeMinutes: 1440,
      totalMinutes: 1440,
      errorRate: 0,
      totalRequests: 10000,
      totalErrors: 0,
      avgLatencyMs: 50,
      p99LatencyMs: 200,
      syncFrequencyMs: 60000,
    };
    const score = calculateHealthScore(perfect);
    // 100 base + 5 reliability + 10 fast_sync = 115 clamped to 100
    expect(score).toBe(100);

    const degraded = { ...perfect, totalErrors: 500, p99LatencyMs: 1500 };
    degraded.errorRate = degraded.totalErrors / degraded.totalRequests;
    const degradedScore = calculateHealthScore(degraded);
    expect(degradedScore).toBeLessThan(100);
  });
});

// ═══════════════════════════════════════════════════════════════
// EVENT BUS TESTS
// ═══════════════════════════════════════════════════════════════

import { EventBus, createEventBus } from "@/lib/core-services/event-bus";

describe("EventBus", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = createEventBus();
  });

  it("publishes events and dispatches to subscribers", async () => {
    const received: string[] = [];
    bus.subscribe("test.topic", (e) => { received.push(e.topic); });
    await bus.publish("test.topic", { foo: "bar" }, { source: "test" });
    expect(received).toEqual(["test.topic"]);
  });

  it("supports wildcard subscriptions", async () => {
    const received: string[] = [];
    bus.subscribe("*", (e) => { received.push(e.topic); });
    await bus.publish("a.b", {});
    await bus.publish("c.d", {});
    expect(received).toEqual(["a.b", "c.d"]);
  });

  it("supports prefix wildcard subscriptions", async () => {
    const received: string[] = [];
    bus.subscribe("execution.*", (e) => { received.push(e.topic); });
    await bus.publish("execution.completed.v1", {});
    await bus.publish("policy.evaluated.v1", {});
    expect(received).toEqual(["execution.completed.v1"]);
  });

  it("routes failed handlers to dead-letter queue", async () => {
    bus.subscribe("fail.topic", () => { throw new Error("handler broke"); }, "bad-handler");
    await bus.publish("fail.topic", {});
    const dlq = bus.getDeadLetterQueue();
    expect(dlq.length).toBe(1);
    expect(dlq[0].handler).toBe("bad-handler");
    expect(dlq[0].error).toBe("handler broke");
  });

  it("replays events from log with topic filter", async () => {
    await bus.publish("a.1", { v: 1 });
    await bus.publish("b.2", { v: 2 });
    await bus.publish("a.3", { v: 3 });

    const replayed: string[] = [];
    bus.subscribe("a.*", (e) => { replayed.push(e.topic); });
    const events = await bus.replay({ topic: "a.*" });
    expect(events.length).toBe(2);
    expect(replayed.length).toBe(2);
  });

  it("unsubscribes correctly", async () => {
    const received: string[] = [];
    const id = bus.subscribe("unsub.test", (e) => { received.push(e.topic); });
    await bus.publish("unsub.test", {});
    expect(received.length).toBe(1);

    bus.unsubscribe(id);
    await bus.publish("unsub.test", {});
    expect(received.length).toBe(1); // no change
  });

  it("maintains immutable event log", async () => {
    await bus.publish("log.1", { a: 1 });
    await bus.publish("log.2", { b: 2 });
    const log = bus.getLog();
    expect(log.length).toBe(2);
    expect(log[0].topic).toBe("log.1");
    expect(log[1].topic).toBe("log.2");
  });
});

// ═══════════════════════════════════════════════════════════════
// MEMORY SERVICE TESTS
// ═══════════════════════════════════════════════════════════════

import { MemoryService, createMemoryService } from "@/lib/core-services/memory-service";

describe("MemoryService", () => {
  let memory: MemoryService;

  beforeEach(() => {
    memory = createMemoryService();
  });

  it("stores and retrieves memory entries", () => {
    const entry = memory.store("user.preference", "dark-mode", { source: "settings" });
    const retrieved = memory.retrieve(entry.id, "admin");
    expect(retrieved).not.toBeNull();
    expect(retrieved!.value).toBe("dark-mode");
  });

  it("auto-classifies sensitive keys as restricted", () => {
    const entry = memory.store("ssn_number", "123-45-6789");
    expect(entry.privacyTier).toBe("restricted");
  });

  it("auto-classifies financial keys as confidential", () => {
    const entry = memory.store("salary_info", 150000);
    expect(entry.privacyTier).toBe("confidential");
  });

  it("enforces role-based visibility", () => {
    const entry = memory.store("bank_account_number", "****1234");
    expect(entry.privacyTier).toBe("restricted");

    // Viewer cannot see restricted
    const viewerResult = memory.retrieve(entry.id, "viewer");
    expect(viewerResult).toBeNull();

    // Admin can see restricted
    const adminResult = memory.retrieve(entry.id, "admin");
    expect(adminResult).not.toBeNull();
  });

  it("supports forget with audit trail", () => {
    const entry = memory.store("temporary", "data");
    const forgotten = memory.forget(entry.id, "User requested deletion", "user-1");
    expect(forgotten).toBe(true);

    const log = memory.getForgetLog();
    expect(log.length).toBe(1);
    expect(log[0].key).toBe("temporary");
    expect(log[0].reason).toBe("User requested deletion");
  });

  it("queries with filters", () => {
    memory.store("pref.a", "1", { tags: ["settings"], entityId: "user-1" });
    memory.store("pref.b", "2", { tags: ["settings"], entityId: "user-2" });
    memory.store("data.c", "3", { tags: ["analytics"], entityId: "user-1" });

    const results = memory.query({ entityId: "user-1" }, "admin");
    expect(results.length).toBe(2);

    const tagResults = memory.query({ tags: ["settings"] }, "admin");
    expect(tagResults.length).toBe(2);
  });

  it("reports stats correctly", () => {
    memory.store("public.data", "x", { privacyTier: "public" });
    memory.store("ssn", "y");
    const stats = memory.getStats();
    expect(stats.total).toBe(2);
    expect(stats.byTier.public).toBe(1);
    expect(stats.byTier.restricted).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// APPROVAL SERVICE TESTS
// ═══════════════════════════════════════════════════════════════

import { ApprovalService, createApprovalService } from "@/lib/core-services/approval-service";

describe("ApprovalService", () => {
  let approvals: ApprovalService;

  beforeEach(() => {
    approvals = createApprovalService();
  });

  it("creates approval requests", () => {
    const req = approvals.create({
      correlationId: "corr-1",
      title: "Transfer $5000",
      description: "Wire transfer",
      requestedBy: "user-1",
      domain: "finance",
      riskTier: "high",
      approvers: ["admin-1"],
    });
    expect(req.status).toBe("pending");
    expect(req.riskTier).toBe("high");
  });

  it("approves single-approval requests", () => {
    const req = approvals.create({
      correlationId: "corr-2",
      title: "Simple action",
      description: "test",
      requestedBy: "user-1",
      domain: "business",
      riskTier: "medium",
      approvers: ["admin-1"],
    });

    const result = approvals.decide(req.id, "admin-1", "approve", "Looks good");
    expect(result!.status).toBe("approved");
  });

  it("requires dual approval for critical risk", () => {
    const req = approvals.create({
      correlationId: "corr-3",
      title: "Delete account",
      description: "Dangerous",
      requestedBy: "user-1",
      domain: "business",
      riskTier: "critical",
      approvers: ["admin-1", "admin-2"],
    });

    expect(req.requiresDualApproval).toBe(true);

    // First approval — still pending
    const after1 = approvals.decide(req.id, "admin-1", "approve");
    expect(after1!.status).toBe("pending");

    // Second approval — now approved
    const after2 = approvals.decide(req.id, "admin-2", "approve");
    expect(after2!.status).toBe("approved");
  });

  it("rejects immediately on rejection", () => {
    const req = approvals.create({
      correlationId: "corr-4",
      title: "Bad action",
      description: "test",
      requestedBy: "user-1",
      domain: "finance",
      riskTier: "low",
      approvers: ["admin-1"],
    });

    const result = approvals.decide(req.id, "admin-1", "reject", "Not appropriate");
    expect(result!.status).toBe("rejected");
  });

  it("supports delegation", () => {
    const req = approvals.create({
      correlationId: "corr-5",
      title: "Delegate action",
      description: "test",
      requestedBy: "user-1",
      domain: "business",
      riskTier: "medium",
      approvers: ["admin-1"],
    });

    const delegated = approvals.decide(req.id, "admin-1", "delegate", "Out of office", "admin-2");
    expect(delegated!.status).toBe("delegated");
    expect(delegated!.delegatedTo).toBe("admin-2");

    // Delegate can approve
    const approved = approvals.decide(req.id, "admin-2", "approve");
    expect(approved!.status).toBe("approved");
  });

  it("returns pending requests filtered by domain", () => {
    approvals.create({ correlationId: "a", title: "A", description: "", requestedBy: "u", domain: "finance", riskTier: "low", approvers: ["x"] });
    approvals.create({ correlationId: "b", title: "B", description: "", requestedBy: "u", domain: "business", riskTier: "low", approvers: ["x"] });

    const finance = approvals.getPending({ domain: "finance" });
    expect(finance.length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// TRUST STATE SERVICE TESTS
// ═══════════════════════════════════════════════════════════════

import { TrustStateService, createTrustStateService } from "@/lib/core-services/trust-state-service";

describe("TrustStateService", () => {
  let trust: TrustStateService;

  beforeEach(() => {
    trust = createTrustStateService();
  });

  it("initializes entities with default trust score", () => {
    const state = trust.initialize("user-1", "user");
    expect(state.score).toBe(80);
    expect(state.status).toBe("trusted");
  });

  it("downgrades on security flags", () => {
    trust.initialize("user-1", "user", 90);
    const after = trust.reportFlag("user-1", "anomaly", "test");
    expect(after!.score).toBe(80); // 90 - 10
    expect(after!.flags).toContain("anomaly");
  });

  it("applies severe penalty for breach", () => {
    trust.initialize("connector-1", "connector", 80);
    const after = trust.reportFlag("connector-1", "breach", "test");
    expect(after!.score).toBe(40); // 80 - 40
    expect(after!.status).toBe("restricted"); // below 50
  });

  it("recovers trust through verification", () => {
    trust.initialize("user-1", "user", 50);
    const after = trust.recordVerification("user-1", "test");
    expect(after!.score).toBe(55); // 50 + 5
    expect(after!.status).toBe("provisional"); // 50-80 range
  });

  it("tracks audit log", () => {
    trust.initialize("user-1", "user");
    trust.reportFlag("user-1", "anomaly", "detector");
    trust.recordVerification("user-1", "verification");

    const log = trust.getAuditLog({ entityId: "user-1" });
    expect(log.length).toBe(2);
  });

  it("returns flagged entities", () => {
    trust.initialize("a", "user");
    trust.initialize("b", "connector");
    trust.reportFlag("a", "anomaly", "test");

    const flagged = trust.getFlagged();
    expect(flagged.length).toBe(1);
    expect(flagged[0].entityId).toBe("a");
  });

  it("clears flags", () => {
    trust.initialize("user-1", "user");
    trust.reportFlag("user-1", "anomaly", "test");
    trust.clearFlag("user-1", "anomaly", "admin", "Resolved");

    const state = trust.get("user-1");
    expect(state!.flags).not.toContain("anomaly");
  });
});

// ═══════════════════════════════════════════════════════════════
// VERIFICATION ENGINE TESTS
// ═══════════════════════════════════════════════════════════════

import { VerificationEngine, createVerificationEngine } from "@/lib/core-services/verification-engine";

describe("VerificationEngine", () => {
  let engine: VerificationEngine;

  beforeEach(() => {
    engine = createVerificationEngine();
  });

  it("passes verification for valid results", () => {
    const result = engine.verify("corr-1", "business.create", "env-1", {}, { id: "123", status: "success" });
    expect(result.passed).toBe(true);
    expect(result.rollbackRecommended).toBe(false);
  });

  it("fails verification when result contains error", () => {
    const result = engine.verify("corr-2", "business.update", "env-2", {}, { error: "Something broke" });
    expect(result.passed).toBe(false);
    expect(result.overallSeverity).toBe("critical");
  });

  it("recommends rollback on critical failures", () => {
    const result = engine.verify("corr-3", "finance.transfer", "env-3",
      { amount: 1000 },
      { amount: 5000, error: "Duplicate charge" }
    );
    expect(result.rollbackRecommended).toBe(true);
    expect(result.rollbackReason).toBeDefined();
  });

  it("checks amount match for finance capabilities", () => {
    const result = engine.verify("corr-4", "finance.payment", "env-4",
      { amount: 100 },
      { amount: 100, status: "success", id: "pay-1" }
    );
    expect(result.passed).toBe(true);

    const mismatch = engine.verify("corr-5", "finance.payment", "env-5",
      { amount: 100 },
      { amount: 200, status: "success", id: "pay-2" }
    );
    expect(mismatch.passed).toBe(false);
  });

  it("tracks verification history", () => {
    engine.verify("c1", "a.b", "e1", {}, { status: "success" });
    engine.verify("c2", "a.c", "e2", {}, { error: "fail" });

    const stats = engine.getStats();
    expect(stats.total).toBe(2);
    expect(stats.passed).toBe(1);
    expect(stats.failed).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// DOMAIN ENGINE TESTS
// ═══════════════════════════════════════════════════════════════

import { scoreLead, forecastRevenue, assessClientHealth, analyzePipeline, assessBusinessHealth } from "@/lib/domain-engines/business-os";
import { estimateTax, analyzeCashflow, assessBudgetHealth, calculateBurnMultiple } from "@/lib/domain-engines/finance-os";
import { prioritizeTasks, scoreBookingOptions, detectConflicts, evaluateRoutineHealth, coordinateHousehold } from "@/lib/domain-engines/concierge-os";

describe("BusinessOS — Domain Engine", () => {
  it("scores leads with composite formula", () => {
    const hot = scoreLead({ id: "1", name: "Hot Lead", engagementScore: 90, recencyDays: 1, fitScore: 85, estimatedValue: 80000, status: "qualified", createdAt: Date.now() });
    expect(hot.tier).toBe("hot");
    expect(hot.totalScore).toBeGreaterThan(70);

    const cold = scoreLead({ id: "2", name: "Cold Lead", engagementScore: 10, recencyDays: 60, fitScore: 20, estimatedValue: 5000, status: "new", createdAt: Date.now() });
    expect(cold.tier).toBe("cold");
    expect(cold.totalScore).toBeLessThan(25);
  });

  it("forecasts revenue with linear regression", () => {
    const growing = forecastRevenue([10000, 12000, 14000, 16000, 18000, 20000]);
    expect(growing.trend).toBe("growing");
    expect(growing.nextMonthProjected).toBeGreaterThan(20000);
    expect(growing.confidence).toBeGreaterThan(0.5);

    const declining = forecastRevenue([20000, 18000, 16000, 14000]);
    expect(declining.trend).toBe("declining");
  });

  it("assesses client health with churn risk", () => {
    const healthy = assessClientHealth({
      id: "c1", name: "Good Co", totalRevenue: 50000, invoiceCount: 10,
      overdueInvoices: 0, avgPayDays: 15, lastInteractionDays: 3,
      tier: "mid-market", status: "active", createdAt: Date.now(),
    });
    expect(healthy.healthScore).toBeGreaterThan(70);
    expect(healthy.churnRisk).toBeLessThan(0.3);

    const atRisk = assessClientHealth({
      id: "c2", name: "Bad Co", totalRevenue: 5000, invoiceCount: 3,
      overdueInvoices: 3, avgPayDays: 90, lastInteractionDays: 60,
      tier: "smb", status: "at-risk", createdAt: Date.now(),
    });
    expect(atRisk.healthScore).toBeLessThan(40);
    expect(atRisk.churnRisk).toBeGreaterThan(0.5);
  });

  it("analyzes pipeline health", () => {
    const pipeline = analyzePipeline([
      { id: "1", name: "Deal A", stage: "closing", valueCents: 10000_00, probability: 0.9, expectedCloseDate: Date.now(), daysInStage: 5, lastActivityDays: 2 },
      { id: "2", name: "Deal B", stage: "discovery", valueCents: 5000_00, probability: 0.2, expectedCloseDate: Date.now() + 86400000 * 30, daysInStage: 10, lastActivityDays: 3 },
    ]);
    expect(pipeline.totalValue).toBe(15000);
    expect(pipeline.weightedValue).toBeGreaterThan(0);
    expect(pipeline.staleDealCount).toBe(0);
  });
});

describe("FinanceOS — Domain Engine", () => {
  it("estimates US federal tax deterministically", () => {
    const result = estimateTax(100000);
    expect(result.estimatedTax).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(0.37);
    expect(result.bracket).toBe("22%");
    expect(result.quarterlyPayment).toBe(Math.round(result.estimatedTax / 4));

    // Zero income
    const zero = estimateTax(0);
    expect(zero.estimatedTax).toBe(0);
  });

  it("analyzes cashflow health", () => {
    const surplus = analyzeCashflow([
      { id: "1", type: "inflow", category: "revenue", amount: 20000, date: Date.now(), recurring: true, description: "Sales" },
      { id: "2", type: "outflow", category: "payroll", amount: 10000, date: Date.now(), recurring: true, description: "Salaries" },
    ], 50000);
    expect(surplus.healthIndicator).toBe("surplus");
    expect(surplus.netCashflow).toBe(10000);

    const negative = analyzeCashflow([
      { id: "3", type: "outflow", category: "ops", amount: 30000, date: Date.now(), recurring: true, description: "Operations" },
    ], 10000);
    expect(negative.healthIndicator).toBe("negative");
  });

  it("assesses budget health", () => {
    const result = assessBudgetHealth([
      { id: "1", name: "Marketing", category: "marketing", period: "monthly", allocated: 5000, spent: 6000, startDate: Date.now(), endDate: Date.now() + 86400000 * 30 },
      { id: "2", name: "Engineering", category: "eng", period: "monthly", allocated: 20000, spent: 15000, startDate: Date.now(), endDate: Date.now() + 86400000 * 30 },
    ]);
    expect(result.overBudgetCount).toBe(1);
    expect(result.healthScore).toBeLessThan(100);
  });

  it("calculates burn multiple", () => {
    const excellent = calculateBurnMultiple(50000, 100000);
    expect(excellent.rating).toBe("excellent");

    const critical = calculateBurnMultiple(500000, 50000);
    expect(critical.rating).toBe("critical");

    const noARR = calculateBurnMultiple(100000, 0);
    expect(noARR.burnMultiple).toBe(Infinity);
  });
});

describe("ConciergeOS — Domain Engine", () => {
  it("prioritizes tasks by urgency and due date", () => {
    const result = prioritizeTasks([
      { id: "1", title: "Overdue task", category: "household", priority: "urgent", dueDate: Date.now() - 86400000, estimatedMinutes: 30, status: "pending", recurring: false, energyLevel: "high" },
      { id: "2", title: "Low task", category: "personal", priority: "low", estimatedMinutes: 15, status: "pending", recurring: false, energyLevel: "low" },
      { id: "3", title: "Blocked", category: "errands", priority: "high", estimatedMinutes: 45, status: "blocked", recurring: false, energyLevel: "medium" },
    ]);
    expect(result.prioritized[0].id).toBe("1"); // overdue first
    expect(result.blocked.length).toBe(1);
    expect(result.suggestedFocusBlock.tasks.length).toBeGreaterThan(0);
  });

  it("scores booking options", () => {
    const scores = scoreBookingOptions([
      { id: "a", type: "hotel", provider: "Hilton", name: "Hilton Downtown", price: 200, rating: 4.5, reviewCount: 500, cancellable: true, refundable: true, preferences: ["pool", "gym"] },
      { id: "b", type: "hotel", provider: "Budget Inn", name: "Budget Inn", price: 80, rating: 3.0, reviewCount: 20, cancellable: false, refundable: false, preferences: [] },
    ], ["pool", "gym"]);
    expect(scores[0].id).toBe("a"); // better overall despite higher price
    expect(scores[0].score).toBeGreaterThan(scores[1].score);
  });

  it("detects calendar conflicts", () => {
    const now = Date.now();
    const result = detectConflicts([
      { id: "1", title: "Meeting A", startTime: now, endTime: now + 3600000, category: "work", isFixed: true, bufferMinutes: 0 },
      { id: "2", title: "Meeting B", startTime: now + 1800000, endTime: now + 5400000, category: "work", isFixed: false, bufferMinutes: 0 },
    ]);
    expect(result.conflicts.length).toBe(1);
    expect(result.conflicts[0].overlapMinutes).toBe(30);
  });

  it("evaluates routine health", () => {
    const result = evaluateRoutineHealth([
      { id: "1", name: "Morning routine", type: "morning", tasks: ["meditate", "exercise"], completionRate: 0.9, streakDays: 14, averageDurationMinutes: 30 },
      { id: "2", name: "Evening review", type: "evening", tasks: ["journal"], completionRate: 0.3, streakDays: 0, averageDurationMinutes: 10 },
    ]);
    expect(result.routines[0].health).toBe("thriving");
    expect(result.routines[1].health).toBe("broken");
    expect(result.overallScore).toBeLessThan(80);
  });

  it("coordinates household task distribution", () => {
    const result = coordinateHousehold(
      [
        { id: "m1", name: "Alice", role: "adult", taskCapacity: 10, currentLoad: 2, preferences: [], availability: [] },
        { id: "m2", name: "Bob", role: "adult", taskCapacity: 10, currentLoad: 8, preferences: [], availability: [] },
      ],
      [
        { id: "t1", title: "Groceries", category: "errands", priority: "medium", estimatedMinutes: 30, status: "pending", recurring: false, energyLevel: "low" },
        { id: "t2", title: "Dishes", category: "household", priority: "low", estimatedMinutes: 15, status: "pending", recurring: true, energyLevel: "low" },
      ]
    );
    expect(result.unassignedTasks.length).toBe(2);
    expect(result.suggestedAssignments.length).toBe(2);
    // Alice should be suggested (lighter load)
    expect(result.suggestedAssignments[0].member.name).toBe("Alice");
  });
});

// ═══════════════════════════════════════════════════════════════
// ENHANCED CANONICAL CHAIN WITH NEW SERVICES
// ═══════════════════════════════════════════════════════════════

describe("Enhanced Canonical Chain with Event Bus + Memory + Verification + Trust", () => {
  it("emits events throughout the execution chain", async () => {
    const chain = createCanonicalChain({ withEventBus: true, withMemory: true, withVerification: true, withTrust: true });
    chain.executor.registerHandler("crm.note", async (p) => ({ status: "success" as const, result: { ...p, success: true } }));
    const events: string[] = [];
    chain.eventBus!.subscribe("*", (e) => { events.push(e.topic); });

    const result = await chain.orchestrator.execute({
      intent: "test",
      domain: "business",
      capabilityId: "crm.note",
      payload: { note: "test" },
    });

    expect(result.blocked).toBe(false);
    expect(events).toContain("intent.received.v1");
    expect(events).toContain("policy.evaluated.v1");
    expect(events).toContain("execution.completed.v1");
    expect(events).toContain("receipt.created.v1");
  });

  it("stores execution result in memory", async () => {
    const chain = createCanonicalChain();
    chain.executor.registerHandler("crm.note", async (p) => ({ status: "success" as const, result: { ...p, success: true } }));

    await chain.orchestrator.execute({
      intent: "test",
      domain: "business",
      capabilityId: "crm.note",
      payload: { note: "saved" },
    });

    const memories = chain.memory!.query({ tags: ["business"] }, "admin");
    expect(memories.length).toBeGreaterThan(0);
  });

  it("runs verification on execution results", async () => {
    const chain = createCanonicalChain();

    const result = await chain.orchestrator.execute({
      intent: "create record",
      domain: "business",
      capabilityId: "crm.create",
      payload: { name: "Test" },
    });

    expect(result.verificationPassed).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 14. File Ingestion Service
// ═══════════════════════════════════════════════════════════════

describe("File Ingestion Service", () => {
  it("classifies files by filename and content", async () => {
    const { FileIngestionService } = await import("@/lib/core-services/file-ingestion");
    const svc = new FileIngestionService();

    const invoice = await svc.ingest({ filename: "invoice-2026-001.pdf", mimeType: "application/pdf", sizeBytes: 1024, textContent: "Invoice #2026-001 Total: $5,000 Due by: 04/15/2026", uploadedBy: "user-1" });
    expect(invoice.classification).toBe("invoice");
    expect(invoice.sensitivity).toBe("public");
    expect(invoice.workflowSuggestions).toContain("route-to-approvals");
  });

  it("detects sensitive content", async () => {
    const { FileIngestionService } = await import("@/lib/core-services/file-ingestion");
    const svc = new FileIngestionService();

    const taxDoc = await svc.ingest({ filename: "w2-2025.pdf", mimeType: "application/pdf", sizeBytes: 2048, textContent: "SSN: 123-45-6789 Tax ID: 98-7654321", uploadedBy: "user-1" });
    expect(taxDoc.classification).toBe("tax-document");
    expect(taxDoc.sensitivity).toBe("restricted");
    expect(taxDoc.retentionPolicy).toBe("7-year");
  });

  it("extracts deadlines from text", async () => {
    const { extractDeadlines } = await import("@/lib/core-services/file-ingestion");
    const deadlines = extractDeadlines("Payment due by: 04/15/2026. Renewal date: 12/31/2026");
    expect(deadlines.length).toBeGreaterThanOrEqual(1);
  });

  it("returns sensitive files", async () => {
    const { FileIngestionService } = await import("@/lib/core-services/file-ingestion");
    const svc = new FileIngestionService();
    await svc.ingest({ filename: "public-doc.txt", mimeType: "text/plain", sizeBytes: 100, textContent: "Hello world", uploadedBy: "user-1" });
    await svc.ingest({ filename: "bank-statement.pdf", mimeType: "application/pdf", sizeBytes: 500, textContent: "Bank account 1234567890 routing 021000021", uploadedBy: "user-1" });
    expect(svc.getSensitiveFiles().length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// 15. Payment Execution Service
// ═══════════════════════════════════════════════════════════════

describe("Payment Execution Service", () => {
  it("requires approval for large payments", async () => {
    const { PaymentExecutionService } = await import("@/lib/core-services/payment-execution");
    const svc = new PaymentExecutionService();

    const exec = await svc.preparePayment(
      { id: "p1", amount: 5000, currency: "USD", fromAccountId: "acc-1", recipientName: "Vendor A", method: "ach", description: "Invoice payment" },
      50000, 10000
    );
    expect(exec.approvalRequired).toBe(true);
    expect(exec.status).toBe("pending-approval");
  });

  it("simulates payment impact on balance", async () => {
    const { simulatePayment } = await import("@/lib/core-services/payment-execution");
    const sim = simulatePayment(
      { id: "p1", amount: 45000, currency: "USD", fromAccountId: "acc-1", recipientName: "Big Vendor", method: "wire", description: "Large payment" },
      50000, 10000
    );
    expect(sim.safeToSpend).toBe(false);
    expect(sim.impactsReserves).toBe(true);
    expect(sim.recommendation).toBe("delay");
  });

  it("completes approval and execution flow", async () => {
    const { PaymentExecutionService } = await import("@/lib/core-services/payment-execution");
    const svc = new PaymentExecutionService();

    const exec = await svc.preparePayment(
      { id: "p2", amount: 1000, currency: "USD", fromAccountId: "acc-1", recipientName: "Vendor B", method: "ach", description: "Small payment" },
      50000, 10000
    );
    expect(exec.approvalRequired).toBe(true);

    const approved = await svc.approvePayment(exec.id, "admin");
    expect(approved?.status).toBe("approved");

    const completed = await svc.executePayment(exec.id);
    expect(completed?.status).toBe("completed");
    expect(completed?.receiptId).toBeDefined();
  });

  it("runs fraud pre-check on payments", async () => {
    const { performFraudCheck } = await import("@/lib/core-services/payment-execution");
    const result = performFraudCheck(
      { id: "p3", amount: 75000, currency: "USD", fromAccountId: "acc-1", recipientName: "Unknown Corp", method: "crypto", description: "Crypto transfer" },
      []
    );
    expect(result.passed).toBe(false);
    expect(result.requiresManualReview).toBe(true);
    expect(result.flags.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 16. Fraud Sentinel Service
// ═══════════════════════════════════════════════════════════════

describe("Fraud Sentinel Service", () => {
  it("detects large transaction anomaly", async () => {
    const { FraudSentinelService } = await import("@/lib/core-services/fraud-sentinel");
    const svc = new FraudSentinelService();

    const signals = svc.evaluate({ amount: 30000, userId: "user-1", timestamp: Date.now() });
    expect(signals.some(s => s.type === "unusual-amount")).toBe(true);
  });

  it("blocks rapid spend accumulation", async () => {
    const { FraudSentinelService } = await import("@/lib/core-services/fraud-sentinel");
    const svc = new FraudSentinelService();

    const result = svc.shouldBlock({
      amount: 10000, userId: "user-1", timestamp: Date.now(),
      recentTotalAmount: 55000, recentTransactionCount: 5,
    });
    expect(result.blocked).toBe(true);
  });

  it("produces summary with active alerts", async () => {
    const { FraudSentinelService } = await import("@/lib/core-services/fraud-sentinel");
    const svc = new FraudSentinelService();
    svc.evaluate({ amount: 30000, userId: "user-1", timestamp: Date.now(), isNewRecipient: true });
    svc.evaluate({ amount: 100, userId: "user-2", timestamp: Date.now() });

    const summary = svc.getSummary();
    expect(summary.totalSignals).toBeGreaterThan(0);
    expect(summary.activeAlerts).toBeGreaterThan(0);
  });

  it("resolves signals", async () => {
    const { FraudSentinelService } = await import("@/lib/core-services/fraud-sentinel");
    const svc = new FraudSentinelService();
    const signals = svc.evaluate({ amount: 30000, userId: "user-1", timestamp: Date.now() });
    expect(signals.length).toBeGreaterThan(0);

    const resolved = svc.resolve(signals[0].id, "admin");
    expect(resolved).toBe(true);
    expect(svc.getActiveSignals().length).toBeLessThan(signals.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// 17. Search Fabric Service
// ═══════════════════════════════════════════════════════════════

describe("Search Fabric Service", () => {
  it("indexes and searches items", async () => {
    const { SearchFabricService } = await import("@/lib/core-services/search-fabric");
    const svc = new SearchFabricService();

    svc.addBatch([
      { id: "1", type: "customer", domain: "business", title: "Sarah Chen", body: "Enterprise customer, $120k ARR", tags: ["enterprise", "key-account"], timestamp: Date.now(), metadata: { value: 120000 }, linkedEntities: [], sensitivity: "internal" },
      { id: "2", type: "invoice", domain: "finance", title: "Invoice #2026-001", body: "Payment for consulting services", tags: ["invoice", "consulting"], timestamp: Date.now(), metadata: { value: 5000 }, linkedEntities: ["Sarah Chen"], sensitivity: "confidential" },
      { id: "3", type: "task", domain: "concierge", title: "Book dentist appointment", body: "Schedule appointment for next week", tags: ["appointment", "health"], timestamp: Date.now(), metadata: {}, linkedEntities: [], sensitivity: "public" },
    ]);

    const results = svc.search({ query: "Sarah" });
    expect(results.results.length).toBeGreaterThan(0);
    expect(results.results[0].title).toBe("Sarah Chen");
    expect(results.facets.totalResults).toBeGreaterThan(0);
  });

  it("filters by domain", async () => {
    const { SearchFabricService } = await import("@/lib/core-services/search-fabric");
    const svc = new SearchFabricService();
    svc.addBatch([
      { id: "1", type: "customer", domain: "business", title: "Test Business", body: "Business item", tags: ["test"], timestamp: Date.now(), metadata: {}, linkedEntities: [], sensitivity: "public" },
      { id: "2", type: "task", domain: "concierge", title: "Test Concierge", body: "Concierge item with test keyword", tags: ["test"], timestamp: Date.now(), metadata: {}, linkedEntities: [], sensitivity: "public" },
    ]);

    const results = svc.search({ query: "test", domains: ["business"] });
    expect(results.results.every(r => r.domain === "business")).toBe(true);
  });

  it("filters by sensitivity", async () => {
    const { SearchFabricService } = await import("@/lib/core-services/search-fabric");
    const svc = new SearchFabricService();
    svc.addBatch([
      { id: "1", type: "customer", domain: "business", title: "Public Data", body: "public info", tags: ["data"], timestamp: Date.now(), metadata: {}, linkedEntities: [], sensitivity: "public" },
      { id: "2", type: "file", domain: "files", title: "Restricted Data", body: "restricted data", tags: ["data"], timestamp: Date.now(), metadata: {}, linkedEntities: [], sensitivity: "restricted" },
    ]);

    const results = svc.search({ query: "data", sensitivityFilter: ["public"] });
    expect(results.results.every(r => r.sensitivity === "public")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 18. Governance Simulator Service
// ═══════════════════════════════════════════════════════════════

describe("Governance Simulator Service", () => {
  it("simulates policy scenarios", async () => {
    const { GovernanceSimulatorService } = await import("@/lib/core-services/governance-simulator");
    const svc = new GovernanceSimulatorService();

    const result = svc.runSimulation({
      id: "sim-1", name: "Payment Policy Test", type: "policy-change",
      description: "Test payment policy enforcement",
      inputs: [
        { label: "Small payment", policyContext: { domain: "finance", capabilityId: "pay-bill", riskTier: "low", amount: 100 }, expectedOutcome: "allow" },
        { label: "Critical payment", policyContext: { domain: "finance", capabilityId: "pay-bill", riskTier: "critical", amount: 50000 }, expectedOutcome: "deny" },
      ],
      createdAt: Date.now(),
    });

    expect(result.summary.totalScenarios).toBe(2);
    expect(result.results[0].matchesExpectation).toBe(true);
    expect(result.results[1].matchesExpectation).toBe(true);
  });

  it("runs compliance audit", async () => {
    const { GovernanceSimulatorService } = await import("@/lib/core-services/governance-simulator");
    const svc = new GovernanceSimulatorService();

    const result = svc.runComplianceAudit([
      { domain: "finance", capabilityId: "transfer", riskTier: "high", amount: 5000 },
      { domain: "business", capabilityId: "crm.update", riskTier: "low" },
      { domain: "finance", capabilityId: "pay-bill", riskTier: "critical", amount: 100000 },
    ]);

    expect(result.summary.totalScenarios).toBe(3);
    expect(result.summary.overallCompliance).toBeGreaterThanOrEqual(0);
    expect(result.summary.recommendations.length).toBeGreaterThan(0);
  });

  it("projects cross-domain impact", async () => {
    const { GovernanceSimulatorService } = await import("@/lib/core-services/governance-simulator");
    const svc = new GovernanceSimulatorService();

    const impact = svc.projectImpact({ domain: "finance", capabilityId: "transfer", riskTier: "critical", amount: 50000 });
    expect(impact.affectedDomains.length).toBeGreaterThanOrEqual(1);
    expect(impact.estimatedRiskChange).toBe("increase");
    expect(impact.rollbackComplexity).toBe("complex");
  });

  it("keeps history of simulations", async () => {
    const { GovernanceSimulatorService } = await import("@/lib/core-services/governance-simulator");
    const svc = new GovernanceSimulatorService();

    svc.runSimulation({
      id: "s1", name: "Test 1", type: "what-if", description: "Test",
      inputs: [{ label: "basic", policyContext: { domain: "business", riskTier: "low" } }],
      createdAt: Date.now(),
    });

    expect(svc.getHistory().length).toBe(1);
    expect(svc.getLastResult()?.scenarioName).toBe("Test 1");
  });
});
