import { describe, it, expect } from "vitest";

// ── Lifecycle Authority Imports ──────────────────────────────
import {
  LIFECYCLE_AUTHORITY,
  type BootTargetPolicy,
  type RestartStrategy,
  type CrashLoopTrigger,
  type RetryBudget,
} from "@/packages/contracts/runtime/lifecycle-authority";

import {
  computeNextDelay,
  checkRetryBudget,
  detectCrashLoop,
  evaluatePressure,
  type CrashEvent,
  type DependencyPressureReading,
} from "@/packages/contracts/runtime/host-supervision";

import { createLifecycleReceipt } from "@/packages/contracts/runtime/lifecycle-receipts";
import { DETERMINISTIC_RECOVERY_CHECKS } from "@/packages/contracts/runtime/install-recovery";

describe("Lifecycle Authority Registry", () => {
  it("has 9 boot targets in correct order", () => {
    const targets = LIFECYCLE_AUTHORITY.bootTargets;
    expect(targets).toHaveLength(9);
    targets.forEach((t, i) => expect(t.order).toBe(i));
  });

  it("boot targets have valid dependency chains", () => {
    const names = LIFECYCLE_AUTHORITY.bootTargets.map(t => t.target);
    for (const t of LIFECYCLE_AUTHORITY.bootTargets) {
      for (const dep of t.dependsOn) {
        expect(names).toContain(dep);
        const depIdx = LIFECYCLE_AUTHORITY.bootTargets.findIndex(b => b.target === dep);
        expect(depIdx).toBeLessThan(t.order);
      }
    }
  });

  it("has restart strategies for all core reasons", () => {
    const strategies = LIFECYCLE_AUTHORITY.restartStrategies;
    expect(strategies.crash).toBeDefined();
    expect(strategies.oomKill).toBeDefined();
    expect(strategies.updateApplied).toBeDefined();
    expect(strategies.userRequested).toBeDefined();
  });

  it("crash-loop triggers have valid escalations", () => {
    for (const trigger of LIFECYCLE_AUTHORITY.crashLoopTriggers) {
      expect(trigger.threshold).toBeGreaterThan(0);
      expect(trigger.windowMs).toBeGreaterThan(0);
      expect(["quarantine", "operator-intervention", "safe-mode", "halt"]).toContain(trigger.escalation.type);
    }
  });

  it("retry budget defaults cover all scopes", () => {
    const budgets = LIFECYCLE_AUTHORITY.retryBudgetDefaults;
    expect(budgets.perService.scope).toBe("per-service");
    expect(budgets.perBootTarget.scope).toBe("per-boot-target");
    expect(budgets.global.scope).toBe("global");
  });
});

describe("Host Supervision Engine", () => {
  it("computes exponential backoff correctly", () => {
    const policy = { type: "exponential" as const, initialDelayMs: 1000, maxDelayMs: 60000, multiplier: 2, jitterMs: 0 };
    expect(computeNextDelay(policy, 0)).toBe(1000);
    expect(computeNextDelay(policy, 3)).toBe(8000);
    expect(computeNextDelay(policy, 10)).toBe(60000); // capped
  });

  it("checks retry budget correctly — allows when under limit", () => {
    const budget: RetryBudget = { scope: "per-service", maxRetries: 5, windowMs: 300000, currentRetries: 2, lastResetAt: new Date(Date.now() - 10000).toISOString(), exhaustedAction: "quarantine" };
    const result = checkRetryBudget(budget, Date.now());
    expect(result.allowed).toBe(true);
    expect(result.remainingRetries).toBe(3);
  });

  it("checks retry budget correctly — blocks when exhausted", () => {
    const budget: RetryBudget = { scope: "per-service", maxRetries: 5, windowMs: 300000, currentRetries: 5, lastResetAt: new Date(Date.now() - 10000).toISOString(), exhaustedAction: "quarantine" };
    const result = checkRetryBudget(budget, Date.now());
    expect(result.allowed).toBe(false);
    expect(result.exhaustedAction).toBe("quarantine");
  });

  it("detects crash loops when threshold exceeded", () => {
    const now = Date.now();
    const events: CrashEvent[] = Array.from({ length: 6 }, (_, i) => ({
      service: "test-svc", timestamp: new Date(now - i * 10000).toISOString(), oomKilled: false,
    }));
    const triggers: CrashLoopTrigger[] = [{ service: "test-svc", threshold: 5, windowMs: 300000, escalation: { type: "quarantine", quarantineReason: "crash-loop-detected" } }];
    const result = detectCrashLoop(events, triggers, now);
    expect(result).not.toBeNull();
    expect(result!.loopDetected).toBe(true);
  });

  it("evaluates dependency pressure correctly", () => {
    const readings: DependencyPressureReading[] = [
      { source: "memory-pressure", currentValue: 95, threshold: 90, unit: "percent", exceeded: true, sampledAt: new Date().toISOString() },
    ];
    const triggers = LIFECYCLE_AUTHORITY.dependencyPressureTriggers;
    const actions = evaluatePressure(readings, triggers);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].action).toBe("shed-load");
  });
});

describe("Lifecycle Receipts", () => {
  it("creates a valid lifecycle receipt", () => {
    const receipt = createLifecycleReceipt(
      { type: "boot-completed", data: { deviceId: "d1", bootSequenceId: "bs1", bootTargetsCompleted: ["firmware-init"], bootDurationMs: 5000, attestationResult: "full", trustBaseline: 85, isFirstBoot: true } },
      { deviceId: "d1", tenantId: "t1", lifecycleState: "running", previousState: "booting", correlationId: "c1" },
    );
    expect(receipt.id).toMatch(/^lcr-/);
    expect(receipt.payload.type).toBe("boot-completed");
    expect(receipt.operatorVisible).toBe(true);
    expect(receipt.supportBundleEligible).toBe(true);
  });
});

describe("Install/Recovery Contracts", () => {
  it("has deterministic recovery checks for both lanes", () => {
    const appliance = DETERMINISTIC_RECOVERY_CHECKS.filter(c => c.lane === "appliance");
    const iso = DETERMINISTIC_RECOVERY_CHECKS.filter(c => c.lane === "iso");
    expect(appliance.length).toBeGreaterThan(0);
    expect(iso.length).toBeGreaterThan(0);
  });

  it("all checks have required evidence", () => {
    for (const check of DETERMINISTIC_RECOVERY_CHECKS) {
      expect(check.evidenceRequired.length).toBeGreaterThan(0);
    }
  });

  it("failure semantics are valid", () => {
    const valid = ["block", "warn-continue", "abort-with-evidence"];
    for (const check of DETERMINISTIC_RECOVERY_CHECKS) {
      expect(valid).toContain(check.failureSemantics);
    }
  });
});
