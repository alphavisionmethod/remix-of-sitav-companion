import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateDemoPolicy, evaluateAIPolicy, setKillSwitch, isScenarioKilled, disableScenario, enableScenario } from "../demo-policy-engine";

describe("DemoPolicyEngine", () => {
  beforeEach(() => {
    setKillSwitch("demoModeGlobal", false);
    setKillSwitch("demoAILiveCalls", false);
  });

  it("allows all side effects in real mode", () => {
    const decision = evaluateDemoPolicy("real", "external_write");
    expect(decision.allowed).toBe(true);
    expect(decision.executionMode).toBe("real");
  });

  it("blocks external writes in demo mode", () => {
    const decision = evaluateDemoPolicy("demo", "external_write");
    expect(decision.allowed).toBe(false);
    expect(decision.executionMode).toBe("simulated");
  });

  it("blocks billing in demo mode", () => {
    const decision = evaluateDemoPolicy("demo", "billing");
    expect(decision.allowed).toBe(false);
  });

  it("blocks notifications in demo mode", () => {
    const decision = evaluateDemoPolicy("demo", "notification");
    expect(decision.allowed).toBe(false);
  });

  it("blocks everything when global kill switch is on", () => {
    setKillSwitch("demoModeGlobal", true);
    const decision = evaluateDemoPolicy("demo", "ai_inference");
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("kill switch");
  });

  it("blocks specific scenario via kill switch", () => {
    disableScenario("scenario-1");
    const decision = evaluateDemoPolicy("demo", "ai_inference", { scenarioId: "scenario-1" });
    expect(decision.allowed).toBe(false);
    enableScenario("scenario-1"); // cleanup
  });

  it("isScenarioKilled returns true for killed scenario", () => {
    disableScenario("s1");
    expect(isScenarioKilled("s1")).toBe(true);
    enableScenario("s1");
  });
});

describe("evaluateAIPolicy", () => {
  beforeEach(() => {
    setKillSwitch("demoAILiveCalls", false);
  });

  it("allows full AI in real mode", () => {
    const result = evaluateAIPolicy("real");
    expect(result.allowed).toBe(true);
    expect(result.mode).toBe("full_live");
  });

  it("disables AI in demo mode (cached_only)", () => {
    const result = evaluateAIPolicy("demo");
    expect(result.allowed).toBe(false);
    expect(result.mode).toBe("cached_only");
  });

  it("limits AI in dev_demo mode", () => {
    const result = evaluateAIPolicy("dev_demo");
    expect(result.allowed).toBe(true);
    expect(result.budgetCapCents).toBe(50);
  });

  it("kill switch disables AI for non-real modes", () => {
    setKillSwitch("demoAILiveCalls", true);
    const result = evaluateAIPolicy("dev_demo");
    expect(result.allowed).toBe(false);
  });
});
