// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Impact Dashboard
// Aggregated recovered + generated revenue across all playbooks
// with daily/weekly/monthly trend charts
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  DollarSign, TrendingUp, Zap, Target, ArrowUpRight,
  ArrowDownRight, Clock, Users, BarChart3, PieChart as PieIcon
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

type Granularity = "daily" | "weekly" | "monthly";

interface PlaybookRevenue {
  id: string;
  name: string;
  category: "recovery" | "growth" | "retention" | "efficiency";
  recovered: number;
  generated: number;
  actionsRun: number;
  successRate: number;
  roi: number;
  trend: number; // % change
}

interface TrendPoint {
  label: string;
  recovered: number;
  generated: number;
  total: number;
}

// ── Mock Data Generator ──────────────────────────────────────────

const PLAYBOOK_REVENUE: PlaybookRevenue[] = [
  { id: "receivable-recovery", name: "Receivable Recovery", category: "recovery", recovered: 47200, generated: 0, actionsRun: 142, successRate: 78, roi: 1240, trend: 12.5 },
  { id: "win-back-cold", name: "Win-Back Cold Customers", category: "recovery", recovered: 18600, generated: 8400, actionsRun: 89, successRate: 34, roi: 890, trend: 8.2 },
  { id: "leak-seal", name: "Leak Seal", category: "recovery", recovered: 12300, generated: 0, actionsRun: 67, successRate: 92, roi: 2100, trend: -3.1 },
  { id: "growth-accelerator", name: "Growth Accelerator", category: "growth", recovered: 0, generated: 31500, actionsRun: 204, successRate: 41, roi: 680, trend: 22.7 },
  { id: "churn-prevention", name: "Churn Prevention", category: "retention", recovered: 22800, generated: 5200, actionsRun: 53, successRate: 85, roi: 1560, trend: 15.3 },
  { id: "capacity-optimizer", name: "Capacity Optimizer", category: "efficiency", recovered: 0, generated: 9800, actionsRun: 31, successRate: 88, roi: 950, trend: 4.8 },
];

function generateTrend(granularity: Granularity): TrendPoint[] {
  const points: TrendPoint[] = [];
  const count = granularity === "daily" ? 30 : granularity === "weekly" ? 12 : 6;
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (granularity === "daily") d.setDate(d.getDate() - i);
    else if (granularity === "weekly") d.setDate(d.getDate() - i * 7);
    else d.setMonth(d.getMonth() - i);

    const base = granularity === "daily" ? 1800 : granularity === "weekly" ? 12000 : 48000;
    const variance = 0.4;
    const growthFactor = 1 + (count - i) * 0.02;
    const recovered = Math.round(base * growthFactor * (0.6 + Math.random() * variance));
    const generated = Math.round(base * growthFactor * (0.3 + Math.random() * variance) * 0.7);

    const label = granularity === "daily"
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : granularity === "weekly"
        ? `W${Math.ceil((d.getDate()) / 7)} ${d.toLocaleDateString("en-US", { month: "short" })}`
        : d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    points.push({ label, recovered, generated, total: recovered + generated });
  }
  return points;
}

// ── Chart Colors ─────────────────────────────────────────────────

const RECOVERED_COLOR = "hsl(var(--trust-safe))";
const GENERATED_COLOR = "hsl(var(--accent))";
const PIE_COLORS = [
  "hsl(var(--trust-safe))", "hsl(var(--accent))",
  "hsl(var(--primary))", "hsl(var(--destructive))",
  "hsl(var(--urgency-high))", "hsl(var(--muted-foreground))",
];

const categoryColors: Record<string, string> = {
  recovery: "bg-trust-safe/10 text-trust-safe",
  growth: "bg-accent/10 text-accent",
  retention: "bg-primary/10 text-primary",
  efficiency: "bg-muted text-muted-foreground",
};

// ── Custom Tooltip ───────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="text-[10px] text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[11px] text-muted-foreground capitalize">{p.dataKey}</span>
          <span className="text-[11px] font-semibold text-foreground ml-auto">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────

const RevenueImpactDashboard = () => {
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const trendData = useMemo(() => generateTrend(granularity), [granularity]);

  const totals = useMemo(() => {
    const recovered = PLAYBOOK_REVENUE.reduce((s, p) => s + p.recovered, 0);
    const generated = PLAYBOOK_REVENUE.reduce((s, p) => s + p.generated, 0);
    const actions = PLAYBOOK_REVENUE.reduce((s, p) => s + p.actionsRun, 0);
    const avgRoi = Math.round(PLAYBOOK_REVENUE.reduce((s, p) => s + p.roi, 0) / PLAYBOOK_REVENUE.length);
    const avgSuccess = Math.round(PLAYBOOK_REVENUE.reduce((s, p) => s + p.successRate, 0) / PLAYBOOK_REVENUE.length);
    return { recovered, generated, total: recovered + generated, actions, avgRoi, avgSuccess };
  }, []);

  const pieData = useMemo(() =>
    PLAYBOOK_REVENUE.map(p => ({
      name: p.name.length > 18 ? p.name.slice(0, 16) + "…" : p.name,
      value: p.recovered + p.generated,
    })).sort((a, b) => b.value - a.value),
  []);

  const byCategory = useMemo(() => {
    const cats: Record<string, { recovered: number; generated: number }> = {};
    PLAYBOOK_REVENUE.forEach(p => {
      if (!cats[p.category]) cats[p.category] = { recovered: 0, generated: 0 };
      cats[p.category].recovered += p.recovered;
      cats[p.category].generated += p.generated;
    });
    return Object.entries(cats).map(([cat, v]) => ({
      category: cat, ...v, total: v.recovered + v.generated,
    }));
  }, []);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Revenue Impact"
        subtitle="Aggregated recovered and generated revenue across all autopilot playbooks"
        actions={
          <span className="rounded-full bg-trust-safe/10 px-3 py-1 text-[10px] font-semibold text-trust-safe flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +{Math.round(((totals.total) / 100000) * 100)}% vs target
          </span>
        }
      />

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Revenue Impact" value={`$${(totals.total / 1000).toFixed(1)}K`} sub="Recovered + Generated" icon={DollarSign} trend="up" />
        <KPITile label="Recovered" value={`$${(totals.recovered / 1000).toFixed(1)}K`} sub="From leaks & overdue" icon={Target} trend="up" />
        <KPITile label="Generated" value={`$${(totals.generated / 1000).toFixed(1)}K`} sub="New revenue created" icon={Zap} trend="up" />
        <KPITile label="Avg ROI" value={`${totals.avgRoi}%`} sub="Per playbook" icon={TrendingUp} trend="up" />
        <KPITile label="Actions Run" value={String(totals.actions)} sub={`${totals.avgSuccess}% success rate`} icon={Users} />
      </div>

      {/* Trend Chart */}
      <SitaCard className="p-5" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <SitaCardTitle sub="Recovered vs Generated revenue over time">Revenue Trend</SitaCardTitle>
          <div className="flex items-center gap-2">
            {/* Chart type toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setChartType("area")}
                className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${chartType === "area" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <BarChart3 className="h-3 w-3" />
              </button>
              <button onClick={() => setChartType("bar")}
                className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${chartType === "bar" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <PieIcon className="h-3 w-3" />
              </button>
            </div>
            {/* Granularity toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["daily", "weekly", "monthly"] as const).map(g => (
                <button key={g} onClick={() => setGranularity(g)}
                  className={`px-3 py-1 text-[10px] font-medium capitalize transition-colors ${granularity === g ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="recoveredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={RECOVERED_COLOR} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={RECOVERED_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="generatedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GENERATED_COLOR} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={GENERATED_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="recovered" stroke={RECOVERED_COLOR} fill="url(#recoveredGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="generated" stroke={GENERATED_COLOR} fill="url(#generatedGrad)" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="recovered" fill={RECOVERED_COLOR} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="generated" fill={GENERATED_COLOR} radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-trust-safe" /><span className="text-[10px] text-muted-foreground">Recovered</span></div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-accent" /><span className="text-[10px] text-muted-foreground">Generated</span></div>
        </div>
      </SitaCard>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Playbook Breakdown Table */}
        <div className="lg:col-span-2">
          <SitaCard className="p-5" hover={false}>
            <SitaCardTitle sub="Revenue attribution per playbook">Playbook Breakdown</SitaCardTitle>
            <div className="mt-4 space-y-2">
              {PLAYBOOK_REVENUE.sort((a, b) => (b.recovered + b.generated) - (a.recovered + a.generated)).map(pb => {
                const total = pb.recovered + pb.generated;
                const pct = totals.total > 0 ? Math.round((total / totals.total) * 100) : 0;

                return (
                  <div key={pb.id} className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${categoryColors[pb.category]}`}>{pb.category}</span>
                        <span className="text-sm font-medium text-foreground">{pb.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${pb.trend >= 0 ? "text-trust-safe" : "text-destructive"}`}>
                          {pb.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(pb.trend)}%
                        </span>
                        <span className="text-sm font-bold text-foreground">${total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden flex">
                        {pb.recovered > 0 && (
                          <div className="h-full bg-trust-safe rounded-l-full" style={{ width: `${(pb.recovered / total) * pct}%` }} />
                        )}
                        {pb.generated > 0 && (
                          <div className="h-full bg-accent" style={{ width: `${(pb.generated / total) * pct}%` }} />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-[10px] text-muted-foreground">
                      {pb.recovered > 0 && <span>Recovered: ${pb.recovered.toLocaleString()}</span>}
                      {pb.generated > 0 && <span>Generated: ${pb.generated.toLocaleString()}</span>}
                      <span>{pb.actionsRun} actions</span>
                      <span>{pb.successRate}% success</span>
                      <span className="text-trust-safe font-semibold">{pb.roi}% ROI</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SitaCard>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Pie Chart */}
          <SitaCard className="p-5" hover={false}>
            <SitaCardTitle sub="Share of total impact">Revenue by Playbook</SitaCardTitle>
            <div className="h-52 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={45} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-1">
              {pieData.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-muted-foreground">{p.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">${p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </SitaCard>

          {/* Category Summary */}
          <SitaCard className="p-5" hover={false}>
            <SitaCardTitle sub="Grouped by strategy type">By Category</SitaCardTitle>
            <div className="mt-3 space-y-2.5">
              {byCategory.sort((a, b) => b.total - a.total).map(cat => (
                <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${categoryColors[cat.category]}`}>{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${cat.total.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {cat.recovered > 0 && `$${(cat.recovered / 1000).toFixed(1)}K rec`}
                      {cat.recovered > 0 && cat.generated > 0 && " · "}
                      {cat.generated > 0 && `$${(cat.generated / 1000).toFixed(1)}K gen`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SitaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueImpactDashboard;
