import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// AI Workforce & Budget System — Integrity Verification
// ═══════════════════════════════════════════════════════════════

describe("AI Workforce Tables", () => {
  const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");

  it("workforce invocations table exists", () => {
    expect(types).toContain("ai_workforce_invocations");
  });

  it("workforce recommendations table exists", () => {
    expect(types).toContain("ai_workforce_recommendations");
  });

  it("workforce budget classes table exists", () => {
    expect(types).toContain("ai_workforce_budget_classes");
  });

  it("workforce outputs table with quality scoring", () => {
    expect(types).toContain("ai_workforce_outputs");
    expect(types).toContain("quality_score");
  });

  it("launch honesty table exists", () => {
    expect(types).toContain("ai_workforce_launch_honesty");
  });

  it("AI budget enforcement tables exist", () => {
    expect(types).toContain("ai_user_hard_ceilings");
    expect(types).toContain("ai_budget_alerts");
    expect(types).toContain("ai_budget_decision_receipts");
  });

  it("AI model registry with cost tracking", () => {
    expect(types).toContain("ai_model_registry");
    expect(types).toContain("cost_per_1k_in_cents");
  });

  it("AI provider health monitoring exists", () => {
    expect(types).toContain("ai_provider_health");
    expect(types).toContain("error_rate_pct");
  });
});

describe("AI Runtime Verification", () => {
  const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");

  it("nightly runtime verification exists", () => {
    expect(types).toContain("ai_runtime_nightly_runs");
    expect(types).toContain("receipts_verified");
  });

  it("streak tracking for runtime health", () => {
    expect(types).toContain("ai_runtime_streak_state");
    expect(types).toContain("current_streak_days");
  });

  it("failure alerts for runtime issues", () => {
    expect(types).toContain("ai_runtime_failure_alerts");
    expect(types).toContain("failure_class");
  });

  it("AI capability routing table exists", () => {
    expect(types).toContain("ai_capability_routing");
    expect(types).toContain("fallback_chain");
  });
});