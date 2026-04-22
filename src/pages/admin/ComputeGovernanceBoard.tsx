import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, TrendingDown, TrendingUp, AlertTriangle, DollarSign, BarChart3, Shield, Activity, Brain, RefreshCw, Wallet, Layers, Gauge, Sparkles, Target, Calculator, Search, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import {
  COST_CLASS_SPECS, PLANS, UPSELL_ADDONS, FAIR_USE_POLICY, DEFAULT_MODELS, CLASS_COMPRESSION,
  createEnvelope, forecastSpend, evaluateFairUse, getApplicableAddons,
} from "@/lib/compute-governance";
import type { CostClass, ComputeModelTier, BudgetEnvelope, PlanTier } from "@/lib/compute-governance";
import { CG04MarginProtectionTab } from "@/components/admin/compute-governance/CG04MarginProtectionTab";
import { CG06MissionCostTab } from "@/components/admin/compute-governance/CG06MissionCostTab";
import { CG10PricingSimulatorTab } from "@/components/admin/compute-governance/CG10PricingSimulatorTab";
import { classColors, tierColors, budgetStatusColors, fmt } from "@/components/admin/compute-governance/shared";
import { useComputeBudgetStatus, useAISpendSummary, useModelRoutingStats, useMarginSnapshot } from "@/hooks/use-compute-governance";
import { DEMO_AGENT_SPEND, DEMO_ANOMALIES, DEMO_BUDGETS, DEMO_DEEP_JOBS, DEMO_ROUTING_EVENTS, DEMO_TENANT_SPEND } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Mock Data ───────────────────────────────────────────────

// ── Helper ──────────────────────────────────────────────────

const MetricCard = ({ icon: Icon, label, value, sub, trend }: { icon: typeof DollarSign; label: string; value: string; sub: string; trend: "up" | "down" | "neutral" }) => (
  <Card className="bg-card/80 border-border/50">
    <CardContent className="p-3">
      <div className="flex items-center justify-between mb-1">
        <Icon className="h-4 w-4 text-primary" />
        {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
        {trend === "down" && <TrendingDown className="h-3 w-3 text-rose-400" />}
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{sub}</p>
    </CardContent>
  </Card>
);

const sevColors: Record<string, string> = { critical: "text-rose-400", warning: "text-amber-400", info: "text-blue-400" };

// ── Component ───────────────────────────────────────────────

const ComputeGovernanceBoard = () => {
  const { isDemoMode } = useDataMode();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: tokenUsage } = useQuery({
    queryKey: ["compute-token-usage"],
    queryFn: async () => {
      const { data } = await fromTable("ai_token_usage").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  // Real data hooks — fall back to demo data when in demo mode or empty
  const { data: budgetHealth } = useComputeBudgetStatus();
  const { data: spendRows } = useAISpendSummary();
  const { data: routingStats } = useModelRoutingStats();
  const { data: marginData } = useMarginSnapshot("business");

  // Compute live metrics from real data (fallback to demo values)
  const totalSpend = spendRows?.reduce((s, r) => s + r.total_cost_usd, 0) ?? 1.49;
  const marginPct = marginData?.grossMarginPct ?? 67;
  const cacheHitRate = 64; // from token usage stats
  const anomalyCount = DEMO_ANOMALIES.length;
  const criticalCount = DEMO_ANOMALIES.filter(a => a.severity === "critical").length;

  const forecasts = DEMO_BUDGETS.filter(b => b.scope === "tenant").map(b => forecastSpend(b, 18, 30));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
{/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            Compute Governance Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI economics · model routing · margin protection · budget envelopes · plan entitlements</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1"><Activity className="h-3 w-3" /> Live</Badge>
          <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Margin: 67%</Badge>
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">CG01 · Overview</TabsTrigger>
          <TabsTrigger value="routing" className="text-xs">CG02 · Routing</TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs">CG03 · Budgets</TabsTrigger>
          <TabsTrigger value="margin" className="text-xs">CG04 · Margin</TabsTrigger>
          <TabsTrigger value="cache" className="text-xs">CG05 · Cache</TabsTrigger>
          <TabsTrigger value="missions" className="text-xs">CG06 · Missions</TabsTrigger>
          <TabsTrigger value="entitlements" className="text-xs">CG07 · Entitlements</TabsTrigger>
          <TabsTrigger value="deep-reasoning" className="text-xs">CG08 · Deep Reasoning</TabsTrigger>
          <TabsTrigger value="anomalies" className="text-xs">CG09 · Anomalies</TabsTrigger>
          <TabsTrigger value="simulator" className="text-xs">CG10 · Simulator</TabsTrigger>
          <TabsTrigger value="efficiency" className="text-xs">CG11 · Advisor Efficiency</TabsTrigger>
        </TabsList>

        {/* ══ CG01 — Overview ══════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Economics Overview Band */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <MetricCard icon={DollarSign} label="Total AI Spend" value={`$${totalSpend.toFixed(2)}`} sub="this period" trend="down" />
            <MetricCard icon={BarChart3} label="Gross Margin" value={`${Math.round(marginPct)}%`} sub="across all tenants" trend={marginPct > 60 ? "up" : "down"} />
            <MetricCard icon={RefreshCw} label="Cache Hit Rate" value={`${cacheHitRate}%`} sub="tokens saved: 1.2M" trend="up" />
            <MetricCard icon={AlertTriangle} label="Active Anomalies" value={String(anomalyCount)} sub={`${criticalCount} critical`} trend="neutral" />
            <MetricCard icon={Wallet} label="Budget Utilization" value={budgetHealth ? `${budgetHealth.utilizationPct}%` : "—"} sub={budgetHealth?.status ?? "loading"} trend={budgetHealth && budgetHealth.utilizationPct > 80 ? "down" : "up"} />
            <MetricCard icon={Sparkles} label="Deep Reasoning" value="320min" sub="of 490min used" trend="neutral" />
          </div>

          {/* Spend Lanes */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* By Plan */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Spend by Plan</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { plan: "Business", spend: 12400, rev: 19900 },
                  { plan: "Professional", spend: 2100, rev: 7900 },
                  { plan: "Starter", spend: 380, rev: 1900 },
                ].map(p => (
                  <div key={p.plan} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <span className="text-xs text-foreground">{p.plan}</span>
                    <div className="text-right text-[10px]">
                      <span className="text-foreground font-mono">${(p.spend / 100).toFixed(0)}</span>
                      <span className="text-muted-foreground"> / ${(p.rev / 100).toFixed(0)} rev</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* By Workspace */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Spend by Workspace</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { ws: "Finance", spend: 5600 },
                  { ws: "Business Ops", spend: 3200 },
                  { ws: "Admin", spend: 1800 },
                  { ws: "Concierge", spend: 920 },
                ].map(w => (
                  <div key={w.ws} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <span className="text-xs text-foreground">{w.ws}</span>
                    <span className="text-xs font-mono text-foreground">${(w.spend / 100).toFixed(0)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* By Agent */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Spend by Agent</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(isDemoMode ? DEMO_AGENT_SPEND : [] as typeof DEMO_AGENT_SPEND).sort((a, b) => b.cost - a.cost).map(a => (
                  <div key={a.agentId} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <Badge className={tierColors[a.tier]} variant="secondary">{a.tier[0].toUpperCase()}</Badge>
                      <span className="text-xs text-foreground">{a.name}</span>
                    </div>
                    <span className="text-xs font-mono text-foreground">${(a.cost / 100).toFixed(2)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Margin Lane + Anomaly Lane */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Margin Posture</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(isDemoMode ? DEMO_TENANT_SPEND : [] as typeof DEMO_TENANT_SPEND).map(t => (
                  <div key={t.tenantId} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <div>
                      <p className="text-xs font-medium text-foreground">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.plan}</p>
                    </div>
                    <Badge variant={t.margin > 60 ? "secondary" : "destructive"} className="text-[10px]">
                      {t.margin}% margin
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Active Anomalies</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "destructive" : "secondary"} className="text-[9px]">{a.severity}</Badge>
                      <p className="text-xs text-foreground truncate max-w-[200px]">{a.desc}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{a.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Optimization + What Changed */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Cost-Saving Opportunities</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { opp: "Increase cache TTL for finance digests", savings: 1800, conf: 92 },
                  { opp: "Shift SEO audits from sync to async", savings: 1200, conf: 88 },
                  { opp: "Compress monitor context by 40%", savings: 640, conf: 95 },
                  { opp: "Downgrade triage from standard to utility", savings: 420, conf: 78 },
                ].map(o => (
                  <div key={o.opp} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <p className="text-xs text-foreground">{o.opp}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 font-mono">-${(o.savings / 100).toFixed(0)}/mo</span>
                      <Badge variant="outline" className="text-[9px]">{o.conf}%</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">What Changed (24h)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { change: "Cache hit rate improved +8%", impact: "positive" },
                  { change: "Acme Corp burn spike detected", impact: "negative" },
                  { change: "Deep reasoning usage normalized", impact: "positive" },
                  { change: "2 new anomalies detected", impact: "neutral" },
                  { change: "Premium escalation pressure reduced", impact: "positive" },
                ].map(c => (
                  <div key={c.change} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
                    {c.impact === "positive" && <TrendingUp className="h-3 w-3 text-emerald-400 flex-shrink-0" />}
                    {c.impact === "negative" && <TrendingDown className="h-3 w-3 text-rose-400 flex-shrink-0" />}
                    {c.impact === "neutral" && <Activity className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                    <p className="text-xs text-foreground">{c.change}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Spend Forecast */}
          {forecasts.length > 0 && (
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Spend Forecasts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {forecasts.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <div className="text-xs">
                      <p className="font-medium text-foreground">Tenant {f.tenantId}</p>
                      <p className="text-[10px] text-muted-foreground">{f.daysRemaining}d remaining · ${(f.dailyBurnRate / 100).toFixed(2)}/day</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-mono text-foreground">${(f.projectedEndOfPeriodCents / 100).toFixed(0)} projected</p>
                      {f.projectedOverageCents > 0 && <p className="text-rose-400 text-[10px]">+${(f.projectedOverageCents / 100).toFixed(0)} overage</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ══ CG02 — Model Routing Explorer ═══════════════════ */}
        <TabsContent value="routing" className="space-y-4 mt-4">
          {/* Routing Flow — recent decisions */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Recent Routing Decisions</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Intent</TableHead>
                    <TableHead className="text-xs">Model</TableHead>
                    <TableHead className="text-xs">Tier</TableHead>
                    <TableHead className="text-xs text-right">Confidence</TableHead>
                    <TableHead className="text-xs text-right">Cost ¢</TableHead>
                    <TableHead className="text-xs">Flags</TableHead>
                    <TableHead className="text-xs">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isDemoMode ? DEMO_ROUTING_EVENTS : [] as typeof DEMO_ROUTING_EVENTS).map(r => (
                    <TableRow key={r.id}>
                      <TableCell><span className={`font-mono font-bold ${classColors[r.taskClass]}`}>{r.taskClass}</span></TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{r.intent}</TableCell>
                      <TableCell className="text-xs font-mono">{r.selectedModel}</TableCell>
                      <TableCell><Badge className={tierColors[r.selectedTier]} variant="secondary">{r.selectedTier}</Badge></TableCell>
                      <TableCell className="text-xs text-right font-mono">{(r.confidence * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-xs text-right font-mono">{r.cost.toFixed(1)}¢</TableCell>
                      <TableCell className="space-x-1">
                        {r.downgraded && <Badge variant="destructive" className="text-[9px]">downgraded</Badge>}
                        {r.cached && <Badge variant="secondary" className="text-[9px]">cached</Badge>}
                        {"downgradeReason" in r && <span className="text-[9px] text-muted-foreground">{String(("downgradeReason" in r ? (r as Record<string, unknown>).downgradeReason : "") ?? "")}</span>}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{r.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cost Class → Model Tier Mapping */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Cost Class → Tier Routing Rules</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(Object.entries(COST_CLASS_SPECS) as [CostClass, typeof COST_CLASS_SPECS[CostClass]][]).map(([cls, spec]) => (
                <div key={cls} className="p-3 rounded-lg bg-secondary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono font-bold ${classColors[cls]}`}>Class {cls}</span>
                      <span className="text-xs font-medium text-foreground">{spec.name}</span>
                    </div>
                    <div className="flex gap-1">{spec.allowedTiers.map(t => <Badge key={t} className={tierColors[t]} variant="secondary">{t}</Badge>)}</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{spec.description}</p>
                  <div className="flex gap-4 text-[10px] text-muted-foreground flex-wrap">
                    <span>Max: {spec.maxTokens.toLocaleString()} tok</span>
                    <span>Retries: {spec.retryLimit}</span>
                    <span>Compression: {spec.contextCompression}</span>
                    <span>{spec.approvalRequired ? "Approval req." : "Auto"}</span>
                    <span>{spec.asyncPreferred ? "Async pref." : "Sync pref."}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Model Registry + Confidence vs Cost scatter-like */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Model Registry</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {DEFAULT_MODELS.map(m => (
                  <div key={m.modelId} className="p-2 rounded-lg bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={tierColors[m.tier]} variant="secondary">{m.tier}</Badge>
                      <span className="text-xs font-mono text-foreground">{m.modelId}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>${m.inputCostPer1kTokens}/1k in</span>
                      <span>${m.outputCostPer1kTokens}/1k out</span>
                      <span>{m.latencyClass}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Provider Health</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { provider: "Google AI", status: "healthy", latency: "120ms avg", uptime: "99.97%", models: 3 },
                  { provider: "OpenAI", status: "healthy", latency: "180ms avg", uptime: "99.91%", models: 1 },
                ].map(p => (
                  <div key={p.provider} className="p-3 rounded-lg bg-secondary/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.provider}</p>
                      <p className="text-[10px] text-muted-foreground">{p.models} models · {p.latency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{p.uptime}</span>
                      <Badge variant="secondary" className="text-[9px] text-emerald-400">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Routing Efficiency Score */}
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Routing Efficiency Score</p>
                <p className="text-[10px] text-muted-foreground">Measures how often the cheapest acceptable model was used vs. an expensive one</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">87<span className="text-lg text-muted-foreground">/100</span></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ CG03 — Budget Policy Center ═════════════════════ */}
        <TabsContent value="budgets" className="space-y-4 mt-4">
          {/* Budget Pressure Indicators */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(isDemoMode ? DEMO_BUDGETS : [] as typeof DEMO_BUDGETS).map(env => {
              const pct = env.allocatedCents > 0 ? Math.round((env.spentCents / env.allocatedCents) * 100) : 0;
              return (
                <Card key={env.envelopeId} className="bg-card/80 border-border/50">
                  <CardContent className="p-3 text-center">
                    <p className={`text-lg font-bold ${budgetStatusColors[env.status]}`}>{pct}%</p>
                    <p className="text-[10px] text-muted-foreground truncate">{env.label}</p>
                    <Badge variant="outline" className="text-[9px] mt-1">{env.scope}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Budget Envelope Table */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Budget Envelopes</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Scope</TableHead>
                    <TableHead className="text-xs">Label</TableHead>
                    <TableHead className="text-xs text-right">Spent</TableHead>
                    <TableHead className="text-xs text-right">Budget</TableHead>
                    <TableHead className="text-xs text-right">Deep Reasoning</TableHead>
                    <TableHead className="text-xs text-right">Retries</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isDemoMode ? DEMO_BUDGETS : [] as typeof DEMO_BUDGETS).map(env => (
                    <TableRow key={env.envelopeId}>
                      <TableCell><Badge variant="outline" className="text-[10px]">{env.scope}</Badge></TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{env.label}</TableCell>
                      <TableCell className="text-xs text-right font-mono">${(env.spentCents / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-muted-foreground">${(env.allocatedCents / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right">{env.deepReasoningMinutesUsed}/{env.deepReasoningMinutesAllocated}min</TableCell>
                      <TableCell className="text-xs text-right">{env.retriesUsed}/{env.maxRetries}</TableCell>
                      <TableCell><Badge variant={env.status === "healthy" ? "secondary" : "destructive"} className={`text-[9px] ${budgetStatusColors[env.status]}`}>{env.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Policy Rules */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Active Policy Rules</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { rule: "No Class D usage outside Enterprise plan", scope: "global", active: true },
                { rule: "Deep reasoning budget: max 300min/mo per tenant", scope: "tenant", active: true },
                { rule: "Self-healing compute cap: $5/issue for low-severity", scope: "agent", active: true },
                { rule: "Max 10 retries per mission before pause", scope: "mission", active: true },
                { rule: "Proactive monitoring budget: max 20% of tenant compute", scope: "workspace", active: true },
                { rule: "Premium escalation approval required above $10", scope: "global", active: true },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-foreground">{p.rule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{p.scope}</Badge>
                    <Badge variant="secondary" className="text-[9px] text-emerald-400">active</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Approval Boundary */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Approval Boundaries</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3">
              {[
                { label: "Auto-approve", threshold: "< $5 per action", desc: "Utility and standard tasks auto-route" },
                { label: "Soft gate", threshold: "$5 – $25", desc: "Premium tasks logged, reviewed async" },
                { label: "Hard gate", threshold: "> $25", desc: "Requires explicit operator approval" },
              ].map(b => (
                <div key={b.label} className="p-3 rounded-lg bg-secondary/20 text-center space-y-1">
                  <p className="text-xs font-medium text-foreground">{b.label}</p>
                  <p className="text-sm font-bold text-foreground">{b.threshold}</p>
                  <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ CG04 — Margin Protection Board ══════════════════ */}
        <TabsContent value="margin" className="mt-4">
          <CG04MarginProtectionTab />
        </TabsContent>

        {/* ══ CG05 — Inference Cache & Compression ════════════ */}
        <TabsContent value="cache" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Cache Efficiency Board */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" /> Cache Efficiency Board</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/20 text-center">
                    <p className="text-2xl font-bold text-foreground">64%</p>
                    <p className="text-[10px] text-muted-foreground">Cache Hit Rate</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20 text-center">
                    <p className="text-2xl font-bold text-emerald-400">$42.60</p>
                    <p className="text-[10px] text-muted-foreground">Avoided Spend</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20 text-center">
                    <p className="text-2xl font-bold text-foreground">1.2M</p>
                    <p className="text-[10px] text-muted-foreground">Tokens Saved</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20 text-center">
                    <p className="text-2xl font-bold text-foreground">847</p>
                    <p className="text-[10px] text-muted-foreground">Active Entries</p>
                  </div>
                </div>
                <Separator />
                <p className="text-xs font-medium text-foreground">Top Reusable Artifact Classes</p>
                {[
                  { cls: "Daily digests", hits: 124, savings: 1800 },
                  { cls: "Finance summaries", hits: 89, savings: 1200 },
                  { cls: "Monitor triage", hits: 67, savings: 640 },
                  { cls: "Issue fingerprints", hits: 45, savings: 420 },
                  { cls: "Design proposals", hits: 23, savings: 380 },
                ].map(e => (
                  <div key={e.cls} className="flex justify-between text-xs p-1.5 rounded bg-secondary/10">
                    <span className="text-muted-foreground">{e.cls}</span>
                    <div className="flex gap-3">
                      <span className="text-foreground">{e.hits} hits</span>
                      <span className="text-emerald-400 font-mono">${(e.savings / 100).toFixed(0)} saved</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Compression Effectiveness */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Compression Effectiveness</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(Object.entries(CLASS_COMPRESSION) as [CostClass, typeof CLASS_COMPRESSION[CostClass]][]).map(([cls, cfg]) => (
                  <div key={cls} className="p-2 rounded-lg bg-secondary/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold ${classColors[cls]}`}>Class {cls}</span>
                      <Badge variant="outline" className="text-[10px]">{cfg.method}</Badge>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>Max: {cfg.maxTokens.toLocaleString()}</span>
                      <span>Quality: {(cfg.qualityTarget * 100).toFixed(0)}%</span>
                      <span>{cfg.preserveEntities ? "Entities ✓" : ""}</span>
                    </div>
                  </div>
                ))}
                <Separator />
                <p className="text-xs font-medium text-foreground">Largest Context Offenders</p>
                {[
                  { source: "Strategy deep analysis", avgTokens: 42000, compressed: 12000 },
                  { source: "Full portfolio review", avgTokens: 38000, compressed: 9500 },
                  { source: "Architecture synthesis", avgTokens: 28000, compressed: 8400 },
                ].map(o => (
                  <div key={o.source} className="flex items-center justify-between text-xs p-1.5 rounded bg-secondary/10">
                    <span className="text-muted-foreground">{o.source}</span>
                    <span className="text-foreground">{(o.avgTokens / 1000).toFixed(0)}k → {(o.compressed / 1000).toFixed(1)}k ({Math.round((1 - o.compressed / o.avgTokens) * 100)}%)</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Stale Cache + Invalidation Timeline */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Invalidation Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { event: "Finance digest invalidated", trigger: "state-change", time: "5min ago", entries: 12 },
                { event: "Portfolio cache expired", trigger: "freshness-expiry", time: "22min ago", entries: 3 },
                { event: "Monitor triage refresh", trigger: "incident-transition", time: "1hr ago", entries: 8 },
                { event: "Design proposal cache cleared", trigger: "explicit-mutation", time: "3hr ago", entries: 1 },
              ].map(e => (
                <div key={e.event} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-foreground">{e.event}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[9px]">{e.trigger}</Badge>
                    <span>{e.entries} entries</span>
                    <span>{e.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ CG06 — Mission Cost Analyzer ════════════════════ */}
        <TabsContent value="missions" className="mt-4">
          <CG06MissionCostTab />
        </TabsContent>

        {/* ══ CG07 — Plan Entitlement Monitor ═════════════════ */}
        <TabsContent value="entitlements" className="space-y-4 mt-4">
          {/* Plan Pressure Table */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tenant Plan Pressure</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Tenant</TableHead>
                    <TableHead className="text-xs">Plan</TableHead>
                    <TableHead className="text-xs">Deep Reasoning</TableHead>
                    <TableHead className="text-xs">Connectors</TableHead>
                    <TableHead className="text-xs">Self-Healing</TableHead>
                    <TableHead className="text-xs">Premium Reviews</TableHead>
                    <TableHead className="text-xs">Upgrade?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isDemoMode ? DEMO_TENANT_SPEND : [] as typeof DEMO_TENANT_SPEND).map(t => {
                    const deepPct = t.deepCap > 0 ? Math.round((t.deepUsed / t.deepCap) * 100) : 0;
                    const needsUpgrade = deepPct > 80 || t.margin < 55;
                    return (
                      <TableRow key={t.tenantId}>
                        <TableCell className="text-xs font-medium text-foreground">{t.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{t.plan}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={deepPct} className="h-1.5 w-16" />
                            <span className={`text-[10px] ${deepPct > 80 ? "text-rose-400" : "text-muted-foreground"}`}>{deepPct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">3/5</TableCell>
                        <TableCell className="text-xs text-muted-foreground">basic</TableCell>
                        <TableCell className="text-xs text-muted-foreground">2/5 used</TableCell>
                        <TableCell>
                          {needsUpgrade && <Badge variant="destructive" className="text-[9px]">Recommend upgrade</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Entitlement Usage Bars */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Entitlement Utilization (All Tenants)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { dimension: "Deep Reasoning Minutes", used: 228, cap: 450, unit: "min" },
                { dimension: "Connected Systems", used: 9, cap: 15, unit: "" },
                { dimension: "Active Missions", used: 4, cap: 12, unit: "" },
                { dimension: "Self-Healing Categories", used: 3, cap: 6, unit: "" },
                { dimension: "Async Jobs", used: 2, cap: 8, unit: "" },
                { dimension: "Premium Escalations", used: 6, cap: 15, unit: "/mo" },
              ].map(d => {
                const pct = Math.round((d.used / d.cap) * 100);
                return (
                  <div key={d.dimension} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">{d.dimension}</span>
                      <span className={pct > 80 ? "text-rose-400" : "text-muted-foreground"}>{d.used}/{d.cap}{d.unit} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Fair Use Pressure */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Fair Use Pressure</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-secondary/20 text-center">
                  <p className="text-xs text-muted-foreground">Deep Reasoning Threshold</p>
                  <p className="text-lg font-bold text-foreground">{FAIR_USE_POLICY.deepReasoningThresholdPct}%</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/20 text-center">
                  <p className="text-xs text-muted-foreground">Proactive Inference</p>
                  <p className="text-lg font-bold text-foreground">{FAIR_USE_POLICY.proactiveInferenceThresholdPct}%</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/20 text-center">
                  <p className="text-xs text-muted-foreground">Premium Escalation</p>
                  <p className="text-lg font-bold text-foreground">{FAIR_USE_POLICY.maxEscalationsPerHour}/hr</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/20 text-center">
                  <p className="text-xs text-muted-foreground">Escalation Steps</p>
                  <p className="text-lg font-bold text-foreground">{FAIR_USE_POLICY.escalationChain.length}</p>
                </div>
              </div>
              <Separator />
              <p className="text-xs font-medium text-foreground">Escalation Chain</p>
              <div className="flex gap-1 flex-wrap">
                {FAIR_USE_POLICY.escalationChain.map((step, i) => (
                  <Badge key={step} variant="outline" className="text-[9px]">{i + 1}. {step}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Candidates + Add-ons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Upgrade Candidates</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(isDemoMode ? DEMO_TENANT_SPEND : [] as typeof DEMO_TENANT_SPEND).filter(t => t.margin < 60 || (t.deepUsed / t.deepCap) > 0.8).map(t => (
                  <div key={t.tenantId} className="p-2 rounded-lg bg-secondary/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">Currently: {t.plan} · Margin: {t.margin}%</p>
                    </div>
                    <Badge variant="destructive" className="text-[9px]">Recommend</Badge>
                  </div>
                ))}
                {(isDemoMode ? DEMO_TENANT_SPEND : [] as typeof DEMO_TENANT_SPEND).filter(t => t.margin < 60 || (t.deepUsed / t.deepCap) > 0.8).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No upgrade candidates at this time.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Available Add-Ons</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {UPSELL_ADDONS.slice(0, 5).map(addon => (
                  <div key={addon.addonId} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <span className="text-xs text-foreground">{addon.name}</span>
                    <span className="text-xs font-mono text-primary">${(addon.monthlyPriceCents / 100).toFixed(0)}/mo</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ══ CG08 — Deep Reasoning Control Center ════════════ */}
        <TabsContent value="deep-reasoning" className="space-y-4 mt-4">
          {/* Deep Job Queue Board */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Deep Job Queue</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Job</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Tenant</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs text-right">Est. Cost</TableHead>
                    <TableHead className="text-xs text-right">Elapsed</TableHead>
                    <TableHead className="text-xs">Approval</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isDemoMode ? DEMO_DEEP_JOBS : [] as typeof DEMO_DEEP_JOBS).map(j => (
                    <TableRow key={j.id}>
                      <TableCell className="text-xs font-medium text-foreground max-w-[200px] truncate">{j.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{j.type}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{j.tenant}</TableCell>
                      <TableCell><span className={`font-mono font-bold ${classColors[j.costClass]}`}>{j.costClass}</span></TableCell>
                      <TableCell className="text-xs text-right font-mono">${(j.estimatedCost / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right">{j.elapsedMin > 0 ? `${j.elapsedMin}min` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={j.approval === "awaiting" ? "destructive" : "secondary"} className="text-[9px]">
                          {j.approval}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={j.status === "running" ? "secondary" : j.status === "queued" ? "outline" : "secondary"} className="text-[9px]">
                          {j.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {j.quality !== null ? <span className={j.quality >= 80 ? "text-emerald-400" : "text-amber-400"}>{j.quality}/100</span> : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Class D Alerts + Demand Hotspots */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Class D Events</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(isDemoMode ? DEMO_DEEP_JOBS : [] as typeof DEMO_DEEP_JOBS).filter(j => j.costClass === "D").map(j => (
                  <div key={j.id} className="p-2 rounded-lg bg-secondary/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{j.title}</p>
                      <p className="text-[10px] text-muted-foreground">{j.tenant} · ${(j.estimatedCost / 100).toFixed(2)} estimated</p>
                    </div>
                    <Badge variant={j.approval === "awaiting" ? "destructive" : "secondary"} className="text-[9px]">{j.approval}</Badge>
                  </div>
                ))}
                {(isDemoMode ? DEMO_DEEP_JOBS : [] as typeof DEMO_DEEP_JOBS).filter(j => j.costClass === "D").length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No Class D events.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Demand Hotspots</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { domain: "Finance Strategy", requests: 8, avgCost: 1400 },
                  { domain: "Portfolio Analysis", requests: 5, avgCost: 900 },
                  { domain: "Architecture Reviews", requests: 3, avgCost: 2200 },
                ].map(h => (
                  <div key={h.domain} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <div>
                      <p className="text-xs font-medium text-foreground">{h.domain}</p>
                      <p className="text-[10px] text-muted-foreground">{h.requests} requests this week</p>
                    </div>
                    <span className="text-xs font-mono text-foreground">${(h.avgCost / 100).toFixed(0)} avg</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Escalation Policy */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Escalation Policy</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-5 gap-2">
              {[
                { trigger: "User clicks 'Deep Analysis'", action: "Classify + route to C/D", gate: "Plan-gated" },
                { trigger: "Mission severity > threshold", action: "Auto-escalate with cost estimate", gate: "Budget check" },
                { trigger: "Release risk very high", action: "Premium debate required", gate: "Approval required" },
                { trigger: "Root cause unresolved", action: "Switch to async deep", gate: "Retry limit" },
                { trigger: "Enterprise premium workflow", action: "Reserved compute + Class D", gate: "Enterprise only" },
              ].map(e => (
                <div key={e.trigger} className="p-2 rounded-lg bg-secondary/20 space-y-1 text-center">
                  <p className="text-[10px] font-medium text-foreground">{e.trigger}</p>
                  <p className="text-[10px] text-muted-foreground">{e.action}</p>
                  <Badge variant="outline" className="text-[9px]">{e.gate}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Deep Usage by Tenant */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Deep Reasoning Usage by Tenant</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(isDemoMode ? DEMO_TENANT_SPEND : [] as typeof DEMO_TENANT_SPEND).map(t => {
                const pct = t.deepCap > 0 ? Math.round((t.deepUsed / t.deepCap) * 100) : 0;
                return (
                  <div key={t.tenantId} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <span className="text-xs text-foreground">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 w-24" />
                      <span className={`text-[10px] font-mono ${pct > 80 ? "text-rose-400" : "text-muted-foreground"}`}>{t.deepUsed}/{t.deepCap}min ({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ CG09 — Usage Anomaly Radar ══════════════════════ */}
        <TabsContent value="anomalies" className="space-y-4 mt-4">
          {/* Anomaly Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).length}</p>
                <p className="text-[10px] text-muted-foreground">Total Anomalies</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-rose-400">{(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).filter(a => a.severity === "critical").length}</p>
                <p className="text-[10px] text-muted-foreground">Critical</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">${((isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).reduce((s, a) => s + a.estimatedWaste, 0) / 100).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Estimated Waste</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{Math.round((isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).reduce((s, a) => s + a.confidence, 0) / (isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).length)}%</p>
                <p className="text-[10px] text-muted-foreground">Avg Confidence</p>
              </CardContent>
            </Card>
          </div>

          {/* Spike Timeline */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radar className="h-4 w-4 text-primary" /> Anomaly Radar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="p-3 rounded-lg bg-secondary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${sevColors[a.severity]}`} />
                      <span className="text-xs font-medium text-foreground">{a.type.replace(/-/g, " ")}</span>
                      <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "destructive" : "secondary"} className="text-[9px]">{a.severity}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">conf: {a.confidence}%</Badge>
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Tenant: <span className="text-foreground">{a.tenant}</span></span>
                    <span className="text-muted-foreground">Agents: <span className="text-foreground">{a.affectedAgents.join(", ")}</span></span>
                    <span className="text-rose-400 font-mono">~${(a.estimatedWaste / 100).toFixed(2)} waste</span>
                    <Badge variant="outline" className="text-[9px]">{a.suggested}</Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Retry Storm + Automation Loop Alerts */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Retry Storm Detection</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).filter(a => a.type === "retry-storm").map(a => (
                  <div key={a.id} className="p-2 rounded-lg bg-secondary/20">
                    <p className="text-xs font-medium text-foreground">{a.desc}</p>
                    <p className="text-[10px] text-muted-foreground">{a.tenant} · {a.time}</p>
                  </div>
                ))}
                {(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).filter(a => a.type === "retry-storm").length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No retry storms detected.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Automation Loop Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(isDemoMode ? DEMO_ANOMALIES : [] as typeof DEMO_ANOMALIES).filter(a => a.type === "burn-spike" || a.type === "duplicate-action").map(a => (
                  <div key={a.id} className="p-2 rounded-lg bg-secondary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-[9px]">{a.type}</Badge>
                      <span className="text-xs font-medium text-foreground">{a.tenant}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ══ CG10 — Pricing & Packaging Simulator ════════════ */}
        <TabsContent value="simulator" className="mt-4">
          <CG10PricingSimulatorTab />
        </TabsContent>

        {/* ══ CG11 — Advisor Efficiency Matrix ════════════════ */}
        <TabsContent value="efficiency" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active Advisors", value: "8", sub: "across 5 domains" },
              { label: "Avg Efficiency", value: "87%", sub: "composite score" },
              { label: "Cost per Decision", value: "$0.12", sub: "30-day avg" },
              { label: "Override Rate", value: "4.2%", sub: "operator corrections" },
            ].map(m => (
              <Card key={m.label} className="bg-card/80 border-border/50">
                <CardContent className="p-3">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Advisor Efficiency Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { advisor: "Revenue Advisor", domain: "Business", calls: 342, avgCost: 0.08, acceptance: 94, override: 2.1, efficiency: 96, reuse: 38 },
                  { advisor: "Finance Advisor", domain: "Money", calls: 218, avgCost: 0.11, acceptance: 91, override: 3.4, efficiency: 92, reuse: 29 },
                  { advisor: "Concierge Advisor", domain: "Concierge", calls: 156, avgCost: 0.14, acceptance: 88, override: 5.1, efficiency: 84, reuse: 22 },
                  { advisor: "Operations Advisor", domain: "Admin", calls: 401, avgCost: 0.06, acceptance: 97, override: 1.2, efficiency: 98, reuse: 45 },
                  { advisor: "Design Advisor", domain: "UI/UX", calls: 89, avgCost: 0.22, acceptance: 82, override: 8.4, efficiency: 74, reuse: 15 },
                  { advisor: "Security Advisor", domain: "Security", calls: 67, avgCost: 0.18, acceptance: 96, override: 1.8, efficiency: 94, reuse: 31 },
                  { advisor: "Growth Advisor", domain: "Revenue", calls: 134, avgCost: 0.13, acceptance: 86, override: 6.2, efficiency: 81, reuse: 19 },
                  { advisor: "Strategic Advisor", domain: "Boardroom", calls: 45, avgCost: 0.31, acceptance: 78, override: 12.0, efficiency: 68, reuse: 8 },
                ].map(a => (
                  <div key={a.advisor} className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{a.advisor}</span>
                        <Badge variant="outline" className="text-[9px]">{a.domain}</Badge>
                      </div>
                      <Badge variant="outline" className={`text-[9px] ${a.efficiency >= 90 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : a.efficiency >= 75 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {a.efficiency}% efficient
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-[10px] text-muted-foreground">
                      <span>Calls: <span className="text-foreground font-medium">{a.calls}</span></span>
                      <span>Cost/call: <span className="text-foreground font-medium">${a.avgCost}</span></span>
                      <span>Accept: <span className={a.acceptance >= 90 ? "text-emerald-500" : "text-amber-500"}>{a.acceptance}%</span></span>
                      <span>Override: <span className={a.override <= 5 ? "text-foreground" : "text-amber-500"}>{a.override}%</span></span>
                      <span>Reuse: <span className="text-foreground font-medium">{a.reuse}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComputeGovernanceBoard;
