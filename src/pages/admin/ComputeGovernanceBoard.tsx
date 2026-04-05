import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, TrendingDown, TrendingUp, AlertTriangle, Zap, DollarSign, BarChart3, Shield, Activity, Brain, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { COST_CLASS_SPECS, PLANS, DEFAULT_MODELS } from "@/lib/compute-governance";
import type { CostClass, ComputeModelTier } from "@/lib/compute-governance";

// ── Mock Data ───────────────────────────────────────────────

const mockTenantSpend = [
  { tenantId: "t-1", name: "Acme Corp", plan: "Business", spend: 12400, budget: 15000, margin: 68, cacheHit: 0.72, anomalies: 0 },
  { tenantId: "t-2", name: "Household Smith", plan: "Professional", spend: 2100, budget: 3000, margin: 74, cacheHit: 0.65, anomalies: 1 },
  { tenantId: "t-3", name: "Solo User", plan: "Starter", spend: 380, budget: 500, margin: 52, cacheHit: 0.45, anomalies: 0 },
];

const mockAgentSpend = [
  { agentId: "finance-advisor", name: "Finance Advisor", tokens: 284000, cost: 420, calls: 1240, tier: "standard" as ComputeModelTier },
  { agentId: "monitor-agent", name: "Proactive Monitor", tokens: 890000, cost: 180, calls: 12400, tier: "utility" as ComputeModelTier },
  { agentId: "strategy-agent", name: "Strategy Synthesizer", tokens: 64000, cost: 960, calls: 32, tier: "premium" as ComputeModelTier },
  { agentId: "self-heal", name: "Self-Healing Agent", tokens: 120000, cost: 95, calls: 340, tier: "utility" as ComputeModelTier },
];

const mockAnomalies = [
  { id: "a1", type: "retry-storm", severity: "warning" as const, tenant: "Household Smith", desc: "12 retries on portfolio analysis in 5min", suggested: "pause-autonomy", time: "2min ago" },
  { id: "a2", type: "low-cache-efficiency", severity: "info" as const, tenant: "Solo User", desc: "Cache hit rate only 12% — optimization available", suggested: "digest-mode", time: "15min ago" },
];

const classColors: Record<CostClass, string> = { A: "text-emerald-400", B: "text-blue-400", C: "text-amber-400", D: "text-rose-400" };
const tierColors: Record<ComputeModelTier, string> = { utility: "bg-emerald-500/20 text-emerald-300", standard: "bg-blue-500/20 text-blue-300", premium: "bg-amber-500/20 text-amber-300", exceptional: "bg-rose-500/20 text-rose-300" };

// ── Component ───────────────────────────────────────────────

const ComputeGovernanceBoard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: tokenUsage } = useQuery({
    queryKey: ["compute-token-usage"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_token_usage").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            Compute Governance Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI economics, model routing, margin protection, and plan entitlements</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1"><Activity className="h-3 w-3" /> Live</Badge>
          <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Margin: 67%</Badge>
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routing">Model Routing</TabsTrigger>
          <TabsTrigger value="tenants">Tenant Economics</TabsTrigger>
          <TabsTrigger value="agents">Agent Spend</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="plans">Plan Entitlements</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={DollarSign} label="Total AI Spend" value="$149.00" sub="this month" trend="down" />
            <MetricCard icon={BarChart3} label="Gross Margin" value="67%" sub="across all tenants" trend="up" />
            <MetricCard icon={RefreshCw} label="Cache Hit Rate" value="64%" sub="tokens saved: 1.2M" trend="up" />
            <MetricCard icon={AlertTriangle} label="Active Anomalies" value="2" sub="1 warning, 1 info" trend="neutral" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Cost Class Distribution */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Cost Class Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(Object.entries(COST_CLASS_SPECS) as [CostClass, typeof COST_CLASS_SPECS[CostClass]][]).map(([cls, spec]) => {
                  const pcts: Record<CostClass, number> = { A: 62, B: 24, C: 10, D: 4 };
                  return (
                    <div key={cls} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-mono font-bold ${classColors[cls]}`}>Class {cls}</span>
                        <span className="text-muted-foreground">{spec.name} — {pcts[cls]}%</span>
                      </div>
                      <Progress value={pcts[cls]} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Model Tier Usage */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Model Tier Usage</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {DEFAULT_MODELS.map(model => {
                  const usage: Record<string, number> = { "gemini-3-flash": 78, "gemini-2.5-flash": 52, "gemini-2.5-pro": 28, "gpt-5": 8 };
                  return (
                    <div key={model.modelId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={tierColors[model.tier]} variant="secondary">{model.tier}</Badge>
                        <span className="text-xs font-mono text-foreground">{model.modelId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={usage[model.modelId] ?? 0} className="h-1.5 w-20" />
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{usage[model.modelId] ?? 0}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Active Anomalies */}
          {mockAnomalies.length > 0 && (
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Active Anomalies</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {mockAnomalies.map(a => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Badge variant={a.severity === "warning" ? "destructive" : "secondary"} className="text-[10px]">{a.severity}</Badge>
                      <div>
                        <p className="text-xs font-medium text-foreground">{a.desc}</p>
                        <p className="text-[10px] text-muted-foreground">{a.tenant} · {a.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{a.suggested}</Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Routing Tab ───────────────────────────────────── */}
        <TabsContent value="routing" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Model Routing Engine — Cost Class → Model Tier</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Every AI task is classified (A–D) and routed to the cheapest model meeting quality requirements. Budget pressure auto-downgrades.</p>
                <Separator />
                {(Object.entries(COST_CLASS_SPECS) as [CostClass, typeof COST_CLASS_SPECS[CostClass]][]).map(([cls, spec]) => (
                  <div key={cls} className="p-3 rounded-lg bg-secondary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono font-bold ${classColors[cls]}`}>Class {cls}</span>
                        <span className="text-xs font-medium text-foreground">{spec.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {spec.allowedTiers.map(t => <Badge key={t} className={tierColors[t]} variant="secondary">{t}</Badge>)}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{spec.description}</p>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span>Max tokens: {spec.maxTokens.toLocaleString()}</span>
                      <span>Retries: {spec.retryLimit}</span>
                      <span>Compression: {spec.contextCompression}</span>
                      <span>{spec.approvalRequired ? "Approval required" : "Auto-route"}</span>
                      <span>{spec.batchAllowed ? "Batchable" : "Sync only"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tenants Tab ───────────────────────────────────── */}
        <TabsContent value="tenants" className="space-y-4 mt-4">
          <div className="space-y-3">
            {mockTenantSpend.map(t => (
              <Card key={t.tenantId} className="bg-card/80 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{t.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{t.plan} plan</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.anomalies > 0 && <Badge variant="destructive" className="text-[10px]">{t.anomalies} anomaly</Badge>}
                      <Badge variant={t.margin > 60 ? "secondary" : "destructive"} className="text-[10px]">Margin: {t.margin}%</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Spend / Budget</p>
                      <p className="font-mono font-medium text-foreground">${(t.spend / 100).toFixed(0)} / ${(t.budget / 100).toFixed(0)}</p>
                      <Progress value={(t.spend / t.budget) * 100} className="h-1.5 mt-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cache Hit Rate</p>
                      <p className="font-mono font-medium text-foreground">{(t.cacheHit * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Margin</p>
                      <p className={`font-mono font-medium ${t.margin > 60 ? "text-emerald-400" : "text-amber-400"}`}>{t.margin}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Agent Spend Tab ───────────────────────────────── */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Agent AI Spend</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {mockAgentSpend.sort((a, b) => b.cost - a.cost).map(agent => (
                <div key={agent.agentId} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{agent.calls.toLocaleString()} calls · {(agent.tokens / 1000).toFixed(0)}k tokens</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={tierColors[agent.tier]} variant="secondary">{agent.tier}</Badge>
                    <span className="text-xs font-mono font-medium text-foreground">${(agent.cost / 100).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Anomalies Tab ─────────────────────────────────── */}
        <TabsContent value="anomalies" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Usage Anomaly Detector</CardTitle></CardHeader>
            <CardContent>
              {mockAnomalies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No anomalies detected. System healthy.</p>
              ) : (
                <div className="space-y-3">
                  {mockAnomalies.map(a => (
                    <div key={a.id} className="p-3 rounded-lg bg-secondary/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${a.severity === "warning" ? "text-amber-400" : "text-blue-400"}`} />
                          <span className="text-xs font-medium text-foreground">{a.type.replace("-", " ")}</span>
                        </div>
                        <Badge variant={a.severity === "warning" ? "destructive" : "secondary"}>{a.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Tenant: {a.tenant}</span>
                        <Badge variant="outline">Suggested: {a.suggested}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Plans Tab ─────────────────────────────────────── */}
        <TabsContent value="plans" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {PLANS.map(plan => (
              <Card key={plan.planId} className="bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{plan.name}</span>
                    <span className="text-xs font-mono text-primary">${(plan.monthlyPriceCents / 100).toFixed(0)}/mo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-[11px] text-muted-foreground">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>Connectors: {plan.entitlements.connectedSystems === -1 ? "∞" : plan.entitlements.connectedSystems}</span>
                    <span>Monitors: {plan.entitlements.activeMonitoringCapacity === -1 ? "∞" : plan.entitlements.activeMonitoringCapacity}</span>
                    <span>Deep reasoning: {plan.entitlements.deepReasoningMinutesPerMonth === -1 ? "∞" : plan.entitlements.deepReasoningMinutesPerMonth + "min"}</span>
                    <span>Max class: {plan.entitlements.maxCostClassAllowed}</span>
                    <span>Boardroom: {plan.entitlements.boardroomSessions === -1 ? "∞" : plan.entitlements.boardroomSessions}/mo</span>
                    <span>AI teams: {plan.entitlements.aiTeamConcurrency} concurrent</span>
                    <span>Compute: ${(plan.entitlements.monthlyComputeBudgetCents / 100).toFixed(0)}/mo</span>
                    <span>Self-heal: {plan.entitlements.selfHealingScope}</span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {plan.entitlements.premiumModelAccess && <Badge variant="secondary" className="text-[9px]">Premium models</Badge>}
                    {plan.entitlements.exceptionalModelAccess && <Badge variant="secondary" className="text-[9px]">Exceptional compute</Badge>}
                    {plan.entitlements.engineeringTeamAccess && <Badge variant="secondary" className="text-[9px]">AI Eng Team</Badge>}
                    {plan.entitlements.exportAndCompliance && <Badge variant="secondary" className="text-[9px]">Export & Compliance</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComputeGovernanceBoard;

// ── Metric Card ─────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub, trend }: { icon: any; label: string; value: string; sub: string; trend: "up" | "down" | "neutral" }) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <Icon className="h-4 w-4 text-primary" />
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
          </div>
          <p className="text-lg font-bold text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
          <p className="text-[9px] text-muted-foreground/60">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
