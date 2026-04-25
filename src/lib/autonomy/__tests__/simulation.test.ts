import { describe, it, expect } from "vitest";
import { buildSimulationReceipt, inventorySideEffects } from "../simulation";
import type { ProposedPlan } from "../proposers";
import type { DryRunDecision, AutonomyPolicy } from "../dry-run";

const basePlan: ProposedPlan = {
  actionKey: "cfo.draft_burn_review",
  summary: "Draft burn review",
  domain: "finance",
  riskClass: "reversible_safe",
  confidence: 0.8,
  financialImpactCents: 0,
  isClientFacing: false,
  payload: { signal_id: "sig-1" },
  rollback: { strategy: "delete_queued_record" },
  draftOnly: true,
};

const okDecision: DryRunDecision = {
  ok: true,
  mode: "queue_for_approval",
  reason: "below_confidence_threshold",
};

const policy: AutonomyPolicy = {
  autonomy_level: 3,
  allow_client_facing: false,
  allow_communication: false,
  allow_financial: false,
  allow_scheduling: false,
  emergency_stop: false,
  max_financial_impact_cents: 10_00,
  require_approval_above_confidence: 0.85,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

describe("simulation receipts", () => {
  it("inventories at minimum the queue insert", () => {
    const effects = inventorySideEffects(basePlan);
    expect(effects.some((e) => e.kind === "queue_insert")).toBe(true);
  });

  it("flags client-facing as non-reversible side effect", () => {
    const plan: ProposedPlan = { ...basePlan, isClientFacing: true };
    const effects = inventorySideEffects(plan);
    const cf = effects.find((e) => e.kind === "client_message");
    expect(cf).toBeDefined();
    expect(cf!.reversible).toBe(false);
  });

  it("includes financial side effect when impact > 0", () => {
    const plan: ProposedPlan = { ...basePlan, financialImpactCents: 500 };
    const effects = inventorySideEffects(plan);
    expect(effects.some((e) => e.kind === "financial_move")).toBe(true);
  });

  it("warns when confidence is below policy threshold", () => {
    const r = buildSimulationReceipt({
      advisorId: "cfo-advisor",
      plan: { ...basePlan, confidence: 0.5 },
      signal: null,
      policy,
      decision: okDecision,
    });
    expect(r.policyWarnings.some((w) => w.includes("Confidence"))).toBe(true);
  });

  it("warns when financial impact exceeds policy cap", () => {
    const r = buildSimulationReceipt({
      advisorId: "cfo-advisor",
      plan: { ...basePlan, financialImpactCents: 50_00 },
      signal: null,
      policy,
      decision: okDecision,
    });
    expect(r.policyWarnings.some((w) => w.includes("exceeds per-action cap"))).toBe(true);
  });

  it("warns about irreversible plans regardless of decision", () => {
    const r = buildSimulationReceipt({
      advisorId: "cfo-advisor",
      plan: { ...basePlan, riskClass: "irreversible" },
      signal: null,
      policy,
      decision: { ok: true, mode: "queue_for_approval", reason: "irreversible_actions_always_require_approval" },
    });
    expect(r.policyWarnings.some((w) => w.toLowerCase().includes("irreversible"))).toBe(true);
  });

  it("flags missing policy with default-L1 warning", () => {
    const r = buildSimulationReceipt({
      advisorId: "cfo-advisor",
      plan: basePlan,
      signal: null,
      policy: null,
      decision: okDecision,
    });
    expect(r.policyWarnings.some((w) => w.includes("L1"))).toBe(true);
  });

  it("includes a human-readable rollback summary", () => {
    const r = buildSimulationReceipt({
      advisorId: "cfo-advisor",
      plan: basePlan,
      signal: null,
      policy,
      decision: okDecision,
    });
    expect(r.rollbackPlan.humanSummary.length).toBeGreaterThan(0);
  });

  it("emits projected outcomes that include the plan summary", () => {
    const r = buildSimulationReceipt({
      advisorId: "cfo-advisor",
      plan: basePlan,
      signal: null,
      policy,
      decision: okDecision,
    });
    expect(r.projectedOutcomes.join(" ")).toContain("Draft burn review");
  });
});