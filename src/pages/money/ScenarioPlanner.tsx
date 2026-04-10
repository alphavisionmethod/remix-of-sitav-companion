// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Scenario Planner (What-If Engine)
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { Beaker, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight, DollarSign, Shield, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { runScenario, generatePresetScenarios } from "@/lib/services/finance-os/scenario-engine.service";
import type { ScenarioInput, ScenarioOutput } from "@/packages/finance-contracts";

const CTX = {
  monthlyIncomeCents: 850000,
  monthlyExpensesCents: 620000,
  safeToSpendCents: 245000,
  reservesCents: 1800000,
  monthlyBurn: 620000,
  subscriptionsCostCents: 35000,
  debtPaymentsCents: 88340,
};

const ScenarioPlanner = () => {
  const { isDemoMode } = useDataMode();
  const presets = useMemo(() => generatePresetScenarios(CTX), []);
  const [activeScenario, setActiveScenario] = useState<ScenarioInput>(presets[0]);

  const result = useMemo(() => runScenario(activeScenario, CTX), [activeScenario]);

  const fmt = (c: number) => `$${(Math.abs(c) / 100).toLocaleString()}`;
  const sign = (c: number) => c >= 0 ? "+" : "-";

  const riskColor = result.riskLevel === "low" ? "text-trust-verified" : result.riskLevel === "moderate" ? "text-amber-500" : "text-red-500";
  const riskBg = result.riskLevel === "low" ? "bg-emerald-500/10" : result.riskLevel === "moderate" ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Scenario Planner" subtitle="What-if projections — see the impact before you decide" />
      <DemoModeBadge />

      {/* Scenario Selector */}
      <SitaCard hover={false} className="p-4">
        <SitaCardTitle>Choose a Scenario</SitaCardTitle>
        <div className="flex flex-wrap gap-2 mt-3">
          {presets.map(p => (
            <SitaButton key={p.id} size="sm"
              variant={activeScenario.id === p.id ? "accent" : "ghost"}
              onClick={() => setActiveScenario(p)}
            >
              {p.name}
            </SitaButton>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{activeScenario.description}</p>
      </SitaCard>

      {/* Impact KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile label="Monthly Impact" value={`${sign(result.netImpactMonthlyCents)}${fmt(result.netImpactMonthlyCents)}`}
          icon={result.netImpactMonthlyCents >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <KPITile label="Annual Impact" value={`${sign(result.netImpactAnnualCents)}${fmt(result.netImpactAnnualCents)}`}
          icon={DollarSign}
        <KPITile label="Safe-to-Spend" value={fmt(result.projectedSafeToSpend)}
          icon={Shield}
        <KPITile label="Risk Level" value={result.riskLevel.toUpperCase()}
          icon={AlertTriangle}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projection Chart */}
        <div className="space-y-4">
          <SitaSectionHeader title="12-Month Cash Projection" />
          <SitaCard hover={false} className="p-4">
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
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-muted-foreground/30 rounded-full" style={{ width: `${(baseVal / maxVal) * 100}%` }} />
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v >= baseVal ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${(v / maxVal) * 100}%` }} />
                        </div>
                      </div>
                      <span className="font-display font-semibold w-16 text-right text-xs">{fmt(v)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-muted-foreground/30 rounded-full" /> Baseline</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-emerald-500 rounded-full" /> Projected</span>
            </div>
          </SitaCard>
        </div>

        {/* Analysis */}
        <div className="space-y-4">
          <SitaSectionHeader title="Analysis" />

          {/* Risk Assessment */}
          <SitaCard hover={false} className={`p-4 ${riskBg}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.riskLevel === "low" ? <CheckCircle className="h-4 w-4 text-trust-verified" /> : <AlertTriangle className={`h-4 w-4 ${riskColor}`} />}
              <SitaCardTitle>Risk: {result.riskLevel.toUpperCase()}</SitaCardTitle>
            </div>
            <ConfidenceBar value={Math.round(result.confidenceScore * 100)} label="Projection confidence" />
          </SitaCard>

          {/* Tradeoffs */}
          {result.tradeoffs.length > 0 && (
            <SitaCard hover={false} className="p-4">
              <SitaCardTitle>Tradeoffs</SitaCardTitle>
              <div className="mt-2 space-y-1">
                {result.tradeoffs.map((t, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-primary" /> {t}
                  </p>
                ))}
              </div>
            </SitaCard>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <SitaCard hover={false} className="p-4">
              <SitaCardTitle>Recommendations</SitaCardTitle>
              <div className="mt-2 space-y-1">
                {result.recommendations.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-amber-500" /> {r}
                  </p>
                ))}
              </div>
            </SitaCard>
          )}

          <LiveAdvisorCard
            advisor="money"
            intent="scenario_analysis"
            context={{ scenario: activeScenario.name, impact: result.netImpactMonthlyCents / 100, risk: result.riskLevel }}
            demoName="Scenario Advisor"
            demoRole="What-If Intelligence"
            demoConfidence="High"
            demoRecommendation={`"${activeScenario.name}" would ${result.netImpactMonthlyCents >= 0 ? "improve" : "reduce"} monthly cashflow by ${fmt(result.netImpactMonthlyCents)}. Risk: ${result.riskLevel}.`}
            demoReasoning="12-month projection using current income/expense patterns with scenario-specific adjustments applied."
          />

          <TrustBadge level="verified" />
        </div>
      </div>
    </motion.div>
  );
};

export default ScenarioPlanner;
