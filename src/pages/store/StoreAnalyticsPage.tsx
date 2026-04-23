// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Analytics Dashboard
// Attach rates, ARPU uplift, retention, install rates, revenue
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaMetric } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { PACK_CATALOG, getInstalledPacks, type PackAnalytics } from "@/lib/pack-store";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Package, TrendingUp, DollarSign, Users, Activity, ArrowRight, Target, Zap, BarChart3, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
// ── Mock Analytics Data ─────────────────────────────────────────

const PACK_ANALYTICS: PackAnalytics[] = [
  { pack_id: "pack-founder-boardroom", attach_rate: 0.42, time_to_first_value_avg: "8 min", retention_lift: 0.18, arpu_uplift: 0.35, activation_speed: "Fast", workflow_completion_lift: 0.25, install_completion_rate: 0.94, uninstall_reasons: ["Too complex", "Not enough time"], revenue_generated: 35960 },
  { pack_id: "pack-collections", attach_rate: 0.38, time_to_first_value_avg: "45 min", retention_lift: 0.22, arpu_uplift: 0.28, activation_speed: "Medium", workflow_completion_lift: 0.35, install_completion_rate: 0.91, uninstall_reasons: ["Switched provider"], revenue_generated: 39900 },
  { pack_id: "pack-family-coo", attach_rate: 0.55, time_to_first_value_avg: "4 min", retention_lift: 0.15, arpu_uplift: 0.18, activation_speed: "Fast", workflow_completion_lift: 0.20, install_completion_rate: 0.96, uninstall_reasons: ["Partner didn't adopt"], revenue_generated: 38400 },
  { pack_id: "pack-revenue-autopilot", attach_rate: 0.31, time_to_first_value_avg: "55 min", retention_lift: 0.28, arpu_uplift: 0.45, activation_speed: "Medium", workflow_completion_lift: 0.40, install_completion_rate: 0.87, uninstall_reasons: ["Too aggressive"], revenue_generated: 64350 },
  { pack_id: "pack-med-spa", attach_rate: 0.22, time_to_first_value_avg: "20 min", retention_lift: 0.32, arpu_uplift: 0.52, activation_speed: "Fast", workflow_completion_lift: 0.38, install_completion_rate: 0.89, uninstall_reasons: ["Wrong vertical"], revenue_generated: 22620 },
  { pack_id: "pack-investment-office", attach_rate: 0.08, time_to_first_value_avg: "12 min", retention_lift: 0.35, arpu_uplift: 0.85, activation_speed: "Slow", workflow_completion_lift: 0.15, install_completion_rate: 0.82, uninstall_reasons: ["Too expensive"], revenue_generated: 22120 },
  { pack_id: "pack-lead-recovery", attach_rate: 0.34, time_to_first_value_avg: "1.5 hr", retention_lift: 0.12, arpu_uplift: 0.20, activation_speed: "Fast", workflow_completion_lift: 0.30, install_completion_rate: 0.93, uninstall_reasons: ["Low lead volume"], revenue_generated: 27000 },
];

const StoreAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const totalRevenue = PACK_ANALYTICS.reduce((s, a) => s + a.revenue_generated, 0);
  const avgAttachRate = PACK_ANALYTICS.reduce((s, a) => s + a.attach_rate, 0) / PACK_ANALYTICS.length;
  const avgArpuUplift = PACK_ANALYTICS.reduce((s, a) => s + a.arpu_uplift, 0) / PACK_ANALYTICS.length;
  const avgRetentionLift = PACK_ANALYTICS.reduce((s, a) => s + a.retention_lift, 0) / PACK_ANALYTICS.length;
  const avgInstallCompletion = PACK_ANALYTICS.reduce((s, a) => s + a.install_completion_rate, 0) / PACK_ANALYTICS.length;

  const enrichedAnalytics = PACK_ANALYTICS.map(a => {
    const pack = PACK_CATALOG.find(p => p.pack_id === a.pack_id);
    return { ...a, name: pack?.name || a.pack_id, category: pack?.category || "unknown" };
  }).sort((a, b) => b.revenue_generated - a.revenue_generated);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
{/* Header */}
      <SitaPageHeader title="Pack Analytics" subtitle="Attach rates, ARPU uplift, retention differentials, and revenue performance" />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPITile label="Total Pack Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}k`} trend="up" sub="Last 6 months" />
        <KPITile label="Avg Attach Rate" value={`${Math.round(avgAttachRate * 100)}%`} trend="up" sub="Across all packs" />
        <KPITile label="ARPU Uplift" value={`+${Math.round(avgArpuUplift * 100)}%`} trend="up" sub="Pack users vs base" />
        <KPITile label="Retention Lift" value={`+${Math.round(avgRetentionLift * 100)}%`} trend="up" sub="12-month cohort" />
        <KPITile label="Install Completion" value={`${Math.round(avgInstallCompletion * 100)}%`} trend="flat" sub="Setup finish rate" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/40">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packs">By Pack</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Revenue Trend */}
          <SitaCard hover={false}>
            <SitaCardTitle sub="Monthly revenue and install volume">Revenue & Install Trend</SitaCardTitle>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="installs" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SitaCard>

          {/* Category Revenue Pie */}
          <div className="grid gap-4 md:grid-cols-2">
            <SitaCard hover={false}>
              <SitaCardTitle>Revenue by Category</SitaCardTitle>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={CATEGORY_REVENUE} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {([] as any[]).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SitaCard>

            {/* Top Packs by ARPU Uplift */}
            <SitaCard hover={false}>
              <SitaCardTitle>ARPU Uplift by Pack</SitaCardTitle>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrichedAnalytics.sort((a, b) => b.arpu_uplift - a.arpu_uplift)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `+${Math.round(v * 100)}%`} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip formatter={(v: number) => `+${Math.round(v * 100)}%`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="arpu_uplift" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SitaCard>
          </div>
        </TabsContent>

        <TabsContent value="packs" className="space-y-4 mt-4">
          <SitaSectionHeader title="Per-Pack Performance" subtitle="Detailed metrics for every pack" />
          <div className="space-y-3">
            {enrichedAnalytics.map((a, i) => (
              <motion.div key={a.pack_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{a.category}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px]">${(a.revenue_generated / 1000).toFixed(1)}k revenue</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <MetricMini label="Attach Rate" value={`${Math.round(a.attach_rate * 100)}%`} />
                  <MetricMini label="ARPU Uplift" value={`+${Math.round(a.arpu_uplift * 100)}%`} />
                  <MetricMini label="Retention Lift" value={`+${Math.round(a.retention_lift * 100)}%`} />
                  <MetricMini label="Install Completion" value={`${Math.round(a.install_completion_rate * 100)}%`} />
                  <MetricMini label="Time to Value" value={a.time_to_first_value_avg} />
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4 mt-4">
          <SitaCard hover={false}>
            <SitaCardTitle sub="Pack users vs non-pack users over time">Retention Differential</SitaCardTitle>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={RETENTION_DATA}>
                  <defs>
                    <linearGradient id="retWith" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--trust-safe))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--trust-safe))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="retWithout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="withPack" name="With Packs" stroke="hsl(var(--trust-safe))" fill="url(#retWith)" strokeWidth={2} />
                  <Area type="monotone" dataKey="withoutPack" name="Without Packs" stroke="hsl(var(--muted-foreground))" fill="url(#retWithout)" strokeWidth={2} strokeDasharray="5 5" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SitaCard>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4 mt-4">
          <SitaCard hover={false}>
            <SitaCardTitle>Revenue by Pack</SitaCardTitle>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrichedAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="revenue_generated" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SitaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MetricMini = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-secondary/30 px-2.5 py-2 text-center">
    <p className="text-xs font-semibold text-foreground">{value}</p>
    <p className="text-[9px] text-muted-foreground">{label}</p>
  </div>
);

export default StoreAnalyticsPage;
