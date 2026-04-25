// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Forecasting Model
// Digital twin health + playbook performance → 30/60/90 day projections
// with confidence intervals and scenario analysis
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { KPITile } from "@/platform/sita/components/sita/SitaComponents";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  BarChart, Bar, Cell, ComposedChart, Line
} from "recharts";
import {
  TrendingUp, Target, Zap, Shield, Brain, Activity,
  ChevronDown, ChevronUp, Users, DollarSign, AlertTriangle,
  ArrowUpRight, Gauge, Eye
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";



// ── Types ────────────────────────────────────────────────────────

interface DigitalTwin {
  id: string;
  name: string;
  healthScore: number; // 0-100
  revenueAtRisk: number;
  predictedRevenue: number;
  churnProbability: number; // 0-1
  lastActivity: string;
  segment: "enterprise" | "mid-market" | "smb";
  trend: "improving" | "stable" | "declining";
}

interface ForecastPoint {
  day: number;
  label: string;
  baseline: number;
  optimistic: number;
  pessimistic: number;
  withPlaybooks: number;
  actual?: number;
}

interface PlaybookImpact {
  id: string;
  name: string;
  projectedLift: number;
  confidence: number;
  activeCustomers: number;
  avgHealthDelta: number;
  status: "high-impact" | "moderate" | "emerging";
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  revenue30: number;
  revenue60: number;
  revenue90: number;
  probability: number;
  color: string;
}

// ── Mock Data ────────────────────────────────────────────────────

const DIGITAL_TWINS: DigitalTwin[] = [
  { id: "dt-1", name: "TechVentures Inc", healthScore: 92, revenueAtRisk: 0, predictedRevenue: 45000, churnProbability: 0.03, lastActivity: "2h ago", segment: "enterprise", trend: "improving" },
  { id: "dt-2", name: "Bloom Studio", healthScore: 58, revenueAtRisk: 8400, predictedRevenue: 12000, churnProbability: 0.35, lastActivity: "3d ago", segment: "mid-market", trend: "declining" },
  { id: "dt-3", name: "Premier Design Co", healthScore: 41, revenueAtRisk: 22000, predictedRevenue: 28000, churnProbability: 0.62, lastActivity: "8d ago", segment: "enterprise", trend: "declining" },
  { id: "dt-4", name: "Acme Corp", healthScore: 87, revenueAtRisk: 0, predictedRevenue: 67000, churnProbability: 0.05, lastActivity: "1h ago", segment: "enterprise", trend: "stable" },
  { id: "dt-5", name: "Johnson & Co", healthScore: 73, revenueAtRisk: 4200, predictedRevenue: 18500, churnProbability: 0.15, lastActivity: "1d ago", segment: "mid-market", trend: "improving" },
  { id: "dt-6", name: "Legacy Systems", healthScore: 34, revenueAtRisk: 15000, predictedRevenue: 15000, churnProbability: 0.71, lastActivity: "12d ago", segment: "smb", trend: "declining" },
  { id: "dt-7", name: "Sarah Chen LLC", healthScore: 95, revenueAtRisk: 0, predictedRevenue: 8500, churnProbability: 0.02, lastActivity: "30m ago", segment: "smb", trend: "improving" },
  { id: "dt-8", name: "NovaTech Solutions", healthScore: 81, revenueAtRisk: 2100, predictedRevenue: 34000, churnProbability: 0.09, lastActivity: "5h ago", segment: "enterprise", trend: "stable" },
];

const PLAYBOOK_IMPACTS: PlaybookImpact[] = [
  { id: "receivable-recovery", name: "Receivable Recovery", projectedLift: 47200, confidence: 89, activeCustomers: 12, avgHealthDelta: 8.3, status: "high-impact" },
  { id: "win-back-cold", name: "Win-Back Cold Customers", projectedLift: 27000, confidence: 62, activeCustomers: 6, avgHealthDelta: 18.5, status: "moderate" },
  { id: "leak-seal", name: "Revenue Leak Sealer", projectedLift: 12300, confidence: 94, activeCustomers: 8, avgHealthDelta: 5.1, status: "high-impact" },
  { id: "churn-prevention", name: "Churn Prevention", projectedLift: 28000, confidence: 71, activeCustomers: 4, avgHealthDelta: 22.7, status: "moderate" },
  { id: "growth-accelerator", name: "Growth Accelerator", projectedLift: 15800, confidence: 45, activeCustomers: 3, avgHealthDelta: -2.1, status: "emerging" },
];

const SCENARIOS: Scenario[] = [
  { id: "base", name: "Base Case", description: "Current trajectory with active playbooks", revenue30: 228000, revenue60: 472000, revenue90: 738000, probability: 0.55, color: "hsl(var(--primary))" },
  { id: "optimistic", name: "Upside", description: "All at-risk accounts recover, growth accelerates", revenue30: 268000, revenue60: 558000, revenue90: 892000, probability: 0.20, color: "hsl(var(--accent))" },
  { id: "pessimistic", name: "Downside", description: "Churn risk materializes, slower recovery", revenue30: 195000, revenue60: 378000, revenue90: 562000, probability: 0.25, color: "hsl(var(--destructive))" },
];

function generateForecastData(): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const baseMonthly = 228000;

  for (let d = 0; d <= 90; d += 3) {
    const progress = d / 90;
    const base = baseMonthly * (d / 30);
    const playboostFactor = 1 + 0.18 * Math.pow(progress, 0.7);
    const optimisticFactor = 1 + 0.32 * Math.pow(progress, 0.6);
    const pessimisticFactor = 1 - 0.15 * Math.pow(progress, 0.8);
    const noise = () => (Math.random() - 0.5) * base * 0.02;

    points.push({
      day: d,
      label: d === 0 ? "Today" : d === 30 ? "30d" : d === 60 ? "60d" : d === 90 ? "90d" : `${d}d`,
      baseline: Math.round(base + noise()),
      optimistic: Math.round(base * optimisticFactor + noise()),
      pessimistic: Math.round(base * pessimisticFactor + noise()),
      withPlaybooks: Math.round(base * playboostFactor + noise()),
      ...(d <= 12 ? { actual: Math.round(base * (1 + 0.14 * (d / 12)) + noise()) } : {}),
    });
  }
  return points;
}

// ── Helpers ──────────────────────────────────────────────────────

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const pct = (n: number) => `${n.toFixed(0)}%`;

const healthColor = (score: number) =>
  score >= 80 ? "text-accent" : score >= 50 ? "text-yellow-400" : "text-destructive";

const healthBg = (score: number) =>
  score >= 80 ? "bg-accent/10" : score >= 50 ? "bg-yellow-400/10" : "bg-destructive/10";

const trendIcon = (trend: string) =>
  trend === "improving" ? "↑" : trend === "declining" ? "↓" : "→";

// ── Component ────────────────────────────────────────────────────

// ── Monte Carlo Engine ───────────────────────────────────────────

interface MonteCarloResult {
  buckets: { range: string; count: number; midpoint: number }[];
  mean: number;
  median: number;
  p10: number;
  p90: number;
  stdDev: number;
  iterations: number;
}

function runMonteCarlo(iterations: number = 1000): MonteCarloResult {
  const baseRevenue = 738000; // 90-day base
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let rev = baseRevenue;

    // Twin health factor: each twin's churn prob reduces revenue
    for (const twin of DIGITAL_TWINS) {
      const churnRoll = Math.random();
      if (churnRoll < twin.churnProbability) {
        rev -= twin.predictedRevenue * (0.4 + Math.random() * 0.6);
      } else {
        // Health-based growth: healthy twins may upsell
        const growthChance = twin.healthScore / 200;
        if (Math.random() < growthChance) {
          rev += twin.predictedRevenue * (0.05 + Math.random() * 0.15);
        }
      }
    }

    // Playbook impact: each playbook has a probabilistic lift
    for (const pb of PLAYBOOK_IMPACTS) {
      const successRoll = Math.random() * 100;
      if (successRoll < pb.confidence) {
        const liftVariance = 0.6 + Math.random() * 0.8; // 60-140% of projected
        rev += pb.projectedLift * liftVariance;
      }
    }

    // Market noise: ±8%
    rev *= 0.92 + Math.random() * 0.16;

    results.push(Math.round(rev));
  }

  results.sort((a, b) => a - b);

  const mean = Math.round(results.reduce((s, v) => s + v, 0) / results.length);
  const median = results[Math.floor(results.length / 2)];
  const p10 = results[Math.floor(results.length * 0.1)];
  const p90 = results[Math.floor(results.length * 0.9)];
  const variance = results.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / results.length;
  const stdDev = Math.round(Math.sqrt(variance));

  // Build histogram buckets
  const min = results[0];
  const max = results[results.length - 1];
  const bucketCount = 20;
  const bucketSize = Math.ceil((max - min) / bucketCount);
  const buckets: { range: string; count: number; midpoint: number }[] = [];

  for (let b = 0; b < bucketCount; b++) {
    const lo = min + b * bucketSize;
    const hi = lo + bucketSize;
    const count = results.filter(v => v >= lo && v < hi).length;
    buckets.push({
      range: `${fmt(lo)}`,
      count,
      midpoint: lo + bucketSize / 2,
    });
  }

  return { buckets, mean, median, p10, p90, stdDev, iterations };
}

const RevenueForecast = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>("base");
  const [showTwins, setShowTwins] = useState(true);
  const [twinSort, setTwinSort] = useState<"health" | "risk" | "revenue">("risk");
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [mcRunning, setMcRunning] = useState(false);

  const forecastData = useMemo(() => generateForecastData(), []);

  const handleRunMonteCarlo = () => {
    setMcRunning(true);
    setShowMonteCarlo(true);
    // Simulate async computation
    setTimeout(() => {
      setMcResult(runMonteCarlo(1000));
      setMcRunning(false);
    }, 600);
  };

  // ── Live Data Queries (fallback to mock) ──────────────────────
  const { data: liveTwins } = useQuery({
    queryKey: ["digital-twins"],
    queryFn: async () => {
      const { data, error } = await fromTable("digital_twins").select("*");
      if (error) throw error;
      return data?.length ? data.map((t: Record<string, any>) => ({
        id: t.id,
        name: t.name,
        healthScore: t.health_score,
        revenueAtRisk: t.revenue_at_risk,
        predictedRevenue: t.predicted_revenue,
        churnProbability: Number(t.churn_probability),
        lastActivity: t.last_activity || "unknown",
        segment: t.segment as DigitalTwin["segment"],
        trend: t.trend as DigitalTwin["trend"],
      })) : null;
    },
    staleTime: 30000,
  });

  const { data: livePlaybooks } = useQuery({
    queryKey: ["playbook-metrics"],
    queryFn: async () => {
      const { data, error } = await fromTable("playbook_metrics").select("*");
      if (error) throw error;
      return data?.length ? data.map((p: Record<string, any>) => ({
        id: p.playbook_id,
        name: p.name,
        projectedLift: p.projected_lift,
        confidence: p.confidence,
        activeCustomers: p.active_customers,
        avgHealthDelta: Number(p.avg_health_delta),
        status: p.status as PlaybookImpact["status"],
      })) : null;
    },
    staleTime: 30000,
  });

  // Use live data if available, otherwise mock
  const twins = liveTwins || DIGITAL_TWINS;
  const playbooks = livePlaybooks || PLAYBOOK_IMPACTS;
  const isLiveData = !!liveTwins;

  const sortedTwins = useMemo(() => {
    const sorted = [...twins];
    if (twinSort === "health") sorted.sort((a, b) => a.healthScore - b.healthScore);
    else if (twinSort === "risk") sorted.sort((a, b) => b.revenueAtRisk - a.revenueAtRisk);
    else sorted.sort((a, b) => b.predictedRevenue - a.predictedRevenue);
    return sorted;
  }, [twinSort, twins]);

  const totalPredicted = twins.reduce((s, t) => s + t.predictedRevenue, 0);
  const totalAtRisk = twins.reduce((s, t) => s + t.revenueAtRisk, 0);
  const avgHealth = Math.round(twins.reduce((s, t) => s + t.healthScore, 0) / twins.length);
  const playbookLift = playbooks.reduce((s, p) => s + p.projectedLift, 0);
  const weightedConfidence = Math.round(
    playbooks.reduce((s, p) => s + p.confidence * p.projectedLift, 0) / playbookLift
  );

  const activeScenario = SCENARIOS.find(s => s.id === selectedScenario)!;

  // Health distribution for bar chart
  const healthDistribution = [
    { range: "0-25", count: DIGITAL_TWINS.filter(t => t.healthScore <= 25).length, color: "hsl(var(--destructive))" },
    { range: "26-50", count: DIGITAL_TWINS.filter(t => t.healthScore > 25 && t.healthScore <= 50).length, color: "hsl(0, 30%, 55%)" },
    { range: "51-75", count: DIGITAL_TWINS.filter(t => t.healthScore > 50 && t.healthScore <= 75).length, color: "hsl(45, 80%, 55%)" },
    { range: "76-100", count: DIGITAL_TWINS.filter(t => t.healthScore > 75).length, color: "hsl(var(--accent))" },
  ];

  return (
    <div className="space-y-6">
      <PageTruthBanner />

      {/* ── KPI Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPITile label="30-Day Forecast" value={fmt(activeScenario.revenue30)} trend="up" icon={TrendingUp} />
        <KPITile label="60-Day Forecast" value={fmt(activeScenario.revenue60)} trend="up" icon={Target} />
        <KPITile label="90-Day Forecast" value={fmt(activeScenario.revenue90)} trend="up" icon={DollarSign} />
        <KPITile label="Revenue at Risk" value={fmt(totalAtRisk)} trend="down" icon={AlertTriangle} />
        <KPITile label="Avg Twin Health" value={`${avgHealth}/100`} trend={avgHealth > 70 ? "up" : "down"} icon={Activity} />
        <KPITile label="Playbook Confidence" value={pct(weightedConfidence)} trend="up" icon={Brain} />
      </div>

      {/* ── Scenario Selector ──────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        {SCENARIOS.map(s => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedScenario(s.id)}
            className={`flex-1 min-w-[180px] rounded-xl border p-4 text-left transition-all ${
              selectedScenario === s.id
                ? "border-primary/40 bg-primary/5 shadow-glow-purple"
                : "border-border bg-card hover:border-primary/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-foreground">{s.name}</span>
              <span className="text-xs font-mono text-muted-foreground">{pct(s.probability * 100)} prob</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.description}</p>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-foreground font-medium">{fmt(s.revenue30)} <span className="text-muted-foreground">30d</span></span>
              <span className="text-foreground font-medium">{fmt(s.revenue60)} <span className="text-muted-foreground">60d</span></span>
              <span className="text-foreground font-medium">{fmt(s.revenue90)} <span className="text-muted-foreground">90d</span></span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Monte Carlo Simulation ─────────────────── */}
      <SitaCard hover={false} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SitaCardTitle>Monte Carlo Simulation</SitaCardTitle>
            <p className="text-xs text-muted-foreground">1,000 iterations modeling twin health variance, playbook success rates, and market noise</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRunMonteCarlo}
            disabled={mcRunning}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              showMonteCarlo && mcResult
                ? "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            } ${mcRunning ? "opacity-60 cursor-wait" : ""}`}
          >
            <Gauge className="h-4 w-4" />
            {mcRunning ? "Simulating..." : showMonteCarlo ? "Re-run Simulation" : "Run Simulation"}
          </motion.button>
        </div>

        {mcRunning && (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary"
            />
            <span className="ml-3 text-sm text-muted-foreground">Running 1,000 iterations…</span>
          </div>
        )}

        {showMonteCarlo && mcResult && !mcRunning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Mean</p>
                <p className="text-lg font-mono font-bold text-foreground">{fmt(mcResult.mean)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Median</p>
                <p className="text-lg font-mono font-bold text-foreground">{fmt(mcResult.median)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">10th Pctl</p>
                <p className="text-lg font-mono font-bold text-destructive">{fmt(mcResult.p10)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">90th Pctl</p>
                <p className="text-lg font-mono font-bold text-accent">{fmt(mcResult.p90)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Std Dev</p>
                <p className="text-lg font-mono font-bold text-muted-foreground">±{fmt(mcResult.stdDev)}</p>
              </div>
            </div>

            {/* Histogram */}
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mcResult.buckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                    interval={2}
                    angle={-30}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value} iterations`, "Frequency"]}
                    labelFormatter={(label) => `Revenue: ${label}`}
                  />
                  <Bar dataKey="count" name="Frequency" radius={[3, 3, 0, 0]}>
                    {mcResult.buckets.map((entry, i) => {
                      const isP10P90 = entry.midpoint >= mcResult.p10 && entry.midpoint <= mcResult.p90;
                      const isMean = Math.abs(entry.midpoint - mcResult.mean) < (mcResult.stdDev * 0.5);
                      return (
                        <Cell
                          key={i}
                          fill={isMean ? "hsl(var(--accent))" : isP10P90 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                          opacity={isP10P90 ? 0.9 : 0.4}
                        />
                      );
                    })}
                  </Bar>
                  <ReferenceLine x={mcResult.buckets.find(b => Math.abs(b.midpoint - mcResult.mean) === Math.min(...mcResult.buckets.map(b => Math.abs(b.midpoint - mcResult.mean))))?.range} stroke="hsl(var(--accent))" strokeDasharray="4 4" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Mean region</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> P10–P90 range</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground opacity-40" /> Tail outcomes</span>
            </div>
          </motion.div>
        )}

        {!showMonteCarlo && !mcRunning && (
          <EmptyState
            variant="card"
            icon={Gauge}
            title="No simulation yet"
            description="Run a Monte Carlo simulation to see the probability distribution. Models twin churn risk, playbook confidence intervals, and market variance."
            actionLabel="Run simulation"
            onAction={handleRunMonteCarlo}
          />
        )}
      </SitaCard>

      {/* ── Main Forecast Chart ────────────────────── */}
      <SitaCard hover={false} className="p-5">
        <SitaCardTitle>Revenue Projection — {activeScenario.name}</SitaCardTitle>
        <p className="text-xs text-muted-foreground mb-4">
          Shaded area = confidence interval · Solid line = projected with active playbooks · Dashed = baseline without
        </p>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="playbookGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={55} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [fmt(value), name]}
              />
              {/* Confidence band */}
              <Area type="monotone" dataKey="optimistic" stroke="none" fill="url(#confGradient)" name="Optimistic" />
              <Area type="monotone" dataKey="pessimistic" stroke="none" fill="hsl(var(--background))" name="Pessimistic" />
              {/* Baseline */}
              <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" strokeWidth={1.5} fill="none" name="Baseline (no playbooks)" />
              {/* With playbooks */}
              <Area type="monotone" dataKey="withPlaybooks" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#playbookGradient)" name="With Playbooks" />
              {/* Actuals */}
              <Area type="monotone" dataKey="actual" stroke="hsl(var(--foreground))" strokeWidth={2} fill="none" name="Actual" dot={{ r: 3, fill: "hsl(var(--foreground))" }} />
              {/* Reference lines */}
              <ReferenceLine x="30d" stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine x="60d" stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine x="90d" stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.5} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SitaCard>

      {/* ── Two Column: Playbook Impact + Health Distribution ── */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Playbook Impact */}
        <SitaCard hover={false} className="md:col-span-3 p-5">
          <SitaCardTitle>Playbook Revenue Impact</SitaCardTitle>
          <p className="text-xs text-muted-foreground mb-4">Projected lift from active automation sequences</p>
          <div className="space-y-3">
            {PLAYBOOK_IMPACTS.map(p => (
              <div key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      p.status === "high-impact" ? "bg-accent" : p.status === "moderate" ? "bg-yellow-400" : "bg-primary"
                    }`} />
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-accent">{fmt(p.projectedLift)}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Confidence: <span className="font-medium text-foreground">{p.confidence}%</span></span>
                  <span>Customers: <span className="font-medium text-foreground">{p.activeCustomers}</span></span>
                  <span>Health Δ: <span className={`font-medium ${p.avgHealthDelta > 0 ? "text-accent" : "text-destructive"}`}>{p.avgHealthDelta > 0 ? "+" : ""}{p.avgHealthDelta}</span></span>
                </div>
                {/* Confidence bar */}
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.confidence}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      p.confidence >= 80 ? "bg-accent" : p.confidence >= 60 ? "bg-yellow-400" : "bg-primary"
                    }`}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total Projected Lift</span>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-accent">{fmt(playbookLift)}</span>
                <span className="text-xs text-muted-foreground ml-2">@ {weightedConfidence}% weighted conf.</span>
              </div>
            </div>
          </div>
        </SitaCard>

        {/* Health Distribution + Mini chart */}
        <SitaCard hover={false} className="md:col-span-2 p-5">
          <SitaCardTitle>Twin Health Distribution</SitaCardTitle>
          <p className="text-xs text-muted-foreground mb-4">{DIGITAL_TWINS.length} active digital twins</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Customers" radius={[4, 4, 0, 0]}>
                  {healthDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Summary */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Healthy (76+)</span>
              <span className="font-medium text-accent">{DIGITAL_TWINS.filter(t => t.healthScore > 75).length} customers</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">At Risk (≤50)</span>
              <span className="font-medium text-destructive">{DIGITAL_TWINS.filter(t => t.healthScore <= 50).length} customers</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Revenue at Risk</span>
              <span className="font-medium text-destructive">{fmt(totalAtRisk)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg Churn Probability</span>
              <span className="font-medium text-foreground">
                {(DIGITAL_TWINS.reduce((s, t) => s + t.churnProbability, 0) / DIGITAL_TWINS.length * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </SitaCard>
      </div>

      {/* ── Digital Twin Table ──────────────────────── */}
      <SitaCard hover={false} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SitaCardTitle>Digital Twin Health → Revenue Map</SitaCardTitle>
            <p className="text-xs text-muted-foreground">Each customer's health score drives their revenue prediction</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["risk", "health", "revenue"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setTwinSort(s)}
                  className={`px-3 py-1.5 capitalize transition-colors ${
                    twinSort === s ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTwins(!showTwins)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              {showTwins ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {showTwins && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Customer</th>
                    <th className="pb-2 pr-4">Health</th>
                    <th className="pb-2 pr-4">Trend</th>
                    <th className="pb-2 pr-4">Predicted Rev</th>
                    <th className="pb-2 pr-4">At Risk</th>
                    <th className="pb-2 pr-4">Churn Prob</th>
                    <th className="pb-2">Segment</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTwins.map(twin => (
                    <tr key={twin.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5 text-primary/60" />
                          <span className="font-medium text-foreground">{twin.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-md px-2 py-0.5 text-xs font-mono font-semibold ${healthBg(twin.healthScore)} ${healthColor(twin.healthScore)}`}>
                            {twin.healthScore}
                          </div>
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                twin.healthScore >= 80 ? "bg-accent" : twin.healthScore >= 50 ? "bg-yellow-400" : "bg-destructive"
                              }`}
                              style={{ width: `${twin.healthScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-medium ${
                          twin.trend === "improving" ? "text-accent" : twin.trend === "declining" ? "text-destructive" : "text-muted-foreground"
                        }`}>
                          {trendIcon(twin.trend)} {twin.trend}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-foreground">{fmt(twin.predictedRevenue)}</td>
                      <td className="py-2.5 pr-4">
                        {twin.revenueAtRisk > 0 ? (
                          <span className="font-mono text-destructive">{fmt(twin.revenueAtRisk)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`font-mono ${twin.churnProbability > 0.3 ? "text-destructive" : "text-muted-foreground"}`}>
                          {(twin.churnProbability * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground capitalize">
                          {twin.segment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </SitaCard>

      {/* ── Model Methodology ──────────────────────── */}
      <SitaCard hover={false} className="p-5">
        <SitaCardTitle>Forecasting Methodology</SitaCardTitle>
        <div className="mt-3 grid md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-primary" /> Digital Twin Inputs</p>
            <p>Health scores (engagement recency, revenue trend, communication frequency, issue resolution, satisfaction) weighted per the customer-health formula.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-accent" /> Playbook Adjustments</p>
            <p>Each active playbook's historical success rate and confidence interval adjusts the base projection upward. Monte Carlo simulation generates confidence bands.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Scenario Modeling</p>
            <p>Three scenarios weighted by probability. Churn probability from declining twins reduces pessimistic case. Playbook lift amplifies optimistic case.</p>
          </div>
        </div>
      </SitaCard>
    </div>
  );
};

export default RevenueForecast;
