// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Analytics Dashboard
// Attach rates, ARPU uplift, retention, install rates, revenue
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaMetric } from "@/platform/sita/components/sita/SitaCard";
import { KPITile } from "@/platform/sita/components/sita/SitaComponents";
import { PACK_CATALOG, getInstalledPacks } from "@/lib/pack-store";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Package, TrendingUp, DollarSign, Users, Activity, ArrowRight, Target, Zap, BarChart3, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useStoreAnalytics } from "@/modules/business/hooks/use-store-analytics";

const StoreAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading } = useStoreAnalytics();
  const enrichedAnalytics = data?.packAnalytics ?? [];
  const REVENUE_TREND = data?.revenueTrend ?? [];
  const CATEGORY_REVENUE = data?.categoryRevenue ?? [];
  const RETENTION_DATA = data?.retentionData ?? [];

  const totalRevenue = enrichedAnalytics.reduce((s, a) => s + a.revenue_generated, 0);
  const safe = (arr: number[]) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0);
  const avgAttachRate = safe(enrichedAnalytics.map(a => a.attach_rate));
  const avgArpuUplift = safe(enrichedAnalytics.map(a => a.arpu_uplift));
  const avgRetentionLift = safe(enrichedAnalytics.map(a => a.retention_lift));
  const avgInstallCompletion = safe(enrichedAnalytics.map(a => a.install_completion_rate));
  const hasData = enrichedAnalytics.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
{/* Header */}
      <SitaPageHeader title="Pack Analytics" subtitle="Attach rates, ARPU uplift, retention differentials, and revenue performance" />

      {!hasData && !isLoading && (
        <PremiumEmptyState
          variant="connect-to-activate"
          icon={Package}
          title="No pack metrics yet"
          description="Pack analytics — installs, ARPU uplift, retention, and revenue — populate as users install and use packs."
        />
      )}

      {hasData && (<>
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPITile label="Total Pack Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}k`} trend="up" sub="Last 6 months" />
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
                      {CATEGORY_REVENUE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
      </>)}
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
