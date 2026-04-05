// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Portfolio Allocation Engine
// Treats AI spend like an investment portfolio.
// ═══════════════════════════════════════════════════════════════

export type AllocationCategory =
  | "defensive"
  | "growth"
  | "strategic_premium"
  | "experimentation"
  | "emergency_reserve";

export interface PortfolioPolicy {
  policyId: string;
  businessPhase: "early" | "growth" | "mature" | "conservative";
  environment: "production" | "staging" | "development";
  allocations: Record<AllocationCategory, TargetAllocation>;
}

export interface TargetAllocation {
  targetPercent: number;
  minPercent: number;
  maxPercent: number;
  description: string;
}

export interface PortfolioSnapshot {
  snapshotId: string;
  measuredAt: string;
  policyId: string;
  totalBudgetCents: number;
  actual: Record<AllocationCategory, ActualAllocation>;
  driftAlerts: DriftAlert[];
  rebalanceRecommendations: RebalanceAction[];
}

export interface ActualAllocation {
  spentCents: number;
  percent: number;
  targetPercent: number;
  drift: number;
}

export interface DriftAlert {
  category: AllocationCategory;
  actualPercent: number;
  targetPercent: number;
  drift: number;
  severity: "ok" | "warning" | "critical";
}

export interface RebalanceAction {
  from: AllocationCategory;
  to: AllocationCategory;
  amountCents: number;
  reason: string;
}

// ── Default Policies ───────────────────────────────────────

export const DEFAULT_PORTFOLIO_POLICIES: PortfolioPolicy[] = [
  {
    policyId: "portfolio-growth",
    businessPhase: "growth", environment: "production",
    allocations: {
      defensive: { targetPercent: 25, minPercent: 20, maxPercent: 35, description: "Monitoring, self-healing, compliance" },
      growth: { targetPercent: 35, minPercent: 25, maxPercent: 45, description: "Revenue, lead scoring, optimization" },
      strategic_premium: { targetPercent: 20, minPercent: 10, maxPercent: 30, description: "Deep analysis, synthesis, strategy" },
      experimentation: { targetPercent: 10, minPercent: 5, maxPercent: 15, description: "New capabilities, benchmark tests" },
      emergency_reserve: { targetPercent: 10, minPercent: 5, maxPercent: 20, description: "Incident response, critical escalation" },
    },
  },
  {
    policyId: "portfolio-mature",
    businessPhase: "mature", environment: "production",
    allocations: {
      defensive: { targetPercent: 35, minPercent: 30, maxPercent: 45, description: "Stability, compliance, monitoring" },
      growth: { targetPercent: 25, minPercent: 15, maxPercent: 35, description: "Optimization, revenue protection" },
      strategic_premium: { targetPercent: 20, minPercent: 15, maxPercent: 30, description: "Strategic analysis, board-level" },
      experimentation: { targetPercent: 5, minPercent: 0, maxPercent: 10, description: "Limited experimentation" },
      emergency_reserve: { targetPercent: 15, minPercent: 10, maxPercent: 25, description: "Robust emergency reserve" },
    },
  },
  {
    policyId: "portfolio-early",
    businessPhase: "early", environment: "production",
    allocations: {
      defensive: { targetPercent: 15, minPercent: 10, maxPercent: 25, description: "Basic monitoring" },
      growth: { targetPercent: 40, minPercent: 30, maxPercent: 50, description: "Aggressive growth focus" },
      strategic_premium: { targetPercent: 15, minPercent: 5, maxPercent: 25, description: "Strategic foundation" },
      experimentation: { targetPercent: 20, minPercent: 10, maxPercent: 30, description: "Heavy experimentation" },
      emergency_reserve: { targetPercent: 10, minPercent: 5, maxPercent: 15, description: "Minimal reserve" },
    },
  },
];

// ── Engine ──────────────────────────────────────────────────

export function getPortfolioPolicy(businessPhase: string, environment: string): PortfolioPolicy {
  return DEFAULT_PORTFOLIO_POLICIES.find(p => p.businessPhase === businessPhase && p.environment === environment)
    || DEFAULT_PORTFOLIO_POLICIES[0];
}

export function computePortfolioSnapshot(
  policy: PortfolioPolicy,
  spending: Record<AllocationCategory, number>,
  totalBudgetCents: number,
): PortfolioSnapshot {
  const actual: Record<AllocationCategory, ActualAllocation> = {} as any;
  const driftAlerts: DriftAlert[] = [];
  const rebalance: RebalanceAction[] = [];
  const totalSpent = Object.values(spending).reduce((s, v) => s + v, 0);

  for (const [cat, target] of Object.entries(policy.allocations) as [AllocationCategory, TargetAllocation][]) {
    const spent = spending[cat] || 0;
    const pct = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
    const drift = pct - target.targetPercent;

    actual[cat] = { spentCents: spent, percent: Math.round(pct * 10) / 10, targetPercent: target.targetPercent, drift: Math.round(drift * 10) / 10 };

    const severity = Math.abs(drift) > 15 ? "critical" : Math.abs(drift) > 8 ? "warning" : "ok";
    if (severity !== "ok") {
      driftAlerts.push({ category: cat, actualPercent: pct, targetPercent: target.targetPercent, drift, severity });
    }
  }

  // Generate rebalance recommendations
  const overSpent = driftAlerts.filter(d => d.drift > 0).sort((a, b) => b.drift - a.drift);
  const underSpent = driftAlerts.filter(d => d.drift < 0).sort((a, b) => a.drift - b.drift);

  for (let i = 0; i < Math.min(overSpent.length, underSpent.length); i++) {
    const amount = Math.round(Math.min(Math.abs(overSpent[i].drift), Math.abs(underSpent[i].drift)) * totalSpent / 100);
    if (amount > 0) {
      rebalance.push({
        from: overSpent[i].category, to: underSpent[i].category,
        amountCents: amount,
        reason: `${overSpent[i].category} is ${overSpent[i].drift.toFixed(1)}% over target; ${underSpent[i].category} is ${Math.abs(underSpent[i].drift).toFixed(1)}% under target`,
      });
    }
  }

  return {
    snapshotId: `port-${Date.now()}`,
    measuredAt: new Date().toISOString(),
    policyId: policy.policyId,
    totalBudgetCents: totalBudgetCents,
    actual,
    driftAlerts,
    rebalanceRecommendations: rebalance,
  };
}
