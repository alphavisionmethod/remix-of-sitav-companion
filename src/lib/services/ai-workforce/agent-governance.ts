// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Agent Governance Service
// Autonomy ceiling, token budget, simulation gate, council escalation
// ═══════════════════════════════════════════════════════════════

import type { AgentAutonomyLevel } from "@/packages/contracts/domain-types/ai-workforce";
import type { AIWorkforceService } from "./index";

// ── Types ──

export interface GovernanceCheckResult {
  check: string;
  passed: boolean;
  detail: string;
}

export interface GovernanceDecision {
  allowed: boolean;
  reason: string;
  checks: GovernanceCheckResult[];
  escalatedTo?: string;
  riskScore: number;
  autonomyLevel: AgentAutonomyLevel;
}

export interface GovernanceConfig {
  maxAutonomyLevel: AgentAutonomyLevel;
  hourlyTokenLimit: number;
  monthlyTokenLimit: number;
  riskThreshold: number;
  requireSimulationAboveLevel: AgentAutonomyLevel;
}

interface TokenUsageRecord {
  agentId: string;
  tokensUsed: number;
  timestamp: number;
}

// ── Constants ──

const AUTONOMY_ORDER: AgentAutonomyLevel[] = [
  "L0-observe", "L1-suggest", "L2-draft", "L3-simulate",
  "L4-auto-reversible", "L5-auto-irreversible", "L6-constrained-action",
];

const DEFAULT_CONFIG: GovernanceConfig = {
  maxAutonomyLevel: "L4-auto-reversible",
  hourlyTokenLimit: 100_000,
  monthlyTokenLimit: 10_000_000,
  riskThreshold: 7.5,
  requireSimulationAboveLevel: "L3-simulate",
};

// ── Service ──

export class AgentGovernanceService {
  private config: GovernanceConfig;
  private tokenLedger: TokenUsageRecord[] = [];
  private decisionLog: Array<{ agentId: string; decision: GovernanceDecision; timestamp: string }> = [];

  constructor(
    private workforce: AIWorkforceService,
    config?: Partial<GovernanceConfig>,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run all governance checks before allowing an agent action.
   */
  evaluate(
    agentId: string,
    actionType: string,
    requestedLevel: AgentAutonomyLevel,
    riskScore: number,
    estimatedTokens: number,
    simulationPassed?: boolean,
  ): GovernanceDecision {
    const checks: GovernanceCheckResult[] = [];
    let allowed = true;
    let escalatedTo: string | undefined;

    // ── Check 1: Autonomy ceiling ──
    const requestedIdx = AUTONOMY_ORDER.indexOf(requestedLevel);
    const maxIdx = AUTONOMY_ORDER.indexOf(this.config.maxAutonomyLevel);
    const agentDef = this.workforce.getAgent(agentId);
    const agentMaxIdx = agentDef ? AUTONOMY_ORDER.indexOf(agentDef.autonomyLevel) : maxIdx;
    const effectiveMax = Math.min(maxIdx, agentMaxIdx);
    const ceilingPassed = requestedIdx <= effectiveMax;
    checks.push({
      check: "autonomy_ceiling",
      passed: ceilingPassed,
      detail: ceilingPassed
        ? `Level ${requestedLevel} (${requestedIdx}) within ceiling ${AUTONOMY_ORDER[effectiveMax]} (${effectiveMax})`
        : `Level ${requestedLevel} (${requestedIdx}) exceeds ceiling ${AUTONOMY_ORDER[effectiveMax]} (${effectiveMax})`,
    });
    if (!ceilingPassed) allowed = false;

    // ── Check 2: Hourly token budget ──
    const oneHourAgo = Date.now() - 3600000;
    const hourlyUsage = this.tokenLedger
      .filter(r => r.agentId === agentId && r.timestamp > oneHourAgo)
      .reduce((s, r) => s + r.tokensUsed, 0);
    const projectedHourly = hourlyUsage + estimatedTokens;
    const hourlyBudgetPassed = projectedHourly <= this.config.hourlyTokenLimit;
    checks.push({
      check: "hourly_token_budget",
      passed: hourlyBudgetPassed,
      detail: hourlyBudgetPassed
        ? `${projectedHourly.toLocaleString()}/${this.config.hourlyTokenLimit.toLocaleString()} tokens/hr`
        : `Would use ${projectedHourly.toLocaleString()} tokens, exceeding ${this.config.hourlyTokenLimit.toLocaleString()}/hr limit`,
    });
    if (!hourlyBudgetPassed) allowed = false;

    // ── Check 3: Monthly token budget ──
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const monthlyUsage = this.tokenLedger
      .filter(r => r.agentId === agentId && r.timestamp > thirtyDaysAgo)
      .reduce((s, r) => s + r.tokensUsed, 0);
    const projectedMonthly = monthlyUsage + estimatedTokens;
    const monthlyBudgetPassed = projectedMonthly <= this.config.monthlyTokenLimit;
    checks.push({
      check: "monthly_token_budget",
      passed: monthlyBudgetPassed,
      detail: monthlyBudgetPassed
        ? `${projectedMonthly.toLocaleString()}/${this.config.monthlyTokenLimit.toLocaleString()} tokens/mo`
        : `Would use ${projectedMonthly.toLocaleString()} tokens, exceeding ${this.config.monthlyTokenLimit.toLocaleString()}/mo limit`,
    });
    if (!monthlyBudgetPassed) allowed = false;

    // ── Check 4: Simulation gate for high-autonomy actions ──
    const simRequiredIdx = AUTONOMY_ORDER.indexOf(this.config.requireSimulationAboveLevel);
    if (requestedIdx > simRequiredIdx) {
      const simPassed = simulationPassed === true;
      checks.push({
        check: "simulation_gate",
        passed: simPassed,
        detail: simPassed
          ? `Simulation passed for ${requestedLevel} action`
          : `Simulation required for ${requestedLevel} (above ${this.config.requireSimulationAboveLevel}) — ${simulationPassed === undefined ? "not provided" : "failed"}`,
      });
      if (!simPassed) allowed = false;
    }

    // ── Check 5: Risk threshold ──
    const riskPassed = riskScore <= this.config.riskThreshold;
    checks.push({
      check: "risk_threshold",
      passed: riskPassed,
      detail: riskPassed
        ? `Risk score ${riskScore} within threshold ${this.config.riskThreshold}`
        : `Risk score ${riskScore} exceeds threshold ${this.config.riskThreshold}`,
    });
    if (!riskPassed) {
      allowed = false;
      escalatedTo = "security";
    }

    // ── Record decision ──
    const decision: GovernanceDecision = {
      allowed,
      reason: allowed
        ? "All governance checks passed"
        : checks.filter(c => !c.passed).map(c => c.detail).join("; "),
      checks,
      escalatedTo,
      riskScore,
      autonomyLevel: requestedLevel,
    };

    this.decisionLog.push({
      agentId,
      decision,
      timestamp: new Date().toISOString(),
    });

    // Record token usage if allowed
    if (allowed) {
      this.tokenLedger.push({
        agentId,
        tokensUsed: estimatedTokens,
        timestamp: Date.now(),
      });
    }

    return decision;
  }

  /**
   * Record actual token usage after action completion.
   */
  recordTokenUsage(agentId: string, tokensUsed: number): void {
    this.tokenLedger.push({ agentId, tokensUsed, timestamp: Date.now() });
  }

  /**
   * Get token usage stats for an agent.
   */
  getTokenUsage(agentId: string): { hourly: number; monthly: number; total: number } {
    const now = Date.now();
    const records = this.tokenLedger.filter(r => r.agentId === agentId);
    return {
      hourly: records.filter(r => now - r.timestamp < 3600000).reduce((s, r) => s + r.tokensUsed, 0),
      monthly: records.filter(r => now - r.timestamp < 30 * 86400000).reduce((s, r) => s + r.tokensUsed, 0),
      total: records.reduce((s, r) => s + r.tokensUsed, 0),
    };
  }

  /**
   * Get recent governance decisions for review.
   */
  getDecisionLog(agentId?: string, limit = 50): typeof this.decisionLog {
    const filtered = agentId ? this.decisionLog.filter(d => d.agentId === agentId) : this.decisionLog;
    return filtered.slice(-limit);
  }

  /**
   * Get governance stats.
   */
  getStats(): { totalDecisions: number; allowed: number; blocked: number; escalated: number; topBlockReasons: Record<string, number> } {
    const decisions = this.decisionLog.map(d => d.decision);
    const blockReasons: Record<string, number> = {};
    for (const d of decisions.filter(d => !d.allowed)) {
      for (const c of d.checks.filter(c => !c.passed)) {
        blockReasons[c.check] = (blockReasons[c.check] || 0) + 1;
      }
    }
    return {
      totalDecisions: decisions.length,
      allowed: decisions.filter(d => d.allowed).length,
      blocked: decisions.filter(d => !d.allowed).length,
      escalated: decisions.filter(d => d.escalatedTo).length,
      topBlockReasons: blockReasons,
    };
  }

  updateConfig(updates: Partial<GovernanceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): GovernanceConfig {
    return { ...this.config };
  }
}

export function createAgentGovernance(
  workforce: AIWorkforceService,
  config?: Partial<GovernanceConfig>,
): AgentGovernanceService {
  return new AgentGovernanceService(workforce, config);
}
