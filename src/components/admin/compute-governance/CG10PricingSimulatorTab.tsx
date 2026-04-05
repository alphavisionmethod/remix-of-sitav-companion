import { useState } from "react";
import { Calculator, TrendingUp, BarChart3, Sliders, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PLANS } from "@/lib/compute-governance";

interface SimScenario {
  label: string;
  cacheHitRate: number;
  deepReasoningCap: number;
  utilityPct: number;
  standardPct: number;
  premiumPct: number;
  exceptionalPct: number;
}

const defaultScenario: SimScenario = {
  label: "Current",
  cacheHitRate: 64,
  deepReasoningCap: 100,
  utilityPct: 62,
  standardPct: 24,
  premiumPct: 10,
  exceptionalPct: 4,
};

const scenarios: SimScenario[] = [
  defaultScenario,
  { label: "High Cache", cacheHitRate: 85, deepReasoningCap: 100, utilityPct: 65, standardPct: 22, premiumPct: 9, exceptionalPct: 4 },
  { label: "Low Premium", cacheHitRate: 64, deepReasoningCap: 50, utilityPct: 68, standardPct: 25, premiumPct: 5, exceptionalPct: 2 },
  { label: "Enterprise Heavy", cacheHitRate: 70, deepReasoningCap: 200, utilityPct: 50, standardPct: 25, premiumPct: 15, exceptionalPct: 10 },
];

function simulateMargin(s: SimScenario): { grossMarginPct: number; monthlyCostCents: number; monthlyRevenueCents: number; savingsFromCache: number } {
  const baseCostPerTenant = 4200;
  const cacheSaving = baseCostPerTenant * (s.cacheHitRate / 100) * 0.3;
  const tierCost = (s.utilityPct * 0.8 + s.standardPct * 3 + s.premiumPct * 12 + s.exceptionalPct * 45) * 10;
  const deepCost = s.deepReasoningCap * 8;
  const totalCost = tierCost + deepCost - cacheSaving;
  const avgRevenue = 7900;
  const margin = ((avgRevenue - totalCost) / avgRevenue) * 100;
  return { grossMarginPct: Math.max(0, Math.round(margin)), monthlyCostCents: Math.round(totalCost), monthlyRevenueCents: avgRevenue, savingsFromCache: Math.round(cacheSaving) };
}

export const CG10PricingSimulatorTab = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  const results = scenarios.map(simulateMargin);

  return (
    <div className="space-y-4">
      {/* Scenario Selector */}
      <div className="flex gap-2 flex-wrap">
        {scenarios.map((s, i) => (
          <button key={s.label} onClick={() => setActiveScenario(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeScenario === i ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Active Scenario Detail */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sliders className="h-4 w-4 text-primary" /> Scenario Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const s = scenarios[activeScenario];
              return (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Cache Hit Rate</span><span className="text-foreground">{s.cacheHitRate}%</span></div>
                    <Progress value={s.cacheHitRate} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Deep Reasoning Cap</span><span className="text-foreground">{s.deepReasoningCap} min/mo</span></div>
                    <Progress value={Math.min(100, (s.deepReasoningCap / 200) * 100)} className="h-2" />
                  </div>
                  <Separator />
                  <p className="text-[10px] text-muted-foreground font-medium">Model Tier Distribution</p>
                  {[
                    { tier: "Utility", pct: s.utilityPct, color: "text-emerald-400" },
                    { tier: "Standard", pct: s.standardPct, color: "text-blue-400" },
                    { tier: "Premium", pct: s.premiumPct, color: "text-amber-400" },
                    { tier: "Exceptional", pct: s.exceptionalPct, color: "text-rose-400" },
                  ].map(t => (
                    <div key={t.tier} className="flex items-center justify-between text-xs">
                      <span className={t.color}>{t.tier}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={t.pct} className="h-1.5 w-20" />
                        <span className="text-foreground w-8 text-right">{t.pct}%</span>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Margin Impact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const r = results[activeScenario];
              return (
                <>
                  <div className="text-center p-4 rounded-lg bg-secondary/20">
                    <p className="text-4xl font-bold text-foreground">{r.grossMarginPct}%</p>
                    <p className="text-xs text-muted-foreground">Projected Gross Margin</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <p className="font-bold text-foreground">${(r.monthlyRevenueCents / 100).toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Revenue</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <p className="font-bold text-foreground">${(r.monthlyCostCents / 100).toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Cost</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <p className="font-bold text-emerald-400">${(r.savingsFromCache / 100).toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground">Cache Savings</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Sensitivity: All Scenarios Compared */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Scenario Comparison</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {scenarios.map((s, i) => {
            const r = results[i];
            return (
              <div key={s.label} className={`p-3 rounded-lg ${activeScenario === i ? "bg-primary/10 border border-primary/30" : "bg-secondary/20"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">{s.label}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">Cost: <span className="text-foreground font-mono">${(r.monthlyCostCents / 100).toFixed(0)}</span></span>
                    <span className={r.grossMarginPct >= 65 ? "text-emerald-400" : r.grossMarginPct >= 50 ? "text-amber-400" : "text-rose-400"}>
                      Margin: {r.grossMarginPct}%
                    </span>
                  </div>
                </div>
                <Progress value={r.grossMarginPct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Plan Margin Per Tier */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Plan-Level Margin Estimates</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {PLANS.filter(p => p.monthlyPriceCents > 0).map(plan => {
            const revenue = plan.monthlyPriceCents;
            const costEstimate = Math.round(revenue * (1 - (activeScenario === 0 ? 0.67 : activeScenario === 1 ? 0.74 : activeScenario === 2 ? 0.71 : 0.58)));
            const margin = Math.round(((revenue - costEstimate) / revenue) * 100);
            return (
              <div key={plan.planId} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                <div>
                  <p className="text-xs font-medium text-foreground">{plan.name}</p>
                  <p className="text-[10px] text-muted-foreground">${(revenue / 100).toFixed(0)}/mo</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <p className="text-muted-foreground">Cost: ${(costEstimate / 100).toFixed(0)}</p>
                  </div>
                  <Badge variant={margin >= 65 ? "secondary" : "destructive"} className="text-[10px] min-w-[60px] justify-center">
                    {margin}% margin
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
