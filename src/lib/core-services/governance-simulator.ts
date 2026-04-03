// ═══════════════════════════════════════════════════════════════
// SITA OS — Governance Simulator Service
// Policy simulation, what-if analysis, impact projection,
// rollout modeling, and governance compliance testing
// ═══════════════════════════════════════════════════════════════

import { evaluatePolicy, type PolicyContext, type PolicyEvaluationResult } from "./policy-engine";

export type SimulationType = "policy-change" | "rollout" | "what-if" | "compliance" | "stress-test" | "permission-audit";

export interface SimulationScenario {
  id: string;
  name: string;
  type: SimulationType;
  description: string;
  inputs: SimulationInput[];
  createdAt: number;
}

export interface SimulationInput {
  label: string;
  policyContext: PolicyContext;
  expectedOutcome?: string;
}

export interface SimulationResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  type: SimulationType;
  results: SimulationInputResult[];
  summary: SimulationSummary;
  executedAt: number;
  durationMs: number;
}

export interface SimulationInputResult {
  label: string;
  policyResult: PolicyEvaluationResult;
  expectedOutcome?: string;
  matchesExpectation: boolean;
  riskImpact: "none" | "low" | "medium" | "high" | "critical";
  notes: string[];
}

export interface SimulationSummary {
  totalScenarios: number;
  passed: number;
  failed: number;
  blocked: number;
  riskBreaches: number;
  overallCompliance: number;  // 0-1
  recommendations: string[];
}

// ── Impact Projection ───────────────────────────────────────────

export interface ImpactProjection {
  affectedDomains: string[];
  affectedCapabilities: string[];
  usersImpacted: number;
  workflowsAffected: number;
  estimatedRiskChange: "increase" | "decrease" | "neutral";
  complianceImpact: "improves" | "degrades" | "neutral";
  rollbackComplexity: "simple" | "moderate" | "complex";
}

// ── Governance Simulator Service ────────────────────────────────

export class GovernanceSimulatorService {
  private history: SimulationResult[] = [];

  runSimulation(scenario: SimulationScenario): SimulationResult {
    const start = Date.now();
    const results: SimulationInputResult[] = [];

    for (const input of scenario.inputs) {
      const policyResult = evaluatePolicy(input.policyContext);
      const notes: string[] = [];

      // Determine if result matches expectation
      let matchesExpectation = true;
      if (input.expectedOutcome) {
        matchesExpectation = policyResult.effect === input.expectedOutcome;
        if (!matchesExpectation) {
          notes.push(`Expected "${input.expectedOutcome}" but got "${policyResult.effect}"`);
        }
      }

      // Risk impact assessment
      let riskImpact: SimulationInputResult["riskImpact"] = "none";
      if (policyResult.effect === "deny") { riskImpact = "none"; notes.push("Action blocked by policy"); }
      else if (policyResult.effect === "require-dual-approval") { riskImpact = "high"; notes.push("Dual approval required — high governance overhead"); }
      else if (policyResult.effect === "require-approval") { riskImpact = "medium"; notes.push("Approval gate active"); }
      else if (policyResult.effect === "require-simulation") { riskImpact = "low"; notes.push("Simulation-first required"); }
      else if (input.policyContext.riskTier === "critical") { riskImpact = "critical"; notes.push("Critical risk tier — policy allows but risk is elevated"); }

      results.push({
        label: input.label,
        policyResult,
        expectedOutcome: input.expectedOutcome,
        matchesExpectation,
        riskImpact,
        notes,
      });
    }

    const passed = results.filter(r => r.matchesExpectation).length;
    const failed = results.filter(r => !r.matchesExpectation).length;
    const blocked = results.filter(r => r.policyResult.effect === "deny").length;
    const riskBreaches = results.filter(r => r.riskImpact === "critical" || r.riskImpact === "high").length;
    const overallCompliance = results.length > 0 ? passed / results.length : 1;

    const recommendations: string[] = [];
    if (riskBreaches > 0) recommendations.push(`${riskBreaches} scenario(s) have high/critical risk — review policy rules`);
    if (failed > 0) recommendations.push(`${failed} scenario(s) did not match expected outcomes — policy may need adjustment`);
    if (blocked > results.length * 0.5) recommendations.push("Over 50% of scenarios are blocked — policy may be too restrictive");
    if (overallCompliance === 1) recommendations.push("All scenarios pass — governance posture is compliant");

    const result: SimulationResult = {
      id: crypto.randomUUID(),
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      type: scenario.type,
      results,
      summary: { totalScenarios: results.length, passed, failed, blocked, riskBreaches, overallCompliance, recommendations },
      executedAt: Date.now(),
      durationMs: Date.now() - start,
    };

    this.history.push(result);
    return result;
  }

  projectImpact(policyContext: PolicyContext): ImpactProjection {
    const domains = [policyContext.domain ?? "unknown"];
    const capabilities = [policyContext.capabilityId ?? "unknown"];

    // Cross-domain impacts
    if (policyContext.domain === "finance" && (policyContext.amount ?? 0) > 10000) {
      domains.push("business");
    }
    if (policyContext.capabilityId?.includes("transfer")) {
      domains.push("finance");
    }

    const riskTier = policyContext.riskTier ?? "low";
    const estimatedRiskChange: ImpactProjection["estimatedRiskChange"] =
      riskTier === "critical" ? "increase" : riskTier === "high" ? "increase" : "neutral";

    return {
      affectedDomains: [...new Set(domains)],
      affectedCapabilities: capabilities,
      usersImpacted: riskTier === "critical" ? 1 : 5,
      workflowsAffected: riskTier === "critical" ? 3 : 1,
      estimatedRiskChange,
      complianceImpact: "neutral",
      rollbackComplexity: riskTier === "critical" ? "complex" : "simple",
    };
  }

  runComplianceAudit(contexts: PolicyContext[]): SimulationResult {
    const scenario: SimulationScenario = {
      id: crypto.randomUUID(),
      name: "Compliance Audit",
      type: "compliance",
      description: "Automated compliance audit across all policy contexts",
      inputs: contexts.map((ctx, i) => ({
        label: `Audit ${i + 1}: ${ctx.domain ?? "unknown"} / ${ctx.capabilityId ?? "unknown"}`,
        policyContext: ctx,
        expectedOutcome: undefined,
      })),
      createdAt: Date.now(),
    };

    return this.runSimulation(scenario);
  }

  getHistory(): SimulationResult[] {
    return [...this.history];
  }

  getLastResult(): SimulationResult | undefined {
    return this.history[this.history.length - 1];
  }
}
