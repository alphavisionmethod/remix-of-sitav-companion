// ═══════════════════════════════════════════════════════════════
// SITA OS — Economic Intelligence Engine
// Revenue projection, cost optimization, unit economics,
// and cash runway with scenario modeling.
// ═══════════════════════════════════════════════════════════════

export interface RevenueProjection {
  period: string;
  projected_mrr: number;
  confidence_interval: { low: number; mid: number; high: number };
  growth_rate_percent: number;
  churn_rate_percent: number;
  new_mrr: number;
  expansion_mrr: number;
  churned_mrr: number;
}

export interface CostBreakdown {
  period: string;
  infrastructure: number;
  ai_inference: number;
  support: number;
  personnel: number;
  marketing: number;
  total: number;
  cost_per_user: number;
}

export interface UnitEconomics {
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  payback_period_months: number;
  gross_margin_percent: number;
  arpu: number;
  arppu: number;
}

export interface CashRunway {
  current_cash: number;
  monthly_burn_rate: number;
  runway_months: number;
  scenarios: Array<{
    name: string;
    assumptions: string;
    runway_months: number;
    break_even_date?: string;
  }>;
  projected_at: string;
}

export interface CostOptimization {
  id: string;
  category: string;
  current_cost: number;
  optimized_cost: number;
  savings_percent: number;
  recommendation: string;
  effort: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  impact_timeline_days: number;
}

export class EconomicIntelligenceEngine {
  projectRevenue(
    currentMRR: number,
    growthRate: number,
    churnRate: number,
    months: number
  ): RevenueProjection[] {
    const projections: RevenueProjection[] = [];
    let mrr = currentMRR;

    for (let i = 1; i <= months; i++) {
      const newMRR = mrr * (growthRate / 100);
      const churnedMRR = mrr * (churnRate / 100);
      const expansionMRR = mrr * 0.02;
      mrr = mrr + newMRR + expansionMRR - churnedMRR;

      projections.push({
        period: `month_${i}`,
        projected_mrr: Math.round(mrr * 100) / 100,
        confidence_interval: {
          low: Math.round(mrr * 0.85 * 100) / 100,
          mid: Math.round(mrr * 100) / 100,
          high: Math.round(mrr * 1.15 * 100) / 100,
        },
        growth_rate_percent: growthRate,
        churn_rate_percent: churnRate,
        new_mrr: Math.round(newMRR * 100) / 100,
        expansion_mrr: Math.round(expansionMRR * 100) / 100,
        churned_mrr: Math.round(churnedMRR * 100) / 100,
      });
    }
    return projections;
  }

  calculateUnitEconomics(cac: number, arpu: number, churnRate: number, grossMargin: number): UnitEconomics {
    const avgLifetimeMonths = churnRate > 0 ? 1 / (churnRate / 100) : 120;
    const ltv = arpu * avgLifetimeMonths * (grossMargin / 100);
    return {
      cac,
      ltv: Math.round(ltv * 100) / 100,
      ltv_cac_ratio: Math.round((ltv / cac) * 100) / 100,
      payback_period_months: Math.round((cac / (arpu * (grossMargin / 100))) * 10) / 10,
      gross_margin_percent: grossMargin,
      arpu,
      arppu: arpu * 1.3,
    };
  }

  calculateRunway(cash: number, monthlyBurn: number, scenarios?: Array<{ name: string; burnAdjust: number; revenueAdjust: number }>): CashRunway {
    const baseRunway = monthlyBurn > 0 ? cash / monthlyBurn : Infinity;
    const scenarioResults = (scenarios ?? []).map(s => ({
      name: s.name,
      assumptions: `Burn ${s.burnAdjust > 0 ? "+" : ""}${s.burnAdjust}%, Revenue ${s.revenueAdjust > 0 ? "+" : ""}${s.revenueAdjust}%`,
      runway_months: Math.round((cash / (monthlyBurn * (1 + s.burnAdjust / 100))) * 10) / 10,
    }));

    return {
      current_cash: cash,
      monthly_burn_rate: monthlyBurn,
      runway_months: Math.round(baseRunway * 10) / 10,
      scenarios: scenarioResults,
      projected_at: new Date().toISOString(),
    };
  }

  identifyOptimizations(costs: CostBreakdown): CostOptimization[] {
    const optimizations: CostOptimization[] = [];
    if (costs.ai_inference > costs.total * 0.3) {
      optimizations.push({
        id: "opt-ai-cache", category: "AI Inference", current_cost: costs.ai_inference,
        optimized_cost: costs.ai_inference * 0.6, savings_percent: 40,
        recommendation: "Implement aggressive caching and model downtier for utility tasks",
        effort: "medium", risk: "low", impact_timeline_days: 14,
      });
    }
    if (costs.infrastructure > costs.total * 0.25) {
      optimizations.push({
        id: "opt-infra-scale", category: "Infrastructure", current_cost: costs.infrastructure,
        optimized_cost: costs.infrastructure * 0.75, savings_percent: 25,
        recommendation: "Right-size compute resources and implement auto-scaling policies",
        effort: "low", risk: "low", impact_timeline_days: 7,
      });
    }
    return optimizations;
  }
}

export const economicIntelligence = new EconomicIntelligenceEngine();
