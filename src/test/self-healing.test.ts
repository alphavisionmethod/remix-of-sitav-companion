// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Healing Operations Tests
// Incident lifecycle, circuit breakers, fleet health, quarantine
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import { SelfHealingService, createSelfHealingService } from "@/lib/core-services/self-healing/service";
import { ImmuneController, createImmuneController } from "@/lib/core-services/self-healing/immune-controller";
import { FleetHealthService, createFleetHealthService } from "@/lib/core-services/self-healing/fleet-health";
import {
  ESCALATION_RULES, HEALING_CAPABILITY_MAP, ROOT_CAUSE_HEALING_MAP,
  AUTO_ALLOWED_ACTIONS, NEVER_AUTO_ACTIONS, DEGRADED_MODES,
} from "@/lib/core-services/self-healing/types";
import type { IncidentSeverity, RootCauseCategory } from "@/lib/core-services/self-healing/types";

// ── Self-Healing Service Tests ──────────────────────────────────

describe("SelfHealingService", () => {
  let svc: SelfHealingService;

  beforeEach(() => {
    svc = createSelfHealingService();
  });

  it("detect creates an incident in detected state", () => {
    const inc = svc.detect({ title: "Test", description: "Test incident", severity: "P2", rootCause: "connector-failure", affectedServices: ["svc-a"] });
    expect(inc.state).toBe("detected");
    expect(inc.severity).toBe("P2");
    expect(inc.rootCause).toBe("connector-failure");
    expect(inc.timeline).toHaveLength(1);
  });

  it("classify transitions to classified state", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P2", rootCause: "workflow-stuck", affectedServices: ["svc-a"] });
    const classified = svc.classify(inc.id);
    expect(classified?.state).toBe("classified");
    expect(classified?.timeline).toHaveLength(2);
  });

  it("triage returns escalation rule for severity", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P0", rootCause: "dependency-failure", affectedServices: ["svc-a"] });
    svc.classify(inc.id);
    const result = svc.triage(inc.id);
    expect(result?.escalationRule.severity).toBe("P0");
    expect(result?.escalationRule.autoHeal).toBe(true);
    expect(result?.escalationRule.notifyOwner).toBe(true);
  });

  it("plan generates healing actions from root cause mapping", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P2", rootCause: "connector-failure", affectedServices: ["connector-control"] });
    svc.classify(inc.id);
    svc.triage(inc.id);
    const plan = svc.plan(inc.id);
    expect(plan).toBeTruthy();
    expect(plan!.actions.length).toBeGreaterThan(0);
    const capabilities = plan!.actions.map(a => a.capability);
    expect(capabilities).toEqual(expect.arrayContaining(["connector-failover"]));
  });

  it("heal increments attempt count and transitions to healing", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P2", rootCause: "cache-failure", affectedServices: ["svc-a"] });
    svc.classify(inc.id);
    svc.triage(inc.id);
    svc.plan(inc.id);
    const healed = svc.heal(inc.id);
    expect(healed?.state).toBe("healing");
    expect(healed?.healAttempts).toBe(1);
  });

  it("heal escalates after max attempts", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P2", rootCause: "cache-failure", affectedServices: ["svc-a"] });
    svc.classify(inc.id);
    svc.triage(inc.id);
    svc.plan(inc.id);

    // Set healAttempts to max so next heal triggers escalation
    const current = svc.getIncident(inc.id)!;
    (svc as any).incidents.set(inc.id, { ...current, healAttempts: 3 });

    // Also ensure no circuit breaker blocks with cooldown
    const cbKey = `svc-a:${inc.id}`;
    (svc as any).circuitBreakers.set(cbKey, {
      serviceId: "svc-a", incidentId: inc.id, attempts: 3, maxAttempts: 3,
      lastAttemptAt: 0, cooldownMs: 30000, windowResetMs: 1800000, state: "closed",
    });

    const escalated = svc.heal(inc.id);
    expect(escalated?.state).toBe("escalated");
  });

  it("verify resolves on health check pass", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P2", rootCause: "cache-failure", affectedServices: ["svc-a"] });
    svc.classify(inc.id);
    svc.triage(inc.id);
    svc.plan(inc.id);
    svc.heal(inc.id);
    const resolved = svc.verify(inc.id, true);
    expect(resolved?.state).toBe("resolved");
    expect(resolved?.resolvedAt).toBeTruthy();
  });

  it("verify does not resolve on health check failure", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P2", rootCause: "cache-failure", affectedServices: ["svc-a"] });
    svc.classify(inc.id);
    svc.triage(inc.id);
    svc.plan(inc.id);
    svc.heal(inc.id);
    const result = svc.verify(inc.id, false);
    expect(result?.state).toBe("verifying");
  });

  it("escalate transitions to escalated with target", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P1", rootCause: "release-failure", affectedServices: ["svc-a"] });
    const escalated = svc.escalate(inc.id, "Manual escalation");
    expect(escalated?.state).toBe("escalated");
    expect(escalated?.escalatedTo).toBe("sup-reliability");
  });

  it("resolve transitions to resolved", () => {
    const inc = svc.detect({ title: "Test", description: "d", severity: "P3", rootCause: "ux-quality", affectedServices: ["svc-a"] });
    const resolved = svc.resolve(inc.id, "Fixed manually");
    expect(resolved?.state).toBe("resolved");
  });

  it("runPipeline auto-heals for P0-P2", () => {
    const result = svc.runPipeline({
      title: "Test pipeline", description: "d", severity: "P2",
      rootCause: "connector-failure", affectedServices: ["svc-a"],
    });
    expect(result.autoHealed).toBe(true);
    expect(result.plan).toBeTruthy();
    expect(result.incident.state).toBe("healing");
  });

  it("runPipeline does NOT auto-heal for P3", () => {
    const result = svc.runPipeline({
      title: "Test pipeline", description: "d", severity: "P3",
      rootCause: "ux-quality", affectedServices: ["svc-a"],
    });
    expect(result.autoHealed).toBe(false);
    expect(result.plan).toBeTruthy();
  });

  it("runPipeline logs only for P4", () => {
    const result = svc.runPipeline({
      title: "Info event", description: "d", severity: "P4",
      rootCause: "unknown", affectedServices: ["svc-a"],
    });
    expect(result.autoHealed).toBe(false);
    expect(result.plan).toBeNull();
  });

  it("getStats returns correct breakdown", () => {
    svc.runPipeline({ title: "A", description: "d", severity: "P2", rootCause: "connector-failure", affectedServices: ["a"] });
    svc.runPipeline({ title: "B", description: "d", severity: "P3", rootCause: "ux-quality", affectedServices: ["b"] });
    const stats = svc.getStats();
    expect(stats.total).toBe(2);
    expect(stats.bySeverity.P2).toBe(1);
    expect(stats.bySeverity.P3).toBe(1);
  });

  it("getActiveIncidents filters out resolved/escalated", () => {
    const inc = svc.detect({ title: "T", description: "d", severity: "P3", rootCause: "ux-quality", affectedServices: ["a"] });
    svc.resolve(inc.id, "done");
    expect(svc.getActiveIncidents()).toHaveLength(0);
  });

  it("generateDiagnosticBundle produces support-readable bundle", () => {
    const inc = svc.detect({ title: "T", description: "d", severity: "P2", rootCause: "connector-failure", affectedServices: ["a"], evidence: [{ foo: "bar" }] });
    const bundle = svc.generateDiagnosticBundle(inc.id);
    expect(bundle).toBeTruthy();
    expect(bundle!.supportReadable).toBe(true);
    expect(bundle!.classification).toBe("connector-failure");
    expect(bundle!.evidence).toHaveLength(1);
  });
});

// ── Immune Controller Tests ─────────────────────────────────────

describe("ImmuneController", () => {
  let ctrl: ImmuneController;

  beforeEach(() => {
    ctrl = createImmuneController();
  });

  it("quarantine isolates a service", () => {
    ctrl.quarantine("svc-x", "test reason");
    expect(ctrl.isQuarantined("svc-x")).toBe(true);
  });

  it("release removes quarantine", () => {
    ctrl.quarantine("svc-x", "test");
    ctrl.release("svc-x");
    expect(ctrl.isQuarantined("svc-x")).toBe(false);
  });

  it("auto-release after time window", () => {
    ctrl.quarantine("svc-x", "test", { autoRelease: true, autoReleaseAfterMs: 1 });
    // Wait just enough
    const start = Date.now();
    while (Date.now() - start < 5) { /* spin */ }
    expect(ctrl.isQuarantined("svc-x")).toBe(false);
  });

  it("matchRules returns matching immune rules", () => {
    const matched = ctrl.matchRules("connector-failure");
    expect(matched.length).toBeGreaterThan(0);
    expect(matched[0].pattern).toBe("connector-failure");
  });

  it("matchRules increments match count", () => {
    ctrl.matchRules("connector-failure");
    ctrl.matchRules("connector-failure");
    const rules = ctrl.getRules().filter(r => r.pattern === "connector-failure");
    expect(rules[0].matchCount).toBe(2);
  });

  it("addRule creates a custom rule", () => {
    const rule = ctrl.addRule({
      id: "custom-1", name: "Custom rule", pattern: "trust-failure",
      condition: "score < 30", action: "permission-revert",
      autonomyLevel: "L2", enabled: true,
    });
    expect(rule.matchCount).toBe(0);
    expect(ctrl.getRules().find(r => r.id === "custom-1")).toBeTruthy();
  });

  it("removeRule deletes a rule", () => {
    ctrl.addRule({ id: "del-1", name: "To delete", pattern: "unknown", condition: "true", action: "circuit-breaker", autonomyLevel: "L3", enabled: true });
    expect(ctrl.removeRule("del-1")).toBe(true);
    expect(ctrl.getRules().find(r => r.id === "del-1")).toBeUndefined();
  });

  it("auto-block after threshold offenses", () => {
    for (let i = 0; i < 5; i++) {
      ctrl.quarantine("repeat-offender", `offense ${i}`);
      ctrl.release("repeat-offender");
    }
    expect(ctrl.isAutoBlocked("repeat-offender")).toBe(true);
  });

  it("clearOffenses resets offense count", () => {
    for (let i = 0; i < 5; i++) {
      ctrl.quarantine("svc-y", `offense ${i}`);
      ctrl.release("svc-y");
    }
    ctrl.clearOffenses("svc-y");
    expect(ctrl.isAutoBlocked("svc-y")).toBe(false);
  });

  it("getStats returns correct summary", () => {
    ctrl.quarantine("a", "reason");
    ctrl.quarantine("b", "reason");
    const stats = ctrl.getStats();
    expect(stats.quarantinedCount).toBe(2);
    expect(stats.enabledRuleCount).toBeGreaterThan(0);
  });

  it("releaseAll clears all quarantines", () => {
    ctrl.quarantine("a", "r");
    ctrl.quarantine("b", "r");
    const released = ctrl.releaseAll();
    expect(released).toBe(2);
    expect(ctrl.getAllQuarantined()).toHaveLength(0);
  });
});

// ── Fleet Health Service Tests ──────────────────────────────────

describe("FleetHealthService", () => {
  let fleet: FleetHealthService;

  beforeEach(() => {
    fleet = createFleetHealthService();
    fleet.registerService("db", "Database", []);
    fleet.registerService("api", "API Server", ["db"]);
    fleet.registerService("web", "Web Frontend", ["api"]);
  });

  it("registerService creates healthy service", () => {
    const svc = fleet.getService("db");
    expect(svc?.status).toBe("healthy");
    expect(svc?.healthScore).toBe(100);
  });

  it("registerService sets up dependency graph", () => {
    expect(fleet.getUpstreamDependencies("api")).toEqual(["db"]);
    expect(fleet.getDownstreamDependents("db")).toEqual(["api"]);
  });

  it("recordHealthCheck updates health score", () => {
    const result = fleet.recordHealthCheck("db", true, { uptimePercent: 99.9, avgLatencyMs: 5, p99LatencyMs: 20, errorRate: 0.001, requestsPerMinute: 100 });
    expect(result?.status).toBe("healthy");
    expect(result?.healthScore).toBeGreaterThan(90);
  });

  it("consecutive failures degrade status", () => {
    for (let i = 0; i < 3; i++) {
      fleet.recordHealthCheck("db", false, { uptimePercent: 80, errorRate: 0.15 });
    }
    const svc = fleet.getService("db");
    expect(["degraded", "unhealthy"]).toContain(svc?.status);
  });

  it("degraded mode entered on unhealthy check", () => {
    for (let i = 0; i < 3; i++) {
      fleet.recordHealthCheck("db", false, { uptimePercent: 70, errorRate: 0.2 });
    }
    expect(fleet.isDegraded("db")).toBe(true);
    expect(fleet.getDegradedServices()).toHaveLength(1);
  });

  it("degraded mode exits after 3 consecutive healthy checks", () => {
    fleet.enterDegradedMode("db", "test");
    expect(fleet.isDegraded("db")).toBe(true);

    fleet.recordHealthCheck("db", true, { uptimePercent: 99.9, errorRate: 0.001 });
    fleet.recordHealthCheck("db", true, { uptimePercent: 99.9, errorRate: 0.001 });
    fleet.recordHealthCheck("db", true, { uptimePercent: 99.9, errorRate: 0.001 });

    expect(fleet.isDegraded("db")).toBe(false);
  });

  it("degraded mode does NOT exit before 3 consecutive healthy", () => {
    fleet.enterDegradedMode("db", "test");
    fleet.recordHealthCheck("db", true, { uptimePercent: 99.9, errorRate: 0.001 });
    fleet.recordHealthCheck("db", true, { uptimePercent: 99.9, errorRate: 0.001 });
    // Only 2 consecutive healthy — should still be degraded
    expect(fleet.isDegraded("db")).toBe(true);
  });

  it("buildRecoverySequence sorts upstream-first", () => {
    const seq = fleet.buildRecoverySequence(["web", "db", "api"], "inc-1");
    const order = seq.steps.map(s => s.serviceId);
    expect(order.indexOf("db")).toBeLessThan(order.indexOf("api"));
    expect(order.indexOf("api")).toBeLessThan(order.indexOf("web"));
  });

  it("predictCascade finds downstream impact", () => {
    const affected = fleet.predictCascade("db");
    expect(affected).toContain("api");
    expect(affected).toContain("web");
  });

  it("predictCascade returns empty for leaf service", () => {
    const affected = fleet.predictCascade("web");
    expect(affected).toHaveLength(0);
  });

  it("getFleetSummary aggregates correctly", () => {
    const summary = fleet.getFleetSummary();
    expect(summary.total).toBe(3);
    expect(summary.healthy).toBe(3);
    expect(summary.avgHealthScore).toBe(100);
  });

  it("setServiceStatus manually changes status", () => {
    fleet.setServiceStatus("db", "quarantined");
    expect(fleet.getService("db")?.status).toBe("quarantined");
  });

  it("getServicesByStatus filters correctly", () => {
    fleet.setServiceStatus("db", "unhealthy");
    expect(fleet.getServicesByStatus("unhealthy")).toHaveLength(1);
    expect(fleet.getServicesByStatus("healthy")).toHaveLength(2);
  });
});

// ── Type System Tests ───────────────────────────────────────────

describe("Self-Healing Type System", () => {
  it("ESCALATION_RULES covers all severities P0-P4", () => {
    const severities = ESCALATION_RULES.map(r => r.severity);
    expect(severities).toEqual(["P0", "P1", "P2", "P3", "P4"]);
  });

  it("P0 has highest autonomy and auto-heal", () => {
    const p0 = ESCALATION_RULES.find(r => r.severity === "P0")!;
    expect(p0.autoHeal).toBe(true);
    expect(p0.autonomyLevel).toBe("L6");
    expect(p0.notifyOwner).toBe(true);
  });

  it("P4 has no auto-heal and no escalation", () => {
    const p4 = ESCALATION_RULES.find(r => r.severity === "P4")!;
    expect(p4.autoHeal).toBe(false);
    expect(p4.maxAttempts).toBe(0);
    expect(p4.escalationTarget).toBe("");
  });

  it("HEALING_CAPABILITY_MAP has 11 capabilities", () => {
    expect(HEALING_CAPABILITY_MAP).toHaveLength(11);
  });

  it("ROOT_CAUSE_HEALING_MAP covers all root causes", () => {
    const causes: RootCauseCategory[] = [
      "resource-exhaustion", "dependency-failure", "config-error",
      "workflow-stuck", "connector-failure", "release-failure",
      "trust-failure", "runtime-cost", "ux-quality",
    ];
    for (const cause of causes) {
      expect(ROOT_CAUSE_HEALING_MAP[cause].length).toBeGreaterThan(0);
    }
  });

  it("AUTO_ALLOWED_ACTIONS are all low-risk", () => {
    expect(AUTO_ALLOWED_ACTIONS).toContain("cache-flush");
    expect(AUTO_ALLOWED_ACTIONS).toContain("queue-drain");
    expect(AUTO_ALLOWED_ACTIONS).not.toContain("rollback");
  });

  it("NEVER_AUTO_ACTIONS forbids dangerous operations", () => {
    expect(NEVER_AUTO_ACTIONS).toContain("widen-permissions");
    expect(NEVER_AUTO_ACTIONS).toContain("destructive-data-actions");
    expect(NEVER_AUTO_ACTIONS).toContain("irreversible-migrations");
  });

  it("DEGRADED_MODES has 6 definitions", () => {
    expect(DEGRADED_MODES).toHaveLength(6);
    for (const mode of DEGRADED_MODES) {
      expect(mode.fallbackBehavior.length).toBeGreaterThan(0);
    }
  });
});
