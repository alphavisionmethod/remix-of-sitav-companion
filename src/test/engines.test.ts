import { describe, it, expect } from "vitest";
import {
  ActionStateMachine, EntityRoleGraph, MemoryGovernanceEngine,
  PolicyDepthEngine, RevenueOpportunityEngine, TokenGovernanceEngine,
} from "@/lib/engines";
import { ReplayRecoveryEngine } from "@/lib/engines/replay-recovery";
import {
  EnterpriseControlPlaneEngine, SupportDiagnosticsEngine,
  ObservabilityEngine, ReleaseSafetyEngine, TrustDeviceEngine,
  ComplianceAuditEngine,
} from "@/lib/engines/enterprise-maturity";

describe("ActionStateMachine", () => {
  it("creates an action record with correct initial state", () => {
    const asm = new ActionStateMachine("test-wf", "business", "test-action", { ownerId: "u1", visibility: "private" });
    const record = asm.getRecord();
    expect(record.workflowId).toBe("test-wf");
    expect(record.domain).toBe("business");
    expect(record.currentState).toBe("draft");
    expect(record.stateHistory.length).toBeGreaterThan(0);
  });
});

describe("EntityRoleGraph", () => {
  it("registers and retrieves entities", () => {
    const graph = new EntityRoleGraph();
    graph.registerEntity({ id: "e1", name: "Test Entity", type: "user", roles: ["owner"], trustLevel: "verified", createdAt: new Date().toISOString() });
    const entity = graph.getEntity("e1");
    expect(entity).toBeDefined();
    expect(entity?.name).toBe("Test Entity");
  });

  it("creates and queries relationships", () => {
    const graph = new EntityRoleGraph();
    graph.registerEntity({ id: "e1", name: "Owner", type: "user", roles: ["owner"], trustLevel: "verified", createdAt: new Date().toISOString() });
    graph.registerEntity({ id: "e2", name: "Advisor", type: "advisor", roles: ["advisor"], trustLevel: "trusted", createdAt: new Date().toISOString() });
    graph.addRelationship({ fromId: "e1", toId: "e2", type: "delegates-to", permissions: ["read"], createdAt: new Date().toISOString() });
    const rels = graph.getRelationships("e1");
    expect(rels.length).toBe(1);
    expect(rels[0].toId).toBe("e2");
  });
});

describe("MemoryGovernanceEngine", () => {
  it("stores and retrieves memory entries", () => {
    const engine = new MemoryGovernanceEngine();
    const entry = engine.store({ category: "business", fact: "Test fact", confidence: 0.9, source: "test", entityId: "e1" });
    expect(entry.id).toBeDefined();
    const retrieved = engine.query("e1");
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].fact).toBe("Test fact");
  });
});

describe("PolicyDepthEngine", () => {
  it("evaluates policies and returns decisions", () => {
    const engine = new PolicyDepthEngine();
    engine.registerPolicy({ id: "p1", name: "Test Policy", domain: "finance", conditions: [{ field: "amount", operator: "gt", value: 1000 }], effect: "deny", priority: 1, active: true, version: 1, createdAt: new Date().toISOString() });
    const result = engine.evaluate("finance", { amount: 5000 });
    expect(result.effect).toBe("deny");
  });
});

describe("RevenueOpportunityEngine", () => {
  it("detects leakage and tracks stats", () => {
    const engine = new RevenueOpportunityEngine();
    engine.detectLeakage({ type: "stale_lead", domain: "business", title: "Test lead", description: "Stale", estimatedValue: 5000, currency: "USD", confidence: 0.8, source: "test", entityId: "e1", relatedRecords: [], suggestedAction: "Follow up" });
    const stats = engine.getStats();
    expect(stats.detected).toBe(1);
    expect(stats.totalPotentialValue).toBe(5000);
  });
});

describe("ObservabilityEngine", () => {
  it("returns SLO definitions", () => {
    const engine = new ObservabilityEngine();
    const slos = engine.getSLOs();
    expect(slos.length).toBeGreaterThan(0);
    expect(slos[0]).toHaveProperty("target");
    expect(slos[0]).toHaveProperty("currentValue");
    expect(slos[0]).toHaveProperty("status");
  });

  it("detects anomalies", () => {
    const engine = new ObservabilityEngine();
    const anomalies = engine.detectAnomalies();
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0]).toHaveProperty("metric");
    expect(anomalies[0]).toHaveProperty("deviation");
    expect(anomalies[0]).toHaveProperty("severity");
  });

  it("returns trust posture dashboard", () => {
    const engine = new ObservabilityEngine();
    const posture = engine.getTrustPostureDashboard();
    expect(posture.length).toBeGreaterThan(0);
    expect(posture[0]).toHaveProperty("dimension");
    expect(posture[0]).toHaveProperty("current");
  });
});

describe("SupportDiagnosticsEngine", () => {
  it("creates and retrieves support cases", () => {
    const engine = new SupportDiagnosticsEngine();
    const c = engine.createCase({ title: "Test case", description: "Test", severity: "medium", status: "open", correlationIds: [], remediationSteps: [], escalationPath: [], slaTarget: 24 });
    expect(c.id).toBeDefined();
    const retrieved = engine.getCase(c.id);
    expect(retrieved?.title).toBe("Test case");
  });

  it("generates diagnostic bundles", () => {
    const engine = new SupportDiagnosticsEngine();
    const bundle = engine.generateDiagnosticBundle(undefined, ["corr-1"]);
    expect(bundle.id).toBeDefined();
    expect(bundle.correlationIds).toContain("corr-1");
    expect(bundle.actionReplay.length).toBeGreaterThan(0);
  });
});

describe("ReleaseSafetyEngine", () => {
  it("returns rollout rings", () => {
    const engine = new ReleaseSafetyEngine();
    const rings = engine.getRolloutRings();
    expect(rings.length).toBeGreaterThan(0);
  });

  it("returns readiness score", () => {
    const engine = new ReleaseSafetyEngine();
    const score = engine.getReadinessScore();
    expect(score).toHaveProperty("score");
    expect(score).toHaveProperty("checklist");
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});

describe("TrustDeviceEngine", () => {
  it("enrolls and retrieves devices", () => {
    const engine = new TrustDeviceEngine();
    const device = engine.enrollDevice({ name: "Test Laptop", type: "desktop", fingerprint: "fp-123" });
    expect(device.id).toBeDefined();
    expect(device.trustScore).toBeGreaterThan(0);
    const retrieved = engine.getDevice(device.id);
    expect(retrieved?.name).toBe("Test Laptop");
  });

  it("revokes devices", () => {
    const engine = new TrustDeviceEngine();
    const device = engine.enrollDevice({ name: "Bad Device", type: "mobile", fingerprint: "fp-bad" });
    const revoked = engine.revokeDevice(device.id, "Compromised");
    expect(revoked).toBe(true);
    const retrieved = engine.getDevice(device.id);
    expect(retrieved?.status).toBe("revoked");
  });
});

describe("ComplianceAuditEngine", () => {
  it("generates proof packets", () => {
    const engine = new ComplianceAuditEngine();
    const packet = engine.generateProofPacket("workflow", "wf-001");
    expect(packet.id).toBeDefined();
    expect(packet.type).toBe("workflow");
    expect(packet.entries.length).toBeGreaterThan(0);
  });

  it("returns audit timeline", () => {
    const engine = new ComplianceAuditEngine();
    engine.generateProofPacket("approval", "appr-001");
    engine.generateProofPacket("financial", "fin-001");
    const timeline = engine.getAuditTimeline();
    expect(timeline.length).toBe(2);
  });
});

describe("EnterpriseControlPlaneEngine", () => {
  it("creates and lists orgs", () => {
    const engine = new EnterpriseControlPlaneEngine();
    const org = engine.createOrg({ name: "Test Corp", type: "business", visibility: "org-wide", delegationChain: [], policies: [], trustEnvironment: "standard", slaLevel: "standard" });
    expect(org.id).toBeDefined();
    const orgs = engine.listOrgs();
    expect(orgs.length).toBe(1);
  });

  it("manages delegations", () => {
    const engine = new EnterpriseControlPlaneEngine();
    const org = engine.createOrg({ name: "FO", type: "family-office", visibility: "private", delegationChain: [], policies: [], trustEnvironment: "premium", slaLevel: "premium" });
    const grant = engine.grantDelegation({ grantorId: "owner-1", granteeId: "operator-1", level: "operator", scope: [org.id], constraints: {}, active: true });
    expect(grant.id).toBeDefined();
    const level = engine.getEffectiveLevel("operator-1", org.id);
    expect(level).toBe("operator");
  });
});

describe("TokenGovernanceEngine", () => {
  it("tracks token budgets", () => {
    const engine = new TokenGovernanceEngine();
    const budget = engine.getBudgetStatus();
    expect(budget).toHaveProperty("daily");
    expect(budget).toHaveProperty("monthly");
  });
});

describe("ReplayRecoveryEngine", () => {
  it("builds replay packets from action records", () => {
    const engine = new ReplayRecoveryEngine();
    const packet = engine.buildReplayPacket({
      id: "rec-1", workflowId: "wf-1", domain: "finance" as const,
      actionType: "payment", entityScope: { ownerId: "u1", visibility: "private" as const },
      currentState: "failed" as any, rollbackEligible: true, proofIds: [],
      stateHistory: [
        { from: "draft", to: "executing", triggeredBy: "user", timestamp: new Date().toISOString(), confidence: 1 },
        { from: "executing", to: "failed", triggeredBy: "system", timestamp: new Date().toISOString(), confidence: 1 },
      ],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    expect(packet.id).toBeDefined();
    expect(packet.replayEligible).toBe(true);
    expect(packet.timeline.length).toBe(2);
  });
});
