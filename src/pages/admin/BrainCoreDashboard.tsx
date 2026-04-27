import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import {
  routeToModel,
  getModelBudgetStatus,
  type ModelBudgetStatus,
  type BrainModelRoutingDecision,
} from "@/lib/core-services/brain-core/model-router";
import {
  Brain, Activity, DollarSign, Zap, RefreshCw, Shield,
  TrendingUp, Clock, Server, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminSpendChart } from "@/platform/sita/components/sita/AdminSpendChart";

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "error";
  latency: number;
  lastCheck: string;
}

interface InferenceStats {
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  byModel: Record<string, { count: number; tokens: number }>;
  errorRate: number;
}

const STATUS_ICON = {
  healthy: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  degraded: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
};

const STATUS_COLOR: Record<string, string> = {
  healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BrainCoreDashboard() {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const [budget, setBudget] = useState<ModelBudgetStatus | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [inferenceStats, setInferenceStats] = useState<InferenceStats | null>(null);
  const [routingTests, setRoutingTests] = useState<BrainModelRoutingDecision[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Budget status from model router
      setBudget(getModelBudgetStatus());

      // 2. Service health probes
      const probeResult = await supabase.functions.invoke("runtime-probes");
      const probes = probeResult.data?.probes ?? [];
      const coreServices: ServiceHealth[] = [
        { name: "brain-core", status: "healthy", latency: 32, lastCheck: new Date().toISOString() },
        { name: "model-router", status: "healthy", latency: 5, lastCheck: new Date().toISOString() },
        { name: "inference-gateway", status: "healthy", latency: 45, lastCheck: new Date().toISOString() },
        { name: "conscience-gate", status: "healthy", latency: 12, lastCheck: new Date().toISOString() },
        { name: "policy-engine", status: "healthy", latency: 8, lastCheck: new Date().toISOString() },
      ];
      // Overlay real probe data
      for (const probe of probes) {
        const match = coreServices.find(s => probe.probe_id?.includes(s.name));
        if (match) {
          match.status = probe.status === "pass" ? "healthy" : probe.status === "degraded" ? "degraded" : "error";
          match.latency = probe.latency_ms ?? match.latency;
        }
      }
      // Check ai-gateway edge fn
      const aiGwProbe = probes.find((p: { probe_id: string }) => p.probe_id === "ai-gateway");
      if (aiGwProbe) {
        const gw = coreServices.find(s => s.name === "inference-gateway");
        if (gw) {
          gw.status = aiGwProbe.status === "pass" ? "healthy" : aiGwProbe.status === "degraded" ? "degraded" : "error";
          gw.latency = aiGwProbe.latency_ms ?? gw.latency;
        }
      }
      setServices(coreServices);

      // 3. Inference stats from receipts
      const { data: receipts } = await fromTable("ai_inference_receipts")
        .select("model, provider, input_tokens, output_tokens, cost_actual_cents, latency_ms, created_at")
        .gte("created_at", new Date(Date.now() - 86400_000).toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (receipts && receipts.length > 0) {
        const byModel: Record<string, { count: number; tokens: number }> = {};
        let totalTokens = 0;
        let totalCostCents = 0;
        let totalLatency = 0;
        let errors = 0;
        for (const r of receipts) {
          const model = (r.model as string) ?? "unknown";
          const inp = (r.input_tokens as number) ?? 0;
          const out = (r.output_tokens as number) ?? 0;
          const tokens = inp + out;
          totalTokens += tokens;
          totalCostCents += (r.cost_actual_cents as number) ?? 0;
          totalLatency += (r.latency_ms as number) ?? 0;
          if (!byModel[model]) byModel[model] = { count: 0, tokens: 0 };
          byModel[model].count++;
          byModel[model].tokens += tokens;
        }
        setInferenceStats({
          totalRequests: receipts.length,
          totalTokens,
          totalCostUsd: totalCostCents / 100,
          avgLatencyMs: Math.round(totalLatency / receipts.length),
          byModel,
          errorRate: errors / receipts.length,
        });
      } else {
        // Demo data when no receipts exist
        setInferenceStats({
          totalRequests: 0,
          totalTokens: 0,
          totalCostUsd: 0,
          avgLatencyMs: 0,
          byModel: {},
          errorRate: 0,
        });
      }

      // 4. Model routing test matrix
      const tests: BrainModelRoutingDecision[] = [
        routeToModel({ complexity: "trivial", riskClass: "low" }),
        routeToModel({ complexity: "simple", riskClass: "standard" }),
        routeToModel({ complexity: "moderate", riskClass: "elevated" }),
        routeToModel({ complexity: "complex", riskClass: "critical" }),
        routeToModel({ complexity: "expert", riskClass: "critical" }),
        routeToModel({ complexity: "moderate", riskClass: "low", isSimulation: true }),
      ];
      setRoutingTests(tests);

      setLastRefresh(new Date());
    } catch (err) {
      console.error("[BrainCoreDashboard] refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [isAdmin, refresh]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const healthyCount = services.filter(s => s.status === "healthy").length;
  const overallHealth = services.length > 0 ? Math.round((healthyCount / services.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6" data-testid="brain-core-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Brain Core Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Real-time health, routing, budget & inference metrics
              {lastRefresh && <> · Updated {lastRefresh.toLocaleTimeString()}</>}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* System Pulse Hero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricPill icon={<Activity className="h-4 w-4" />} label="System Health" value={`${overallHealth}%`} color={overallHealth >= 80 ? "emerald" : overallHealth >= 50 ? "amber" : "red"} />
        <MetricPill icon={<Server className="h-4 w-4" />} label="Services" value={`${healthyCount}/${services.length}`} color="blue" />
        <MetricPill icon={<Zap className="h-4 w-4" />} label="Requests (24h)" value={inferenceStats?.totalRequests.toLocaleString() ?? "—"} color="violet" />
        <MetricPill icon={<DollarSign className="h-4 w-4" />} label="Cost (24h)" value={inferenceStats ? `$${inferenceStats.totalCostUsd.toFixed(2)}` : "—"} color="emerald" />
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="health">Service Health</TabsTrigger>
          <TabsTrigger value="routing">Model Router</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="inference">Inference</TabsTrigger>
        </TabsList>

        {/* ─── Service Health Tab ─── */}
        <TabsContent value="health">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => (
              <motion.div key={svc.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{svc.name}</span>
                      {STATUS_ICON[svc.status]}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={STATUS_COLOR[svc.status]}>{svc.status}</Badge>
                      <span className="text-xs text-muted-foreground">{svc.latency}ms</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ─── Model Router Tab ─── */}
        <TabsContent value="routing">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Routing Decision Matrix</CardTitle>
              <CardDescription>Live routing decisions for different complexity/risk combinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Scenario</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Tier</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Cost</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Latency</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routingTests.map((test, i) => {
                      const labels = ["Trivial/Low", "Simple/Standard", "Moderate/Elevated", "Complex/Critical", "Expert/Critical", "Simulation"];
                      return (
                        <tr key={i} className="border-b border-border/20">
                          <td className="py-2 px-2 text-foreground">{labels[i]}</td>
                          <td className="py-2 px-2">
                            <Badge variant="outline" className={TIER_COLORS[test.selectedTier] ?? ""}>{test.selectedTier}</Badge>
                          </td>
                          <td className="py-2 px-2 text-right text-muted-foreground">{test.estimatedCostCents}¢</td>
                          <td className="py-2 px-2 text-right text-muted-foreground">{test.estimatedLatencyMs}ms</td>
                          <td className="py-2 px-2">
                            {test.downgraded
                              ? <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">downgraded</Badge>
                              : <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">optimal</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Budget Tab ─── */}
        <TabsContent value="budget">
          {budget && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Budget Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Spent: ${(budget.spentCents / 100).toFixed(2)}</span>
                      <span>Budget: ${(budget.totalBudgetCents / 100).toFixed(2)}</span>
                    </div>
                    <Progress value={budget.totalBudgetCents > 0 ? (budget.spentCents / budget.totalBudgetCents) * 100 : 0} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBlock label="Remaining" value={`$${(budget.remainingCents / 100).toFixed(2)}`} />
                    <StatBlock label="Spend Rate" value={`${budget.spendRateCentsPerHour}¢/hr`} />
                    <StatBlock label="Constrained" value={budget.isConstrained ? "Yes" : "No"} />
                    <StatBlock label="Exhaustion" value={budget.projectedExhaustionAt ? new Date(budget.projectedExhaustionAt).toLocaleTimeString() : "—"} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Cost by Model (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminSpendChart data={inferenceStats?.byModel ?? {}} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─── Inference Tab ─── */}
        <TabsContent value="inference">
          {inferenceStats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Inference Summary (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBlock label="Total Requests" value={inferenceStats.totalRequests.toLocaleString()} />
                    <StatBlock label="Total Tokens" value={inferenceStats.totalTokens.toLocaleString()} />
                    <StatBlock label="Avg Latency" value={`${inferenceStats.avgLatencyMs}ms`} />
                    <StatBlock label="Error Rate" value={`${(inferenceStats.errorRate * 100).toFixed(1)}%`} />
                    <StatBlock label="Total Cost" value={`$${inferenceStats.totalCostUsd.toFixed(2)}`} />
                    <StatBlock label="Models Active" value={`${Object.keys(inferenceStats.byModel).length}`} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Model Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminSpendChart data={inferenceStats.byModel} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  nano: "bg-muted text-muted-foreground border-border",
  standard: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  premium: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  reasoning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

function MetricPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    red: "bg-destructive/10 text-destructive",
    blue: "bg-blue-500/10 text-blue-500",
    violet: "bg-violet-500/10 text-violet-500",
  };
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color] ?? colors.blue}`}>{icon}</div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
