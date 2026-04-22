// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Economics & Token Governance Page
// Model routing, budgets, spend dashboards, anomaly detection
// Wired to real DB data via compute governance hooks
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import {
  Cpu, DollarSign, Zap, BarChart3, AlertTriangle, Shield,
  TrendingUp, Target, RefreshCw, Layers,
  CheckCircle2, Activity,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  useAISpendSummary,
  useModelRoutingStats,
  useComputeBudgetStatus,
} from "@/hooks/use-compute-governance";
import { PageShell } from "@/components/sita/PageShell";

// ── Main Page ──────────────────────────────────────────────────
export default function AIEconomicsPage() {
  const { data: spendSummary, isLoading: spendLoading } = useAISpendSummary();
  const { data: routingStats, isLoading: routingLoading } = useModelRoutingStats();
  const { data: budgetStatus } = useComputeBudgetStatus();

  const totalSpend = spendSummary?.reduce((s, r) => s + r.total_cost_usd, 0) ?? 0;
  const totalTokens = spendSummary?.reduce((s, r) => s + r.total_tokens, 0) ?? 0;
  const totalRequests = spendSummary?.reduce((s, r) => s + r.request_count, 0) ?? 0;
  const efficiencyScore = budgetStatus ? Math.max(0, 100 - budgetStatus.utilizationPct) : 85;

  const tierColors: Record<string, string> = {
    no_llm: "text-trust-safe", cheap: "text-primary", mid: "text-sita-gold", premium: "text-accent",
  };

  return (
    <PageShell>
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
{/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground font-display">AI Economics</h1>
            <p className="text-sm text-muted-foreground">Token governance, model routing, budget controls, and efficiency metrics</p>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold font-display text-foreground">${totalSpend.toFixed(3)}</p>
              <p className="text-[9px] text-muted-foreground">Period Spend</p>
            </div>
            <div className="text-center">
              <p className={cn("text-lg font-bold font-display", efficiencyScore >= 80 ? "text-trust-safe" : "text-accent")}>
                {Math.round(efficiencyScore)}%
              </p>
              <p className="text-[9px] text-muted-foreground">Efficiency</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5">
          <TabsTrigger value="overview" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <BarChart3 className="h-3 w-3 mr-1.5" />Overview
          </TabsTrigger>
          <TabsTrigger value="routing" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Layers className="h-3 w-3 mr-1.5" />Model Routing
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <AlertTriangle className="h-3 w-3 mr-1.5" />Budget Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Spend", value: `$${totalSpend.toFixed(3)}`, icon: DollarSign },
              { label: "Total Tokens", value: `${(totalTokens / 1000).toFixed(0)}k`, icon: Cpu },
              { label: "Total Requests", value: String(totalRequests), icon: Activity },
              { label: "Efficiency", value: `${efficiencyScore}%`, icon: Target },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-border/30 bg-card/60 p-4 text-center">
                <m.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Spend by Capability */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Cpu className="h-3 w-3" /> Spend by Capability
            </h3>
            {spendLoading ? (
              <p className="text-xs text-muted-foreground">Loading spend data...</p>
            ) : (
              <div className="space-y-3">
                {(spendSummary || []).slice(0, 10).map((row, i) => {
                  const maxCost = Math.max(...(spendSummary || []).map(r => r.total_cost_usd), 0.001);
                  return (
                    <motion.div key={`${row.spend_date}-${row.capability_key}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-[10px] font-mono text-muted-foreground w-32 truncate capitalize">{row.capability_key.replace(/-/g, " ")}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(row.total_cost_usd / maxCost) * 100}%` }}
                          className="h-full rounded-full bg-primary/60" transition={{ duration: 0.6 }} />
                      </div>
                      <span className="text-[10px] font-mono text-foreground w-12 text-right">{row.request_count}</span>
                      <span className="text-[10px] text-muted-foreground w-16 text-right">${row.total_cost_usd.toFixed(3)}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Forecast */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Forecast</span>
            </div>
            <p className="text-xs text-muted-foreground">
              At current usage, projected monthly spend is <span className="font-bold text-foreground">${(totalSpend * 30).toFixed(2)}</span>.
              Efficiency score: {Math.round(efficiencyScore)}%.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="routing" className="mt-5 space-y-4">
          <div className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Model Routing Distribution</h3>
            {routingLoading ? (
              <p className="text-xs text-muted-foreground">Loading routing data...</p>
            ) : (
              (routingStats || []).map((r, i) => (
                <motion.div key={r.model} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 py-2.5 border-b border-border/10 last:border-0"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/30 text-primary">
                    <Cpu className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground font-mono">{r.model}</p>
                    <p className="text-[10px] text-muted-foreground">{r.provider} · {r.request_count} requests · {r.avg_latency_ms}ms avg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-foreground">${r.total_cost_usd.toFixed(3)}</p>
                    <p className="text-[10px] text-muted-foreground">{(r.total_tokens / 1000).toFixed(0)}k tok</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Routing Rules */}
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3">Routing Rules</h3>
            <div className="space-y-2">
              {[
                { rule: "Trivial tasks → No LLM (structured state)", icon: Zap, color: "text-trust-safe" },
                { rule: "Simple tasks → Flash model (cheapest)", icon: DollarSign, color: "text-primary" },
                { rule: "Moderate tasks → Mid-tier model", icon: Target, color: "text-primary" },
                { rule: "Complex/Critical → Premium model", icon: Shield, color: "text-accent" },
                { rule: "Budget constrained → Auto-downgrade tier", icon: AlertTriangle, color: "text-destructive" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <r.icon className={cn("h-3 w-3 shrink-0", r.color)} />
                  <span className="text-muted-foreground">{r.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="mt-5 space-y-3">
          {budgetStatus ? (
            <div className="space-y-4">
              <div className={cn("rounded-xl border p-6",
                budgetStatus.status === "healthy" ? "border-trust-safe/15 bg-trust-safe/5" :
                budgetStatus.status === "approaching" ? "border-primary/15 bg-primary/5" :
                "border-destructive/20 bg-destructive/5"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  {budgetStatus.status === "healthy" ? (
                    <CheckCircle2 className="h-6 w-6 text-trust-safe" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-accent" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground capitalize">{budgetStatus.status} Budget</p>
                    <p className="text-xs text-muted-foreground">{budgetStatus.utilizationPct}% of monthly budget used</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-card/60">
                    <p className="text-lg font-bold text-foreground">${(budgetStatus.dailySpentCents / 100).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">Today</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card/60">
                    <p className="text-lg font-bold text-foreground">${(budgetStatus.monthlySpentCents / 100).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card/60">
                    <p className="text-lg font-bold text-foreground">{budgetStatus.activePolicies}</p>
                    <p className="text-[10px] text-muted-foreground">Active Policies</p>
                  </div>
                </div>
              </div>

              {budgetStatus.blockedCapabilities.length > 0 && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-xs font-semibold text-destructive mb-2">Blocked Capabilities</p>
                  <div className="flex gap-2 flex-wrap">
                    {budgetStatus.blockedCapabilities.map(cap => (
                      <Badge key={cap} variant="destructive" className="text-[10px]">{cap}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/30 bg-card/60 p-6 text-center">
              <RefreshCw className="h-6 w-6 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading budget status...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </PageShell>
  );
}
