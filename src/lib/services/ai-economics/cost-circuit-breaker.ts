// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Cost Circuit Breaker
// Per-agent & fleet-wide budget enforcement with tiered response:
// warn → throttle → pause → halt
// ═══════════════════════════════════════════════════════════════

export type BreakerState = "closed" | "warn" | "throttle" | "pause" | "halt";
export type BreakerBudgetPeriod = "hourly" | "daily" | "monthly";

export interface BreakerBudgetConfig {
  agentId: string;
  period: BreakerBudgetPeriod;
  budgetCents: number;
  warnThreshold: number;       // 0-1, e.g. 0.7 = 70%
  throttleThreshold: number;   // 0-1, e.g. 0.85
  pauseThreshold: number;      // 0-1, e.g. 0.95
  haltThreshold: number;       // 0-1, e.g. 1.0
  autoDowngradeModel: boolean;
}

export interface BudgetState {
  agentId: string;
  period: BreakerBudgetPeriod;
  periodStart: string;
  spentCents: number;
  budgetCents: number;
  utilizationPercent: number;
  breakerState: BreakerState;
  throttleRate: number;        // 0-1, 1 = no throttle
  modelOverride?: string;      // downgraded model
  invocationCount: number;
  lastInvocationAt?: string;
  stateChangedAt: string;
  violations: CostViolation[];
}

export interface CostViolation {
  id: string;
  agentId: string;
  type: "warn" | "throttle" | "pause" | "halt" | "model_downgrade";
  triggeredAt: string;
  spentCents: number;
  budgetCents: number;
  utilizationPercent: number;
  action: string;
}

export interface FleetBudgetSummary {
  totalBudgetCents: number;
  totalSpentCents: number;
  utilizationPercent: number;
  agentCount: number;
  breakerStates: Record<BreakerState, number>;
  violations24h: number;
  projectedOverrunCents: number;
}

// Model cost tiers (cents per 1K tokens)
const MODEL_COST_TIERS: { model: string; inputCostPer1K: number; outputCostPer1K: number }[] = [
  { model: "gpt-4o", inputCostPer1K: 0.25, outputCostPer1K: 1.0 },
  { model: "gpt-4o-mini", inputCostPer1K: 0.015, outputCostPer1K: 0.06 },
  { model: "gpt-3.5-turbo", inputCostPer1K: 0.05, outputCostPer1K: 0.15 },
  { model: "claude-3-haiku", inputCostPer1K: 0.025, outputCostPer1K: 0.125 },
  { model: "local-llm", inputCostPer1K: 0, outputCostPer1K: 0 },
];

export class CostCircuitBreakerService {
  private configs = new Map<string, BreakerBudgetConfig>();
  private states = new Map<string, BudgetState>();
  private allViolations: CostViolation[] = [];
  private violationCounter = 0;
  private fleetBudgetCents = 100_00; // $100 default

  // ── Configuration ─────────────────────────────────────────────

  configureBudget(config: BudgetConfig): void {
    this.configs.set(config.agentId, config);
    if (!this.states.has(config.agentId)) {
      this.states.set(config.agentId, {
        agentId: config.agentId,
        period: config.period,
        periodStart: new Date().toISOString(),
        spentCents: 0,
        budgetCents: config.budgetCents,
        utilizationPercent: 0,
        breakerState: "closed",
        throttleRate: 1,
        invocationCount: 0,
        stateChangedAt: new Date().toISOString(),
        violations: [],
      });
    }
  }

  setFleetBudget(cents: number): void {
    this.fleetBudgetCents = cents;
  }

  // ── Cost Recording ────────────────────────────────────────────

  recordCost(agentId: string, costCents: number): CostBreakerState {
    const config = this.configs.get(agentId);
    const state = this.states.get(agentId);
    if (!config || !state) {
      // Auto-register with defaults
      this.configureBudget({
        agentId,
        period: "hourly",
        budgetCents: 500,
        warnThreshold: 0.7,
        throttleThreshold: 0.85,
        pauseThreshold: 0.95,
        haltThreshold: 1.0,
        autoDowngradeModel: true,
      });
      return this.recordCost(agentId, costCents);
    }

    // Check period rollover
    this.checkPeriodRollover(agentId);

    state.spentCents += costCents;
    state.invocationCount++;
    state.lastInvocationAt = new Date().toISOString();
    state.utilizationPercent = state.budgetCents > 0
      ? state.spentCents / state.budgetCents : 0;

    // Evaluate breaker state
    const prevState = state.breakerState;
    const util = state.utilizationPercent;

    if (util >= config.haltThreshold) {
      state.breakerState = "halt";
      state.throttleRate = 0;
    } else if (util >= config.pauseThreshold) {
      state.breakerState = "pause";
      state.throttleRate = 0.1;
      if (config.autoDowngradeModel) {
        state.modelOverride = this.findCheaperModel(state.modelOverride);
      }
    } else if (util >= config.throttleThreshold) {
      state.breakerState = "throttle";
      state.throttleRate = 0.5;
      if (config.autoDowngradeModel) {
        state.modelOverride = this.findCheaperModel(state.modelOverride);
      }
    } else if (util >= config.warnThreshold) {
      state.breakerState = "warn";
      state.throttleRate = 0.9;
    } else {
      state.breakerState = "closed";
      state.throttleRate = 1;
      state.modelOverride = undefined;
    }

    // Create violation on state change
    if (prevState !== state.breakerState && state.breakerState !== "closed") {
      const violation = this.createViolation(agentId, state);
      state.violations.push(violation);
      state.stateChangedAt = new Date().toISOString();
    }

    return state.breakerState;
  }

  // ── Query ─────────────────────────────────────────────────────

  canInvoke(agentId: string): { allowed: boolean; reason: string; throttleRate: number; modelOverride?: string } {
    const state = this.states.get(agentId);
    if (!state) return { allowed: true, reason: "No budget config", throttleRate: 1 };

    this.checkPeriodRollover(agentId);

    if (state.breakerState === "halt") {
      return { allowed: false, reason: `Budget exhausted (${Math.round(state.utilizationPercent * 100)}%)`, throttleRate: 0 };
    }
    if (state.breakerState === "pause") {
      // Probabilistic allow at 10%
      const allowed = Math.random() < state.throttleRate;
      return {
        allowed,
        reason: allowed ? "Pause mode — limited invocations" : "Paused — budget nearly exhausted",
        throttleRate: state.throttleRate,
        modelOverride: state.modelOverride,
      };
    }
    if (state.breakerState === "throttle") {
      const allowed = Math.random() < state.throttleRate;
      return {
        allowed,
        reason: allowed ? "Throttled — proceed with caution" : "Throttled — try again later",
        throttleRate: state.throttleRate,
        modelOverride: state.modelOverride,
      };
    }
    return {
      allowed: true,
      reason: state.breakerState === "warn" ? "Budget warning — approaching limit" : "OK",
      throttleRate: state.throttleRate,
      modelOverride: state.modelOverride,
    };
  }

  getAgentBudgetState(agentId: string): BudgetState | null {
    const state = this.states.get(agentId);
    if (state) this.checkPeriodRollover(agentId);
    return state ?? null;
  }

  getFleetSummary(): FleetBudgetSummary {
    const states = Array.from(this.states.values());
    const breakerCounts: Record<CostBreakerState, number> = { closed: 0, warn: 0, throttle: 0, pause: 0, halt: 0 };
    let totalSpent = 0;
    let totalBudget = 0;

    for (const s of states) {
      this.checkPeriodRollover(s.agentId);
      totalSpent += s.spentCents;
      totalBudget += s.budgetCents;
      breakerCounts[s.breakerState]++;
    }

    const now = Date.now();
    const hourElapsed = states.length > 0
      ? Math.max((now - new Date(states[0].periodStart).getTime()) / 3_600_000, 0.01) : 1;
    const burnRate = totalSpent / hourElapsed;
    const hoursRemaining = totalBudget > totalSpent ? (totalBudget - totalSpent) / Math.max(burnRate, 0.01) : 0;
    const projectedOverrun = Math.max(0, burnRate * 24 - totalBudget); // 24h projection

    const oneDayAgo = new Date(now - 86_400_000).toISOString();
    const violations24h = this.allViolations.filter(v => v.triggeredAt > oneDayAgo).length;

    return {
      totalBudgetCents: totalBudget,
      totalSpentCents: totalSpent,
      utilizationPercent: totalBudget > 0 ? totalSpent / totalBudget : 0,
      agentCount: states.length,
      breakerStates: breakerCounts,
      violations24h,
      projectedOverrunCents: Math.round(projectedOverrun),
    };
  }

  getAllViolations(): CostViolation[] {
    return [...this.allViolations];
  }

  resetBudget(agentId: string): void {
    const state = this.states.get(agentId);
    if (!state) return;
    state.spentCents = 0;
    state.utilizationPercent = 0;
    state.breakerState = "closed";
    state.throttleRate = 1;
    state.modelOverride = undefined;
    state.periodStart = new Date().toISOString();
    state.invocationCount = 0;
    state.violations = [];
  }

  // ── Internals ─────────────────────────────────────────────────

  private checkPeriodRollover(agentId: string): void {
    const state = this.states.get(agentId);
    if (!state) return;

    const now = Date.now();
    const start = new Date(state.periodStart).getTime();
    const elapsed = now - start;
    const periodMs = state.period === "hourly" ? 3_600_000
      : state.period === "daily" ? 86_400_000
      : 30 * 86_400_000;

    if (elapsed >= periodMs) {
      state.spentCents = 0;
      state.utilizationPercent = 0;
      state.breakerState = "closed";
      state.throttleRate = 1;
      state.modelOverride = undefined;
      state.periodStart = new Date().toISOString();
      state.invocationCount = 0;
      state.violations = [];
    }
  }

  private findCheaperModel(currentModel?: string): string {
    if (!currentModel) return MODEL_COST_TIERS[1]?.model ?? "gpt-4o-mini";
    const idx = MODEL_COST_TIERS.findIndex(m => m.model === currentModel);
    if (idx < 0 || idx >= MODEL_COST_TIERS.length - 1) return MODEL_COST_TIERS[MODEL_COST_TIERS.length - 1].model;
    return MODEL_COST_TIERS[idx + 1].model;
  }

  private createViolation(agentId: string, state: BudgetState): CostViolation {
    const violation: CostViolation = {
      id: `cv-${++this.violationCounter}`,
      agentId,
      type: state.breakerState === "closed" ? "warn" : state.breakerState as CostViolation["type"],
      triggeredAt: new Date().toISOString(),
      spentCents: state.spentCents,
      budgetCents: state.budgetCents,
      utilizationPercent: state.utilizationPercent,
      action: state.modelOverride
        ? `State → ${state.breakerState}, model → ${state.modelOverride}`
        : `State → ${state.breakerState}`,
    };
    this.allViolations.push(violation);
    return violation;
  }
}

export function createCostCircuitBreaker(): CostCircuitBreakerService {
  return new CostCircuitBreakerService();
}
