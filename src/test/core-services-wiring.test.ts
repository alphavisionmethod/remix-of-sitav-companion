// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Services Wiring Tests
// Verifies all 7 new services instantiate, use contract types,
// and produce valid runtime state
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { createOpportunityGraphService } from "@/lib/services/opportunity-graph";
import { createIntegrationConciergeService } from "@/lib/services/integration-concierge";
import { createOSUnificationService } from "@/lib/services/os-unification";
import { createOwnerControlRoomService } from "@/lib/services/owner-control-room";
import { createObservabilityService } from "@/lib/services/observability";
import { createTenantFirewallService } from "@/lib/services/tenant-firewall";
import { createTrustedDeviceService } from "@/lib/services/trusted-device";

describe("Core Services Wiring", () => {
  // ── Opportunity Graph ─────────────────────────────────────────
  describe("OpportunityGraphService", () => {
    it("instantiates and evaluates empty state", () => {
      const svc = createOpportunityGraphService();
      const state = svc.evaluate();
      expect(state.nodes).toEqual([]);
      expect(state.edges).toEqual([]);
      expect(state.totalPipelineValueCents).toBe(0);
      expect(state.realizedValueCents).toBe(0);
    });

    it("adds nodes, computes pipeline, returns top opportunities", () => {
      const svc = createOpportunityGraphService();
      svc.addOpportunity({
        id: "opp-1", title: "Automate AP", domain: "finance",
        type: "savings", valueCents: 500_00, confidence: 0.9,
        dependencies: [], status: "identified",
      });
      svc.addOpportunity({
        id: "opp-2", title: "Revenue capture", domain: "business",
        type: "revenue", valueCents: 1000_00, confidence: 0.7,
        dependencies: [], status: "evaluating",
      });
      const state = svc.evaluate();
      expect(state.nodes).toHaveLength(2);
      expect(state.totalPipelineValueCents).toBe(1500_00);
      expect(state.topOpportunities[0]).toBe("opp-2"); // higher value*confidence
    });

    it("handles blockers and status updates", () => {
      const svc = createOpportunityGraphService();
      svc.addOpportunity({ id: "a", title: "A", domain: "business", type: "revenue", valueCents: 100, confidence: 1, dependencies: [], status: "identified" });
      svc.addOpportunity({ id: "b", title: "B", domain: "business", type: "revenue", valueCents: 200, confidence: 1, dependencies: ["a"], status: "identified" });
      svc.addEdge({ fromId: "a", toId: "b", relationship: "blocks", strength: 1 });
      expect(svc.getBlockers("b")).toHaveLength(1);
      svc.updateStatus("a", "realized");
      expect(svc.getNode("a")?.status).toBe("realized");
    });
  });

  // ── Integration Concierge ─────────────────────────────────────
  describe("IntegrationConciergeService", () => {
    it("instantiates and evaluates empty state", () => {
      const svc = createIntegrationConciergeService();
      const state = svc.evaluate();
      expect(state.totalConnectors).toBe(0);
      expect(state.onboardingProgress).toBe(100); // no connectors = 100%
    });

    it("registers connectors and tracks health", () => {
      const svc = createIntegrationConciergeService();
      svc.registerConnector({
        connectorId: "stripe", name: "Stripe", status: "active",
        lastHealthCheck: new Date().toISOString(), errorCount: 0,
        dataFlowRate: 100, configCompleteness: 100,
      });
      svc.registerConnector({
        connectorId: "qbo", name: "QuickBooks", status: "configuring",
        lastHealthCheck: new Date().toISOString(), errorCount: 0,
        dataFlowRate: 0, configCompleteness: 50,
      });
      const state = svc.evaluate();
      expect(state.totalConnectors).toBe(2);
      expect(state.activeConnectors).toBe(1);
    });

    it("tracks errors and degrades connectors", () => {
      const svc = createIntegrationConciergeService();
      svc.registerConnector({
        connectorId: "x", name: "X", status: "active",
        lastHealthCheck: "", errorCount: 0, dataFlowRate: 10, configCompleteness: 100,
      });
      for (let i = 0; i < 5; i++) svc.recordError("x");
      expect(svc.getConnector("x")?.status).toBe("degraded");
    });
  });

  // ── OS Unification ────────────────────────────────────────────
  describe("OSUnificationService", () => {
    it("instantiates and manages surfaces", () => {
      const svc = createOSUnificationService();
      svc.connectSurface({
        surfaceId: "web-1", type: "web", userId: "u1", deviceId: "d1",
        connectedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(),
        currentContext: {},
      });
      const state = svc.evaluate();
      expect(state.activeSurfaces).toHaveLength(1);
      expect(state.continuityScore).toBe(100);
    });

    it("syncs shared context across surfaces", () => {
      const svc = createOSUnificationService();
      svc.connectSurface({
        surfaceId: "web", type: "web", userId: "u1", deviceId: "d1",
        connectedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(),
        currentContext: {},
      });
      svc.connectSurface({
        surfaceId: "mobile", type: "mobile", userId: "u1", deviceId: "d2",
        connectedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(),
        currentContext: {},
      });
      svc.setSharedContext("activeTask", "task-42");
      svc.syncContextAcrossSurfaces("u1");
      expect(svc.getSurface("web")?.currentContext.activeTask).toBe("task-42");
      expect(svc.getSurface("mobile")?.currentContext.activeTask).toBe("task-42");
    });
  });

  // ── Owner Control Room ────────────────────────────────────────
  describe("OwnerControlRoomService", () => {
    it("instantiates with owner mode and manages delegations", () => {
      const svc = createOwnerControlRoomService("user-1");
      svc.addDelegation({
        capabilityId: "pay-invoice", domain: "finance",
        isAutonomous: true, requiresApproval: false, maxAmountCents: 10000,
      });
      const state = svc.evaluate();
      expect(state.mode).toBe("owner");
      expect(state.delegations).toHaveLength(1);
      expect(state.delegations[0].isAutonomous).toBe(true);
    });

    it("tracks command history and recent entities", () => {
      const svc = createOwnerControlRoomService("u1");
      svc.addCommandToHistory("show revenue");
      svc.addCommandToHistory("approve invoice");
      svc.addRecentEntity({ type: "invoice", id: "inv-1", label: "Invoice #42", accessedAt: new Date().toISOString() });
      const state = svc.evaluate();
      expect(state.workspace.commandPaletteHistory).toHaveLength(2);
      expect(state.workspace.recentEntities).toHaveLength(1);
    });
  });

  // ── Observability ─────────────────────────────────────────────
  describe("ObservabilityService", () => {
    it("records metrics and computes health", () => {
      const svc = createObservabilityService();
      svc.recordMetric({
        id: "m1", name: "request_count", type: "counter",
        domain: "platform", value: 0, unit: "count",
        labels: {}, timestamp: new Date().toISOString(),
      });
      svc.incrementCounter("m1", 5);
      expect(svc.getMetric("m1")?.value).toBe(5);
      const state = svc.evaluate();
      expect(state.health.status).toBe("healthy");
    });

    it("tracks SLOs and detects breaches", () => {
      const svc = createObservabilityService();
      svc.registerSLO({
        id: "slo-1", name: "API uptime", target: 99.9,
        window: "30d", metric: "uptime", currentValue: 99.5,
        isMet: false, burnRate: 0.004,
      });
      expect(svc.getBreachedSLOs()).toHaveLength(1);
      const state = svc.evaluate();
      expect(state.health.status).toBe("degraded");
    });
  });

  // ── Tenant Firewall ───────────────────────────────────────────
  describe("TenantFirewallService", () => {
    it("allows same-tenant access", () => {
      const svc = createTenantFirewallService();
      const result = svc.enforce(
        { tenantId: "t1", userId: "u1", role: "owner", permissions: [] },
        "t1", "invoices", "finance"
      );
      expect(result.allowed).toBe(true);
    });

    it("default-denies cross-tenant access", () => {
      const svc = createTenantFirewallService();
      const result = svc.enforce(
        { tenantId: "t1", userId: "u1", role: "owner", permissions: [] },
        "t2", "invoices", "finance"
      );
      expect(result.allowed).toBe(false);
      expect(svc.getViolations()).toHaveLength(1);
    });

    it("enforces explicit allow/deny rules", () => {
      const svc = createTenantFirewallService();
      svc.addRule({
        id: "r1", sourceTenantId: "t1", targetTenantId: "t2",
        domain: "business", action: "allow", resource: "reports",
        privacyTier: "internal",
      });
      const result = svc.enforce(
        { tenantId: "t1", userId: "u1", role: "admin", permissions: [] },
        "t2", "reports", "business"
      );
      expect(result.allowed).toBe(true);
    });
  });

  // ── Trusted Device ────────────────────────────────────────────
  describe("TrustedDeviceService", () => {
    it("registers and attests devices", () => {
      const svc = createTrustedDeviceService();
      const device = svc.registerDevice({
        deviceId: "d1", userId: "u1", platform: "macOS",
        fingerprint: "fp-abc", capabilities: ["biometric", "tpm"],
      });
      expect(device.trustLevel).toBe("basic");
      svc.attestDevice("d1", "hardware-attested");
      expect(svc.getDevice("d1")?.trustLevel).toBe("hardware-attested");
      expect(svc.isDeviceTrusted("d1")).toBe(true);
    });

    it("revokes devices and prunes expired", () => {
      const svc = createTrustedDeviceService();
      svc.registerDevice({ deviceId: "d1", userId: "u1", platform: "iOS", fingerprint: "fp", capabilities: [] });
      svc.revokeDevice("d1");
      expect(svc.isDeviceTrusted("d1")).toBe(false);
      const state = svc.evaluate();
      expect(state.revokedCount).toBe(1);
    });
  });
});
