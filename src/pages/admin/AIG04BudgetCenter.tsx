import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign, TrendingUp, AlertTriangle, ShieldAlert, Server,
  Database, GitBranch, Zap, Ban, ShieldCheck, Activity
} from "lucide-react";
import {
  getBudgetSummary, getPortfolioAllocations, getCostLedger,
  getBudgetPolicies, getBudgetAlerts, getUsageLedgerStats,
  type UsageLedgerStats,
} from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { supabase } from "@/integrations/supabase/client";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function AIG04BudgetCenter() {

  const { data: summary } = useQuery({
    queryKey: ["ai-budget-summary"],
    queryFn: getBudgetSummary,
  });
  const { data: allocations = [] } = useQuery({
    queryKey: ["ai-portfolio-allocations"],
    queryFn: getPortfolioAllocations,
  });
  const { data: policies = [] } = useQuery({
    queryKey: ["ai-budget-policies"],
    queryFn: getBudgetPolicies,
  });
  const { data: alerts = [] } = useQuery({
    queryKey: ["ai-budget-alerts"],
    queryFn: getBudgetAlerts,
  });
  const { data: recentCosts = [] } = useQuery({
    queryKey: ["ai-cost-ledger"],
    queryFn: () => getCostLedger(50),
  });
  const { data: ledgerStats } = useQuery<UsageLedgerStats>({
    queryKey: ["ai-usage-ledger-stats"],
    queryFn: getUsageLedgerStats,
  });

  // Top metrics counts
  const { data: providerCount = 0 } = useQuery({
    queryKey: ["ai-providers-healthy-count"],
    queryFn: async () => {
      const { count } = await supabase.from("ai_provider_registry").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count ?? 0;
    },
  });
  const { data: modelCount = 0 } = useQuery({
    queryKey: ["ai-models-active-count"],
    queryFn: async () => {
      const { count } = await supabase.from("ai_model_registry").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: capabilityCount = 0 } = useQuery({
    queryKey: ["ai-capabilities-routed-count"],
    queryFn: async () => {
      const { count } = await supabase.from("ai_capability_routing").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count ?? 0;
    },
  });
  const { data: publicSafeCount = 0 } = useQuery({
    queryKey: ["ai-public-safe-count"],
    queryFn: async () => {
      // ai_launch_honesty is a runtime-only table not present in generated Database types.
      // Cast the client at the call boundary to a generic SupabaseClient to allow the lookup.
      type AnyTableClient = { from: (t: string) => { select: (s: string, o?: { count?: "exact"; head?: boolean }) => { eq: (col: string, val: boolean) => Promise<{ count: number | null }> } } };
      const client = supabase as unknown as AnyTableClient;
      const { count } = await client.from("ai_launch_honesty").select("*", { count: "exact", head: true }).eq("public_claim_allowed", true);
      return count ?? 0;
    },
  });

  const premiumPct = ledgerStats && ledgerStats.totalToday > 0
    ? ((ledgerStats.premiumCount / ledgerStats.totalToday) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6" /> AIG04 — AI Budget & Spend Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Budget policies, spend tracking, alerts, and cost governance
        </p>
      </div>

      {/* ══ Top Metrics Bar ══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard icon={Server} label="Providers Healthy" value={providerCount} />
        <MetricCard icon={Database} label="Active Models" value={modelCount} />
        <MetricCard icon={GitBranch} label="Capabilities Routed" value={capabilityCount} />
        <MetricCard icon={DollarSign} label="Budget Burn Today" value={`$${(ledgerStats?.costToday ?? 0).toFixed(4)}`} />
        <MetricCard icon={TrendingUp} label="Premium Spend %" value={`${premiumPct}%`} />
        <MetricCard icon={Zap} label="Fallback Events" value={ledgerStats?.fallbackCount ?? 0} />
        <MetricCard icon={AlertTriangle} label="Failed Today" value={ledgerStats?.failedCount ?? 0} warn />
        <MetricCard icon={ShieldCheck} label="Public-Safe AI" value={publicSafeCount} />
      </div>

      {/* ══ Budget Overview Cards ══ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-bold">${((summary?.totalBudgetCents ?? 0) / 100).toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-bold">${((summary?.totalSpentCents ?? 0) / 100).toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Utilization</p>
          <p className="text-2xl font-bold">{(summary?.utilizationPercent ?? 0).toFixed(1)}%</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Blocked/Downgraded</p>
          <p className="text-2xl font-bold text-destructive">{(ledgerStats?.blockedCount ?? 0) + (ledgerStats?.fallbackCount ?? 0)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active Alerts</p>
          <p className="text-2xl font-bold text-destructive">{alerts.filter(a => a.alert_state !== "resolved").length}</p>
        </CardContent></Card>
      </div>

      {/* ══ Threshold Progress Bars ══ */}
      {policies.filter(p => p.daily_budget_usd != null).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Daily Budget Threshold Progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {policies.filter(p => p.daily_budget_usd != null).map(p => {
              const spent = ledgerStats?.costToday ?? 0;
              const budget = p.daily_budget_usd ?? 1;
              const pct = Math.min((spent / budget) * 100, 100);
              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{p.policy_key} <Badge variant="outline" className="text-[10px] ml-1">{p.scope_type}</Badge></span>
                    <span className="text-muted-foreground">${spent.toFixed(4)} / ${budget}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>Alert: {p.alert_threshold_percent}%</span>
                    <span>Critical: {p.critical_threshold_percent}%</span>
                    {p.block_on_exceeded && <Badge variant="destructive" className="text-[10px]">Blocks</Badge>}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ══ Spend by Capability (from ledger) ══ */}
      {ledgerStats && Object.keys(ledgerStats.spendByCapability).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Spend by Capability (Today)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(ledgerStats.spendByCapability)
                .sort(([, a], [, b]) => b - a)
                .map(([cap, cost]) => (
                  <div key={cap} className="p-3 rounded-md border border-border">
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{cap}</p>
                    <p className="text-lg font-bold">${cost.toFixed(4)}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══ Premium vs Economy Split ══ */}
      {ledgerStats && ledgerStats.totalToday > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Premium vs Economy Split (Today)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-md border border-border">
                <p className="text-xs text-muted-foreground">Premium</p>
                <p className="text-xl font-bold">{ledgerStats.premiumCount}</p>
              </div>
              <div className="p-3 rounded-md border border-border">
                <p className="text-xs text-muted-foreground">Economy</p>
                <p className="text-xl font-bold">{ledgerStats.economyCount}</p>
              </div>
              <div className="p-3 rounded-md border border-border">
                <p className="text-xs text-muted-foreground">Fallbacks</p>
                <p className="text-xl font-bold">{ledgerStats.fallbackCount}</p>
              </div>
              <div className="p-3 rounded-md border border-border">
                <p className="text-xs text-muted-foreground">Blocked</p>
                <p className="text-xl font-bold text-destructive">{ledgerStats.blockedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══ Budget Policies ══ */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Budget Policies</CardTitle></CardHeader>
        <CardContent>
          {policies.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Policy Key</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Daily</TableHead>
                <TableHead>Weekly</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Max/Request</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Fallback</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Alert %</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.policy_key}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{p.scope_type}{p.scope_ref ? ` · ${p.scope_ref}` : ""}</Badge></TableCell>
                    <TableCell className="text-xs">{p.daily_budget_usd ? `$${p.daily_budget_usd}` : "—"}</TableCell>
                    <TableCell className="text-xs">{p.weekly_budget_usd ? `$${p.weekly_budget_usd}` : "—"}</TableCell>
                    <TableCell className="text-xs">{p.monthly_budget_usd ? `$${p.monthly_budget_usd}` : "—"}</TableCell>
                    <TableCell className="text-xs">{p.max_request_cost_usd ? `$${p.max_request_cost_usd}` : "—"}</TableCell>
                    <TableCell className="text-xs">{p.premium_allowed ? "✓" : "✗"}</TableCell>
                    <TableCell className="text-xs">{p.fallback_on_exceeded ? "✓" : "✗"}</TableCell>
                    <TableCell className="text-xs">{p.block_on_exceeded ? "✗ Block" : "—"}</TableCell>
                    <TableCell className="text-xs">{p.alert_threshold_percent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No budget policies configured.</p>
          )}
        </CardContent>
      </Card>

      {/* ══ Budget Alerts ══ */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Budget Alerts</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Scope</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Observed Cost</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs">{a.scope_type}{a.scope_ref ? ` · ${a.scope_ref}` : ""}</TableCell>
                    <TableCell className="text-xs">{a.threshold_percent}%</TableCell>
                    <TableCell className="text-xs">${a.observed_cost_usd}</TableCell>
                    <TableCell className="text-xs">{a.period_class}</TableCell>
                    <TableCell><Badge variant={a.alert_state === "critical" ? "destructive" : a.alert_state === "resolved" ? "default" : "secondary"} className="text-xs">{a.alert_state}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(a.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ══ Spend by Provider ══ */}
      {summary && Object.keys(summary.byProvider).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Spend by Provider</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary.byProvider).map(([provider, cents]) => (
                <div key={provider} className="p-3 rounded-md border border-border">
                  <p className="text-xs text-muted-foreground">{provider}</p>
                  <p className="text-lg font-bold">${((cents as number) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══ Portfolio Allocations ══ */}
      <Card>
        <CardHeader><CardTitle>Portfolio Allocations</CardTitle></CardHeader>
        <CardContent>
          {allocations.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Period</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {allocations.map((a) => {
                  const util = a.budget_cents > 0 ? ((a.spent_cents ?? 0) / a.budget_cents * 100) : 0;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.allocation_class}</TableCell>
                      <TableCell className="text-xs">{a.domain ?? "—"}</TableCell>
                      <TableCell>${(a.budget_cents / 100).toFixed(2)}</TableCell>
                      <TableCell>${((a.spent_cents ?? 0) / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={util > 90 ? "destructive" : util > 70 ? "secondary" : "default"} className="text-xs">
                          {util.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{a.priority ?? "—"}</TableCell>
                      <TableCell className="text-xs">{a.period ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No budget allocations configured.</p>
          )}
        </CardContent>
      </Card>

      {/* ══ Recent Costs ══ */}
      {recentCosts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Cost Events</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {recentCosts.slice(0, 20).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.model}</TableCell>
                    <TableCell className="text-xs">{c.provider ?? "—"}</TableCell>
                    <TableCell className="text-xs">{c.purpose ?? "—"}</TableCell>
                    <TableCell className="text-xs">{((c.input_tokens ?? 0) + (c.output_tokens ?? 0)).toLocaleString()}</TableCell>
                    <TableCell>${((c.cost_cents ?? 0) / 100).toFixed(4)}</TableCell>
                    <TableCell className="text-xs">{c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, warn }: { icon: React.ElementType; label: string; value: string | number; warn?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3 px-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        </div>
        <p className={`text-lg font-bold ${warn ? "text-destructive" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
