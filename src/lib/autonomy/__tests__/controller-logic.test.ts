import { describe, it, expect } from "vitest";
import {
  canTransition,
  nextStateOnFailure,
  FAILURE_THRESHOLD,
} from "../state-machine";
import { decideExecutionMode, AUTONOMY_CEILING, type AutonomyPolicy } from "../dry-run";
import { proposeForSignal } from "../proposers";
import { SIGNAL_KINDS, type OSStateSignal } from "../signal-bus";

const baseSignal: OSStateSignal = {
  acted_on: false,
  acted_on_at: null,
  acted_on_by_advisor_id: null,
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 86400_000).toISOString(),
  id: "sig-1",
  payload: {},
  severity: "high",
  signal_kind: SIGNAL_KINDS.CASH_RUNWAY_DIP,
  source: "test",
  suggested_action_class: null,
  suggested_advisor_ids: [],
  summary: "x",
  user_id: "u1",
};

const policyL3: AutonomyPolicy = {
  autonomy_level: 3,
  allow_client_facing: false,
  allow_communication: false,
  allow_financial: true,
  allow_scheduling: true,
  emergency_stop: false,
  max_financial_impact_cents: 100_00,
  require_approval_above_confidence: 0.5,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

describe("state-machine.canTransition", () => {
  it("allows idle → observing", () => {
    expect(canTransition("idle", "observing")).toBe(true);
  });
  it("disallows idle → executing", () => {
    expect(canTransition("idle", "executing")).toBe(false);
  });
  it("disallows observing → executing (must go through dry_run)", () => {
    expect(canTransition("observing", "executing")).toBe(false);
  });
  it("allows dry_run → executing and dry_run → awaiting_approval", () => {
    expect(canTransition("dry_run", "executing")).toBe(true);
    expect(canTransition("dry_run", "awaiting_approval")).toBe(true);
  });
});

describe("state-machine.nextStateOnFailure", () => {
  it("opens the circuit at the failure threshold", () => {
    const r = nextStateOnFailure("executing", FAILURE_THRESHOLD - 1);
    expect(r.state).toBe("circuit_open");
    expect(r.openUntil).toBeDefined();
  });
  it("cools down before threshold", () => {
    const r = nextStateOnFailure("executing", 0);
    expect(r.state).toBe("cooling_down");
  });
});

describe("dry-run.decideExecutionMode (L3 ceiling)", () => {
  const safePlan = proposeForSignal("cfo-advisor", baseSignal)!;
  it("queues when no policy exists", () => {
    const d = decideExecutionMode(safePlan, null);
    expect(d.mode).toBe("queue_for_approval");
  });
  it("blocks when emergency_stop is on", () => {
    const d = decideExecutionMode(safePlan, { ...policyL3, emergency_stop: true });
    expect(d.mode).toBe("blocked");
  });
  it("queues when below L3", () => {
    const d = decideExecutionMode(safePlan, { ...policyL3, autonomy_level: 2 });
    expect(d.mode).toBe("queue_for_approval");
  });
  it("auto-executes a reversible_safe plan at L3", () => {
    const d = decideExecutionMode(safePlan, policyL3);
    expect(d.mode).toBe("auto_execute");
  });
  it("never auto-executes irreversible plans even at L3", () => {
    const d = decideExecutionMode(
      { ...safePlan, riskClass: "irreversible" },
      policyL3,
    );
    expect(d.mode).toBe("queue_for_approval");
    expect(d.reason).toMatch(/irreversible/);
  });
  it("never auto-executes risky-but-reversible plans at L3", () => {
    const d = decideExecutionMode(
      { ...safePlan, riskClass: "reversible_risky" },
      policyL3,
    );
    expect(d.mode).toBe("queue_for_approval");
  });
  it("queues when financial impact exceeds cap", () => {
    const d = decideExecutionMode(
      { ...safePlan, financialImpactCents: 200_00 },
      policyL3,
    );
    expect(d.mode).toBe("queue_for_approval");
  });
  it("caps stored autonomy_level at AUTONOMY_CEILING", () => {
    const d = decideExecutionMode(safePlan, { ...policyL3, autonomy_level: 99 });
    expect(d.mode).toBe("auto_execute");
    expect(AUTONOMY_CEILING).toBe(3);
  });
});

describe("proposers.proposeForSignal", () => {
  it("maps CASH_RUNWAY_DIP → reversible_safe burn-review draft", () => {
    const p = proposeForSignal("cfo-advisor", baseSignal)!;
    expect(p.riskClass).toBe("reversible_safe");
    expect(p.draftOnly).toBe(true);
    expect(p.actionKey).toBe("cfo.draft_burn_review");
  });
  it("returns null for unknown signal kinds", () => {
    const p = proposeForSignal("cfo-advisor", {
      ...baseSignal,
      signal_kind: "unknown.kind",
    });
    expect(p).toBeNull();
  });
});