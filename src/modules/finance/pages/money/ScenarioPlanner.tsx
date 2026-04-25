// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Scenario Planner (What-If Engine)
// ═══════════════════════════════════════════════════════════════

import { HeroCard, ComparisonCard, SummaryCard, StatusCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { Beaker, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight, DollarSign, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { runScenario, generatePresetScenarios } from "@/lib/services/finance-os/scenario-engine.service";
import type { ScenarioInput } from "@/packages/finance-contracts";

const CTX = {
  monthlyIncomeCents: 850000, monthlyExpensesCents: 620000, safeToSpendCents: 245000,
  reservesCents: 1800000, monthlyBurn: 620000, subscriptionsCostCents: 35000, debtPaymentsCents: 88340,
};

const ScenarioPlanner = () => {
  const presets = useMemo(() => generatePresetScenarios(CTX), []);
  const [activeScenario, setActiveScenario] = useState<ScenarioInput>(presets[0]);
  const result = useMemo(() => runScenario(activeScenario, CTX), [activeScenario]);

  const fmt = (c: number) => `$${(Math.abs(c) / 100).toLocaleString()}`;
  const sign = (c: number) => c >= 0 ? "+" : "-";
  const riskColor = result.riskLevel === "low" ? "hsl(152 55% 48%)" : result.riskLevel === "moderate" ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)";

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageTruthBanner />

      <HeroCard
        title="SCENARIO PLANNER"
        metric={`${sign(result.netImpactMonthlyCents)}${fmt(result.netImpactMonthlyCents)}/mo`}
        subtitle={`"${activeScenario.name}" — ${result.riskLevel} risk`}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(200 60% 50%)"
        icon={<Beaker className="h-5 w-5 text-[hsl(265_55%_58%)]" />}
      />

      {/* Scenario Selector */}
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button key={p.id} onClick={() => setActiveScenario(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all micro-press ${activeScenario.id === p.id ? "bg-primary text-primary-foreground" : "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_70%)] hover:bg-[hsl(0_0%_100%/0.10)]"}`}>
            {p.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{activeScenario.description}</p>

      {/* Impact KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusCard label="Monthly Impact" status={result.netImpactMonthlyCents >= 0 ? "healthy" : "degraded"} lastChecked={`${sign(result.netImpactMonthlyCents)}${fmt(result.netImpactMonthlyCents)}`} icon={<TrendingUp className="h-3.5 w-3.5" />} />
        <StatusCard label="Annual Impact" status={result.netImpactAnnualCents >= 0 ? "healthy" : "degraded"} lastChecked={`${sign(result.netImpactAnnualCents)}${fmt(result.netImpactAnnualCents)}`} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatusCard label="Safe-to-Spend" status="healthy" lastChecked={fmt(result.projectedSafeToSpend)} icon={<Shield className="h-3.5 w-3.5" />} />
        <StatusCard label="Risk Level" status={result.riskLevel === "low" ? "healthy" : result.riskLevel === "moderate" ? "degraded" : "down"} lastChecked={result.riskLevel.toUpperCase()} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projection Chart */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)] mb-4">12-Month Cash Projection</h3>
          <div className="space-y-2">
            {result.projectedCashflow.map((v, i) => {
              const baseVal = result.baselineCashflow[i];
              const maxVal = Math.max(...result.projectedCashflow, ...result.baselineCashflow);
              const month = new Date(Date.now() + (i + 1) * 30 * 86400000).toLocaleDateString(undefined, { month: "short" });
              return (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground w-8">{month}</span>
                    <div className="flex-1 mx-2 space-y-0.5">
                      <div className="h-1.5 bg-[hsl(0_0%_100%/0.04)] rounded-full overflow-hidden">
                        <div className="h-full bg-[hsl(0_0%_100%/0.15)] rounded-full" style={{ width: `${(baseVal / maxVal) * 100}%` }} />
                      </div>
                      <div className="h-1.5 bg-[hsl(0_0%_100%/0.04)] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${v >= baseVal ? "bg-[hsl(152_55%_48%)]" : "bg-[hsl(38_85%_58%)]"}`} style={{ width: `${(v / maxVal) * 100}%` }} />
                      </div>
                    </div>
                    <span className="font-display font-semibold w-16 text-right text-xs">{fmt(v)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-[hsl(0_0%_100%/0.15)] rounded-full" /> Baseline</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-[hsl(152_55%_48%)] rounded-full" /> Projected</span>
          </div>
        </div>

        {/* Analysis */}
        <div className="space-y-4">
          <StatusCard label={`Risk: ${result.riskLevel.toUpperCase()}`} status={result.riskLevel === "low" ? "healthy" : result.riskLevel === "moderate" ? "degraded" : "down"} confidence={Math.round(result.confidenceScore * 100)} icon={result.riskLevel === "low" ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />} />

          {result.tradeoffs.length > 0 && (
            <SummaryCard title="Tradeoffs" kpis={result.tradeoffs.map(t => ({ label: t, value: "→" }))} />
          )}

          {result.recommendations.length > 0 && (
            <SummaryCard title="Recommendations" kpis={result.recommendations.map(r => ({ label: r, value: "⚡" }))} />
          )}

          <ModuleAdvisorInsight
            advisorName="Scenario Advisor"
            domain="finance"
            insight={`"${activeScenario.name}" would ${result.netImpactMonthlyCents >= 0 ? "improve" : "reduce"} monthly cashflow by ${fmt(result.netImpactMonthlyCents)}. Risk: ${result.riskLevel}.`}
            confidence={Math.round(result.confidenceScore * 100)}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ScenarioPlanner;
