// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT01: AI Team Overview Board (Full Spec)
// Mission control for the internal AI engineering workforce
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getWorkforceRoles, getRecentInvocations, getWorkforceStats, getRecommendations, getApprovalQueue } from "@/lib/core-services/ai-workforce/workforce-orchestrator";
import { computeTruthIndices } from "@/lib/core-services/truth-indices/truth-index-aggregator";
import { Bot, DollarSign, Zap, Clock, Shield, Activity, AlertTriangle, CheckCircle2, Lightbulb, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AITSubNav from "@/platform/admin/components/admin/AITSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function AIT01TeamOverview() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["ai-workforce-stats"], queryFn: getWorkforceStats });
  const { data: roles = [] } = useQuery({ queryKey: ["ai-workforce-roles"], queryFn: getWorkforceRoles });
  const { data: invocations = [] } = useQuery({ queryKey: ["ai-workforce-invocations"], queryFn: () => getRecentInvocations(50) });
  const { data: recs = [] } = useQuery({ queryKey: ["ai-workforce-recommendations"], queryFn: () => getRecommendations() });
  const { data: approvals = [] } = useQuery({ queryKey: ["ai-workforce-approval-queue"], queryFn: () => getApprovalQueue() });
  const { data: truthIndices } = useQuery({ queryKey: ["truth-indices-ait01"], queryFn: computeTruthIndices, staleTime: 60_000 });

  const activeRoles = roles.filter(r => r.is_active);
  const todayInvocations = invocations.filter(i => new Date(i.created_at).toDateString() === new Date().toDateString());
  const premiumTasks = todayInvocations.filter(i => i.cost_cents > 5);
  const premiumPct = todayInvocations.length > 0 ? Math.round((premiumTasks.length / todayInvocations.length) * 100) : 0;
  const fallbackToday = todayInvocations.filter(i => i.fallback_occurred).length;
  const degradedToday = todayInvocations.filter(i => i.status === "degraded" || i.status === "fallback_success").length;
  const pendingApprovals = approvals.length;
  const newRecs = recs.filter((r: Record<string, any>) => r.status === "new" || r.status === "reviewing").length;
  const acceptedToday = recs.filter((r: Record<string, any>) => r.status === "accepted").length;
  const budgetAlerts = todayInvocations.filter(i => i.status === "blocked_budget").length;

  const kpis = [
    { label: "Active Roles", value: activeRoles.length, total: roles.length, icon: Bot, color: "text-primary" },
    { label: "Tasks Today", value: todayInvocations.length, icon: Zap, color: "text-amber-500" },
    { label: "Premium %", value: `${premiumPct}%`, icon: DollarSign, color: premiumPct > 30 ? "text-destructive" : "text-emerald-500" },
    { label: "Budget Alerts", value: budgetAlerts, icon: AlertTriangle, color: budgetAlerts > 0 ? "text-destructive" : "text-muted-foreground" },
    { label: "Pending Approvals", value: pendingApprovals, icon: Shield, color: pendingApprovals > 0 ? "text-amber-500" : "text-muted-foreground" },
    { label: "Recommendations", value: newRecs, icon: Lightbulb, color: "text-blue-500" },
    { label: "Accepted Today", value: acceptedToday, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Degraded Today", value: degradedToday + fallbackToday, icon: Activity, color: degradedToday > 0 ? "text-amber-500" : "text-muted-foreground" },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> AI Engineering Team — Mission Control
          </h1>
          <p className="text-muted-foreground mt-1">Internal AI workforce status, activity, budget posture, and governance</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/ai-team/invoke"><Button size="sm" variant="default" className="gap-1"><Zap className="h-3 w-3" />Invoke Task</Button></Link>
          <Link to="/admin/ai-team/approvals"><Button size="sm" variant="outline" className="gap-1"><Shield className="h-3 w-3" />Approvals ({pendingApprovals})</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardContent className="pt-3 pb-2 px-3 text-center">
              <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
              <div className="text-xl font-bold">{k.value}{k.total !== undefined ? <span className="text-xs text-muted-foreground">/{k.total}</span> : null}</div>
              <div className="text-[10px] text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Launch Honesty Posture */}
      {truthIndices && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Admin AI Launch Honesty Posture</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: "Runtime", score: truthIndices.runtimeTruth.score },
                { label: "Launch", score: truthIndices.launchHonesty.score },
                { label: "AI Truth", score: truthIndices.aiTruth.score },
                { label: "Connectors", score: truthIndices.connectorTruth.score },
                { label: "Demo Gov.", score: truthIndices.demoGovernance.score },
                { label: "Surface", score: truthIndices.surfacePortability.score },
              ].map(idx => (
                <div key={idx.label} className="text-center">
                  <div className={`text-lg font-bold ${idx.score >= 80 ? "text-emerald-500" : idx.score >= 50 ? "text-amber-500" : "text-destructive"}`}>{idx.score}</div>
                  <div className="text-[10px] text-muted-foreground">{idx.label}</div>
                  <Progress value={idx.score} className="h-1 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Roles */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">AI Workforce Roles</CardTitle>
              <Link to="/admin/ai-team/roles" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles registered. Seed workforce roles to begin.</p>
            ) : roles.slice(0, 8).map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded border text-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs">{r.display_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{r.purpose.slice(0, 50)}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={r.is_active ? "default" : "secondary"} className="text-[10px]">{r.launch_stage}</Badge>
                  <Badge variant="outline" className="text-[10px]">{r.default_model_tier}</Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">${(r.total_cost_cents / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <Link to="/admin/ai-team/activity" className="text-xs text-primary hover:underline flex items-center gap-1">Feed <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {invocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invocations yet. The AI team is idle.</p>
            ) : invocations.slice(0, 8).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-2 rounded border text-sm">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium">{inv.role_key.replace(/_/g, " ")} → {inv.task_type}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{inv.output_summary?.slice(0, 60) ?? "Pending..."}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {inv.fallback_occurred && <Badge variant="destructive" className="text-[10px]">fallback</Badge>}
                  <span className="text-[10px] font-mono text-muted-foreground">${(inv.cost_cents / 100).toFixed(3)}</span>
                  <Badge variant={inv.status === "completed" ? "default" : inv.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Recommendations */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1"><Lightbulb className="h-3 w-3" />Top Recommendations</CardTitle>
              <Link to="/admin/ai-team/recommendations" className="text-xs text-primary hover:underline flex items-center gap-1">All <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {recs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recommendations yet.</p>
            ) : recs.slice(0, 5).map((r: Record<string, any>) => (
              <div key={r.id} className="p-2 rounded border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{r.title}</span>
                  <Badge variant={r.severity === "critical" ? "destructive" : r.severity === "high" ? "default" : "secondary"} className="text-[10px]">{r.severity}</Badge>
                </div>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">{r.domain}</Badge>
                  <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1"><DollarSign className="h-3 w-3" />Cost Summary</CardTitle>
              <Link to="/admin/ai-team/cost" className="text-xs text-primary hover:underline flex items-center gap-1">Details <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded border text-center">
                <div className="text-lg font-bold">${((stats?.totalCostCents ?? 0) / 100).toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground">Total Spend</div>
              </div>
              <div className="p-3 rounded border text-center">
                <div className="text-lg font-bold">{stats?.totalTokens?.toLocaleString() ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">Total Tokens</div>
              </div>
              <div className="p-3 rounded border text-center">
                <div className="text-lg font-bold">{stats?.avgLatencyMs ?? 0}ms</div>
                <div className="text-[10px] text-muted-foreground">Avg Latency</div>
              </div>
              <div className="p-3 rounded border text-center">
                <div className="text-lg font-bold flex items-center justify-center gap-1">
                  {stats?.completedCount ?? 0}/{stats?.totalInvocations ?? 0}
                  {(stats?.completedCount ?? 0) > 0 && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                </div>
                <div className="text-[10px] text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
