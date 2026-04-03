import { describe, it, expect } from "vitest";
import {
  ALL_DETAILED_AGENTS, getDetailedAgent, getDetailedAgentsByCouncil,
  PRODUCT_BUILD_AGENTS, RELIABILITY_OPS_AGENTS, SECURITY_TRUST_AGENTS,
  RUNTIME_COST_AGENTS, ARCHITECTURE_GOVERNANCE_AGENTS, KNOWLEDGE_COORDINATION_AGENTS,
} from "@/lib/internal-agents";
import {
  AUTONOMY_TIERS, getAutonomyTier, NEVER_ALLOWED, MUST_REQUIRE_HUMAN_APPROVAL,
  MAY_AUTO_EXECUTE, MUST_SIMULATE_FIRST, PROMOTION_RULES, DEMOTION_TRIGGERS,
  AGENT_METRICS, getAutonomyLevel, canAutoApply, isAutoExecutable, requiresSimulation,
  getPromotionRequirements, getDemotionTrigger, DESIGN_DRIFT_CHECKLIST, WATCHDOG_CONCERNS,
} from "@/lib/internal-agents/rights";
import { COUNCILS, getCouncil } from "@/lib/internal-agents/councils";
import { SUPERVISORS, getSupervisor } from "@/lib/internal-agents/supervisors";
import {
  validateLaunchReadiness, getCouncilSummary, getAllCouncilSummaries,
  LAUNCH_CHECKLIST, ACTION_PIPELINE_STATES, ADMIN_CONTROL_FIELDS,
} from "@/lib/internal-agents/launch-readiness";

// Also test packages re-export
import {
  ALL_DETAILED_AGENTS as PKG_AGENTS,
  COUNCILS as PKG_COUNCILS,
  SUPERVISORS as PKG_SUPERVISORS,
} from "@/packages/internal-agent-config";

describe("Internal AI Workforce", () => {
  // ═══════════ Core Agent Registry ═══════════
  it("has exactly 40 agents total", () => {
    expect(ALL_DETAILED_AGENTS.length).toBe(40);
  });

  it("every agent has required fields", () => {
    for (const agent of ALL_DETAILED_AGENTS) {
      expect(agent.agentId).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.council).toBeTruthy();
      expect(agent.mission).toBeTruthy();
      expect(agent.scope.length).toBeGreaterThan(0);
      expect(agent.maxAutonomyLevel).toBeTruthy();
      expect(agent.schedule).toBeTruthy();
      expect(agent.maturity).toBeTruthy();
      expect(agent.confidenceRules.minConfidenceToAct).toBeGreaterThan(0);
      expect(agent.confidenceRules.minConfidenceToRecommend).toBeGreaterThan(0);
    }
  });

  it("every agent has unique ID", () => {
    const ids = ALL_DETAILED_AGENTS.map(a => a.agentId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all agent IDs start with aw-", () => {
    for (const agent of ALL_DETAILED_AGENTS) {
      expect(agent.agentId).toMatch(/^aw-/);
    }
  });

  it("getDetailedAgent finds by ID", () => {
    const first = ALL_DETAILED_AGENTS[0];
    const found = getDetailedAgent(first.agentId);
    expect(found).toBeDefined();
    expect(found!.name).toBe(first.name);
  });

  it("has correct agent distribution per council (8,8,7,6,6,5)", () => {
    expect(PRODUCT_BUILD_AGENTS.length).toBe(8);
    expect(RELIABILITY_OPS_AGENTS.length).toBe(8);
    expect(SECURITY_TRUST_AGENTS.length).toBe(7);
    expect(RUNTIME_COST_AGENTS.length).toBe(6);
    expect(ARCHITECTURE_GOVERNANCE_AGENTS.length).toBe(6);
    expect(KNOWLEDGE_COORDINATION_AGENTS.length).toBe(5);
  });

  // ═══════════ Autonomy Tiers ═══════════
  it("has 7 autonomy tiers (L0-L6)", () => {
    expect(AUTONOMY_TIERS.length).toBe(7);
    for (let i = 0; i < 7; i++) {
      expect(getAutonomyTier(i)).toBeDefined();
      expect(getAutonomyTier(i)!.level).toBe(i);
    }
  });

  it("L0-L2 cannot write production", () => {
    for (let i = 0; i <= 2; i++) {
      expect(getAutonomyTier(i)!.canWriteProduction).toBe(false);
    }
  });

  it("L3-L6 can write production", () => {
    for (let i = 3; i <= 6; i++) {
      expect(getAutonomyTier(i)!.canWriteProduction).toBe(true);
    }
  });

  it("canAutoApply returns true for L3+", () => {
    expect(canAutoApply(2)).toBe(false);
    expect(canAutoApply(3)).toBe(true);
    expect(canAutoApply(6)).toBe(true);
  });

  // ═══════════ Governance Constants ═══════════
  it("has 10 never-allowed actions", () => {
    expect(NEVER_ALLOWED.length).toBe(10);
  });

  it("has 8 must-require-human-approval categories", () => {
    expect(MUST_REQUIRE_HUMAN_APPROVAL.length).toBe(8);
  });

  it("has 6 may-auto-execute categories", () => {
    expect(MAY_AUTO_EXECUTE.length).toBe(6);
    expect(isAutoExecutable("Incident triage")).toBe(true);
    expect(isAutoExecutable("Production deployments")).toBe(false);
  });

  it("has 6 must-simulate-first categories", () => {
    expect(MUST_SIMULATE_FIRST.length).toBe(6);
    expect(requiresSimulation("Recovery")).toBe(true);
    expect(requiresSimulation("Diagnostics")).toBe(false);
  });

  it("has 10 design drift checklist items", () => {
    expect(DESIGN_DRIFT_CHECKLIST.length).toBe(10);
  });

  it("has 6 watchdog concerns", () => {
    expect(WATCHDOG_CONCERNS.length).toBe(6);
  });

  // ═══════════ Promotion & Demotion ═══════════
  it("has promotion rules for L0→L6 path", () => {
    expect(PROMOTION_RULES.length).toBe(6);
    expect(getPromotionRequirements(0, 1)).toBeDefined();
    expect(getPromotionRequirements(5, 6)).toBeDefined();
    expect(getPromotionRequirements(5, 6)!.requires).toContain("human-confirmation");
    expect(getPromotionRequirements(5, 6)!.timeConstraint).toBe("5 minutes");
  });

  it("all promotions require audit", () => {
    for (const rule of PROMOTION_RULES) {
      expect(rule.auditRequired).toBe(true);
    }
  });

  it("has 5 demotion triggers", () => {
    expect(DEMOTION_TRIGGERS.length).toBe(5);
    expect(getDemotionTrigger("policy-violation")).toBeDefined();
    expect(getDemotionTrigger("policy-violation")!.targetLevel).toBe(0);
  });

  // ═══════════ Agent Metrics ═══════════
  it("has 12 agent metric definitions", () => {
    expect(AGENT_METRICS.length).toBe(12);
    const ids = AGENT_METRICS.map(m => m.metricId);
    expect(ids).toContain("agent.invocation.count");
    expect(ids).toContain("supervisor.override.count");
  });

  // ═══════════ Councils ═══════════
  it("has 6 councils", () => {
    expect(COUNCILS.length).toBe(6);
    for (const council of COUNCILS) {
      expect(council.councilId).toBeTruthy();
      expect(council.name).toBeTruthy();
      expect(council.agentCount).toBeGreaterThan(0);
    }
  });

  it("getCouncil finds by ID", () => {
    const first = COUNCILS[0];
    const found = getCouncil(first.councilId);
    expect(found).toBeDefined();
  });

  it("security and architecture councils have higher quorum", () => {
    expect(getCouncil("security-trust")!.quorum).toBe(60);
    expect(getCouncil("architecture-governance")!.quorum).toBe(60);
  });

  // ═══════════ Supervisors ═══════════
  it("has 7 supervisors including chief-of-staff", () => {
    expect(SUPERVISORS.length).toBe(7);
    expect(getSupervisor("chief-of-staff")).toBeDefined();
    expect(getSupervisor("chief-of-staff")!.council).toBe("all");
  });

  // ═══════════ Launch Readiness ═══════════
  it("has 14 launch checklist items", () => {
    expect(LAUNCH_CHECKLIST.length).toBe(14);
  });

  it("validateLaunchReadiness returns structured result", () => {
    const result = validateLaunchReadiness();
    expect(result.totalChecks).toBe(14);
    expect(result.passedChecks).toBeGreaterThan(0);
    expect(result.results.length).toBe(14);
    for (const r of result.results) {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(typeof r.passed).toBe("boolean");
      expect(r.detail).toBeTruthy();
    }
  });

  it("all launch checks pass", () => {
    const result = validateLaunchReadiness();
    const failed = result.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.warn("Failed checks:", failed.map(f => `${f.name}: ${f.detail}`));
    }
    expect(result.passed).toBe(true);
  });

  // ═══════════ Council Summaries ═══════════
  it("has plain-language summaries for all councils", () => {
    const summaries = getAllCouncilSummaries();
    expect(summaries.length).toBe(6);
    for (const s of summaries) {
      expect(s.summary.length).toBeGreaterThan(50);
      expect(s.agentCount).toBeGreaterThan(0);
    }
  });

  it("getCouncilSummary returns non-empty strings", () => {
    expect(getCouncilSummary("product-build").length).toBeGreaterThan(0);
    expect(getCouncilSummary("security-trust").length).toBeGreaterThan(0);
  });

  // ═══════════ Action Pipeline ═══════════
  it("has 4 action pipeline states", () => {
    expect(ACTION_PIPELINE_STATES.length).toBe(4);
    expect(ACTION_PIPELINE_STATES[0]).toBe("proposal");
    expect(ACTION_PIPELINE_STATES[3]).toBe("executed");
  });

  // ═══════════ Admin Controls ═══════════
  it("has 10 admin control fields", () => {
    expect(ADMIN_CONTROL_FIELDS.length).toBe(10);
  });

  // ═══════════ Package Sync ═══════════
  it("packages/internal-agent-config mirrors lib/internal-agents", () => {
    expect(PKG_AGENTS.length).toBe(ALL_DETAILED_AGENTS.length);
    expect(PKG_COUNCILS.length).toBe(COUNCILS.length);
    expect(PKG_SUPERVISORS.length).toBe(SUPERVISORS.length);
    
    // Verify same agent IDs
    const libIds = ALL_DETAILED_AGENTS.map(a => a.agentId).sort();
    const pkgIds = PKG_AGENTS.map(a => a.agentId).sort();
    expect(pkgIds).toEqual(libIds);
  });
});
