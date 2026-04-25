// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT05: Cost & Efficiency Board (Full Spec + Budget Policy Metrics)
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRecentInvocations, getWorkforceStats } from "@/lib/core-services/ai-workforce/workforce-orchestrator";
import { ROLE_BUDGET_POLICIES, DEFAULT_THRESHOLDS, BUDGET_CLASS_SPECS, type AdminBudgetClass } from "@/lib/core-services/ai-workforce/admin-budget-routing-policy";
import { DollarSign, TrendingUp, TrendingDown, Lightbulb, AlertTriangle, Shield, Zap } from "lucide-react";
import AITSubNav from "@/platform/admin/components/admin/AITSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export function AIT05CostEfficiency() {
  const { data: stats } = useQuery({ queryKey: ["ai-workforce-stats"], queryFn: getWorkforceStats });
  const { data: invocations = [] } = useQuery({ queryKey: ["ai-workforce-invocations-cost"], queryFn: () => getRecentInvocations(500) });

  const todayStr = new Date().toDateString();
  const todayInvocations = invocations.filter(i => new Date(i.created_at).toDateString() === todayStr);

  // Spend analysis
  const spendByRole: Record<string, { cost: number; count: number; premiumCount: number }> = {};
  const spendByTask: Record<string, { cost: number; count: number }> = {};
  const spendByClass: Record<string, { cost: number; count: number }> = {};
  let premiumCount = 0;
  let economyCount = 0;
  let balancedCount = 0;
  let fallbackByBudget = 0;
  let fallbackEvents = 0;

  invocations.forEach(inv => {
    const roleKey = inv.role_key;
    if (!spendByRole[roleKey]) spendByRole[roleKey] = { cost: 0, count: 0, premiumCount: 0 };
    spendByRole[roleKey].cost += inv.cost_cents ?? 0;
    spendByRole[roleKey].count += 1;
    if (inv.cost_cents > 5) spendByRole[roleKey].premiumCount += 1;

    if (!spendByTask[inv.task_type]) spendByTask[inv.task_type] = { cost: 0, count: 0 };
    spendByTask[inv.task_type].cost += inv.cost_cents ?? 0;
    spendByTask[inv.task_type].count += 1;

    // Budget class approximation from cost
    const cls = inv.cost_cents > 10 ? "premium" : inv.cost_cents > 1 ? "balanced" : "economy";
    if (!spendByClass[cls]) spendByClass[cls] = { cost: 0, count: 0 };
    spendByClass[cls].cost += inv.cost_cents ?? 0;
    spendByClass[cls].count += 1;

    if (inv.cost_cents > 5) premiumCount++;
    else if (inv.cost_cents > 1) balancedCount++;
    else economyCount++;

    if (inv.status === "blocked_budget") fallbackByBudget++;
    if (inv.fallback_occurred) fallbackEvents++;
  });

  const sortedRoles = Object.entries(spendByRole).sort((a, b) => b[1].cost - a[1].cost);
  const sortedTasks = Object.entries(spendByTask).sort((a, b) => b[1].cost - a[1].cost);
  const totalSpend = (stats?.totalCostCents ?? 0) / 100;
  const premiumPct = invocations.length > 0 ? Math.round((premiumCount / invocations.length) * 100) : 0;

  // Budget policy compliance
  const todayGlobalSpend = todayInvocations.reduce((s, i) => s + (i.cost_cents ?? 0), 0);
  const globalBudgetUsed = (todayGlobalSpend / DEFAULT_THRESHOLDS.dailyGlobalAdminSpendCents) * 100;

  // Role compliance
  const roleCompliance = sortedRoles.map(([role, data]) => {
    const policy = ROLE_BUDGET_POLICIES[role];
    const todayRoleSpend = todayInvocations
      .filter(i => i.role_key === role)
      .reduce((s, i) => s + (i.cost_cents ?? 0), 0);
    const pct = policy ? (todayRoleSpend / policy.maxDailySpendCents) * 100 : 0;
    return { role, data, policy, todaySpend: todayRoleSpend, pct };
  });

  // Optimization insights (spec section 5)
  const insights: string[] = [];
  sortedRoles.forEach(([role, data]) => {
    if (data.premiumCount > 5) insights.push(`"${role.replace(/_/g, " ")}" has ${data.premiumCount} premium runs — review if economy/balanced would suffice`);
    if (data.count > 10 && data.cost / data.count > 5) insights.push(`"${role.replace(/_/g, " ")}" avg cost is high — consider structured-output-first to reduce bloat`);
  });
  if (premiumPct > DEFAULT_THRESHOLDS.premiumPercentageCeiling) {
    insights.push(`Premium usage is ${premiumPct}% — above ${DEFAULT_THRESHOLDS.premiumPercentageCeiling}% ceiling. Review which tasks truly need premium.`);
  }
  if (fallbackByBudget > 0) insights.push(`${fallbackByBudget} tasks blocked by budget — review thresholds or optimize expensive patterns.`);
  sortedTasks.forEach(([task, data]) => {
    if (data.count > 10) insights.push(`Task "${task}" ran ${data.count}× — enable output caching to reduce redundant runs.`);
  });
  if (fallbackEvents > 3) insights.push(`${fallbackEvents} fallback events — consider cheaper-first two-step routing.`);

  // Metric: cost per accepted recommendation
  // (approximated — in real system would join with recommendations table)

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
<h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" /> AIT05 — Cost & Efficiency</h1>
      <p className="text-muted-foreground text-sm">Budget policy metrics, spend analysis, and optimization insights</p>

      {/* Top KPIs */}
      <div className="grid md:grid-cols-6 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">${totalSpend.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Total Spend</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.totalTokens?.toLocaleString() ?? 0}</div>
          <div className="text-xs text-muted-foreground">Total Tokens</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className={`text-2xl font-bold ${premiumPct > DEFAULT_THRESHOLDS.premiumPercentageCeiling ? "text-destructive" : premiumPct > 20 ? "text-amber-500" : "text-emerald-500"}`}>{premiumPct}%</div>
          <div className="text-xs text-muted-foreground">Premium %</div>
          <Progress value={premiumPct} className="h-1 mt-1" />
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{fallbackByBudget}</div>
          <div className="text-xs text-muted-foreground">Budget Blocks</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{fallbackEvents}</div>
          <div className="text-xs text-muted-foreground">Fallback Events</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.avgLatencyMs ?? 0}ms</div>
          <div className="text-xs text-muted-foreground">Avg Latency</div>
        </CardContent></Card>
      </div>

      {/* Budget Policy Compliance */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-1"><Shield className="h-4 w-4" />Budget Policy Compliance (Today)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium">Global Admin AI Spend</span>
              <span className="font-mono">${(todayGlobalSpend / 100).toFixed(2)} / ${(DEFAULT_THRESHOLDS.dailyGlobalAdminSpendCents / 100).toFixed(2)}</span>
            </div>
            <Progress value={Math.min(globalBudgetUsed, 100)} className="h-2" />
            {globalBudgetUsed > 80 && <p className="text-[10px] text-amber-500 mt-1">Approaching daily global budget limit</p>}
          </div>

          <div className="text-xs font-medium">Per-Role Compliance</div>
          <div className="grid md:grid-cols-2 gap-2">
            {roleCompliance.map(rc => (
              <div key={rc.role} className="p-2 rounded border text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{rc.role.replace(/_/g, " ")}</span>
                  <span className="font-mono">${(rc.todaySpend / 100).toFixed(2)} / ${rc.policy ? (rc.policy.maxDailySpendCents / 100).toFixed(2) : "∞"}</span>
                </div>
                {rc.policy && (
                  <Progress value={Math.min(rc.pct, 100)} className="h-1 mt-1" />
                )}
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">{rc.data.count} tasks</Badge>
                  {rc.data.premiumCount > 0 && <Badge variant="secondary" className="text-[10px]">{rc.data.premiumCount} premium</Badge>}
                  {rc.pct > 80 && <Badge variant="destructive" className="text-[10px]">Near limit</Badge>}
                </div>
              </div>
            ))}
          </div>

          {/* Tier Mix */}
          <div className="text-xs font-medium mt-2">Tier Mix</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded border text-center">
              <div className="text-lg font-bold text-emerald-500">{economyCount}</div>
              <div className="text-[10px] text-muted-foreground">Economy</div>
            </div>
            <div className="p-3 rounded border text-center">
              <div className="text-lg font-bold text-blue-500">{balancedCount}</div>
              <div className="text-[10px] text-muted-foreground">Balanced</div>
            </div>
            <div className="p-3 rounded border text-center">
              <div className="text-lg font-bold text-amber-500">{premiumCount}</div>
              <div className="text-[10px] text-muted-foreground">Premium</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Spend by Role</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {sortedRoles.map(([role, data]) => (
              <div key={role} className="flex items-center justify-between p-2 rounded border text-xs">
                <span className="font-medium capitalize">{role.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{data.count} tasks</span>
                  <span className="font-mono">${(data.cost / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">(avg ${(data.cost / data.count / 100).toFixed(3)})</span>
                  {data.cost / data.count > 10 ? <TrendingUp className="h-3 w-3 text-amber-500" /> : <TrendingDown className="h-3 w-3 text-emerald-500" />}
                </div>
              </div>
            ))}
            {sortedRoles.length === 0 && <p className="text-sm text-muted-foreground">No spend data.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Spend by Task Type</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {sortedTasks.map(([task, data]) => (
              <div key={task} className="flex items-center justify-between p-2 rounded border text-xs">
                <span className="font-medium">{task}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{data.count}×</span>
                  <span className="font-mono">${(data.cost / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
            {sortedTasks.length === 0 && <p className="text-sm text-muted-foreground">No task data.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Optimization Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-1"><Lightbulb className="h-4 w-4 text-amber-500" />Budget Optimization Insights</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded border text-xs">
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIT05CostEfficiency;
