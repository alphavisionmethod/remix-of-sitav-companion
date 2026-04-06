import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, AlertTriangle, ShieldAlert } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { getBudgetSummary, getPortfolioAllocations, getCostLedger, getBudgetPolicies, getBudgetAlerts } from "@/lib/services/ai-gateway";

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

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> AIG04 — AI Budget & Spend Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Budget policies, spend tracking, alerts, and cost governance</p>
      </div>

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
          <p className="text-xs text-muted-foreground">Budget Policies</p>
          <p className="text-2xl font-bold">{policies.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active Alerts</p>
          <p className="text-2xl font-bold text-destructive">{alerts.filter(a => a.alert_state !== "resolved").length}</p>
        </CardContent></Card>
      </div>

      {/* Budget Policies */}
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
            <p className="text-center text-muted-foreground py-4">No budget policies configured. Add entries to ai_budget_policies.</p>
          )}
        </CardContent>
      </Card>

      {/* Budget Alerts */}
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

      {/* Spend by Provider */}
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

      {/* Portfolio Allocations */}
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

      {/* Recent Costs */}
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
