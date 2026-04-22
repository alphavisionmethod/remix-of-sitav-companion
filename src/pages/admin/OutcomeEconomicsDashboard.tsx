import { useState } from "react";
import {
  TrendingUp, DollarSign, ShieldCheck, Activity, BarChart3, Zap,
  Target, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { cn } from "@/lib/utils";
import type { OutcomeCategory } from "@/lib/intelligence-architecture/outcome-economics-engine";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

/* ── Demo Data ─────────────────────────────────────────────── */

interface OutcomeROI {
  category: OutcomeCategory;
  label: string;
  outcomes: number;
  totalCost: number;
  totalValue: number;
  paybackRatio: number;
  acceptanceRate: number;
  trend: "up" | "down" | "flat";
}

const DEMO_OUTCOMES: OutcomeROI[] = [
  { category: "incident_prevented", label: "Incidents Prevented", outcomes: 47, totalCost: 12.40, totalValue: 2340, paybackRatio: 188.7, acceptanceRate: 96, trend: "up" },
  { category: "self_heal_success", label: "Self-Heal Success", outcomes: 31, totalCost: 8.20, totalValue: 1560, paybackRatio: 190.2, acceptanceRate: 94, trend: "up" },
  { category: "cost_saved", label: "Cost Saved", outcomes: 23, totalCost: 6.10, totalValue: 890, paybackRatio: 145.9, acceptanceRate: 89, trend: "up" },
  { category: "retention_saved", label: "Retention Saved", outcomes: 12, totalCost: 4.80, totalValue: 720, paybackRatio: 150.0, acceptanceRate: 92, trend: "flat" },
  { category: "lead_recovered", label: "Leads Recovered", outcomes: 18, totalCost: 3.60, totalValue: 540, paybackRatio: 150.0, acceptanceRate: 78, trend: "up" },
  { category: "release_approved", label: "Releases Approved", outcomes: 8, totalCost: 9.40, totalValue: 420, paybackRatio: 44.7, acceptanceRate: 87, trend: "flat" },
  { category: "risk_mitigated", label: "Risks Mitigated", outcomes: 15, totalCost: 5.20, totalValue: 380, paybackRatio: 73.1, acceptanceRate: 85, trend: "down" },
  { category: "design_improvement_accepted", label: "Design Improvements", outcomes: 9, totalCost: 7.80, totalValue: 210, paybackRatio: 26.9, acceptanceRate: 71, trend: "down" },
  { category: "strategic_accepted", label: "Strategic Decisions", outcomes: 6, totalCost: 18.60, totalValue: 150, paybackRatio: 8.1, acceptanceRate: 67, trend: "flat" },
];

interface ReasoningPath {
  path: string;
  outcomes: number;
  cost: number;
  value: number;
  avgPayback: number;
  acceptance: number;
  recommendation: "expand" | "maintain" | "optimize" | "downgrade" | "eliminate";
}

const DEMO_PATHS: ReasoningPath[] = [
  { path: "Monitor → Detect → Auto-Fix", outcomes: 31, cost: 4.20, value: 1560, avgPayback: 371.4, acceptance: 94, recommendation: "expand" },
  { path: "Monitor → Alert → Review → Fix", outcomes: 22, cost: 8.40, value: 1120, avgPayback: 133.3, acceptance: 89, recommendation: "maintain" },
  { path: "Analyze → Recommend → Approve", outcomes: 18, cost: 6.80, value: 640, avgPayback: 94.1, acceptance: 82, recommendation: "maintain" },
  { path: "Deep Reason → Multi-Agent → Synthesize", outcomes: 8, cost: 22.40, value: 420, avgPayback: 18.8, acceptance: 75, recommendation: "optimize" },
  { path: "Scan → Classify → Archive", outcomes: 14, cost: 2.10, value: 180, avgPayback: 85.7, acceptance: 91, recommendation: "maintain" },
  { path: "Research → Debate → Propose", outcomes: 4, cost: 34.60, value: 120, avgPayback: 3.5, acceptance: 50, recommendation: "downgrade" },
];

interface IncidentMetric {
  type: string;
  prevented: number;
  avgCostPer: number;
  avgValueSaved: number;
  roi: number;
}

const DEMO_INCIDENTS: IncidentMetric[] = [
  { type: "Infrastructure Outage", prevented: 12, avgCostPer: 0.28, avgValueSaved: 85, roi: 303.6 },
  { type: "Data Quality Drift", prevented: 9, avgCostPer: 0.18, avgValueSaved: 42, roi: 233.3 },
  { type: "Security Anomaly", prevented: 8, avgCostPer: 0.34, avgValueSaved: 120, roi: 352.9 },
  { type: "Budget Overrun", prevented: 6, avgCostPer: 0.22, avgValueSaved: 35, roi: 159.1 },
  { type: "Compliance Violation", prevented: 5, avgCostPer: 0.42, avgValueSaved: 200, roi: 476.2 },
  { type: "Performance Regression", prevented: 7, avgCostPer: 0.15, avgValueSaved: 28, roi: 186.7 },
];

interface Benchmark {
  metric: string;
  current: number;
  target: number;
  industry: number;
  unit: string;
}

const DEMO_BENCHMARKS: Benchmark[] = [
  { metric: "Cost per Outcome", current: 0.38, target: 0.25, industry: 0.65, unit: "$" },
  { metric: "Payback Ratio", current: 142, target: 200, industry: 85, unit: "x" },
  { metric: "Acceptance Rate", current: 86, target: 92, industry: 72, unit: "%" },
  { metric: "Value per $1 AI Spend", current: 142, target: 200, industry: 85, unit: "$" },
  { metric: "Incident Prevention Rate", current: 94, target: 98, industry: 78, unit: "%" },
  { metric: "Self-Heal Success Rate", current: 89, target: 95, industry: 62, unit: "%" },
];

/* ── Helpers ───────────────────────────────────────────────── */

const recColors: Record<string, string> = {
  expand: "bg-trust-safe/15 text-trust-safe",
  maintain: "bg-primary/15 text-primary",
  optimize: "bg-sita-gold/15 text-sita-gold",
  downgrade: "bg-amber-500/15 text-amber-400",
  eliminate: "bg-destructive/15 text-destructive",
};

const TrendIcon = ({
  trend }: { trend: "up" | "down" | "flat" }) => {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5 text-trust-safe" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

/* ── Page ──────────────────────────────────────────────────── */

const OutcomeEconomicsDashboard = () => {
  useRequireAdmin();
  const [period, setPeriod] = useState("30d");

  const totalCost = ([] as typeof DEMO_OUTCOMES).reduce((s, o) => s + o.totalCost, 0);
  const totalValue = ([] as typeof DEMO_OUTCOMES).reduce((s, o) => s + o.totalValue, 0);
  const totalOutcomes = ([] as typeof DEMO_OUTCOMES).reduce((s, o) => s + o.outcomes, 0);
  const overallPayback = totalValue / totalCost;

  return (
    <div className="space-y-6">
<div className="flex items-start justify-between">
        <SitaPageHeader
          title="Outcome Economics"
          subtitle="ROI per outcome type · reasoning path analysis · cost-per-saved-incident · value benchmarks"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Hero Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total AI Spend", value: `$${totalCost.toFixed(2)}`, icon: DollarSign, sub: `${totalOutcomes} outcomes` },
          { label: "Total Value Generated", value: `$${totalValue.toLocaleString()}`, icon: TrendingUp, sub: `${overallPayback.toFixed(0)}x payback` },
          { label: "Avg Cost / Outcome", value: `$${(totalCost / totalOutcomes).toFixed(2)}`, icon: Activity, sub: "across all types" },
          { label: "Incidents Prevented", value: "47", icon: ShieldCheck, sub: "$2,340 value saved" },
        ].map((m) => (
          <Card key={m.label} className="bg-card/50">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── ROI per Outcome Type ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            ROI per Outcome Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {([] as typeof DEMO_OUTCOMES).map((o) => (
            <div key={o.category} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className="w-36 shrink-0">
                <p className="text-xs font-semibold text-foreground">{o.label}</p>
                <p className="text-[10px] text-muted-foreground">{o.outcomes} outcomes</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Progress value={Math.min((o.paybackRatio / 200) * 100, 100)} className="h-1.5 flex-1" />
                  <span className="text-xs font-mono text-foreground w-16 text-right">{o.paybackRatio.toFixed(1)}x</span>
                </div>
              </div>
              <div className="text-right w-20">
                <p className="text-xs font-mono text-trust-safe">${o.totalValue.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">cost: ${o.totalCost.toFixed(2)}</p>
              </div>
              <div className="w-14 text-right">
                <span className="text-xs text-muted-foreground">{o.acceptanceRate}%</span>
              </div>
              <TrendIcon trend={o.trend} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ── Reasoning Path Analysis ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-sita-gold" />
              Reasoning Path Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {([] as typeof DEMO_PATHS).map((p) => (
              <div key={p.path} className="p-2.5 rounded-lg bg-secondary/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{p.path}</p>
                  <Badge variant="outline" className={cn("text-[9px] border-0", recColors[p.recommendation])}>
                    {p.recommendation}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>{p.outcomes} outcomes</span>
                  <span>Cost: ${p.cost.toFixed(2)}</span>
                  <span>Value: ${p.value.toLocaleString()}</span>
                  <span className="text-trust-safe font-mono">{p.avgPayback.toFixed(1)}x</span>
                </div>
                <Progress value={Math.min((p.avgPayback / 400) * 100, 100)} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Cost per Saved Incident ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Cost per Saved Incident
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {([] as typeof DEMO_INCIDENTS).map((inc) => (
              <div key={inc.type} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{inc.type}</p>
                  <p className="text-[10px] text-muted-foreground">{inc.prevented} prevented</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-foreground">${inc.avgCostPer.toFixed(2)}<span className="text-muted-foreground">/detect</span></p>
                  <p className="text-[10px] text-trust-safe">${inc.avgValueSaved} saved/each</p>
                </div>
                <Badge variant="outline" className="text-[9px] bg-trust-safe/10 text-trust-safe border-trust-safe/20">
                  {inc.roi.toFixed(0)}x ROI
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Value Benchmarks ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Value Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {([] as typeof DEMO_BENCHMARKS).map((b) => {
              const pct = b.unit === "%" ? b.current : Math.min((b.current / b.target) * 100, 100);
              const beating = b.current >= b.industry;
              return (
                <div key={b.metric} className="p-3 rounded-lg bg-secondary/20 space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{b.metric}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-foreground">
                      {b.unit === "$" && "$"}{b.current}{b.unit === "%" && "%"}{b.unit === "x" && "x"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/ {b.unit === "$" && "$"}{b.target}{b.unit === "%" && "%"}{b.unit === "x" && "x"} target</span>
                  </div>
                  <Progress value={pct} className="h-1" />
                  <div className="flex items-center gap-1">
                    {beating ? (
                      <ArrowUpRight className="h-3 w-3 text-trust-safe" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-sita-gold" />
                    )}
                    <span className={cn("text-[10px]", beating ? "text-trust-safe" : "text-sita-gold")}>
                      {beating ? "Above" : "Below"} industry ({b.unit === "$" && "$"}{b.industry}{b.unit === "%" && "%"}{b.unit === "x" && "x"})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutcomeEconomicsDashboard;
