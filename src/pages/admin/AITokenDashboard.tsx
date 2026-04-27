import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Gauge, DollarSign, Cpu, TrendingUp, Users, Zap, Plus, Trash2, Shield, Loader2 } from "lucide-react";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";


import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  useBudgetPolicies, useBudgetSummary, useUsageLedger, useDailyAggregation,
  useCreateBudgetPolicy, useUpdateBudgetPolicy, useDeleteBudgetPolicy,
} from "@/platform/governance/hooks/use-ai-budget-data";

export default function AITokenDashboard() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { data: policies } = useBudgetPolicies();
  const { data: summary } = useBudgetSummary();
  const { data: ledger } = useUsageLedger(500);
  const { data: dailyAgg } = useDailyAggregation();
  const createPolicy = useCreateBudgetPolicy();
  const updatePolicy = useUpdateBudgetPolicy();
  const deletePolicy = useDeleteBudgetPolicy();

  const [showCreate, setShowCreate] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ policy_key: "", daily_budget_usd: 10, monthly_budget_usd: 100 });

  if (adminLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  const records = ledger ?? [];
  const totalTokens = records.reduce((s,  r: Record<string, any>) => s + (r.total_tokens || 0), 0);
  const totalCost = records.reduce((s,  r: Record<string, any>) => s + (Number(r.estimated_cost_usd) || 0), 0);
  const uniqueCapabilities = new Set(records.map((r: Record<string, any>) => r.capability_key)).size;

  // By capability breakdown
  const byCap: Record<string, { tokens: number; cost: number; calls: number }> = {};
  records.forEach((r: Record<string, any>) => {
    const k = r.capability_key || "unknown";
    if (!byCap[k]) byCap[k] = { tokens: 0, cost: 0, calls: 0 };
    byCap[k].tokens += r.total_tokens || 0;
    byCap[k].cost += Number(r.estimated_cost_usd) || 0;
    byCap[k].calls += 1;
  });

  const capList = Object.entries(byCap).sort((a, b) => b[1].cost - a[1].cost).slice(0, 10);
  const maxCapCost = Math.max(...capList.map(([, v]) => v.cost), 0.01);

  // Daily aggregation for chart
  const dailyData = (dailyAgg ?? []).slice(0, 14).reverse();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Gauge className="h-6 w-6 text-primary" /> AI Token Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Monitor AI spend via usage ledger, budget policies, and daily aggregation</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{(totalTokens / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Total Cost</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-purple-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Capabilities</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{uniqueCapabilities}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Active Alerts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary?.alertCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Capability */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Cost by Capability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {capList.map(([name, stats]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground font-mono">{name}</span>
                  <span className="text-muted-foreground">${stats.cost.toFixed(4)} · {stats.calls} calls</span>
                </div>
                <Progress value={(stats.cost / maxCapCost) * 100} className="h-1.5" />
              </div>
            ))}
            {capList.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No usage data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Daily Aggregation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Daily Spend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dailyData.length > 0 ? dailyData.map((d: Record<string, any>) => (
              <div key={`${d.spend_date}-${d.capability_key}`} className="flex items-center justify-between text-xs border-b border-border/20 pb-1">
                <span className="text-muted-foreground">{d.spend_date}</span>
                <span className="font-mono">{d.capability_key}</span>
                <span className="font-medium">${Number(d.total_cost_usd).toFixed(4)}</span>
                <span className="text-muted-foreground">{d.request_count} req</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No daily aggregation data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Policies */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Budget Policies</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowCreate(true)} className="gap-1">
            <Plus className="h-3 w-3" /> New Policy
          </Button>
        </CardHeader>
        <CardContent>
          {(policies ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No budget policies configured</p>
          ) : (
            <div className="space-y-2">
              {(policies ?? []).map((p: Record<string, any>) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{p.policy_key}</span>
                      <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                      <Badge variant="outline">{p.scope_type}</Badge>
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      {p.daily_budget_usd != null && `Daily: $${p.daily_budget_usd}`}
                      {p.monthly_budget_usd != null && ` · Monthly: $${p.monthly_budget_usd}`}
                      {p.block_on_exceeded && " · Blocks"}
                      {p.fallback_on_exceeded && " · Fallback"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.is_active}
                      onCheckedChange={(v) => updatePolicy.mutate({ id: p.id, is_active: v })}
                    />
                    <Button size="sm" variant="ghost" onClick={() => deletePolicy.mutate(p.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Utilization */}
      {summary && summary.totalBudgetCents > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs">
              <span>Spent: ${(summary.totalSpentCents / 100).toFixed(2)}</span>
              <span>Budget: ${(summary.totalBudgetCents / 100).toFixed(2)}</span>
            </div>
            <Progress value={Math.min(summary.utilizationPercent, 100)} className="h-2" />
            {summary.utilizationPercent > 80 && (
              <Badge variant="destructive" className="text-[10px]">Approaching budget limit ({summary.utilizationPercent.toFixed(0)}%)</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Policy Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Budget Policy</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Policy Key</label>
              <Input value={newPolicy.policy_key} onChange={e => setNewPolicy(p => ({ ...p, policy_key: e.target.value }))} placeholder="e.g. global-daily-cap" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Daily Budget (USD)</label>
                <Input type="number" value={newPolicy.daily_budget_usd} onChange={e => setNewPolicy(p => ({ ...p, daily_budget_usd: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium">Monthly Budget (USD)</label>
                <Input type="number" value={newPolicy.monthly_budget_usd} onChange={e => setNewPolicy(p => ({ ...p, monthly_budget_usd: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => {
              createPolicy.mutate(newPolicy);
              setShowCreate(false);
              setNewPolicy({ policy_key: "", daily_budget_usd: 10, monthly_budget_usd: 100 });
            }} disabled={!newPolicy.policy_key}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
