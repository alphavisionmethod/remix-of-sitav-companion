// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Impact Dashboard
// Aggregated revenue impact across all playbooks.
//
// Production-truth rule:
//   • Unauthenticated → sign-in CTA (no fake KPIs).
//   • Demo mode       → uses DEMO_PLAYBOOK_REVENUE + a deterministic
//                       sample trend, clearly labelled by PageTruthBanner.
//   • Live mode       → derives KPIs and trend from the user's real
//                       paid invoices. If there is no paid invoice
//                       history yet, renders an honest empty state
//                       instead of fabricating a trend with random math.
//
// All previously-random "trend" math (Math.random) and the fake
// "+X% vs target" badge have been removed.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import HierarchyHint from "@/modules/business/components/business/shared/HierarchyHint";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { KPITile } from "@/platform/sita/components/sita/SitaComponents";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  DollarSign, TrendingUp, Zap, Target, ArrowUpRight, ArrowDownRight,
  Users, BarChart3, PieChart as PieIcon, LogIn, Inbox,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";

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
  trend: number;
}

interface TrendPoint {
  label: string;
  recovered: number;
  generated: number;
  total: number;
}

// ── Demo-only fixtures (gated by isDemo at render time) ─────────
//
// Deterministic — no Math.random — so demo runs are reproducible and
// don't masquerade as fluctuating live telemetry.
const DEMO_PLAYBOOK_REVENUE: PlaybookRevenue[] = [
  { id: "pb-recover-overdue",   name: "Recover overdue invoices",   category: "recovery",   recovered: 42_300, generated:      0, actionsRun: 38, successRate: 71, roi: 940, trend:  12 },
  { id: "pb-winback-cold-leads", name: "Win back cold leads",        category: "growth",     recovered:      0, generated: 28_900, actionsRun: 64, successRate: 58, roi: 720, trend:   8 },
  { id: "pb-retain-churn-risk",  name: "Retain at-risk customers",   category: "retention",  recovered: 19_500, generated:  6_400, actionsRun: 22, successRate: 79, roi: 1180, trend:  -3 },
  { id: "pb-collect-deposits",   name: "Collect outstanding deposits", category: "recovery", recovered: 11_200, generated:      0, actionsRun: 15, successRate: 83, roi: 990, trend:   5 },
];

function buildDemoTrend(granularity: Granularity): TrendPoint[] {
  const count = granularity === "daily" ? 30 : granularity === "weekly" ? 12 : 6;
  const now = new Date();
  const out: TrendPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (granularity === "daily") d.setDate(d.getDate() - i);
    else if (granularity === "weekly") d.setDate(d.getDate() - i * 7);
    else d.setMonth(d.getMonth() - i);
    // Deterministic curve: gentle growth, no random.
    const base = granularity === "daily" ? 1800 : granularity === "weekly" ? 12000 : 48000;
    const growth = 1 + (count - i) * 0.02;
    const recovered = Math.round(base * growth * 0.7);
    const generated = Math.round(base * growth * 0.35);
    const label = granularity === "daily"
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : granularity === "weekly"
        ? `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("en-US", { month: "short" })}`
        : d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    out.push({ label, recovered, generated, total: recovered + generated });
  }
  return out;
}

/**
 * Build a real trend from paid invoices grouped by date bucket.
 * Recovered = sum of paid invoice totals in the bucket.
 * Generated is intentionally 0 in live mode today — there is no
 * "generated revenue" source wired yet, and we don't fabricate one.
 */
function buildRealTrend(
  invoices: Array<{ total_cents: number | null; paid_at: string | null }>,
  granularity: Granularity,
): TrendPoint[] {
  const count = granularity === "daily" ? 30 : granularity === "weekly" ? 12 : 6;
  const now = new Date();
  const buckets: TrendPoint[] = [];
  const bucketKey = (d: Date) => {
    if (granularity === "daily") return d.toISOString().slice(0, 10);
    if (granularity === "weekly") {
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      return start.toISOString().slice(0, 10);
    }
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  };

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (granularity === "daily") d.setDate(d.getDate() - i);
    else if (granularity === "weekly") d.setDate(d.getDate() - i * 7);
    else d.setMonth(d.getMonth() - i);
    const label = granularity === "daily"
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : granularity === "weekly"
        ? `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("en-US", { month: "short" })}`
        : d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    buckets.push({ label, recovered: 0, generated: 0, total: 0 });
  }

  const labelByOffset = new Map<string, number>();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (granularity === "daily") d.setDate(d.getDate() - i);
    else if (granularity === "weekly") d.setDate(d.getDate() - i * 7);
    else d.setMonth(d.getMonth() - i);
    labelByOffset.set(bucketKey(d), count - 1 - i);
  }

  for (const inv of invoices) {
    if (!inv.paid_at || !inv.total_cents) continue;
    const key = bucketKey(new Date(inv.paid_at));
    const idx = labelByOffset.get(key);
    if (idx === undefined) continue;
    const amount = (inv.total_cents || 0) / 100;
    buckets[idx].recovered += amount;
    buckets[idx].total += amount;
  }
  return buckets;
}

// ── Chart Colors ─────────────────────────────────────────────────

import { PIE_COLORS } from "@/lib/constants/ui-config";
const RECOVERED_COLOR = "hsl(var(--trust-safe))";
const GENERATED_COLOR = "hsl(var(--accent))";
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
      {payload.map((p: Record<string, any>) => (
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
  const { primaryMode } = useBusinessProfile();
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Real data: paid invoices for the signed-in user.
  const { data: realInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["revenue-impact", user?.id],
    enabled: !!user && !isDemo,
    queryFn: async () => {
      const { data: invoices } = await fromTable("invoices")
        .select("id, total_cents, status, paid_at, created_at")
        .eq("user_id", user!.id);
      return (invoices ?? []).filter((i: Record<string, any>) => i.status === "paid") as Array<{
        id: string; total_cents: number | null; status: string; paid_at: string | null; created_at: string | null;
      }>;
    },
  });

  // Playbook breakdown — fixture rows live ONLY in demo mode.
  const playbooks: PlaybookRevenue[] = isDemo ? DEMO_PLAYBOOK_REVENUE : [];

  const trendData = useMemo(() => {
    if (isDemo) return buildDemoTrend(granularity);
    return buildRealTrend(realInvoices ?? [], granularity);
  }, [isDemo, realInvoices, granularity]);

  const totals = useMemo(() => {
    if (isDemo) {
      const recovered = playbooks.reduce((s, p) => s + p.recovered, 0);
      const generated = playbooks.reduce((s, p) => s + p.generated, 0);
      const actions = playbooks.reduce((s, p) => s + p.actionsRun, 0);
      const avgRoi = Math.round(playbooks.reduce((s, p) => s + p.roi, 0) / Math.max(playbooks.length, 1));
      const avgSuccess = Math.round(playbooks.reduce((s, p) => s + p.successRate, 0) / Math.max(playbooks.length, 1));
      return { recovered, generated, total: recovered + generated, actions, avgRoi, avgSuccess };
    }
    // Live mode — derive KPIs strictly from real paid invoices.
    const recovered = (realInvoices ?? []).reduce((s, i) => s + ((i.total_cents || 0) / 100), 0);
    const actions = (realInvoices ?? []).length;
    return { recovered, generated: 0, total: recovered, actions, avgRoi: 0, avgSuccess: 0 };
  }, [isDemo, playbooks, realInvoices]);

  const pieData = useMemo(() =>
    playbooks.map(p => ({
      name: p.name.length > 18 ? p.name.slice(0, 16) + "…" : p.name,
      value: p.recovered + p.generated,
    })).sort((a, b) => b.value - a.value),
  [playbooks]);

  // Honest unauth state in live mode.
  if (!isDemo && !user) {
    return (
      <div className="space-y-4">
        <PageTruthBanner />
        <EmptyStateCard
          icon={LogIn}
          title="Sign in to view revenue impact"
          description="Revenue Impact aggregates paid invoices and recovery activity for your account. Switch to Demo mode to explore the workspace with sample data."
          ctaLabel="Open sign-in"
          ctaPath="/auth"
        />
      </div>
    );
  }

  // Honest empty state in live mode (no paid invoices yet).
  if (!isDemo && !invoicesLoading && (realInvoices ?? []).length === 0) {
    return (
      <div className="space-y-4">
        <PageTruthBanner />
        <EmptyStateCard
          icon={Inbox}
          title="No revenue impact yet"
          description="This workspace summarises recovered and generated revenue once paid invoices and playbook executions exist. Send your first invoice or run a recovery playbook to populate this dashboard."
          ctaLabel="Open invoices"
          ctaPath="/business/invoices"
        />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />
      <HierarchyHint tier="insight" surface="Revenue Impact" description="Recovered + generated revenue" />

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Revenue Impact" value={`$${(totals.total / 1000).toFixed(1)}K`} sub="Recovered + Generated" icon={DollarSign} trend="up" />
        <KPITile label="Recovered" value={`$${(totals.recovered / 1000).toFixed(1)}K`} sub="From leaks & overdue" icon={Target} trend="up" />
        <KPITile label="Generated" value={`$${(totals.generated / 1000).toFixed(1)}K`} sub={isDemo ? "New revenue created" : "Not wired yet"} icon={Zap} />
        <KPITile label="Avg ROI" value={isDemo ? `${totals.avgRoi}%` : "—"} sub={isDemo ? "Per playbook" : "Requires playbook engine"} icon={TrendingUp} />
        <KPITile label="Actions Run" value={String(totals.actions)} sub={isDemo ? `${totals.avgSuccess}% success rate` : "Paid invoices"} icon={Users} />
      </div>

      {/* Trend Chart */}
      <SitaCard className="p-5" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <SitaCardTitle sub="Recovered vs Generated revenue over time">Revenue Trend</SitaCardTitle>
          <div className="flex items-center gap-2">
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

        {/* Right column — Pie */}
        <div className="space-y-5">
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
            <SitaCardTitle sub="Revenue by category">Category Breakdown</SitaCardTitle>
            <div className="mt-3 space-y-2">
              {Object.entries(
                PLAYBOOK_REVENUE.reduce((cats, p) => {
                  if (!cats[p.category]) cats[p.category] = { recovered: 0, generated: 0 };
                  cats[p.category].recovered += p.recovered;
                  cats[p.category].generated += p.generated;
                  return cats;
                }, {} as Record<string, { recovered: number; generated: number }>)
              ).map(([cat, v]) => {
                const totals = v as { recovered: number; generated: number };
                return (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${categoryColors[cat]}`}>{cat}</span>
                    <span className="font-medium text-foreground">${(totals.recovered + totals.generated).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </SitaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueImpactDashboard;
