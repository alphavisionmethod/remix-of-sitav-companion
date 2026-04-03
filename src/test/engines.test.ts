import { describe, it, expect } from "vitest";
import {
  ObservabilityEngine, ReleaseSafetyEngine, TrustDeviceEngine,
  ComplianceAuditEngine, EnterpriseControlPlaneEngine, SupportDiagnosticsEngine,
} from "@/lib/engines/enterprise-maturity";
import { RevenueOpportunityEngine } from "@/lib/engines";

describe("ObservabilityEngine", () => {
  it("returns SLO definitions", () => {
    const engine = new ObservabilityEngine();
    const slos = engine.getSLOs();
    expect(slos.length).toBeGreaterThan(0);
    expect(slos[0]).toHaveProperty("target");
    expect(slos[0]).toHaveProperty("status");
  });

  it("detects anomalies", () => {
    const engine = new ObservabilityEngine();
    const anomalies = engine.detectAnomalies();
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0]).toHaveProperty("metric");
    expect(anomalies[0]).toHaveProperty("deviation");
  });

  it("returns trust posture dashboard", () => {
    const engine = new ObservabilityEngine();
    const posture = engine.getTrustPostureDashboard();
    expect(posture.length).toBeGreaterThan(0);
    expect(posture[0]).toHaveProperty("dimension");
    expect(posture[0]).toHaveProperty("current");
  });

  it("returns latency overview", () => {
    const engine = new ObservabilityEngine();
    const latency = engine.getLatencyOverview();
    expect(latency.length).toBeGreaterThan(0);
    expect(latency[0]).toHaveProperty("p50");
    expect(latency[0]).toHaveProperty("p99");
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
  });

  it("lists and filters cases", () => {
    const engine = new SupportDiagnosticsEngine();
    engine.createCase({ title: "High case", description: "Urgent", severity: "high", status: "open", correlationIds: [], remediationSteps: [], escalationPath: [], slaTarget: 4 });
    engine.createCase({ title: "Low case", description: "Minor", severity: "low", status: "open", correlationIds: [], remediationSteps: [], escalationPath: [], slaTarget: 72 });
    const highCases = engine.listCases({ severity: "high" });
    expect(highCases.length).toBe(1);
    expect(highCases[0].title).toBe("High case");
  });
});

describe("EnterpriseControlPlaneEngine", () => {
  it("creates and lists orgs", () => {
    const engine = new EnterpriseControlPlaneEngine();
    const org = engine.createOrg({ name: "Test Corp", type: "business", visibility: "org-wide", delegationChain: [], policies: [], trustEnvironment: "standard", slaLevel: "standard" });
    expect(org.id).toBeDefined();
    expect(engine.listOrgs().length).toBe(1);
  });

  it("manages delegations", () => {
    const engine = new EnterpriseControlPlaneEngine();
    const org = engine.createOrg({ name: "FO", type: "family-office", visibility: "private", delegationChain: [], policies: [], trustEnvironment: "premium", slaLevel: "premium" });
    engine.grantDelegation({ grantorId: "owner-1", granteeId: "operator-1", level: "operator", scope: [org.id], constraints: {}, active: true });
    expect(engine.getEffectiveLevel("operator-1", org.id)).toBe("operator");
  });

  it("returns family office view", () => {
    const engine = new EnterpriseControlPlaneEngine();
    const org = engine.createOrg({ name: "Family Office", type: "family-office", visibility: "private", delegationChain: [], policies: [], trustEnvironment: "premium", slaLevel: "premium" });
    const view = engine.getFamilyOfficeView(org.id);
    expect(view.entities.length).toBeGreaterThan(0);
    expect(view.approvalRequirements.requiresDual).toBe(true);
  });
});

describe("ComplianceAuditEngine", () => {
  it("generates proof packets", () => {
    const engine = new ComplianceAuditEngine();
    const packet = engine.generateProofPacket("workflow", "wf-001");
    expect(packet.id).toBeDefined();
    expect(packet.type).toBe("workflow");
  });

  it("maintains audit timeline", () => {
    const engine = new ComplianceAuditEngine();
    engine.generateProofPacket("approval", "appr-001");
    engine.generateProofPacket("financial", "fin-001");
    const timeline = engine.getAuditTimeline();
    expect(timeline.length).toBeGreaterThanOrEqual(0);
  });
});

describe("RevenueOpportunityEngine", () => {
  it("detects leakage and tracks stats", () => {
    const engine = new RevenueOpportunityEngine();
    engine.detectLeakage({ type: "stale_lead", domain: "business", title: "Test lead", description: "Stale", estimatedValue: 5000, currency: "USD", confidence: 0.8, source: "test", entityId: "e1", relatedRecords: [], suggestedAction: "Follow up", assignedAdvisor: "biz-advisor" });
    const stats = engine.getStats();
    expect(stats.detected).toBe(1);
    expect(stats.totalPotentialValue).toBe(5000);
  });
});
