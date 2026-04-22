import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, TrendingUp, TrendingDown, RefreshCw, AlertTriangle,
  Server, Globe, Zap, Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────

interface InvocationRow {
  capability_key: string;
  model: string;
  provider: string | null;
  estimated_cost_usd: number | null;
  user_id: string;
  status: string;
  latency_ms: number | null;
}

interface ProviderBreakdown {
  provider: string;
  totalCostUsd: number;
  activeUsers: number;
  costPerUser: number;
  invocations: number;
  avgLatencyMs: number;
  errorRate: number;
}

interface EndpointBreakdown {
  capability: string;
  totalCostUsd: number;
  activeUsers: number;
  costPerUser: number;
  invocations: number;
  avgLatencyMs: number;
  pctOfTotal: number;
}

interface ModelBreakdown {
  model: string;
  provider: string;
  totalCostUsd: number;
  invocations: number;
  costPerCall: number;
  avgLatencyMs: number;
}

interface CostSummary {
  totalCostUsd: number;
  totalActiveUsers: number;
  globalCostPerUser: number;
  byProvider: ProviderBreakdown[];
  byEndpoint: EndpointBreakdown[];
  byModel: ModelBreakdown[];
}

// ── Cost computation ───────────────────────────────────────────

function computeCostSummary(rows: InvocationRow[]): CostSummary {
  const totalCost = rows.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);
  const allUsers = new Set(rows.map((r) => r.user_id));
  const totalActiveUsers = allUsers.size;
  const globalCostPerUser = totalActiveUsers > 0 ? totalCost / totalActiveUsers : 0;

  // By provider
  const providerMap = new Map<string, InvocationRow[]>();
  rows.forEach((r) => {
    const key = r.provider ?? "unknown";
    providerMap.set(key, [...(providerMap.get(key) ?? []), r]);
  });
  const byProvider: ProviderBreakdown[] = [...providerMap.entries()]
    .map(([provider, pRows]) => {
      const cost = pRows.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);
      const users = new Set(pRows.map((r) => r.user_id)).size;
      const latencies = pRows.map((r) => r.latency_ms).filter((v): v is number => v != null);
      const errors = pRows.filter((r) => r.status !== "success").length;
      return {
        provider,
        totalCostUsd: cost,
        activeUsers: users,
        costPerUser: users > 0 ? cost / users : 0,
        invocations: pRows.length,
        avgLatencyMs: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
        errorRate: pRows.length > 0 ? (errors / pRows.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

  // By endpoint/capability
  const capMap = new Map<string, InvocationRow[]>();
  rows.forEach((r) => {
    capMap.set(r.capability_key, [...(capMap.get(r.capability_key) ?? []), r]);
  });
  const byEndpoint: EndpointBreakdown[] = [...capMap.entries()]
    .map(([capability, cRows]) => {
      const cost = cRows.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);
      const users = new Set(cRows.map((r) => r.user_id)).size;
      const latencies = cRows.map((r) => r.latency_ms).filter((v): v is number => v != null);
      return {
        capability,
        totalCostUsd: cost,
        activeUsers: users,
        costPerUser: users > 0 ? cost / users : 0,
        invocations: cRows.length,
        avgLatencyMs: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
        pctOfTotal: totalCost > 0 ? (cost / totalCost) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

  // By model
  const modelMap = new Map<string, InvocationRow[]>();
  rows.forEach((r) => {
    modelMap.set(r.model, [...(modelMap.get(r.model) ?? []), r]);
  });
  const byModel: ModelBreakdown[] = [...modelMap.entries()]
    .map(([model, mRows]) => {
      const cost = mRows.reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);
      const latencies = mRows.map((r) => r.latency_ms).filter((v): v is number => v != null);
      return {
        model,
        provider: mRows[0]?.provider ?? "unknown",
        totalCostUsd: cost,
        invocations: mRows.length,
        costPerCall: mRows.length > 0 ? cost / mRows.length : 0,
        avgLatencyMs: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      };
    })
    .sort((a, b) => b.totalCostUsd - a.totalCostUsd);

  return { totalCostUsd: totalCost, totalActiveUsers, globalCostPerUser, byProvider, byEndpoint, byModel };
}

// ── Formatters ─────────────────────────────────────────────────

const fmtUsd = (v: number) => `$${v.toFixed(4)}`;
const fmtCents = (v: number) => `${(v * 100).toFixed(1)}¢`;
const fmtMs = (v: number) => `${Math.round(v)}ms`;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

// ── Component ──────────────────────────────────────────────────

export default function CostPerActiveUserDashboard() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [windowHours, setWindowHours] = useState(24);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - windowHours * 3600_000).toISOString();
    const { data } = await supabase
      .from("ai_invocations")
      .select("capability_key, model, provider, estimated_cost_usd, user_id, status, latency_ms")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (data) {
      setSummary(computeCostSummary(data as InvocationRow[]));
    }
    setLoading(false);
  }, [windowHours]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cost Per Active User</h1>
            <p className="text-sm text-muted-foreground">
              Breakdown by provider, model, and endpoint — pinpoint cost drift
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 6, 24, 72].map((h) => (
            <Button
              key={h}
              size="sm"
              variant={windowHours === h ? "default" : "outline"}
              onClick={() => setWindowHours(h)}
              className="text-xs"
            >
              {h}h
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-foreground">{fmtUsd(summary.totalCostUsd)}</div>
              <div className="text-xs text-muted-foreground">Total Spend ({windowHours}h)</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-foreground flex items-center justify-center gap-1">
                <Users className="h-5 w-5" />
                {summary.totalActiveUsers}
              </div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-primary">{fmtCents(summary.globalCostPerUser)}</div>
              <div className="text-xs text-muted-foreground">Cost / Active User</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-foreground">{summary.byProvider.length}</div>
              <div className="text-xs text-muted-foreground">Active Providers</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="provider" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="provider"><Server className="h-3 w-3 mr-1" />By Provider</TabsTrigger>
          <TabsTrigger value="endpoint"><Zap className="h-3 w-3 mr-1" />By Endpoint</TabsTrigger>
          <TabsTrigger value="model"><Globe className="h-3 w-3 mr-1" />By Model</TabsTrigger>
        </TabsList>

        {/* ── Provider Breakdown ──────────────────────────────── */}
        <TabsContent value="provider" className="space-y-3">
          {summary?.byProvider.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">No data for this window.</CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-xs">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Provider</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Total Cost</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Users</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Cost/User</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Calls</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Avg Latency</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Error %</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.byProvider.map((p) => (
                    <tr key={p.provider} className="border-t border-border/30 hover:bg-muted/10">
                      <td className="px-3 py-2 text-foreground font-medium">{p.provider}</td>
                      <td className="px-3 py-2 text-right text-foreground">{fmtUsd(p.totalCostUsd)}</td>
                      <td className="px-3 py-2 text-right text-foreground">{p.activeUsers}</td>
                      <td className="px-3 py-2 text-right text-primary font-medium">{fmtCents(p.costPerUser)}</td>
                      <td className="px-3 py-2 text-right text-foreground">{p.invocations}</td>
                      <td className="px-3 py-2 text-right text-foreground">{fmtMs(p.avgLatencyMs)}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={p.errorRate > 5 ? "text-red-400" : p.errorRate > 2 ? "text-yellow-400" : "text-green-400"}>
                          {fmtPct(p.errorRate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── Endpoint Breakdown ─────────────────────────────── */}
        <TabsContent value="endpoint" className="space-y-3">
          {summary?.byEndpoint.map((ep) => (
            <Card key={ep.capability} className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{ep.capability}</span>
                    <Badge variant="outline" className="text-[10px]">{fmtPct(ep.pctOfTotal)} of total</Badge>
                  </div>
                  <span className="text-sm font-bold text-primary">{fmtCents(ep.costPerUser)}/user</span>
                </div>
                {/* Cost bar */}
                <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${Math.min(ep.pctOfTotal, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div>Cost: <span className="text-foreground">{fmtUsd(ep.totalCostUsd)}</span></div>
                  <div>Users: <span className="text-foreground">{ep.activeUsers}</span></div>
                  <div>Calls: <span className="text-foreground">{ep.invocations}</span></div>
                  <div>Latency: <span className="text-foreground">{fmtMs(ep.avgLatencyMs)}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!summary || summary.byEndpoint.length === 0) && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">No endpoint data.</CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Model Breakdown ────────────────────────────────── */}
        <TabsContent value="model" className="space-y-2">
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Model</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Provider</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">Total Cost</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">Calls</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">Cost/Call</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">Avg Latency</th>
                </tr>
              </thead>
              <tbody>
                {summary?.byModel.map((m) => (
                  <tr key={m.model} className="border-t border-border/30 hover:bg-muted/10">
                    <td className="px-3 py-2 text-foreground font-mono text-[11px]">{m.model}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.provider}</td>
                    <td className="px-3 py-2 text-right text-foreground">{fmtUsd(m.totalCostUsd)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{m.invocations}</td>
                    <td className="px-3 py-2 text-right text-primary font-medium">{fmtUsd(m.costPerCall)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{fmtMs(m.avgLatencyMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!summary || summary.byModel.length === 0) && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">No model data.</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}